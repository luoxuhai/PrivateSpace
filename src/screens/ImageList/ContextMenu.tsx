import React, { useCallback, useMemo } from 'react';
import { Share } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ContextMenuView, MenuConfig } from 'react-native-ios-context-menu';

import { showDeleteActionSheet } from '@/utils';
import { IListFileData } from '@/services/api/local/type.d';
import { useDeleteFile, useUpdateFile } from '@/hooks';
import { useStore } from '@/store';
import { services } from '@/services';

interface IContextMenuProps {
  item: IListFileData;
  disabled?: boolean;
  albumId?: string;
  children?: React.ReactNode;
  fileDetailRef?: any;
}

export const ContextMenu = observer<IContextMenuProps>(props => {
  const { t } = useTranslation();
  const { global } = useStore();

  const { refetch: refetchFileList } = useQuery(
    ['image.list.list.item', props.albumId],
    {
      enabled: false,
    },
  );
  const { refetch: refetchAlbumList } = useQuery('list.album', {
    enabled: false,
  });

  const { mutateAsync } = useDeleteFile();
  const { isLoading: updateLoading, mutateAsync: updateFile } = useUpdateFile();

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
    ({ nativeEvent }) => {
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
            async onDone({ id }) {
              await updateFile({
                id: props.item.id,
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
            title: '删除图片',
            onConfirm: async () => {
              await mutateAsync({
                ids: [props.item.id],
                isMark: global.settingInfo.recycleBin.enabled,
              });
              refetchFileList();
              refetchAlbumList();
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
