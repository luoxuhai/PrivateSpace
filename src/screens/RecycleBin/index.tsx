import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
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
import { SelectedMask } from '@/screens/PhotoList';
import { ImageItemBlock } from '@/screens/PhotoList/ImageItem';
import { useStore } from '@/store';
import { FileStatus } from '@/services/database/entities/file.entity';
import { ToolbarContainer, SourceType } from './ToolbarContainer';
import { useTranslation } from 'react-i18next';
import { useUpdateEffect, useForceRender } from '@/hooks';
import { ContextMenu } from './ContextMenu';
import { DataLoadStatus } from '@/components/DataLoadStatus';
import { clearRecycleBin } from './clearRecycleBin';
import GridList from '@/components/GridList';
import FileList from '../FileManager/components/FileList';

const RecycleBinScreen: NavigationFunctionComponent<
  NavigationComponentProps
> = props => {
  const { ui, global } = useStore();
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { visible, forceRender } = useForceRender();
  const [selectedIndex, setSelectedIndex] = useState<SourceType>(
    SourceType.Album,
  );

  const {
    isLoading,
    data: photosData,
    refetch: refetchFileList,
  } = useQuery(
    ['recycle.bin.photos.', selectedIndex],
    async () => {
      let res;
      try {
        res = await services.api[
          selectedIndex === SourceType.Album ? 'photo' : 'file'
        ].list({
          status: FileStatus.Deleted,
          order_by: { mtime: 'DESC' },
        });
      } catch (error) {
        console.log(error);
      }

      return {
        items: res?.items ?? [],
        total: res?.total ?? 0,
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

    if (photosData?.total) {
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
  }, [photosData?.total]);

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

  async function handleImagePress(item: API.PhotoWithSource) {
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
          {t('recycleBin:tip', {
            duration: global.settingInfo.recycleBin.keep ?? 30,
          })}
        </Text>
        {!global.settingInfo.recycleBin?.enabled && (
          <Text
            style={[
              styles.enabledTip,
              {
                color: ui.colors.secondaryLabel,
              },
            ]}>
            {t('recycleBin:enableTip')}
          </Text>
        )}
      </View>
    ),
    [ui.appearance, global.settingInfo.recycleBin, t],
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      return visible ? (
        <ContextMenu
          item={item}
          disabled={isSelectMode}
          sourceType={selectedIndex}>
          <ImageItemBlock
            index={index}
            data={item}
            onPress={() => handleImagePress(item)}
          />
          {isSelectMode && selectedIds?.includes(item.id) && <SelectedMask />}
        </ContextMenu>
      ) : null;
    },
    [visible, isSelectMode, selectedIds],
  );

  return (
    <SafeAreaView style={styles.safeAreaView}>
      {/* <SegmentedControl
        style={[styles.segment]}
        selectedIndex={selectedIndex}
        values={[
          t('album:navigation.title'),
          t('fileManager:navigation.title'),
        ]}
        onChange={event => {
          setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          HapticFeedback.selection();
        }}
      /> */}

      {selectedIndex === SourceType.Album ? (
        <GridList
          style={[
            styles.galleryList,
            {
              backgroundColor: ui.colors.systemBackground,
            },
          ]}
          itemWidth={100}
          gutter={2}
          externalGutter={false}
          gridEnabled
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={
            <DataLoadStatus loading={isLoading} text={t('imageList:noData')} />
          }
          data={photosData?.items ?? []}
          renderItem={renderItem}
        />
      ) : (
        <FileList
          data={photosData?.items ?? []}
          ListEmptyComponent={
            <DataLoadStatus
              loading={isLoading}
              text={t('fileManager:noData')}
            />
          }
        />
      )}
      <ToolbarContainer
        visible={isSelectMode}
        selectedIds={selectedIds}
        sourceType={selectedIndex}
        onDone={() => {
          setIsSelectMode(false);
          refetchFileList();
        }}
      />
    </SafeAreaView>
  );
};

export default observer(RecycleBinScreen);

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  galleryList: {},
  headerTip: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  empty: {
    marginTop: '50%',
  },
  enabledTip: {
    marginTop: 4,
  },
  segment: {
    marginTop: 10,
    marginHorizontal: '10%',
  },
});
