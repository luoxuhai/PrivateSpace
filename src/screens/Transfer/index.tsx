import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Share, Alert } from 'react-native';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';
import {
  useNavigationComponentDidAppear,
  useNavigationComponentDidDisappear,
  useNavigationButtonPress,
} from 'react-native-navigation-hooks';
import { observer } from 'mobx-react-lite';
import QRCode from 'react-native-qrcode-svg';
import * as KeepAwake from 'expo-keep-awake';
import FS from 'react-native-fs';
import NetInfo, {
  NetInfoStateType,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import { HttpServer } from '@darkce/react-native-webserver';

import { useStore } from '@/store';
import { FileStatus } from '@/services/db/file';
import { transformResult } from '@/screens/ImageList/AddButton';
import { createFiles } from '@/utils/initShare';
import {
  platformInfo,
  join,
  extname,
  generateID,
  randomNumRange,
} from '@/utils';
import { THUMBNAIL_PATH, SOURCE_PATH, TEMP_PATH } from '@/config';
import { IconButton } from '@/components/Icon';
import SafeAreaScrollView from '@/components/SafeAreaScrollView';
import { services } from '@/services';
import WebClient from './WebClient';
import { RNToasty } from 'react-native-toasty';
import { useStat } from '@/hooks';

import IconWifi from '@/assets/icons/wifi.svg';
import IconWifiSlash from '@/assets/icons/wifi.slash.svg';

let unsubscribeNetInfo: NetInfoSubscription | null;

/** 连接状态 */
const enum ConnectState {
  Pending = 1,
  Failed,
  Successful,
}

const TransferScreen: NavigationFunctionComponent =
  observer<NavigationComponentProps>(props => {
    const { ui, user, global } = useStore();
    const [url, setUrl] = useState<string | undefined>();
    const [connectState, setConnectState] = useState<ConnectState>(
      ConnectState.Pending,
    );

    useStat('Transfer');

    useNavigationButtonPress(
      () => {
        services.nav.screens?.dismissModal('Transfer');
      },
      props.componentId,
      'cancel',
    );

    useNavigationComponentDidAppear(() => {
      subscribeNetInfo();
    }, props.componentId);

    useNavigationComponentDidDisappear(() => {
      stopHttpServer();
      unsubscribeNetInfo?.();
      unsubscribeNetInfo = null;
      setConnectState(ConnectState.Pending);
    }, props.componentId);

    function subscribeNetInfo() {
      if (unsubscribeNetInfo) return;

      unsubscribeNetInfo = NetInfo.addEventListener(state => {
        if (state.type === NetInfoStateType.wifi) {
          if (connectState !== ConnectState.Successful) {
            startHttpServer();
          }
        } else {
          setConnectState(ConnectState.Failed);
          RNToasty.Show({
            title: '请打开 WI-FI 后重试',
            position: 'top',
          });
        }
      });
    }

    useEffect(() => {
      global.setEnableMask(false);
      KeepAwake.activateKeepAwake();
      NetInfo.fetch().then(state => {
        if (state.type === NetInfoStateType.wifi) {
          startHttpServer().catch(() => {
            startHttpServer().catch(() => {
              Alert.alert('连接失败，请重试！', undefined, [
                {
                  text: '确定',
                },
              ]);
              services.nav.screens?.pop(props.componentId);
            });
          });
        }
      });

      return () => {
        global.setEnableMask(true);
        KeepAwake.deactivateKeepAwake();
      };
    }, []);

    useEffect(() => {
      if (connectState === ConnectState.Failed) {
        setUrl(undefined);
      }
    }, [connectState]);

    async function startHttpServer() {
      await stopHttpServer();
      const ip = await platformInfo.getIpAddressAsync();
      const port = randomNumRange(5000, 60000);

      await HttpServer.start(
        port,
        'http_service',
        async (request, response) => {
          if (request.method === 'OPTIONS') {
            response.send(200);
          }
          // 获取网站
          else if (
            request.method === 'GET' &&
            !request.url.startsWith('/api/')
          ) {
            let filePath = join(WebClient.path, request.url);
            if (request.url === '/') {
              filePath = join(WebClient.path, 'index.html');
            }

            if (!(await FS.exists(filePath))) {
              response.send(404);
              return;
            }
            response.sendFile(filePath);
          }
          // 获取相册
          else if (request.method === 'GET' && request.url === '/api/folders') {
            try {
              const res = await services.api.local.listAlbum({
                owner: user.userInfo!.id,
              });
              response.send(
                200,
                'application/json',
                JSON.stringify({
                  code: 0,
                  data: {
                    list: res.data.list.map(item => {
                      delete item.cover;
                      delete item.owner;
                      delete item.extra;
                      delete item.file_count;
                      return item;
                    }),
                    total: res.data.total,
                  },
                }),
              );
            } catch (error) {
              response.send(500);
            }
            // 获取文件
          } else if (
            request.method === 'GET' &&
            request.url.startsWith('/api/files')
          ) {
            try {
              const res = await services.api.local.listFile({
                owner: user.userInfo!.id,
                parent_id: request.query.folderId as string,
                status: FileStatus.Normal,
              });
              response.send(
                200,
                'application/json',
                JSON.stringify({
                  code: 0,
                  data: {
                    list: res.data.list.map(item => {
                      const sourceUrl = `http://${ip}:${port}/api/source${
                        item.uri.split('source')[1]
                      }`;
                      const thumbnailUrl = item.thumbnail.split('thumbnail')[1]
                        ? `http://${ip}:${port}/api/thumbnail${
                            item.thumbnail.split('thumbnail')[1]
                          }`
                        : sourceUrl;

                      const _item = {
                        ...item,
                        thumbnail: thumbnailUrl,
                        source: sourceUrl,
                      };

                      delete _item.uri;
                      delete _item.extra;
                      delete _item.owner;
                      return _item;
                    }),
                    total: res.data.total,
                  },
                }),
              );
            } catch (error) {
              response.send(500);
            }
            // 上传文件
          } else if (
            request.method === 'POST' &&
            request.url.startsWith('/api/file/upload')
          ) {
            const { file, query } = request;
            if (!file?.path) {
              response.send(400);
              return;
            }
            const tempPath = join(
              TEMP_PATH,
              generateID() + extname(file.filename),
            );
            await FS.moveFile(file.path, tempPath);

            try {
              await createFiles([
                await transformResult(
                  {
                    uri: tempPath,
                    mime: file?.mimeType,
                    name: file?.filename,
                  },
                  query.folderId,
                ),
              ]);
              response.send(200);
            } catch (error) {
              response.send(500);
            }
            // 获取缩略图
          } else if (
            request.method === 'GET' &&
            request.url.startsWith('/api/thumbnail/')
          ) {
            response.sendFile(
              request.url.replace('/api/thumbnail', THUMBNAIL_PATH),
            );

            // 下载文件
          } else if (
            request.method === 'GET' &&
            request.url.startsWith('/api/source/')
          ) {
            response.sendFile(request.url.replace('/api/source', SOURCE_PATH));
          } else {
            response.send(404);
          }
        },
      );

      console.log(`http://${ip}:${port}`);
      setUrl(`http://${ip}:${port}`);
      setConnectState(ConnectState.Successful);
    }

    async function stopHttpServer() {
      return await HttpServer.stop();
    }

    const handleShareUrl = useCallback(() => {
      if (url) {
        Share.share({
          url,
        });
      }
    }, [url]);

    return (
      <SafeAreaScrollView
        style={[
          styles.container,
          {
            backgroundColor:
              ui.appearance === 'dark'
                ? ui.colors.systemBackground
                : ui.colors.secondarySystemBackground,
          },
        ]}
        contentContainerStyle={styles.content}>
        <View style={styles.wifiContainer}>
          {connectState !== ConnectState.Failed ? (
            <IconWifi
              style={styles.wifi}
              width={60}
              height={60}
              fill={
                connectState === ConnectState.Pending
                  ? ui.colors.systemGray2
                  : ui.colors.systemGreen
              }
            />
          ) : (
            <IconWifiSlash
              style={styles.wifi}
              width={60}
              height={60}
              fill={ui.colors.systemRed}
            />
          )}
          {connectState === ConnectState.Failed && (
            <Text
              style={[
                styles.errorTip,
                {
                  color: ui.colors.systemRed,
                },
              ]}>
              请检查 WI-FI 连接
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.tip,
            {
              color: ui.colors.secondaryLabel,
            },
          ]}
          numberOfLines={4}>
          在您的电脑或其他设备的浏览器中通过输入或扫描二维码打开以下网址。
          <Text
            style={[
              styles.tipBold,
              {
                color: ui.colors.label,
              },
            ]}>
            必须连接到同一个WI-FI，请勿离开本页面
          </Text>
        </Text>
        <View
          style={[
            styles.urlContainer,
            {
              backgroundColor:
                ui.appearance === 'dark'
                  ? ui.colors.secondarySystemBackground
                  : ui.colors.systemBackground,
            },
          ]}>
          <Text
            style={[
              styles.url,
              {
                color: ui.colors.systemBlue,
              },
            ]}
            selectable>
            {url}
          </Text>
          <IconButton
            name="ios-share-outline"
            size={24}
            color={ui.themes.primary}
            onPress={handleShareUrl}
          />
        </View>
        <View
          style={[
            styles.QRCodeContainer,
            {
              borderColor: ui.colors.quaternaryLabel,
            },
          ]}>
          {url && <QRCode size={180} value={url} />}
        </View>
      </SafeAreaScrollView>
    );
  });

export default TransferScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  wifiContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  wifi: {
    overflow: 'hidden',
  },
  errorTip: {
    marginTop: 10,
  },
  tip: {
    width: 310,
    marginTop: 70,
    marginBottom: 20,
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: 'bold',
  },
  urlContainer: {
    width: 310,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 80,
  },
  url: {
    fontSize: 18,
    fontWeight: '500',
  },
  QRCodeContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
