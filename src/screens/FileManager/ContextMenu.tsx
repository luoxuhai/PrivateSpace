import React, { useCallback, useMemo } from 'react';
import { Share, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ContextMenuView, MenuConfig } from 'react-native-ios-context-menu';
import * as FS from 'react-native-fs';
import RNShare from 'react-native-share';

import { LoadingOverlay } from '@/components/LoadingOverlay';
import {
  showDeleteActionSheet,
  extname,
  getSourcePath,
  getSourceByMime,
} from '@/utils';
import { useDeleteFile, useUpdateFile, useCopyFile } from '@/hooks';
import { services } from '@/services';
import {
  FileRepository,
  FileType,
  SourceType,
} from '@/services/database/entities/file.entity';

interface IContextMenuProps {
  item: API.FileWithSource;
  disabled?: boolean;
  children?: React.ReactNode;
  onViewDetail?: (item: API.FileWithSource) => void;
}

enum ContextMenuKeys {
  Info = 'info',
  Share = 'share',
  Rename = 'rename',
  Copy = 'copy',
  Move = 'move',
  MoveToAlbum = 'move-to-album',
  SaveToLocal = 'save-to-local',
  Delete = 'delete',
}

export const ContextMenu = observer<IContextMenuProps>(props => {
  const { t } = useTranslation();
  const { mutateAsync: updateFile } = useUpdateFile();
  const { mutateAsync: copyFile } = useCopyFile();
  const folderId = useMemo(() => props.item.parent_id, [props.item]);

  const { refetch: refetchFileList } = useQuery(
    [folderId ?? 'root', '.files'],
    {
      enabled: false,
    },
  );

  const { mutateAsync } = useDeleteFile();
  const isFolder = props.item.type === FileType.Folder;

  const menuConfig: MenuConfig = useMemo(
    () => ({
      menuTitle: '',
      menuItems: [
        {
          menuTitle: '',
          menuOptions: ['displayInline'],
          menuItems: [
            {
              actionKey: ContextMenuKeys.Info,
              actionTitle: t('imageList:showInfo'),
              icon: {
                iconType: 'SYSTEM',
                iconValue: 'info.circle',
              },
            },
            {
              actionKey: ContextMenuKeys.Rename,
              actionTitle: t('common:rename'),
              icon: {
                iconType: 'SYSTEM',
                iconValue: 'pencil',
              },
            },
          ],
        },
        {
          menuTitle: '',
          menuOptions: ['displayInline'],
          menuItems: [
            !isFolder && {
              actionKey: ContextMenuKeys.Share,
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
            !isFolder && {
              actionKey: 'copy',
              actionTitle: t('common:copy'),
              icon: {
                iconType: 'SYSTEM',
                iconValue: 'doc.on.doc',
              },
            },
            [SourceType.Image, SourceType.Video].includes(
              getSourceByMime(props.item.mime),
            ) && {
              actionKey: ContextMenuKeys.MoveToAlbum,
              actionTitle: t('imageList:moveToAlbum'),
              icon: {
                iconType: 'SYSTEM',
                iconValue: 'photo.on.rectangle',
              },
            },
            !isFolder && {
              actionKey: ContextMenuKeys.SaveToLocal,
              actionTitle: t('fileManager:save'),
              icon: {
                iconType: 'SYSTEM',
                iconValue: 'square.and.arrow.down',
              },
            },
          ].filter(item => item),
        },
        {
          menuTitle: '',
          menuOptions: ['displayInline'],
          menuItems: [
            {
              actionKey: ContextMenuKeys.Delete,
              actionTitle: t('common:delete'),
              icon: {
                iconType: 'SYSTEM',
                iconValue: 'trash',
              },
              menuAttributes: ['destructive'],
            },
          ],
        },
      ].filter(item => item),
    }),
    [t, props.item.mime, isFolder],
  );

  const handleMenuItemPress = useCallback(
    async ({ nativeEvent }) => {
      switch (nativeEvent.actionKey) {
        case ContextMenuKeys.Info:
          props.onViewDetail?.(props.item);
          break;
        case ContextMenuKeys.Share:
          Share.share({
            url: props.item.uri,
          });
          break;
        case 'move':
          services.nav.screens?.show('FileDirPiker', {
            excludedFolders: [props.item.id],
            async onDone(id: string) {
              try {
                await updateFile({
                  where: {
                    id: props.item.id,
                  },
                  data: {
                    parent_id: id,
                  },
                });
              } catch (error) {}

              refetchFileList();
              services.nav.screens?.dismissModal('FileDirPiker');
            },
          });
          break;
        case 'copy':
          services.nav.screens?.show('FileDirPiker', {
            excludedFolders: [props.item.id],
            type: 'copy',
            async onDone(id: string) {
              LoadingOverlay.show();
              await copyFile({
                originId: props.item.id as string,
                parent_id: id,
              });
              refetchFileList();
              try {
                await LoadingOverlay.hide();
              } catch {}
              services.nav.screens?.dismissModal('FileDirPiker');
            },
          });
          break;
        case ContextMenuKeys.MoveToAlbum:
          services.nav.screens?.show('FolderPicker', {
            title: {
              text: t('common:move'),
            },
            async onDone({ id }: { id: string }) {
              await updateFile({
                where: {
                  id: props.item.id,
                },
                data: {
                  parent_id: id,
                  repository: FileRepository.Album,
                },
              });
              refetchFileList();
              services.nav.screens?.dismissModal('FolderPicker');
            },
          });
          break;
        case ContextMenuKeys.SaveToLocal:
          RNShare.open({
            url: props.item.uri,
            saveToFiles: true,
          });
          break;
        case ContextMenuKeys.Delete:
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
        case ContextMenuKeys.Rename:
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
