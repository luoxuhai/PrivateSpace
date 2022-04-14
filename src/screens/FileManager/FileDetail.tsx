import React, {
  useImperativeHandle,
  useState,
  useMemo,
  useCallback,
  forwardRef,
} from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import Modal from 'react-native-modal';

import { useStore } from '@/store';
import {
  getSourceNameByType,
  getSourceByMime,
  formatFileSize,
  getImageSize,
  getSourcePath,
  formatDuration,
} from '@/utils';
import FileEntity, {
  FileType,
  SourceType,
} from '@/services/database/entities/file.entity';
import { SafeAreaScrollView } from '@/components';

interface IFileDetailProps {
  item?: FileEntity;
}

export interface FileDetailInstance {
  open(v: API.FileWithSource): void;
  close(): void;
}

const FileDetail = observer<IFileDetailProps, FileDetailInstance>(
  forwardRef((props, ref) => {
    const { t } = useTranslation();
    const [item, setItem] = useState<API.FileWithSource>();
    const { ui } = useStore();
    const [visible, setVisible] = useState(false);
    const [dime, setDime] = useState<
      { width: number; height: number } | undefined
    >();
    const [duration, setDuration] = useState<number | undefined>();

    const sourceType = useMemo(() => getSourceByMime(item?.mime), [item?.mime]);

    useImperativeHandle(ref, () => ({
      open(value: API.FileWithSource) {
        setVisible(true);
        setItem(value);
        if (value.extra?.duration) {
          setDuration(value.extra?.duration);
        }

        if (value.extra?.width && value.extra?.height) {
          setDime({
            width: value.extra?.width,
            height: value.extra?.height,
          });
        } else if (getSourceByMime(value!.mime!) === SourceType.Image) {
          getImageSize(getSourcePath(value.extra!.source_id!, value.name)).then(
            v => {
              setDime(v);
            },
          );
        }
      },
      close: handleClose,
    }));

    const handleClose = useCallback(() => {
      setVisible(false);
      setItem(undefined);
      setDuration(undefined);
      setDime(undefined);
    }, []);

    const isFolder = item?.type === FileType.Folder;

    const list = useMemo(
      () =>
        [
          {
            type: 'name',
            label: t('fileManage:info.name'),
            value: item?.name,
          },
          {
            type: 'type',
            label: t('fileManage:info.type'),
            value: isFolder
              ? t('common:folder')
              : getSourceNameByType(sourceType),
          },
          !isFolder && {
            type: 'size',
            label: t('fileManage:size'),
            value: formatFileSize(item?.size),
          },
          sourceType === SourceType.Image && {
            type: 'dime',
            label: t('fileManage:info.dime'),
            value: dime ? `${dime?.width}x${dime?.height}` : '-',
          },
          sourceType === SourceType.Video && {
            type: 'duration',
            label: t('fileManage:info:duration'),
            value: duration ? formatDuration(duration) : '-',
          },
          {
            type: 'ctime',
            label: t('fileManage:ctime'),
            value: dayjs(item?.ctime).format('YYYY年MM月DD日 HH:mm'),
          },
        ].filter(v => v),
      [item, dime, duration, sourceType, t],
    );

    return (
      <Modal
        style={styles.modal}
        backdropOpacity={0.4}
        supportedOrientations={[
          'portrait',
          'landscape',
          'portrait-upside-down',
          'landscape-left',
          'landscape-right',
        ]}
        isVisible={visible}
        hideModalContentWhileAnimating
        useNativeDriver
        onBackdropPress={handleClose}>
        <View
          style={[
            styles.bottomSheetWrapper,
            {
              backgroundColor:
                ui.appearance === 'dark'
                  ? ui.colors.secondarySystemBackground
                  : ui.colors.systemBackground,
            },
          ]}>
          <SafeAreaScrollView>
            {list?.map(
              item =>
                item && (
                  <View style={styles.operationContainer} key={item.type}>
                    <Text
                      style={[
                        styles.label,
                        {
                          color: ui.colors.label,
                        },
                      ]}>
                      {item.label}：
                    </Text>

                    <ScrollView horizontal alwaysBounceHorizontal={false}>
                      <Text
                        selectable
                        numberOfLines={2}
                        style={{ color: ui.colors.label }}>
                        {item.value}
                      </Text>
                    </ScrollView>
                  </View>
                ),
            )}
          </SafeAreaScrollView>
        </View>
      </Modal>
    );
  }),
);

export default FileDetail;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomSheetWrapper: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    height: 300,
    borderTopEndRadius: 16,
    borderTopStartRadius: 16,
  },
  operationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  operationContainerDesc: {
    flexDirection: 'row',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 5,
  },
  descInput: {
    flex: 1,
  },
  labelItem: {
    padding: 4,
    margin: 6,
    borderRadius: 2,
  },
});
