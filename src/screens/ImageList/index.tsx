import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
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
import {
  ViewStyle,
  StyleSheet,
  StyleProp,
  FlatListProps,
  View,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { FlatGrid } from 'react-native-super-grid';
import { useQuery, useMutation } from 'react-query';
import { useTranslation, getI18n } from 'react-i18next';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useStore } from '@/store';
import { platformInfo } from '@/utils';
import AddButton from './AddButton';
import { services } from '@/services';
import { FileStatus } from '@/services/db/file';
import { useDeepEffect, useUpdateEffect } from '@/hooks';
import { IListFileData } from '@/services/api/local/type.d';
import IconCheckmarkCircleFill from '@/assets/icons/checkmark.circle.fill.svg';
import { ToolbarContainer } from './ToolbarContainer';
import { ContextMenu } from './ContextMenu';
import { ImageItemLine, ImageItemBlock } from './ImageItem';
import { useForceRender, useStat } from '@/hooks';
import { DataLoadStatus } from '@/components/DataLoadStatus';
import { FileDetail } from './FileDetail';

interface IImageListProps extends NavigationComponentProps {
  albumId: string;
  hasImage: boolean;
  albumName: string;
}

const rightButtons = [
  {
    id: 'more',
    component: {
      id: 'ImageListMoreButton',
      name: 'ImageListMoreButton',
    },
  },
  {
    id: 'select',
    text: getI18n().t('common:select'),
  },
];

export async function queryImage(albumId, user, album) {
  let res;

  try {
    res = await services.api.local.listFile({
      owner: user.userInfo!.id,
      parent_id: albumId,
      status: FileStatus.Normal,
      order: {
        [album.photoViewConfig!.sort.field]:
          album.photoViewConfig?.sort.order === 'desc' ? 'DESC' : 'ASC',
      },
    });
  } catch (error) {
    console.log(error);
  }

  return {
    list: res?.data?.list ?? [],
    total: res?.data?.total ?? 0,
  };
}

export function useDeleteImage(): {
  onDelete: (id: string) => void;
  isLoading: boolean;
} {
  const { mutate: onDelete, isLoading } = useMutation<any, unknown, string>(
    async id => {
      try {
        const res = await services.api.local.deleteFile({
          id,
        });
        return res;
      } catch (error) {
        console.error('error', error);
      }
    },
  );
  return {
    onDelete,
    isLoading,
  };
}

let refetchFileListTime;

const ImageList: NavigationFunctionComponent<IImageListProps> = props => {
  const { ui, user, album } = useStore();
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const addButtonOpacity = useSharedValue(1);
  const { visible, forceRender } = useForceRender();
  const fileDetailRef = useRef(null);
  const galleryListRef = useRef(null);
  const imagesRef = useRef<IListFileData[] | undefined>();

  const addButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(addButtonOpacity.value, {
        duration: 150,
      }),
    };
  }, []);

  useStat('ImageList');

  useNavigationComponentDidDisappear(() => {
    forceRender();
  }, props.componentId);

  useEffect(() => {
    services.nav.screens?.N.updateProps('ImageListMoreButton', {
      albumId: props.albumId,
      async onDone() {
        await refetchFileList();
        galleryListRef.current?.scrollToOffset({
          animated: false,
          offset: 0,
        });
      },
    });

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

  async function handleImagePress(item: IListFileData, index: number) {
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
    isLoading,
    data: fileList,
    refetch: refetchFileList,
  } = useQuery(
    ['image.list.list.item', props.albumId],
    () => queryImage(props.albumId, user, album),
    {
      enabled: true,
    },
  );

  const { refetch: refetchAlbumList } = useQuery('list.album', {
    enabled: false,
  });

  useDeepEffect(() => {
    imagesRef.current = fileList?.list;
  }, [fileList?.list]);

  // 没有图片时禁用选择按钮，退出选择模式
  useUpdateEffect(() => {
    if (isSelectMode) {
      return;
    }

    services.nav.screens?.N.mergeOptions(props.componentId, {
      topBar: {
        rightButtons: fileList?.total ? rightButtons : [],
      },
    });
  }, [fileList?.total]);

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
        text: t('common:cancel') + t('common:selectAll'),
      };
      setSelectedIds(fileList?.list.map(item => item.id) ?? []);
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

  const isGalleryView = album.photoViewConfig?.view === 'gallery';

  const GalleryItem = useMemo(() => {
    forceRender();
    switch (album.photoViewConfig?.view) {
      case 'list':
        return ImageItemLine;
      default:
        return ImageItemBlock;
    }
  }, [album.photoViewConfig?.view]);

  const renderItem = useCallback(
    ({ item, itemStyle, index }) => {
      return visible ? (
        <ContextMenu
          item={item}
          disabled={isSelectMode}
          albumId={props.albumId}
          fileDetailRef={fileDetailRef}>
          <GalleryItem
            style={[
              isGalleryView && {
                height: itemStyle.width,
              },
            ]}
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
      <GalleryList
        style={[
          styles.flatGrid,
          {
            backgroundColor: ui.colors.systemBackground,
          },
        ]}
        ref={galleryListRef}
        ListEmptyComponent={
          <DataLoadStatus loading={isLoading} text={t('imageList:noData')} />
        }
        itemDimension={isGalleryView ? undefined : 400}
        data={fileList?.list}
        renderItem={renderItem}
        windowSize={11}
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
      {platformInfo.os === 'ios' &&
        parseInt(platformInfo.version, 10) >= 14 &&
        album.moreContextVisible && <View style={styles.mask} />}
    </>
  );
};

ImageList.options = props => {
  return {
    topBar: {
      title: {
        text: props.albumName,
      },
      rightButtons: props.hasImage ? rightButtons : [],
    },
  };
};

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

interface IGalleryListProps extends FlatListProps<any> {
  style?: StyleProp<ViewStyle>;
  data: any[];
  spacing?: number;
  itemDimension?: number;
  renderItem: ({ item, itemStyle, index }) => JSX.Element;
  onLayout?: () => void;
}

/**
 * 画廊视图列表
 */
export const GalleryList = forwardRef(
  (
    {
      style,
      data,
      spacing = 2,
      itemDimension = 100,
      renderItem,
      onLayout,
      ...rest
    }: IGalleryListProps,
    ref,
  ): JSX.Element => {
    const flatGridRef = useRef(null);

    useImperativeHandle(ref, () => flatGridRef.current);

    return (
      <FlatGrid
        ref={flatGridRef}
        style={[style]}
        itemDimension={itemDimension}
        spacing={spacing}
        between={false}
        data={data}
        onLayout={onLayout}
        renderItem={renderItem}
        {...rest}
      />
    );
  },
);

const styles = StyleSheet.create({
  flatGrid: {
    paddingTop: 10,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
