import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';

import FileCover from '@/components/FileCover';
import { useStore } from '@/store';

interface FileItemProps {
  item: API.FileWithSource;
  onPress: () => void;
}

const FileItem = observer<FileItemProps>(props => {
  const { ui } = useStore();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: ui.colors.systemBackground,
        },
      ]}
      activeOpacity={0.7}
      onPress={props.onPress}>
      <FileCover item={props.item} />
      <Text
        style={[
          styles.name,
          {
            color: ui.colors.label,
          },
        ]}
        ellipsizeMode="middle"
        numberOfLines={2}>
        {props.item.name}
      </Text>
      <Text
        style={[
          styles.time,
          {
            color: ui.colors.secondaryLabel,
          },
        ]}>
        {dayjs(props.item.ctime).format('YYYY-MM-DD')}
      </Text>
    </TouchableOpacity>
  );
});

export default FileItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    height: 170,
    paddingHorizontal: 5,
  },
  name: {
    fontSize: 15,
    marginVertical: 6,
  },
  time: {
    fontSize: 12,
  },
});
