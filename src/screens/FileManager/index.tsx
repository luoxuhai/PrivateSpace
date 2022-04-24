import React from 'react';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
  Navigation,
} from 'react-native-navigation';
import { StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react';
import { useNavigationComponentDidDisappear } from 'react-native-navigation-hooks';
import { useTranslation } from 'react-i18next';
import useUpdateEffect from 'use-update-effect';
import FileViewer from 'react-native-file-viewer';

import { DataLoadStatus } from '@/components/DataLoadStatus';
import AddButton from './AddButton';
import { useStore } from '@/store';
import FileList from './components/FileList';
import { useQuery } from 'react-query';
import { services } from '@/services';
import FileDetail, { FileDetailInstance } from './FileDetail';
import { useRef } from 'react';
import { FileType } from '@/services/database/entities/file.entity';

interface FileManagerProps extends NavigationComponentProps {
  name: string;
  folderId: string;
}

const FileManager: NavigationFunctionComponent<FileManagerProps> = observer(
  props => {
    const { file: fileStore, global } = useStore();
    const { t } = useTranslation();
    const fileDetailRef = useRef<FileDetailInstance>(null);

    useNavigationComponentDidDisappear(() => {
      refetch();
    }, props.componentId);

    useUpdateEffect(() => {
      refetch();
    }, [fileStore.orderBy]);

    useUpdateEffect(() => {
      if (global.maskVisible) {
        FileViewer.dismiss(false);
      }
    }, [global.maskVisible]);

    const {
      data: fileResult,
      isFetching,
      isRefetching,
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
          data={isRefetching ? [] : fileResult?.items ?? []}
          componentId={props.componentId}
          layoutType={fileStore.view}
          ListEmptyComponent={
            fileResult?.total ? null : (
              <DataLoadStatus
                loading={isFetching}
                text={t('fileManager:noData')}
              />
            )
          }
          onViewDetail={item => fileDetailRef.current?.open?.(item)}
          onItemPress={item => {
            if (item.type === FileType.Folder && props.componentId) {
              Navigation.push(props.componentId, {
                component: {
                  name: 'FileManager',
                  passProps: {
                    name: item.name,
                    folderId: item.id,
                  },
                },
              });
            } else {
              // Navigation.push(props.componentId, {
              //   component: {
              //     name: 'FileView',
              //     passProps: {
              //       url: `file://${item.uri}`,
              //       // folderId: item.id,
              //     },
              //   },
              // });
              // return;
              FileViewer.open(item.uri, {
                displayName: item.name,
              });
            }
          }}
        />
        <AddButton folderId={props.folderId} componentId={props.componentId} />
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
