import React, { useCallback, useMemo } from 'react';
import { Share } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ContextMenuView, MenuConfig } from 'react-native-ios-context-menu';
import * as MediaLibrary from 'expo-media-library';
import { RNToasty } from 'react-native-toasty';

import { showDeleteActionSheet } from '@/utils';
import { useDeleteFile, useUpdateFile } from '@/hooks';
import { useStore } from '@/store';
import { services } from '@/services';
import { LoadingOverlay } from '@/components/LoadingOverlay';

interface IContextMenuProps {
  item: API.PhotoWithSource;
  disabled?: boolean;
  albumId?: string;
  children?: React.ReactNode;
  fileDetailRef?: any;
}

export const ContextMenu = observer<IContextMenuProps>(props => {
  const { t } = useTranslation();
  const { global } = useStore();

  const { refetch: refetchFileList } = useQuery([props.albumId, '.photos'], {
    enabled: false,
  });

  const { refetch: refetchAlbumList } = useQuery('albums', {
    enabled: false,
  });

  const { mutateAsync } = useDeleteFile();
  const { mutateAsync: updateFile } = useUpdateFile();

  const menuConfig: MenuConfig = useMemo(
    () => ({
      menuTitle: '',
      menuItems: [
        {
          actionKey: 'info',
          actionTitle: t('imageList:showInfo'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'info.circle',
          },
        },
        {
          actionKey: 'share',
          actionTitle: t('common:share'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'square.and.arrow.up',
          },
        },
        {
          actionKey: 'move',
          actionTitle: t('common:move'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'folder',
          },
        },
        {
          actionKey: 'export',
          actionTitle: '保存到相册',
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'square.and.arrow.down',
          },
        },
        {
          actionKey: 'delete',
          actionTitle: t('common:delete'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'trash',
          },
          menuAttributes: ['destructive'],
        },
      ],
    }),
    [t],
  );

  const handleMenuItemPress = useCallback(
    async ({ nativeEvent }) => {
      switch (nativeEvent.actionKey) {
        case 'info':
          props.fileDetailRef.current.open(props.item);
          break;
        case 'share':
          Share.share({
            url: props.item.uri,
          });
          break;
        case 'move':
          services.nav.screens?.show('FolderPicker', {
            title: {
              text: '移动到相册',
            },
            excludedFolder: [props.albumId],
            async onDone({ id }: { id: string }) {
              await updateFile({
                where: {
                  id: props.item.id,
                },
                data: {
                  parent_id: id,
                },
              });
              refetchFileList();
              services.nav.screens?.dismissModal('FolderPicker');
              refetchAlbumList();
            },
          });
          break;
        case 'delete':
          showDeleteActionSheet({
            title: `这${
              props.item.mime?.startsWith('image/') ? '张照片' : '个视频'
            }将被删除`,
            message: global.settingInfo.recycleBin.enabled
              ? '可到回收站中恢复'
              : '此操作不可撤销',
            onConfirm: async () => {
              await mutateAsync({
                ids: [props.item.id],
                isMark: global.settingInfo.recycleBin.enabled,
              });
              refetchFileList();
              refetchAlbumList();
            },
          });
          break;
        case 'export':
          try {
            const timer = setTimeout(() => {
              LoadingOverlay.show({
                text: {
                  value: '保存中...',
                },
              });
            }, 1000);

            await MediaLibrary.saveToLibraryAsync(props.item.uri);
            clearTimeout(timer);
            RNToasty.Show({
              title: '已保存到相册',
              position: 'top',
            });
          } catch {}
          LoadingOverlay.hide();
      }
    },
    [props.item],
  );

  return props.disabled ? (
    props.children
  ) : (
    <ContextMenuView
      onPressMenuItem={handleMenuItemPress}
      menuConfig={menuConfig}>
      {props.children}
    </ContextMenuView>
  );
});
