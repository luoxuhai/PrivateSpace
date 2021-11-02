import React, {
  useRef,
  useImperativeHandle,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useStore } from '@/store';
import {
  getSourceNameByType,
  getSourceByMime,
  formatFileSize,
  getImageSize,
  getSourcePath,
} from '@/utils';
import FileEntity, { SourceType } from '@/services/db/file';
import { BottomSheet, IBottomSheetPropsRef } from '@/components/BottomSheet';
import { observer } from 'mobx-react-lite';

dayjs.extend(durationPlugin);

interface IFileDetailProps {
  item?: FileEntity;
}

export const FileDetail = observer<IFileDetailProps>(
  (props, ref) => {
    const bottomSheetRef = useRef<IBottomSheetPropsRef>();
    const { t } = useTranslation();
    const [item, setItem] = useState<FileEntity>();
    const { ui } = useStore();
    const [dime, setDime] = useState<
      { width: number; height: number } | undefined
    >();
    const [duration, setDuration] = useState<number | undefined>();

    const sourceType = useMemo(() => getSourceByMime(item?.mime), [item?.mime]);

    useImperativeHandle(ref, () => ({
      open(value: FileEntity) {
        bottomSheetRef.current?.open();
        setItem(value);
        if (value.extra?.duration) {
          setDuration(value.extra?.duration);
        }
        console.log(value.extra);

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
      bottomSheetRef.current?.close();
      setItem(undefined);
      setDuration(undefined);
      setDime(undefined);
    }, []);

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
            value: getSourceNameByType(sourceType),
          },
          {
            type: 'size',
            label: t('fileManage:size'),
            value: formatFileSize(item?.size),
          },
          {
            type: 'dime',
            label: t('fileManage:info.dime'),
            value: dime ? `${dime?.width}x${dime?.height}` : '-',
          },
          sourceType === SourceType.Video && {
            type: 'duration',
            label: t('fileManage:info:duration'),
            value: duration ? dayjs.duration(duration).format('mm:ss') : '-',
          },
          {
            type: 'ctime',
            label: t('fileManage:ctime'),
            value: dayjs(item?.ctime).format('MM月DD日 HH:mm'),
          },
        ].filter(v => v),
      [item, dime, duration, sourceType],
    );

    return (
      <>
        <BottomSheet
          ref={bottomSheetRef}
          header="详情"
          snapPoints={[200, 300]}
          onDismiss={handleClose}>
          <BottomSheetScrollView style={styles.bottomSheetWrapper}>
            {list?.map(item => (
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
                <Text selectable style={{ color: ui.colors.label }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </BottomSheetScrollView>
        </BottomSheet>
      </>
    );
  },
  { forwardRef: true },
);

const styles = StyleSheet.create({
  bottomSheetWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    height: '100%',
  },
  operationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  label: {
    fontSize: 16,
    marginRight: 5,
  },
});
