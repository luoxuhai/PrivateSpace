import React, {
  useImperativeHandle,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import {
  OptionsModalPresentationStyle,
  NavigationComponentProps,
} from 'react-native-navigation';
import Animated, { FadeOut, FadeIn, FadeInDown } from 'react-native-reanimated';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useQuery } from 'react-query';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { services } from '@/services';
import { FileType } from '@/services/database/entities/file.entity';
import { useStore } from '@/store';
import { useUIFrame } from '@/hooks';
import { GridSectionList } from '@/components/GridList';
import { ImageItemBlock } from '@/screens/PhotoList/ImageItem';
import { AlbumCard } from './index';
import { isEmpty } from 'lodash';
import { HapticFeedback } from '@/utils';

const AnimatedSegmentedControl =
  Animated.createAnimatedComponent(SegmentedControl);

type SearchPanelProps = NavigationComponentProps;

interface SearchPanelInstance {
  show: () => void;
  search: (v: string) => void;
  hide: () => void;
}

export const SearchPanel = observer<SearchPanelProps, SearchPanelInstance>(
  forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState<string | undefined>();
    const { ui } = useStore();
    const { t } = useTranslation();
    const UIFrame = useUIFrame();
    const photos = useRef<API.PhotoWithSource[]>();
    const containerOpacity = useSharedValue(0.5);

    const filterOptions = useMemo(
      () => [
        {
          label: t('common:all'),
          key: 0,
        },
        {
          label: t('fileManage:file.type.album'),
          key: 1,
        },
        {
          label: t('fileManage:file.type.image'),
          key: 2,
        },
        {
          label: t('fileManage:file.type.video'),
          key: 3,
        },
      ],
      [t],
    );

    const [selectedTypeIndex, setSelectedTypeIndex] = useState<number>(
      filterOptions[0].key,
    );

    const containerStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(containerOpacity.value, {
          duration: 100,
        }),
        display: visible ? 'flex' : 'none',
        backgroundColor: ui.colors.systemBackground,
      };
    }, [visible, ui.colors.systemBackground]);

    useEffect(() => {
      if (visible) {
        containerOpacity.value = 1;
      } else {
        containerOpacity.value = 0;
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

    const renderAlbumItem = useCallback(
      ({ item }) => (
        <AlbumCard
          footerStyle={styles.albumFooter}
          style={styles.album}
          data={item}
          onPress={() => handlePress(item)}
        />
      ),
      [],
    );

    const renderPhotoItem = useCallback(
      ({ item, index }) => (
        <ImageItemBlock
          index={index}
          data={item}
          onPress={() => handlePress(item)}
        />
      ),
      [],
    );

    const sections = useMemo(
      () =>
        [
          {
            key: 'album',
            title: t('fileManage:file.type.album'),
            data: searchResult?.list?.filter(
              item => item.type === FileType.Folder,
            ),
            itemHeight: styles.album.height,
            externalGutter: true,
            gutter: 4,
            itemWidth: 120,
            renderItem: renderAlbumItem,
          },
          {
            key: 'photo',
            title: '图片/视频',
            data: searchResult?.list?.filter(
              item => item.type === FileType.File,
            ),
            renderItem: renderPhotoItem,
          },
        ] ?? [],
      [searchResult?.list],
    );

    useEffect(() => {
      photos.current = sections?.[1]?.data ?? [];
    }, [sections]);

    function handlePress(item: any) {
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
              initialIndex: photos.current?.findIndex(
                photo => photo.id === item.id,
              ),
              images: photos.current,
              onRefetch: refetchSearch,
            },
            {
              modalPresentationStyle:
                OptionsModalPresentationStyle.overFullScreen,
            },
          );
      }
    }

    const renderSectionHeader = useCallback(
      ({ section }) => {
        return section.key === 'photo' &&
          selectedTypeIndex === 0 &&
          !isEmpty(sections[0].data) &&
          !isEmpty(section.data) ? (
          <View
            style={[
              styles.sectionHeader,
              {
                backgroundColor: ui.colors.systemBackground,
              },
            ]}>
            {/* <Text
            style={[
              styles.sectionHeaderText,
              {
                color: ui.colors.label,
              },
            ]}>
            {section.title}
          </Text> */}
          </View>
        ) : null;
      },
      [selectedTypeIndex, sections],
    );

    return (
      <Animated.View style={[styles.container, containerStyle]}>
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
              HapticFeedback.selection();
            }}
          />
        )}

        <Animated.View
          style={[
            styles.result,
            {
              marginTop: statusBarHeight + 105,
            },
          ]}
          entering={FadeIn}
          exiting={FadeOut}>
          <GridSectionList
            style={[
              {
                backgroundColor: ui.colors.systemBackground,
              },
            ]}
            sections={sections}
            itemWidth={100}
            gutter={2}
            externalGutter={false}
            stickySectionHeadersEnabled={false}
            gridEnabled
            renderSectionHeader={renderSectionHeader}
          />
        </Animated.View>
      </Animated.View>
    );
  }),
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
  albumFooter: {
    height: 40,
  },
  album: {
    height: 160,
  },
  sectionHeader: {
    height: 20,
    justifyContent: 'center',
    paddingLeft: 5,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
