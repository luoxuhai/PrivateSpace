import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import FileCover from '@/components/FileCover';
import { useStore } from '@/store';
import { FileType } from '@/services/database/entities/file.entity';
import { formatFileSize } from '@/utils';

interface FileItemProps {
  item: API.FileWithSource;
  onPress: () => void;
}

type FileItemLineProps = FileItemProps;

const FileItem = observer<FileItemProps>(props => {
  const { ui } = useStore();
  const { t } = useTranslation();

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
        {props.item.type === FileType.File
          ? dayjs(props.item.ctime).format('YYYY-MM-DD')
          : `${props.item.children_count ?? 0} ${t('fileManager:items')}`}
      </Text>
    </TouchableOpacity>
  );
});

export default FileItem;

export const FileItemLine = observer<FileItemLineProps>(props => {
  const { ui } = useStore();
  const { t } = useTranslation();

  const isFolder = props.item.type === FileType.Folder;

  return (
    <TouchableOpacity
      style={[
        lineStyles.container,
        {
          backgroundColor: ui.colors.systemBackground,
        },
      ]}
      activeOpacity={0.7}
      onPress={props.onPress}>
      <FileCover
        item={props.item}
        coverProps={{
          width: 40,
          height: 40,
          style: lineStyles.cover,
        }}
      />
      <View
        style={[
          lineStyles.body,
          {
            borderBottomColor: ui.colors.separator,
          },
        ]}>
        <Text
          style={[
            lineStyles.name,
            {
              color: ui.colors.label,
            },
          ]}
          ellipsizeMode="middle"
          numberOfLines={1}>
          {props.item.name}
        </Text>
        <View style={lineStyles.desc}>
          <Text
            style={[
              lineStyles.time,
              {
                color: ui.colors.secondaryLabel,
              },
            ]}>
            {dayjs(props.item.ctime).format('YYYY-MM-DD')}
          </Text>
          <Text
            style={[
              lineStyles.count,
              lineStyles.time,
              {
                color: ui.colors.secondaryLabel,
              },
            ]}>
            {isFolder
              ? `${props.item.children_count ?? 0} ${t('fileManager:items')}`
              : formatFileSize(props.item.size)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

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
    textAlign: 'center',
  },
  time: {
    fontSize: 12,
  },
});

const lineStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  body: {
    flex: 1,
    marginLeft: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  name: {
    flex: 1,
    fontSize: 15,
  },
  desc: {
    flexDirection: 'row',
    marginTop: 6,
  },
  time: {
    fontSize: 13,
  },
  count: {
    marginLeft: 10,
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
});
