import React, { useRef } from 'react';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
  OptionsTopBarTitle,
} from 'react-native-navigation';
import { observer } from 'mobx-react-lite';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import { useQuery } from 'react-query';
import { FlatGrid } from 'react-native-super-grid';

import { services } from '@/services';
import FileEntity from '@/services/db/file';
import { useStore } from '@/store';
import { DataLoadStatus } from '@/components/DataLoadStatus';
import {
  AddAlbumDialog,
  IAddAlbumDialogRef,
} from '@/components/AddAlbumDialog';
import { AlbumCard } from '@/screens/Album';
import { useTranslation } from 'react-i18next';
import { useCreateAlbum } from '@/hooks';

interface IFolderPickerProps extends NavigationComponentProps {
  title?: OptionsTopBarTitle;
  excludedFolder?: string[];
  onDone: (id: FileEntity) => void;
}

const FolderPicker: NavigationFunctionComponent<IFolderPickerProps> = props => {
  const { ui } = useStore();
  const { t } = useTranslation();
  const addAlbumDialogRef = useRef<IAddAlbumDialogRef>();

  useNavigationButtonPress(handleCloseModal, props.componentId, 'cancel');
  useNavigationButtonPress(
    () => {
      addAlbumDialogRef.current?.open();
    },
    props.componentId,
    'add',
  );

  const { mutateAsync: createAlbum } = useCreateAlbum();

  const {
    data: albumResult,
    isLoading,
    refetch: refetchAlbumList,
  } = useQuery('list.album', {
    enabled: false,
  });

  function handleCloseModal() {
    services.nav.screens?.N.dismissModal(props.componentId);
  }

  return (
    <>
      <FlatGrid
        style={{
          backgroundColor: ui.colors.systemBackground,
        }}
        ListEmptyComponent={
          <DataLoadStatus loading={isLoading} text={t('album:noData')} />
        }
        itemDimension={150}
        spacing={20}
        data={
          albumResult?.list?.filter(
            item => !props.excludedFolder?.includes(item.id),
          ) ?? []
        }
        renderItem={({ item }) => (
          <>
            <AlbumCard
              data={item}
              onPress={() => {
                props.onDone?.(item);
              }}
              {...props}
            />
          </>
        )}
      />
      <AddAlbumDialog
        ref={addAlbumDialogRef}
        onDone={async name => {
          await createAlbum({
            name,
          });
          refetchAlbumList();
        }}
      />
    </>
  );
};

FolderPicker.options = props => ({
  topBar: {
    title: props.title,
  },
  modal: {
    swipeToDismiss: false,
  },
});

export default observer(FolderPicker);
