import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';
import {
  useNavigationButtonPress,
  useNavigationComponentDidAppear,
  useNavigationComponentDidDisappear,
} from 'react-native-navigation-hooks';
import { useQuery } from 'react-query';
import FileViewer from 'react-native-file-viewer';

import { services } from '@/services';
import { GalleryList, SelectedMask } from '@/screens/ImageList';
import { ImageItemBlock } from '@/screens/ImageList/ImageItem';
import { IListFileData } from '@/services/api/local/type.d';
import { useStore } from '@/store';
import { FileStatus } from '@/services/db/file';
import { ToolbarContainer } from './ToolbarContainer';
import { useTranslation } from 'react-i18next';
import { useUpdateEffect, useForceRender } from '@/hooks';
import { ContextMenu } from './ContextMenu';
import { DataLoadStatus } from '@/components/DataLoadStatus';
import { clearRecycleBin } from './clearRecycleBin';

const RecycleBinScreen: NavigationFunctionComponent<
  NavigationComponentProps
> = props => {
  const { ui, user, global } = useStore();
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const contextMenuRef = useRef<{ forceUpdate: () => void }>();
  const { visible, forceRender } = useForceRender();

  const {
    isLoading,
    data: fileListResult,
    refetch: refetchFileList,
  } = useQuery(
    'recycle.bin.image.list',
    async () => {
      let res;
      try {
        res = await services.api.local.listFile({
          owner: user.userInfo!.id,
          status: FileStatus.Deleted,
          order: { mtime: 'DESC' },
        });
      } catch (error) {
        console.log(error);
      }

      return {
        list: res?.data?.list ?? [],
        total: res?.data?.total ?? 0,
      };
    },
    {
      enabled: true,
    },
  );

  // focus
  useNavigationComponentDidAppear(() => {
    clearRecycleBin();
    refetchFileList();
  }, props.componentId);

  // blur
  useNavigationComponentDidDisappear(() => {
    forceRender();
  }, props.componentId);

  useEffect(() => {
    if (isSelectMode) {
      return;
    }

    const settingButton =
      services.nav.screens!.get('RecycleBin').options!.topBar!
        .rightButtons![0]!;
    const rightButtons = [settingButton];

    if (fileListResult?.total) {
      rightButtons[1] = {
        id: 'select',
        text: t('common:select'),
      };
    } else {
      setIsSelectMode(false);
    }

    services.nav.screens?.N.mergeOptions(props.componentId, {
      topBar: {
        rightButtons,
      },
    });
  }, [fileListResult?.total]);

  // 选择模式
  useUpdateEffect(() => {
    if (isSelectMode) {
      services.nav.screens?.N.mergeOptions(props.componentId, {
        topBar: {
          backButton: {
            visible: false,
          },
          rightButtons: [
            {
              id: 'cancelSelect',
              text: t('common:cancel'),
            },
          ],
        },
        bottomTabs: {
          visible: false,
        },
      });
    } else {
      setSelectedIds([]);
      services.nav.screens?.N.mergeOptions(props.componentId, {
        topBar: {
          backButton: {
            visible: true,
          },
          rightButtons: [
            ...services.nav.screens.get('RecycleBin').options?.topBar
              ?.rightButtons,
            {
              id: 'select',
              text: t('common:select'),
            },
          ],
        },
        bottomTabs: {
          visible: true,
        },
      });
    }
  }, [isSelectMode]);

  // 取消选择
  useNavigationButtonPress(
    () => {
      setIsSelectMode(false);
    },
    props.componentId,
    'cancelSelect',
  );

  // 选择模式
  useNavigationButtonPress(
    () => {
      setIsSelectMode(true);
    },
    props.componentId,
    'select',
  );

  // 选择模式
  useNavigationButtonPress(
    () => {
      services.nav.screens?.push(props.componentId, 'RecycleBinSetting');
    },
    props.componentId,
    'config',
  );

  async function handleImagePress(item: IListFileData) {
    if (isSelectMode) {
      setSelectedIds(prev => {
        const newData = prev?.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id];
        return newData;
      });
    } else {
      FileViewer.open(item.uri, {
        displayName: item.name,
      });
    }
  }

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.headerTip}>
        <Text
          style={{
            color: ui.colors.secondaryLabel,
          }}>
          最多保留{global.settingInfo.recycleBin.keep ?? 30}天，之后将永久删除。
        </Text>
        {!global.settingInfo.recycleBin?.enabled && (
          <Text
            style={[
              styles.enabledTip,
              {
                color: ui.colors.secondaryLabel,
              },
            ]}>
            回收站已关闭，可在右上角设置中打开。
          </Text>
        )}
      </View>
    ),
    [ui.appearance, global.settingInfo.recycleBin],
  );

  return (
    <>
      <GalleryList
        style={[
          styles.galleryList,
          {
            backgroundColor: ui.colors.systemBackground,
          },
        ]}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <DataLoadStatus loading={isLoading} text={t('imageList:noData')} />
        }
        data={fileListResult?.list}
        renderItem={
          visible
            ? ({ item, itemStyle, index }) => {
                return (
                  <ContextMenu
                    ref={contextMenuRef}
                    item={item}
                    disabled={isSelectMode}>
                    <ImageItemBlock
                      style={{
                        height: itemStyle.width,
                      }}
                      index={index}
                      data={item}
                      onPress={() => handleImagePress(item)}
                    />
                    {isSelectMode && selectedIds?.includes(item.id) && (
                      <SelectedMask />
                    )}
                  </ContextMenu>
                );
              }
            : () => <></>
        }
      />
      <ToolbarContainer
        visible={isSelectMode}
        selectedIds={selectedIds}
        onDone={() => {
          setIsSelectMode(false);
          refetchFileList();
        }}
      />
    </>
  );
};

export default observer(RecycleBinScreen);

const styles = StyleSheet.create({
  galleryList: {
    paddingTop: 0,
  },
  headerTip: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  empty: {
    marginTop: '50%',
  },
  enabledTip: {
    marginTop: 4,
  },
});
