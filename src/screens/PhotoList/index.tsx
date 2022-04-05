import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  OptionsModalPresentationStyle,
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';
import {
  useNavigationButtonPress,
  useNavigationComponentDidDisappear,
} from 'react-native-navigation-hooks';
import { StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { useTranslation, getI18n } from 'react-i18next';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useStore } from '@/store';
import AddButton from './AddButton';
import { services } from '@/services';
import { useDeepEffect, useUpdateEffect } from '@/hooks';
import IconCheckmarkCircleFill from '@/assets/icons/checkmark.circle.fill.svg';
import { ToolbarContainer } from './ToolbarContainer';
import { ContextMenu } from './ContextMenu';
import { ImageItemLine, ImageItemBlock } from './ImageItem';
import { useForceRender } from '@/hooks';
import { DataLoadStatus } from '@/components/DataLoadStatus';
import GridList, { GridListInstance } from '@/components/GridList';
import { FileDetail } from '../PhotoView/FileDetail';
import { AlbumStore } from '@/store/album';

interface IImageListProps extends NavigationComponentProps {
  albumId: string;
  hasImage: boolean;
  albumName: string;
  count: {
    video?: number;
    image?: number;
  };
}

const baseRightButtons = [
  {
    id: 'more',
    component: {
      id: 'ImageListMoreButton',
      name: 'ImageListMoreButton',
    },
  },
];

export async function queryImage(albumId: string, album: AlbumStore) {
  const res = await services.api.photo.list({
    parent_id: albumId,
    order_by: album.orderBy,
  });

  return {
    items: res?.items ?? [],
    total: res?.total ?? 0,
  };
}

const ImageList: NavigationFunctionComponent<IImageListProps> = props => {
  const { ui, album } = useStore();
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const addButtonOpacity = useSharedValue(1);
  const { visible, forceRender } = useForceRender();
  const fileDetailRef = useRef(null);
  const imagesRef = useRef<API.PhotoWithSource[] | undefined>();

  const addButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(addButtonOpacity.value, {
        duration: 150,
      }),
    };
  }, []);

  useNavigationComponentDidDisappear(() => {
    forceRender();
  }, props.componentId);

  const rightButtons = useMemo(
    () => [
      {
        id: baseRightButtons[0].id,
        component: {
          ...baseRightButtons[0].component,
          passProps: {
            albumId: props.albumId,
            async onRefetch(onCallback?: () => void) {
              await refetchFileList();
              onCallback?.();
            },
            onSelect() {
              setIsSelectMode(true);
            },
          },
        },
      },
    ],
    [],
  );

  useEffect(() => {
    services.nav.screens?.N.updateProps(
      'ImageListMoreButton',
      rightButtons[0].component.passProps,
    );

    return () => {
      setIsSelectMode(false);
    };
  }, []);

  function handleOpenImageViewPress(index: number) {
    services.nav.screens?.show(
      'ImageView',
      {
        initialIndex: index,
        images: imagesRef.current,
        onRefetch: refetchFileList,
      },
      {
        modalPresentationStyle: OptionsModalPresentationStyle.overFullScreen,
      },
    );
  }

  async function handleImagePress(item: API.PhotoWithSource, index: number) {
    if (isSelectMode) {
      setSelectedIds(prev => {
        const newData = prev?.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id];
        return newData;
      });
    } else {
      handleOpenImageViewPress(index);
    }
  }

  const {
    isRefetching,
    isFetching,
    data: photoData,
    refetch: refetchFileList,
  } = useQuery(
    [props.albumId, '.photos'],
    () => queryImage(props.albumId, album),
    {
      enabled: true,
    },
  );

  const { refetch: refetchAlbumList } = useQuery('albums', {
    enabled: false,
  });

  useDeepEffect(() => {
    imagesRef.current = photoData?.items;

    services.nav.screens?.N.mergeOptions(props.componentId, {
      topBar: {
        subtitle: {
          text: getTopBarSubtitle({
            imageTotal: photoData?.items?.filter(item =>
              item.mime?.startsWith('image/'),
            )?.length,
            videoTotal: photoData?.items?.filter(item =>
              item.mime?.startsWith('video/'),
            )?.length,
          }),
        },
      },
    });
  }, [photoData?.items]);

  // 没有图片时禁用选择按钮，退出选择模式
  useUpdateEffect(() => {
    if (isSelectMode) {
      return;
    }

    services.nav.screens?.N.mergeOptions(props.componentId, {
      topBar: {
        rightButtons: photoData?.total ? rightButtons : [],
      },
    });
  }, [photoData?.total]);

  // 选择模式
  useUpdateEffect(() => {
    if (isSelectMode) {
      services.nav.screens?.N.mergeOptions(props.componentId, {
        topBar: {
          leftButtons: [
            {
              id: 'selectAll',
              text: t('common:selectAll'),
            },
          ],
          rightButtons: [
            {
              id: 'cancelSelect',
              text: t('common:cancel'),
            },
          ],
        },
      });
    } else {
      setSelectedIds([]);
      setIsSelectAll(false);
      services.nav.screens?.N.mergeOptions(props.componentId, {
        topBar: {
          leftButtons: [],
          rightButtons,
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

  // 全选操作
  useUpdateEffect(() => {
    if (!isSelectMode) return;

    let leftButton = {
      id: 'selectAll',
      text: t('common:selectAll'),
    };

    if (isSelectAll) {
      leftButton = {
        id: 'unselectAll',
        text: t('common:unselectAll'),
      };
      setSelectedIds(photoData?.items.map(item => item.id) ?? []);
    } else {
      setSelectedIds([]);
    }

    services.nav.screens?.N.mergeOptions(props.componentId, {
      topBar: {
        leftButtons: [leftButton],
      },
    });
  }, [isSelectAll]);

  // 全选状态没有选中
  useUpdateEffect(() => {
    if (!selectedIds.length && isSelectAll) {
      setIsSelectAll(false);
    }
  }, [selectedIds]);

  // 全选
  useNavigationButtonPress(
    () => {
      setIsSelectAll(true);
    },
    props.componentId,
    'selectAll',
  );

  // 取消全选
  useNavigationButtonPress(
    () => {
      setIsSelectAll(false);
    },
    props.componentId,
    'unselectAll',
  );

  const isGalleryView = album.view === 'gallery';

  useUpdateEffect(() => {
    refetchFileList();
  }, [isGalleryView]);

  const GalleryItem = useMemo(() => {
    forceRender();
    switch (album.view) {
      case 'list':
        return ImageItemLine;
      default:
        return ImageItemBlock;
    }
  }, [album.view]);

  const renderItem = useCallback(
    ({ item, index }) => {
      return visible ? (
        <ContextMenu
          item={item}
          disabled={isSelectMode}
          albumId={props.albumId}
          fileDetailRef={fileDetailRef}>
          <GalleryItem
            index={index}
            data={item}
            onPress={() => handleImagePress(item, index)}
          />
          {isSelectMode && selectedIds?.includes(item.id) && <SelectedMask />}
        </ContextMenu>
      ) : null;
    },
    [visible, isSelectMode, selectedIds, isGalleryView],
  );

  return (
    <>
      <GridList
        style={[
          styles.flatGrid,
          {
            backgroundColor: ui.colors.systemBackground,
          },
        ]}
        ListEmptyComponent={
          <DataLoadStatus loading={isFetching} text={t('imageList:noData')} />
        }
        itemWidth={100}
        gutter={2}
        externalGutter={false}
        gridEnabled={isGalleryView}
        data={isRefetching ? [] : photoData?.items ?? []}
        renderItem={renderItem}
        onScrollBeginDrag={() => {
          addButtonOpacity.value = 0.4;
        }}
        onMomentumScrollEnd={() => {
          addButtonOpacity.value = 1;
        }}
      />

      {!isSelectMode && (
        <AddButton
          style={addButtonStyle}
          albumId={props.albumId}
          onDone={() => {
            refetchFileList();
            refetchAlbumList();
          }}
        />
      )}
      <ToolbarContainer
        visible={isSelectMode}
        selectedIds={selectedIds}
        albumId={props.albumId}
        onDone={() => {
          setIsSelectMode(false);
          refetchFileList();
        }}
      />
      <FileDetail ref={fileDetailRef} />
      {album.moreContextVisible && <View style={styles.mask} />}
    </>
  );
};

ImageList.options = props => {
  const imageTotal = props.count?.image;
  const videoTotal = props.count?.video;

  return {
    topBar: {
      title: {
        text: props.albumName,
      },
      subtitle: {
        text: getTopBarSubtitle({
          imageTotal,
          videoTotal,
        }),
      },
      rightButtons: props.hasImage ? baseRightButtons : [],
    },
  };
};

function getTopBarSubtitle({
  imageTotal,
  videoTotal,
}: {
  imageTotal?: number;
  videoTotal?: number;
}) {
  let subtitleText: string | undefined;
  const t = getI18n().t;

  if (imageTotal && !videoTotal) {
    subtitleText = t('imageList:navigation.subtitle.image', {
      count: imageTotal,
    });
  } else if (!imageTotal && videoTotal) {
    subtitleText = t('imageList:navigation.subtitle.video', {
      count: videoTotal,
    });
  } else if (!imageTotal && !videoTotal) {
    subtitleText = undefined;
  } else {
    subtitleText = `${t('imageList:navigation.subtitle.image', {
      count: imageTotal,
    })}、${t('imageList:navigation.subtitle.video', { count: videoTotal })}`;
  }

  return subtitleText;
}

export default observer(ImageList);

export const SelectedMask = observer(() => {
  const { ui } = useStore();

  return (
    <View style={selectedMaskStyles.container} pointerEvents="none">
      <View style={selectedMaskStyles.iconContainer}>
        <IconCheckmarkCircleFill
          width={20}
          height={20}
          fill={ui.themes.primary}
        />
      </View>
    </View>
  );
});

const selectedMaskStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 22,
    height: 22,
    backgroundColor: '#FFF',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const styles = StyleSheet.create({
  flatGrid: {
    paddingTop: 10,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
