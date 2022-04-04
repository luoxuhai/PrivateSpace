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
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
import { FileStatus } from '@/services/database/entities/file.entity';
import { transformResult } from '@/screens/PhotoList/AddButton';
import { createFiles } from '@/utils/initShare';
import { systemInfo, join, extname, generateID, randomNumRange } from '@/utils';
import { THUMBNAIL_PATH, SOURCE_PATH, TEMP_PATH, DATA_PATH } from '@/config';
import { IconButton } from '@/components/Icon';
import SafeAreaScrollView from '@/components/SafeAreaScrollView';
import { services } from '@/services';
import WebClient from './WebClient';
import { HapticFeedback } from '@/utils';
import { RNToasty } from 'react-native-toasty';

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
    const { ui, global } = useStore();
    const { t } = useTranslation();
    const [url, setUrl] = useState<string | undefined>();
    const [connectState, setConnectState] = useState<ConnectState>(
      ConnectState.Pending,
    );

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
            title: t('transfer:wifiTip'),
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
              Alert.alert(t('transfer:connectFail'), undefined, [
                {
                  text: t('common:confirm'),
                },
              ]);
              services.nav.screens?.pop(props.componentId);
            });
          });
        }
      });
      WebClient.update(true);

      return () => {
        global.setEnableMask(true);
        KeepAwake.deactivateKeepAwake();
      };
    }, []);

    useEffect(() => {
      if (connectState === ConnectState.Failed) {
        setUrl(undefined);
        HapticFeedback.notificationAsync.error();
      }
    }, [connectState]);

    async function startHttpServer() {
      await stopHttpServer();
      const ip = await systemInfo.getIpAddressAsync();
      const port = randomNumRange(5000, 60000);
      const origin = `http://${ip}:${port}`;

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

            if (await FS.exists(filePath)) {
              response.sendFile(filePath);
              return;
            }
            response.send(404);
          }
          // 获取相册
          else if (request.method === 'GET' && request.url === '/api/albums') {
            try {
              const res = await services.api.album.list({
                status: FileStatus.Normal,
              });
              response.send(
                200,
                'application/json',
                JSON.stringify({
                  code: 0,
                  data: {
                    list: res.items.map(item => {
                      delete item.extra;
                      item.cover = item.cover?.replace(
                        DATA_PATH,
                        `${origin}/api`,
                      );
                      return item;
                    }),
                    total: res.total,
                  },
                }),
              );
            } catch (error) {
              response.send(500);
            }
            // 获取文件
          } else if (
            request.method === 'GET' &&
            request.url.startsWith('/api/photos')
          ) {
            try {
              const res = await services.api.photo.list({
                parent_id: request.query.parent_id as string,
                status: FileStatus.Normal,
              });
              response.send(
                200,
                'application/json',
                JSON.stringify({
                  code: 0,
                  data: {
                    list: res.items.map(item => {
                      const sourceUrl = `${origin}/api/source${
                        item.uri?.split('source')[1]
                      }`;
                      const thumbnailUrl = (
                        item.thumbnail ||
                        item.poster ||
                        sourceUrl
                      )?.replace(DATA_PATH, `${origin}/api`);

                      const poster =
                        item.poster?.replace(DATA_PATH, `${origin}/api`) ||
                        thumbnailUrl;

                      const _item = {
                        ...item,
                        thumbnail: thumbnailUrl,
                        source: sourceUrl,
                        poster: poster,
                      };

                      delete _item.uri;
                      delete _item.extra;
                      return _item;
                    }),
                    total: res.total,
                  },
                }),
              );
            } catch (error) {
              response.send(500);
            }
            // 上传文件
          } else if (
            request.method === 'POST' &&
            request.url.startsWith('/api/photos/upload')
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
                  query.album_id,
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
            const uri = decodeURI(
              request.url.replace('/api/source', SOURCE_PATH),
            );
            if (!(await FS.exists(uri))) {
              response.send(404);
              return;
            }
            response.sendFile(uri);
          } else {
            response.send(404);
          }
        },
      );

      setUrl(origin);
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
              {t('transfer:errorTip')}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.tip,
            {
              color: ui.colors.secondaryLabel,
            },
          ]}>
          {t('transfer:tip1')}
          <Text
            style={[
              styles.tipBold,
              {
                color: ui.colors.label,
              },
            ]}>
            {t('transfer:tip2')}
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
