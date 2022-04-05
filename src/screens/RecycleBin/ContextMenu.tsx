import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ContextMenuView, MenuConfig } from 'react-native-ios-context-menu';

import { showDeleteActionSheet } from '@/utils';
import { services } from '@/services';
import { useDeleteFile, useRestorePhoto } from '@/hooks';

interface IContextMenuProps {
  item: API.PhotoWithSource;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ContextMenu = observer<IContextMenuProps>(props => {
  const { t } = useTranslation();

  const { refetch: refetchFileList } = useQuery('recycle.bin.photos', {
    enabled: false,
  });
  const { refetch: refetchAlbumList } = useQuery('albums', {
    enabled: false,
  });

  const { mutateAsync } = useDeleteFile();
  const { mutateAsync: restoreAsync } = useRestorePhoto();

  const menuConfig: MenuConfig = useMemo(
    () => ({
      menuTitle: '',
      menuItems: [
        {
          actionKey: 'restore',
          actionTitle: t('common:restore'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'tray.and.arrow.up',
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
        case 'restore':
          services.nav.screens?.show('FolderPicker', {
            title: {
              text: t('recycleBin:restore'),
            },
            async onDone({ id }: { id: string }) {
              await restoreAsync({
                where: {
                  id: props.item.id,
                },
                to: {
                  parent_id: id,
                },
              });
              services.nav.screens?.dismissModal('FolderPicker');
              refetchFileList();
              refetchAlbumList();
            },
          });
          break;
        case 'delete':
          showDeleteActionSheet({
            title: t('imageList:deleteActionSheet.title', {
              content: props.item.mime?.startsWith('image/')
                ? t('imageList:navigation.subtitle.image', { count: '' })
                : t('imageList:navigation.subtitle.video', { count: '' }),
            }),
            message: t('imageList:deleteActionSheet.msg.delete'),
            onConfirm: async () => {
              await mutateAsync({ ids: [props.item.id], isMark: false });
              refetchFileList();
            },
          });
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
