import React, { useCallback } from 'react';

import { StyleSheet, FlatListProps, FlatList } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { useNavigationComponentDidDisappear } from 'react-native-navigation-hooks';

import { FlatGrid } from 'react-native-super-grid';
import FileItem, { FileItemLine } from './FileItem';
import { ContextMenu } from '../ContextMenu';
import { useForceRender } from '@/hooks/index';
import { FileType } from '@/services/database/entities/file.entity';

interface FileListProps
  extends Omit<FlatListProps<API.FileWithSource>, 'renderItem'> {
  layoutType?: FileView;
  componentId?: string;
  onViewDetail?: (v: API.FileWithSource) => void;
  onItemPress?: (v: API.FileWithSource) => void;
}

const ITEM_WIDTH = 80;

function FileList(props: FileListProps) {
  const { visible, forceRender } = useForceRender();

  useNavigationComponentDidDisappear(() => {
    forceRender();
  }, props.componentId);

  const renderItem = useCallback(
    ({ item }) => {
      const Item = props.layoutType === 'list' ? FileItemLine : FileItem;
      return visible ? (
        <ContextMenu item={item} onViewDetail={props.onViewDetail}>
          <Item
            item={item}
            onPress={() => {
              props.onItemPress?.(item);
            }}
          />
        </ContextMenu>
      ) : null;
    },
    [props.componentId, props.layoutType, visible],
  );

  return props.layoutType === 'icons' ? (
    <FlatGrid
      style={styles.list}
      renderItem={renderItem}
      itemDimension={ITEM_WIDTH}
      spacing={20}
      {...props}
    />
  ) : (
    <FlatList style={styles.list} renderItem={renderItem} {...props} />
  );
}

export default FileList;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
