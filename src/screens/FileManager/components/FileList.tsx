import React, { useCallback } from 'react';

import { StyleSheet, FlatListProps } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { useNavigationComponentDidDisappear } from 'react-native-navigation-hooks';
import FileViewer from 'react-native-file-viewer';

import { FlatGrid } from 'react-native-super-grid';
import FileItem from './FileItem';
import { ContextMenu } from '../ContextMenu';
import { useForceRender } from '@/hooks/index';
import { FileType } from '@/services/database/entities/file.entity';

interface FileListProps
  extends Omit<FlatListProps<API.FileWithSource>, 'renderItem'> {
  layoutType?: 'list' | 'grid' | 'gallery';
  componentId: string;
  onViewDetail: (v: API.FileWithSource) => void;
}

const ITEM_WIDTH = 80;

function FileList(props: FileListProps) {
  const { visible, forceRender } = useForceRender();

  useNavigationComponentDidDisappear(() => {
    forceRender();
  }, props.componentId);

  const renderItem = useCallback(
    ({ item }) => {
      return visible ? (
        <ContextMenu item={item} onViewDetail={props.onViewDetail}>
          <FileItem
            item={item}
            onPress={() => {
              if (item.type === FileType.Folder) {
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
                FileViewer.open(item.uri, {
                  displayName: item.name,
                });
              }
            }}
          />
        </ContextMenu>
      ) : null;
    },
    [props.componentId, visible],
  );

  return (
    <FlatGrid
      style={styles.list}
      renderItem={renderItem}
      itemDimension={ITEM_WIDTH}
      spacing={20}
      {...props}
    />
  );
}

export default FileList;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
