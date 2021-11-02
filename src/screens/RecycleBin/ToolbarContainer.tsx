import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation, TFunction } from 'react-i18next';
import { useQuery } from 'react-query';

import { showDeleteActionSheet } from '@/utils';
import { Toolbar } from '../../components/Toolbar';
import { services } from '@/services';
import { FileStatus } from '@/services/db/file';
import { useUpdateFile, useDeleteFile } from '@/hooks';
import { UIStore } from '@/store/ui';
import { useStore } from '@/store';

interface IToolbarContainerProps {
  visible: boolean;
  selectedIds: string[];
  onDone?: () => void;
}

const withDestructive = (ui: UIStore) => ({
  titleStyle: {
    color: ui.colors.systemRed,
  },
  iconProps: {
    fill: ui.colors.systemRed,
  },
});

function getList(isAll: boolean, t: TFunction, ui: UIStore) {
  if (isAll) {
    return [
      {
        title: t('common:restoreAll'),
        key: 'restoreAll',
      },
      {
        title: t('common:deleteAll'),
        key: 'deleteAll',
        ...withDestructive(ui),
      },
    ];
  }

  return [
    {
      title: t('common:restore'),
      key: 'restore',
    },
    {
      title: t('common:delete'),
      key: 'delete',
      ...withDestructive(ui),
    },
  ];
}

export const ToolbarContainer = observer<IToolbarContainerProps>(props => {
  const { t } = useTranslation();
  const { ui } = useStore();
  const list = useMemo(
    () => getList(!props.selectedIds.length, t, ui),
    [t, ui, props.selectedIds.length],
  );

  const { data: fileResult } = useQuery('recycle.bin.image.list', {
    enabled: false,
  });
  const { refetch: refetchAlbumList } = useQuery('list.album', {
    enabled: false,
  });

  const { mutateAsync } = useDeleteFile();
  const { mutateAsync: updateFileAsync } = useUpdateFile();

  async function handleToolbarPress(key: string | number) {
    switch (key) {
      case 'delete':
      case 'deleteAll':
        showDeleteActionSheet({
          title: '删除图片',
          message: '此操作不可撤销',
          onConfirm: async () => {
            try {
              await mutateAsync({
                ids:
                  key === 'deleteAll'
                    ? fileResult?.list.map(item => item.id)
                    : props.selectedIds,
                isMark: false,
              });
            } catch (error) {}
            props.onDone?.();
          },
        });
        break;
      case 'restore':
      case 'restoreAll':
        services.nav.screens?.show('FolderPicker', {
          title: {
            text: '恢复到到相册',
          },
          async onDone({ id }) {
            await updateFileAsync({
              ids:
                key === 'restoreAll'
                  ? fileResult?.list.map(item => item.id)
                  : props.selectedIds,
              data: {
                status: FileStatus.Normal,
                parent_id: id,
                ctime: Date.now(),
              },
            });
            services.nav.screens?.dismissModal('FolderPicker');
            refetchAlbumList();
            props.onDone?.();
          },
        });
    }
  }

  return (
    <Toolbar visible={props.visible} list={list} onPress={handleToolbarPress} />
  );
});
