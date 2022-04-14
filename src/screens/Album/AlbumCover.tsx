import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';
import { observer } from 'mobx-react-lite';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useMutation, useQuery } from 'react-query';
import { PagerView } from 'react-native-pager-view';
import chroma from 'chroma-js';
import { Asset } from 'expo-asset';
import { useTranslation } from 'react-i18next';

import { services } from '@/services';
import FileEntity, {
  FileStatus,
} from '@/services/database/entities/file.entity';
import { useStore } from '@/store';
import { useUpdateEffect, useUIFrame } from '@/hooks';
import { ImageItemBlock } from '@/screens/PhotoList/ImageItem';
import IconCheckmarkCircle from '@/assets/icons/checkmark.circle.svg';
import { DataLoadStatus } from '@/components/DataLoadStatus';
import GridList from '@/components/GridList';
import { HapticFeedback } from '@/utils';

const image2 = Asset.fromModule(require('@/assets/images/cover-2.jpg')).uri;
const image3 = Asset.fromModule(require('@/assets/images/cover-3.jpg')).uri;
const image4 = Asset.fromModule(require('@/assets/images/cover-4.jpg')).uri;
const image5 = Asset.fromModule(require('@/assets/images/cover-5.jpg')).uri;
const image6 = Asset.fromModule(require('@/assets/images/cover-6.jpg')).uri;
const image7 = Asset.fromModule(require('@/assets/images/cover-7.jpg')).uri;
const image8 = Asset.fromModule(require('@/assets/images/cover-8.jpg')).uri;
const image9 = Asset.fromModule(require('@/assets/images/cover-9.jpg')).uri;
const image10 = Asset.fromModule(require('@/assets/images/cover-10.jpg')).uri;
const image11 = Asset.fromModule(require('@/assets/images/cover-11.jpg')).uri;
const image12 = Asset.fromModule(require('@/assets/images/cover-12.jpg')).uri;
const image13 = Asset.fromModule(require('@/assets/images/cover-13.jpg')).uri;
const image14 = Asset.fromModule(require('@/assets/images/cover-14.jpg')).uri;

export const localCovers = [
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
  image13,
  image14,
].map(item => ({
  thumbnail: item,
}));

interface IAlbumCoverProps extends NavigationComponentProps {
  album: FileEntity;
}

const AlbumCover: NavigationFunctionComponent<IAlbumCoverProps> = props => {
  const { ui } = useStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useTranslation();
  const [selectedCoverId, setSelectedCoverId] = useState<
    string | undefined | null
  >(props.album?.extra?.cover);
  const UIFrame = useUIFrame();
  const pagerViewRef = useRef<PagerView>(null);

  const pageViews = useMemo(
    () => [
      {
        label: t('albumCover:tab.item'),
        key: 0,
      },
      {
        label: t('albumCover:tab.system'),
        key: 1,
      },
    ],
    [t],
  );

  useNavigationButtonPress(handleCloseModal, props.componentId, 'cancel');

  useEffect(() => {
    pagerViewRef.current?.setPage(selectedIndex);
  }, [selectedIndex]);

  useUpdateEffect(() => {
    if (selectedCoverId) {
      handleUpdateCover();
    }
  }, [selectedCoverId]);

  const { refetch: refetchAlbumList } = useQuery('albums', {
    enabled: false,
  });

  const { mutate: handleUpdateCover } = useMutation<void, unknown>(async () => {
    try {
      await services.api.album.update({
        where: {
          id: props.album.id,
        },
        data: {
          extra: {
            cover: selectedCoverId,
          },
        },
      });
      refetchAlbumList();
      handleCloseModal();
    } catch (error) {}
  });

  function handleCloseModal() {
    services.nav.screens?.N.dismissModal(props.componentId);
  }

  const { data: fileList, isLoading } = useQuery(
    [props.album.id, '.photos'],
    async () => {
      const res = await services.api.photo.list({
        parent_id: props.album.id,
        status: FileStatus.Normal,
      });

      return {
        list: res?.items ?? [],
        total: res?.total ?? 0,
      };
    },
    {
      enabled: true,
    },
  );

  const renderItem = useCallback(
    ({ item, index, page }) => {
      return (
        <>
          <ImageItemBlock
            index={index}
            data={item}
            onPress={() =>
              setSelectedCoverId(
                page.key === 0 ? item.extra.source_id : item.thumbnail,
              )
            }
          />
          {(page.key === 0 ? item.extra.source_id : item.thumbnail) ===
            selectedCoverId && <SelectedMask />}
        </>
      );
    },
    [selectedCoverId],
  );

  return (
    <SafeAreaView>
      <View
        style={[
          styles.segmentContainer,
          {
            top: UIFrame.topBarHeight,
            backgroundColor:
              ui.appearance === 'dark'
                ? ui.colors.secondarySystemBackground
                : ui.colors.systemBackground,
          },
        ]}>
        <SegmentedControl
          style={styles.segment}
          values={pageViews.map(item => item.label)}
          selectedIndex={selectedIndex}
          onChange={event => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
            HapticFeedback.selection();
          }}
        />
      </View>

      <PagerView
        style={styles.pagerView}
        ref={pagerViewRef}
        pageMargin={20}
        overdrag
        initialPage={0}
        onPageSelected={e => {
          setSelectedIndex(e.nativeEvent.position);
        }}>
        {pageViews.map(page => {
          return (
            <GridList
              style={[
                styles.galleryList,
                {
                  backgroundColor: ui.colors.systemBackground,
                },
              ]}
              data={page.key === 0 ? fileList?.list ?? [] : localCovers}
              itemWidth={100}
              gutter={2}
              externalGutter={false}
              gridEnabled
              ListEmptyComponent={
                <DataLoadStatus
                  loading={isLoading}
                  text={t('imageList:noData')}
                />
              }
              renderItem={({ item, index }) =>
                renderItem({ page, item, index })
              }
            />
          );
        })}
      </PagerView>
    </SafeAreaView>
  );
};

export default observer(AlbumCover);

export const SelectedMask = observer((): JSX.Element => {
  const { ui } = useStore();
  return (
    <View
      style={[
        styles.selectedMask,
        {
          backgroundColor: chroma(ui.themes.primary).alpha(0.2).css(),
        },
      ]}>
      <IconCheckmarkCircle width={32} height={32} fill={ui.colors.white} />
    </View>
  );
});

const styles = StyleSheet.create({
  galleryList: {
    marginHorizontal: 0,
    paddingTop: 40,
    marginBottom: -40,
  },

  segmentContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    height: 40,
  },
  segment: {
    marginHorizontal: '20%',
  },
  pagerView: {
    width: '100%',
    height: '100%',
  },
  selectedMask: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
