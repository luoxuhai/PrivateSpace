import React, { useMemo } from 'react';
import RNShare from 'react-native-share';
import { observer } from 'mobx-react-lite';
import { useTranslation, TFunction } from 'react-i18next';
import * as MediaLibrary from 'expo-media-library';
import { useQuery } from 'react-query';

import { showDeleteActionSheet } from '@/utils';
import { Toolbar } from '../../components/Toolbar';
import { getSourcePath } from '@/utils';
import IconFolder from '@/assets/icons/folder.svg';
import IconSave from '@/assets/icons/save.svg';
import IconTrash from '@/assets/icons/trash.svg';
import IconShare from '@/assets/icons/share.svg';
import { useDeleteFile } from '@/hooks';
import { useStore } from '@/store';
import { UIStore } from '@/store/ui';
import { services } from '@/services';
import { useUpdateFile } from '@/hooks';
import { LoadingOverlay } from '@/components/LoadingOverlay';

interface IToolbarContainerProps {
  visible: boolean;
  selectedIds: string[];
  albumId: string;
  onDone?: () => void;
}

function getList(t: TFunction<'translation', undefined>, ui: UIStore) {
  return [
    {
      title: t('common:share'),
      key: 'share',
      icon: IconShare,
    },
    {
      title: t('imageList:save'),
      key: 'export',
      icon: IconSave,
    },
    {
      title: t('common:move'),
      key: 'move',
      icon: IconFolder,
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
  const { ui, global } = useStore();
  const list = useMemo(() => getList(t, ui), [t, ui.colors]);

  const { mutateAsync } = useDeleteFile();
  const { mutateAsync: updateFile } = useUpdateFile();
  const { refetch: refetchAlbumList } = useQuery('albums', {
    enabled: false,
  });
  const { data: photoData } = useQuery([props.albumId, '.photos'], {
    enabled: false,
  });

  async function handleToolbarPress(key: string | number) {
    switch (key) {
      case 'delete':
        showDeleteActionSheet({
          title: t('imageList:deleteActionSheet.all.title'),
          message: global.settingInfo.recycleBin.enabled
            ? t('imageList:deleteActionSheet.msg.softDelete')
            : t('imageList:deleteActionSheet.msg.delete'),
          onConfirm: async () => {
            try {
              await mutateAsync({
                ids: props.selectedIds,
                isMark: global.settingInfo.recycleBin.enabled,
              });
            } catch (error) {}
            props.onDone?.();
          },
        });
        break;
      case 'share':
        try {
          await RNShare.open({
            urls: getSelectedFileUris(),
          });
        } catch {}

        props.onDone?.();
        break;
      case 'move':
        services.nav.screens?.show('FolderPicker', {
          title: {
            text: t('imageList:moveToAlbum'),
          },
          excludedFolder: [props.albumId],
          async onDone({ id }: { id: string }) {
            await updateFile({
              where: {
                ids: props.selectedIds,
              },
              data: {
                parent_id: id,
              },
            });
            services.nav.screens?.dismissModal('FolderPicker');
            refetchAlbumList();
            props.onDone?.();
          },
        });
        break;
      case 'export':
        try {
          LoadingOverlay.show({
            text: {
              value: `${t('imageList:saving')}...`,
            },
          });
          await Promise.all(
            getSelectedFileUris()?.map(MediaLibrary.saveToLibraryAsync),
          );
        } catch (error) {}
        LoadingOverlay.hide();
        props.onDone?.();
        break;
    }

    function getSelectedFileUris(): string[] {
      return props.selectedIds
        .map(id => photoData?.items?.find(item => item.id === id))
        .map(item => getSourcePath(item.extra.source_id, item.name));
    }
  }

  return (
    <Toolbar
      visible={props.visible}
      disabled={props.selectedIds.length === 0}
      list={list}
      onPress={handleToolbarPress}
    />
  );
});
