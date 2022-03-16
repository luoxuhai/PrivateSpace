import React, {
  useImperativeHandle,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { observer } from 'mobx-react-lite';
import { OptionsModalPresentationStyle } from 'react-native-navigation';
import Animated, { FadeOut, FadeIn, FadeInDown } from 'react-native-reanimated';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useQuery } from 'react-query';

import { services } from '@/services';
import { FileType } from '@/services/database/entities/file.entity';
import { useStore } from '@/store';
import { useUIFrame } from '@/hooks';
import GridList from '@/components/GridList';
import { ImageItemBlock } from '@/screens/PhotoList/ImageItem';
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
    const { ui } = useStore();
    const [selectedTypeIndex, setSelectedTypeIndex] = useState<number>(
      filterOptions[0].key,
    );
    const UIFrame = useUIFrame();

    useEffect(() => {
      if (!visible) {
        reset();
      }
    }, [visible]);

    const reset = useCallback(() => {
      setSelectedTypeIndex(filterOptions[0].key);
      setValue(undefined);
    }, []);

    const statusBarHeight = UIFrame.statusBarHeight;

    const segmentedControlTop = useMemo(
      () => statusBarHeight + 60,
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
          ? await services.api.global.search({
              keyword: value,
              ...searchExtraCondition,
            })
          : null;

        return {
          list: res?.items ?? [],
          total: res?.total ?? 0,
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

    function handlePress(item) {
      switch (item.type) {
        case FileType.Folder:
          services.nav.screens?.push(
            props.componentId,
            'ImageList',
            {
              albumName: item.name,
              albumId: item.id,
              hasImage: !!item.item_total,
              count: {
                image: item.image_total,
                video: item.video_total,
              },
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

    const viewStyle: ViewStyle = useMemo(
      () => ({
        display: visible ? 'flex' : 'none',
        backgroundColor: ui.colors.systemBackground,
      }),
      [visible, ui.colors.systemBackground],
    );

    const renderItem = useCallback(({ item, index }) => {
      return (
        <>
          {item.extra?.is_album ? (
            <AlbumCard
              footerStyle={{
                height: 40,
              }}
              data={item}
              onPress={() => handlePress(item)}
            />
          ) : (
            <ImageItemBlock
              index={index}
              data={item}
              onPress={() => {
                handlePress(item, index);
              }}
            />
          )}
        </>
      );
    }, []);

    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.container, viewStyle]}>
        {visible && (
          <AnimatedSegmentedControl
            style={[
              styles.segment,
              {
                top: segmentedControlTop,
              },
            ]}
            entering={FadeInDown.duration(200).delay(100)}
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
              marginTop: statusBarHeight + 110,
            },
          ]}
          entering={FadeIn}
          exiting={FadeOut}>
          <GridList
            style={[
              {
                backgroundColor: ui.colors.systemBackground,
              },
            ]}
            data={searchResult?.list ?? []}
            itemWidth={100}
            gutter={2}
            externalGutter={false}
            gridEnabled
            ListEmptyComponent={
              searchResult?.list && (
                <Empty
                  style={{
                    marginTop: segmentedControlTop + 40,
                  }}
                />
              )
            }
            renderItem={renderItem}
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
