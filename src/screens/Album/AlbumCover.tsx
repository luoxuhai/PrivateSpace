import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';
import { observer } from 'mobx-react-lite';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useMutation, useQuery } from 'react-query';
import PagerView from 'react-native-pager-view';
import chroma from 'chroma-js';
import { Asset } from 'expo-asset';

import { services } from '@/services';
import FileEntity, { FileStatus } from '@/services/db/file';
import { useStore } from '@/store';
import { useUpdateEffect } from '@/hooks';
import { GalleryList } from '@/screens/ImageList';
import { ImageItemBlock } from '@/screens/ImageList/ImageItem';
import IconCheckmarkCircle from '@/assets/icons/checkmark.circle.svg';
import { DataLoadStatus } from '@/components/DataLoadStatus';
import { useTranslation } from 'react-i18next';

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

const pageViews = [
  {
    label: '相册项目',
    key: 0,
  },
  {
    label: '系统封面',
    key: 1,
  },
];

const AlbumCover: NavigationFunctionComponent<IAlbumCoverProps> = props => {
  const { ui, user } = useStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useTranslation();
  const [selectedCoverId, setSelectedCoverId] = useState<string | undefined>(
    props.album.extra?.cover,
  );
  const [toastVisible, setToastVisivle] = useState<boolean>(false);
  const { topBarHeight } = services.nav.screens?.getConstants();
  const pagerViewRef = useRef<{
    setPage: (index: number) => void;
  }>();

  useNavigationButtonPress(handleCloseModal, props.componentId, 'cancel');

  useEffect(() => {
    pagerViewRef.current?.setPage(selectedIndex);
  }, [selectedIndex]);

  useUpdateEffect(() => {
    if (selectedCoverId) {
      handleUpdateCover();
    }
  }, [selectedCoverId]);

  const { refetch: refetchAlbumList } = useQuery('list.album', {
    enabled: false,
  });

  const { mutate: handleUpdateCover } = useMutation<void, unknown>(
    'album.cover.image.list',
    async () => {
      try {
        await services.api.local.updateFile({
          id: props.album.id,
          data: {
            extra: {
              cover: selectedCoverId,
            },
          },
        });
        refetchAlbumList();
        handleCloseModal();
      } catch (error) {}
    },
  );

  function handleCloseModal() {
    services.nav.screens?.N.dismissModal(props.componentId);
  }

  const { data: fileList, isLoading } = useQuery(
    'album.cover.image.list',
    async () => {
      let res;
      try {
        res = await services.api.local.listFile({
          owner: user.userInfo!.id,
          parent_id: props.album.id,
          status: FileStatus.Normal,
        });
      } catch (error) {}

      return {
        list: res?.data?.list ?? [],
        total: res?.data?.total ?? 0,
      };
    },
    {
      enabled: true,
    },
  );

  return (
    <SafeAreaView
      style={{
        marginTop: topBarHeight,
      }}>
      <SegmentedControl
        style={styles.segment}
        values={pageViews.map(item => item.label)}
        selectedIndex={selectedIndex}
        onChange={event => {
          setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
        }}
      />

      <PagerView
        style={styles.pagerView}
        ref={pagerViewRef}
        initialPage={0}
        onPageSelected={e => {
          setSelectedIndex(e.nativeEvent.position);
        }}>
        {pageViews.map(page => {
          return (
            <GalleryList
              style={[
                styles.galleryList,
                {
                  backgroundColor: ui.colors.systemBackground,
                },
              ]}
              data={page.key === 0 ? fileList?.list : localCovers}
              ListEmptyComponent={
                <DataLoadStatus
                  loading={isLoading}
                  text={t('imageList:noData')}
                />
              }
              renderItem={({ item, itemStyle, index }) => {
                return (
                  <>
                    <ImageItemBlock
                      style={{
                        height: itemStyle.width,
                      }}
                      index={index}
                      data={item}
                      onPress={() =>
                        setSelectedCoverId(
                          page.key === 0
                            ? item.extra.source_id
                            : item.thumbnail,
                        )
                      }
                    />
                    {(page.key === 0
                      ? item.extra.source_id
                      : item.thumbnail) === selectedCoverId && <SelectedMask />}
                  </>
                );
              }}
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
  },
  segment: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: '20%',
  },
  pagerView: {
    width: '100%',
    height: '100%',
    marginTop: 50,
  },
  selectedMask: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
