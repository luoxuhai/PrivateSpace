import React, { useCallback, useMemo } from 'react';
import { Share, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ContextMenuView, MenuConfig } from 'react-native-ios-context-menu';
import * as FS from 'react-native-fs';
import { RNToasty } from 'react-native-toasty';

import { showDeleteActionSheet, extname, getSourcePath } from '@/utils';
import { useDeleteFile, useUpdateFile } from '@/hooks';
import { useStore } from '@/store';
import { services } from '@/services';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { FileType } from '@/services/database/entities/file.entity';

interface IContextMenuProps {
  item: API.FileWithSource;
  disabled?: boolean;
  children?: React.ReactNode;
  onViewDetail?: (item: API.FileWithSource) => void;
}

export const ContextMenu = observer<IContextMenuProps>(props => {
  const { t } = useTranslation();
  const { global } = useStore();
  const { mutateAsync: updateFile } = useUpdateFile();
  const folderId = useMemo(() => props.item.parent_id, [props.item]);

  const { refetch: refetchFileList } = useQuery(
    [folderId ?? 'root', '.files'],
    {
      enabled: false,
    },
  );

  const { mutateAsync } = useDeleteFile();

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
          actionKey: 'rename',
          actionTitle: t('common:rename'),
          icon: {
            iconType: 'SYSTEM',
            iconValue: 'pencil',
          },
        },
        // {
        //   actionKey: 'move',
        //   actionTitle: t('common:move'),
        //   icon: {
        //     iconType: 'SYSTEM',
        //     iconValue: 'folder',
        //   },
        // },
        {
          actionKey: 'export',
          actionTitle: t('fileManager:save'),
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
          props.onViewDetail?.(props.item);
          break;
        case 'export':
        case 'share':
          Share.share({
            url: props.item.uri,
          });
          break;
        // case 'move':
        //   services.nav.screens?.show('FolderPicker', {
        //     title: {
        //       text: t('imageList:move'),
        //     },
        //     excludedFolder: [folderId],
        //     async onDone({ id }: { id: string }) {
        //       await updateFile({
        //         where: {
        //           id: props.item.id,
        //         },
        //         data: {
        //           parent_id: id,
        //         },
        //       });
        //       refetchFileList();
        //       services.nav.screens?.dismissModal('FolderPicker');
        //       refetchAlbumList();
        //     },
        //   });
        //   break;
        case 'delete':
          showDeleteActionSheet({
            title: t('fileManager:deleteActionSheet.title', {
              count: '',
            }),
            message: t('imageList:deleteActionSheet.msg.delete'),
            onConfirm: async () => {
              await mutateAsync({
                ids: [props.item.id],
                isMark: false,
              });
              refetchFileList();
            },
          });
          break;
        case 'rename':
          Alert.prompt(
            t('common:rename'),
            undefined,
            [
              {
                text: t('common:cancel'),
                style: 'cancel',
              },
              {
                text: t('common:confirm'),
                async onPress(value: string | undefined) {
                  const name = value?.trim();
                  if (!name || name === props.item.name) return;

                  const fullName = `${name}${extname(props.item.name)}`;
                  const sourceId = props.item.extra?.source_id as string;
                  await updateFile({
                    where: {
                      id: props.item.id,
                    },
                    data: {
                      name: fullName,
                    },
                  });

                  if (props.item.type === FileType.File) {
                    FS.moveFile(
                      props.item.uri as string,
                      getSourcePath(sourceId, fullName),
                    );
                  }

                  refetchFileList();
                },
              },
            ],
            'plain-text',
            props.item.name.replace(/\..+$/, ''),
          );
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
