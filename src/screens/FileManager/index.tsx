import React from 'react';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';
import { StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react';
import { useNavigationComponentDidAppear } from 'react-native-navigation-hooks';
import { useTranslation } from 'react-i18next';
import useUpdateEffect from 'use-update-effect';

import { DataLoadStatus } from '@/components/DataLoadStatus';
import AddButton from './AddButton';
import { useStore } from '@/store';
import FileList from './components/FileList';
import { useQuery } from 'react-query';
import { services } from '@/services';
import FileDetail, { FileDetailInstance } from './FileDetail';
import { useRef } from 'react';

interface FileManagerProps extends NavigationComponentProps {
  name: string;
  folderId: string;
}

const FileManager: NavigationFunctionComponent<FileManagerProps> = observer(
  props => {
    const { file: fileStore } = useStore();
    const { t } = useTranslation();
    const fileDetailRef = useRef<FileDetailInstance>(null);

    useNavigationComponentDidAppear(() => {
      if (fileResult?.total) {
        refetch();
      }
    }, props.componentId);

    useUpdateEffect(() => {
      refetch();
    }, [fileStore.orderBy]);

    const {
      data: fileResult,
      isLoading,
      isFetching,
      refetch,
    } = useQuery(
      [props.folderId ?? 'root', '.files'],
      async () => {
        const result = await services.api.file.list({
          parent_id: props.folderId ?? null,
          order_by: fileStore.orderBy,
        });

        return result;
      },
      { enabled: true },
    );

    return (
      <>
        <FileList
          data={fileResult?.items ?? []}
          componentId={props.componentId}
          ListEmptyComponent={
            <DataLoadStatus
              loading={isFetching}
              text={t('fileManager:noData')}
            />
          }
          onViewDetail={v => fileDetailRef.current?.open?.(v)}
        />
        <AddButton folderId={props.folderId} />
        <FileDetail ref={fileDetailRef} />
        {fileStore.moreContextVisible && <View style={styles.mask} />}
      </>
    );
  },
);

FileManager.options = props => {
  return {
    topBar: {
      title: {
        text: props.name,
      },
      rightButtons: [
        {
          id: 'more',
          component: {
            id: 'FileManagerMoreButton',
            name: 'FileManagerMoreButton',
          },
        },
      ],
    },
  };
};

export default FileManager;

const styles = StyleSheet.create({
  mask: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
});
