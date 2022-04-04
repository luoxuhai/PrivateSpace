import React, { useMemo, useRef } from 'react';
import { Share } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation, TFunction } from 'react-i18next';
import { useQuery, useMutation } from 'react-query';
import RNFS from 'react-native-fs';
import PhotoEditor from 'react-native-image-editor';
import { cloneDeep } from 'lodash';

import {
  showDeleteActionSheet,
  randomNum,
  extname,
  getSourceByMime,
} from '@/utils';
import { Toolbar } from '../../components/Toolbar';
import IconTrash from '@/assets/icons/trash.svg';
import IconMore from '@/assets/icons/ellipsis.circle.svg';
import IconShare from '@/assets/icons/share.svg';
import IconInfoCircle from '@/assets/icons/info.circle.svg';
import IconPencil from '@/assets/icons/square.and.pencil.svg';
import { useDeleteFile } from '@/hooks';
import { useStore } from '@/store';
import FileEntity, {
  SourceType,
} from '@/services/database/entities/file.entity';
import { services } from '@/services';
import { FileDetail } from './FileDetail';
import { MorePopoverMenu } from './MorePopoverMenu';
import classifyImageProcess from '@/utils/process/classifyImageProcess';
import { CreatePhotoParams } from '@/services/api/photo/types.d';

interface IToolbarContainerProps {
  visible: boolean;
  item?: FileEntity;
  images: any[];
  onDone?: (type: 'edit' | 'delete') => void;
  onChange?: (value: any[], index?: number) => void;
  onRefetch?: () => void;
}

function getList(
  t: TFunction<'translation', undefined>,
  props: IToolbarContainerProps,
) {
  return [
    {
      title: t('common:share'),
      key: 'share',
      icon: IconShare,
    },
    {
      title: t('photoView:toolbar.detail'),
      key: 'info',
      icon: IconInfoCircle,
    },
    {
      title: t('common:edit'),
      key: 'edit',
      icon: IconPencil,
    },
    {
      title: t('common:delete'),
      key: 'delete',
      icon: IconTrash,
    },
    {
      title: t('photoView:toolbar.more'),
      key: 'more',
      icon: iconProps => (
        <MorePopoverMenu
          item={props.item}
          images={props.images}
          onChange={props.onChange}>
          <IconMore {...iconProps} />
        </MorePopoverMenu>
      ),
    },
  ];
}

export const ToolbarContainer = observer<IToolbarContainerProps>(props => {
  const { t } = useTranslation();
  const { global } = useStore();
  const list = useMemo(() => getList(t, props), [t, props]);
  const fileDetailRef = useRef();

  const { mutateAsync } = useDeleteFile();
  const { mutateAsync: createImages } = useMutation<
    API.CreateResult,
    unknown,
    CreatePhotoParams
  >(async file => {
    try {
      return await services.api.photo.create({
        ...file,
        parent_id: props.item?.parent_id,
      });
    } catch (error) {
      console.error('error', error);
    }
  });

  const { refetch: refetchAlbumList } = useQuery('albums', {
    enabled: false,
  });

  async function handleToolbarPress(key: string | number) {
    switch (key) {
      case 'delete':
        showDeleteActionSheet({
          title: t('imageList:deleteActionSheet.title', {
            content: props.item?.mime?.startsWith('image/')
              ? t('imageList:navigation.subtitle.image', { count: '' })
              : t('imageList:navigation.subtitle.video', { count: '' }),
          }),
          message: global.settingInfo.recycleBin.enabled
            ? t('imageList:deleteActionSheet.msg.softDelete')
            : t('imageList:deleteActionSheet.msg.delete'),
          onConfirm: async () => {
            try {
              await mutateAsync({
                ids: [props.item?.id],
                isMark: global.settingInfo.recycleBin.enabled,
              });
            } catch (error) {}

            const index = props.images.findIndex(
              item => item.id === props.item?.id,
            );

            const pageIndex =
              index === props.images.length - 1 ? index - 1 : index;
            props.onChange?.(
              props.images.filter(item => item.id !== props.item?.id),
              pageIndex,
            );
            refetchAlbumList();
          },
        });
        break;
      case 'share':
        await Share.share({
          url: props.item?.uri,
        });
        break;
      case 'edit':
        try {
          const path = await PhotoEditor.open({
            path: `file://${props.item!.uri}`,
            stickers: Array.from({ length: 26 }, (_, index) =>
              encodeURI(
                `https://private-space-storage.oss-cn-beijing.aliyuncs.com/image/stickers/watermark (${
                  index + 1
                }).png`,
              ),
            ),
          });

          const fileInfo = await RNFS.stat(path as string);
          const res = await createImages({
            name: `IMG_${randomNum(6)}${extname(props.item!.name)}`,
            uri: path.replace(/^file:\/\//, ''),
            size: fileInfo.size,
            mime: props.item?.mime,
            ctime: props.item?.ctime,
          });

          if (!res?.id) {
            return;
          }

          const id = res.id;
          const resp = await services.api.photo.list({
            id,
          });

          const index = props.images.findIndex(
            item => item.id === props.item?.id,
          );

          const newImages = cloneDeep(props.images);

          for (let i = newImages.length; i > index; i--) {
            if (i === index + 1) {
              newImages[i] = resp.items[0];
              break;
            } else {
              newImages[i] = props.images[i - 1];
            }
          }

          props.onChange?.(newImages, index + 1);
          refetchAlbumList();
          classifyImageProcess.start();
        } catch (error) {
          console.error(error);
        }
        break;
      case 'info':
        fileDetailRef.current?.open(props.item);
    }
  }

  const isVideo = useMemo(
    () => getSourceByMime(props.item?.mime!) === SourceType.Video,
    [props.item?.mime],
  );

  return (
    <>
      <Toolbar
        visible={props.visible}
        disabled={!props.item}
        list={list.filter(item => (isVideo ? item.key !== 'edit' : true))}
        onPress={handleToolbarPress}
      />
      <FileDetail ref={fileDetailRef} />
    </>
  );
});
