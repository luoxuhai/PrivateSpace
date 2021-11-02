import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ContextMenuView, MenuConfig } from 'react-native-ios-context-menu';

import { showDeleteActionSheet } from '@/utils';
import { IListFileData } from '@/services/api/local/type.d';
import { FileStatus } from '@/services/db/file';
import { services } from '@/services';
import { useDeleteFile, useUpdateFile } from '@/hooks';

interface IContextMenuProps {
  item: IListFileData;
  disabled?: boolean;
  children?: React.ReactNode;
}

interface IContextMenuRef {
  forceUpdate: () => void;
}

export const ContextMenu = observer<IContextMenuProps, IContextMenuRef>(
  (props, ref) => {
    const { t } = useTranslation();

    const { refetch: refetchFileList } = useQuery('recycle.bin.image.list', {
      enabled: false,
    });
    const { refetch: refetchAlbumList } = useQuery('list.album', {
      enabled: false,
    });

    const { mutateAsync } = useDeleteFile();
    const { mutateAsync: updateFileAsync } = useUpdateFile();

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
                text: '恢复到到相册',
              },
              async onDone({ id }) {
                await updateFileAsync({
                  id: props.item.id,
                  data: {
                    status: FileStatus.Normal,
                    parent_id: id,
                    ctime: Date.now(),
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
              title: '删除图片',
              message: '此操作不可撤销',
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
  },
  {
    forwardRef: true,
  },
);
