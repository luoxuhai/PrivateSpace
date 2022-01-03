import React, {
  useImperativeHandle,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { OptionsModalPresentationStyle } from 'react-native-navigation';
import Animated, { FadeOut, FadeIn, FadeInUp } from 'react-native-reanimated';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useQuery } from 'react-query';

import { services } from '@/services';
import { FileType, FileStatus } from '@/services/db/file';
import { useStore } from '@/store';
import { GalleryList } from '@/screens/ImageList';
import { ImageItemBlock } from '@/screens/ImageList/ImageItem';
import { AlbumCard } from './index';
import { Empty } from '@/components/Empty';

const AnimatedSegmentedControl =
  Animated.createAnimatedComponent(SegmentedControl);

const filterOptions = [
  {
    label: '全部',
    key: 0,
  },
  {
    label: '相册',
    key: 1,
  },
  {
    label: '图片',
    key: 2,
  },
  {
    label: '视频',
    key: 3,
  },
];

export const SearchPanel = observer(
  (props, ref) => {
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState<string | undefined>();
    const { ui, user } = useStore();
    const [selectedTypeIndex, setSelectedTypeIndex] = useState<number>(
      filterOptions[0].key,
    );

    useEffect(() => {
      if (!visible) {
        reset();
      }
    }, [visible]);

    const reset = useCallback(() => {
      setSelectedTypeIndex(filterOptions[0].key);
      setValue(undefined);
    }, []);

    const statusBarHeight =
      services.nav.screens?.getConstants()?.statusBarHeight;

    const segmentedControlTop = useMemo(
      () => statusBarHeight! + 60,
      [statusBarHeight],
    );

    useImperativeHandle(ref, () => ({
      show() {
        setVisible(true);
      },
      search(v: string) {
        setValue(v);
      },
      hide() {
        setVisible(false);
      },
    }));

    const searchExtraCondition = useMemo(() => {
      switch (selectedTypeIndex) {
        case filterOptions[0].key:
          return {};
        case filterOptions[1].key:
          return {
            type: FileType.Folder,
          };
        case filterOptions[2].key:
          return {
            mime: 'image',
          };
        case filterOptions[3].key:
          return {
            mime: 'video',
          };
      }
    }, [selectedTypeIndex]);

    const { data: searchResult, refetch: refetchSearch } = useQuery<
      {
        list: any[];
      },
      string | undefined
    >(
      ['search.panel', value, searchExtraCondition],
      async () => {
        const res = value
          ? await services.api.local.searchFile({
              keywords: value!,
              status: FileStatus.Normal,
              owner: user.userInfo?.id,
              ...searchExtraCondition,
            })
          : null;

        return {
          list: res?.data.list,
          total: res?.data.total ?? 0,
        };
      },
      {
        enabled: true,
      },
    );

    const images = useMemo(
      () => searchResult?.list?.filter(item => item.type === FileType.File),
      [searchResult?.list],
    );

    function handlePress(item, index?: number) {
      switch (item.type) {
        case FileType.Folder:
          services.nav.screens?.push(
            props.componentId,
            'ImageList',
            {
              albumName: item.name,
              albumId: item.id,
              hasImage: !!item.file_count,
            },
            {
              bottomTabs: {
                visible: false,
              },
            },
          );
          break;
        default:
          services.nav.screens?.show(
            'ImageView',
            {
              initialIndex: images?.findIndex(images => images.id === item.id),
              images,
              onRefetch: refetchSearch,
            },
            {
              modalPresentationStyle:
                OptionsModalPresentationStyle.overFullScreen,
            },
          );
      }
    }

    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[
          styles.container,
          {
            display: visible ? 'flex' : 'none',
            backgroundColor: ui.colors.systemBackground,
          },
        ]}>
        {visible && (
          <AnimatedSegmentedControl
            style={[
              styles.segment,
              {
                top: segmentedControlTop,
              },
            ]}
            entering={FadeInUp.duration(200).delay(100)}
            values={filterOptions.map(item => item.label)}
            selectedIndex={selectedTypeIndex}
            onChange={event => {
              setSelectedTypeIndex(event.nativeEvent.selectedSegmentIndex);
            }}
          />
        )}

        <Animated.View
          style={[
            styles.result,
            {
              marginTop: statusBarHeight! + 110,
            },
          ]}
          entering={FadeIn}
          exiting={FadeOut}>
          <GalleryList
            style={[
              {
                backgroundColor: ui.colors.systemBackground,
              },
            ]}
            data={searchResult?.list}
            ListEmptyComponent={
              searchResult?.list && (
                <Empty
                  style={{
                    marginTop: segmentedControlTop + 40,
                  }}
                />
              )
            }
            renderItem={({ item, itemStyle, index }) => {
              return (
                <>
                  {item.extra?.is_album ? (
                    <AlbumCard
                      style={{
                        height: itemStyle.width,
                      }}
                      footerStyle={{
                        height: 40,
                      }}
                      data={item}
                      onPress={() => handlePress(item)}
                    />
                  ) : (
                    <ImageItemBlock
                      style={{
                        height: itemStyle.width,
                      }}
                      index={index}
                      data={item}
                      onPress={() => {
                        handlePress(item, index);
                      }}
                    />
                  )}
                </>
              );
            }}
          />
        </Animated.View>
      </Animated.View>
    );
  },
  {
    forwardRef: true,
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
    zIndex: 999,
  },
  segment: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 16,
  },
  result: {
    flex: 1,
  },
});
