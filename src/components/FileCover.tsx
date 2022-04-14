import React from 'react';
import {
  PlatformColor,
  StyleSheet,
  StyleProp,
  ViewProps,
  ImageProps,
} from 'react-native';
import FastImageProgress from '@/components/FastImageProgress';
import { extname } from '@/utils';

import CoverFolder from '@/assets/images/file/默认文件夹.svg';
import CoverImage from '@/assets/images/file/文件类型-标准图-图片文件.svg';
import CoverVideo from '@/assets/images/file/文件类型-标准图-视频文件.svg';
import CoverAudio from '@/assets/images/file/文件类型-标准图-声音文件.svg';
import CoverOther from '@/assets/images/file/文件类型-标准图-未知文件.svg';
import CoverPDF from '@/assets/images/file/文件类型-标准图-PDF文档.svg';
import CoverWord from '@/assets/images/file/文件类型-标准图-Word文档.svg';
import CoverExcel from '@/assets/images/file/文件类型-标准图-工作表.svg';
import CoverPPT from '@/assets/images/file/文件类型-标准图-幻灯片.svg';
import CoverTXT from '@/assets/images/file/文件类型-标准图-记事本.svg';
import CoverZip from '@/assets/images/file/文件类型-标准图-压缩文件.svg';
import CoverWeb from '@/assets/images/file/文件类型-标准图-链接.svg';
import { FileType } from '@/services/database/entities/file.entity';
import { useStore } from '@/store';
import uiStore from '@/store/ui';

const PPTExtensionName = ['ppt', 'pptx', 'pot', 'potx', 'pps', 'ppsx'];
const ExcelExtensionName = [
  'xls',
  'xlt',
  'xla',
  'xlsx',
  'xltx',
  'xlsm',
  'xltm',
  'xlam',
  'xlsb',
];
const WordExtensionName = ['doc', 'dot', 'docx', 'dotx', 'docm', 'dotm'];
const ArchiveExtensionName = ['zip', 'rar', 'gzip', '7z', 'tar'];

const coverProps = {
  width: '90%',
  // height: 100,
  maxHeight: 90,
};

const imageProps: ImageProps = {
  style: {
    width: '90%',
    height: 100,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: uiStore.colors.systemGray4,
  },
  resizeMode: 'contain',
  threshold: 200,
};

function getCoverComponentByMime(
  item: API.FileWithSource,
  props?: { style?: StyleProp<ViewProps | ImageProps> },
) {
  const mime = item.mime;
  const extensionName = extname(item.name)?.replace('.', '');

  if (item.type === FileType.Folder) return <CoverFolder {...props} />;
  const thumbnail = item.thumbnail || item.poster;

  if (mime?.startsWith('image')) {
    if (thumbnail) {
      return (
        <FastImageProgress
          source={{
            uri: thumbnail,
          }}
          {...imageProps}
          {...props}
        />
      );
    } else return <CoverImage {...props} />;
  } else if (mime?.startsWith('audio')) {
    return <CoverAudio {...props} />;
  } else if (mime?.startsWith('video')) {
    if (thumbnail) {
      return (
        <FastImageProgress
          source={{
            uri: thumbnail,
          }}
          {...imageProps}
          {...props}
        />
      );
    } else return <CoverVideo {...props} />;
  } else if (extensionName === 'pdf') {
    return <CoverPDF {...props} />;
  } else if (extensionName === 'html') {
    return <CoverWeb {...props} />;
  } else if (ArchiveExtensionName.includes(extensionName)) {
    return <CoverZip {...props} />;
  } else if (WordExtensionName.includes(extensionName)) {
    return <CoverWord {...props} />;
  } else if (PPTExtensionName.includes(extensionName)) {
    return <CoverPPT {...props} />;
  } else if (ExcelExtensionName.includes(extensionName)) {
    return <CoverExcel {...props} />;
  } else if (mime?.startsWith('text/')) {
    return <CoverTXT {...props} />;
  } else {
    return <CoverOther {...props} />;
  }
}

interface FileCoverProps {
  item: API.FileWithSource;
  coverProps?: {
    style?: StyleProp<ViewProps | ImageProps>;
    width?: number;
    height?: number;
  };
}

function FileCover(props: FileCoverProps): JSX.Element {
  const Component = getCoverComponentByMime(props.item, {
    ...coverProps,
    ...props.coverProps,
  });
  return Component;
}

export default FileCover;
