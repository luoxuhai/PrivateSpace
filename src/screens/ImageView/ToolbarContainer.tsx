import React, { useMemo, useRef } from 'react';
import { Share } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation, TFunction } from 'react-i18next';
import { useQuery, useMutation } from 'react-query';
import RNFS from 'react-native-fs';
import PhotoEditor from '@baronha/react-native-photo-editor';

import {
  showDeleteActionSheet,
  randomNum,
  extname,
  getSourceByMime,
} from '@/utils';
import { Toolbar } from '../../components/Toolbar';
import IconTrash from '@/assets/icons/trash.svg';
import IconShare from '@/assets/icons/share.svg';
import IconInfoCircle from '@/assets/icons/info.circle.svg';
import IconPencil from '@/assets/icons/square.and.pencil.svg';
import { useDeleteFile } from '@/hooks';
import { useStore } from '@/store';
import { UIStore } from '@/store/ui';
import FileEntity, { SourceType } from '@/services/db/file';
import { ICreateFileRequest } from '@/services/api/local/type.d';
import { services } from '@/services';
import { FileDetail } from '../ImageList/FileDetail';

interface IToolbarContainerProps {
  visible: boolean;
  item?: FileEntity;
  albumId: string;
  onDone?: (type: 'edit' | 'delete') => void;
}

function getList(t: TFunction<'translation', undefined>, ui: UIStore) {
  return [
    {
      title: t('common:share'),
      key: 'share',
      icon: IconShare,
    },
    {
      title: '详情',
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
      titleStyle: {
        color: ui.colors.systemRed,
      },
      iconProps: {
        fill: ui.colors.systemRed,
      },
    },
  ];
}

export const ToolbarContainer = observer<IToolbarContainerProps>(props => {
  const { t } = useTranslation();
  const { ui, global, user } = useStore();
  const list = useMemo(() => getList(t, ui), [t, ui.colors]);
  const fileDetailRef = useRef();

  const { isLoading, mutateAsync } = useDeleteFile();
  const { mutateAsync: createImages } = useMutation<
    void,
    unknown,
    ICreateFileRequest
  >('image.list.create.image', async file => {
    try {
      await services.api.local.createFile({
        ...file,
        parent_id: props.item.parent_id,
        owner: user.userInfo!.id,
      });
    } catch (error) {
      console.error('error', error);
    }
  });

  const { refetch: refetchImageList } = useQuery(
    ['image.list.list.item', props.albumId],
    {
      enabled: false,
    },
  );
  const { refetch: refetchAlbumList } = useQuery('list.album', {
    enabled: false,
  });

  async function handleToolbarPress(key: string | number) {
    switch (key) {
      case 'delete':
        showDeleteActionSheet({
          title: '删除图片',
          onConfirm: async () => {
            try {
              await mutateAsync({
                ids: [props.item?.id],
                isMark: global.settingInfo.recycleBin.enabled,
              });
            } catch (error) {}
            refetchImageList();
            refetchAlbumList();
            props.onDone?.('delete');
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
            stickers: [],
          });

          const fileInfo = await RNFS.stat(path);
          await createImages({
            name: `IMG_${randomNum(6)}${extname(props.item.name)}`,
            uri: path.replace(/^file:\/\//, ''),
            size: fileInfo.size,
            mime: props.item.mime,
          });
          refetchImageList();
          refetchAlbumList();
          props.onDone?.('edit');
        } catch (error) {
          console.error(error);
        }
        break;
      case 'info':
        fileDetailRef.current?.open(props.item);
    }
  }

  const isVideo = useMemo(
    () => getSourceByMime(props.item.mime!) === SourceType.Video,
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
