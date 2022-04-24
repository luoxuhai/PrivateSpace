import React, { memo, useMemo, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  StyleProp,
  ActivityIndicator,
  ViewStyle,
  ImageStyle,
  View,
} from 'react-native';
import { ThumbnailGenerator } from 'react-native-app-toolkit';
import { mkdir, exists, unlink } from 'react-native-fs';
import { getMimeType } from '@qeepsake/react-native-file-utils';

import FastImageProgress from '@/components/FastImageProgress';
import { extname, filePathWithScheme, getThumbnailPath, join } from '@/utils';
import {
  CoverFolder,
  CoverImage,
  CoverAudio,
  CoverVideo,
  CoverOther,
  CoverWord,
  CoverPDF,
  CoverExcel,
  CoverTXT,
  CoverPPT,
  CoverWeb,
  CoverZip,
} from './icon';
import {
  PPTExtensionNames,
  ExcelExtensionNames,
  WordExtensionNames,
  ArchiveExtensionNames,
  TextExtensionNames,
  WebExtensionNames,
  ImageExtensionNames,
  AudioExtensionNames,
  VideoExtensionNames,
  DEFAULT_SIZE,
} from './constant';

interface FileThumbnailProps {
  uri: string;
  sourceId?: string;
  thumbnailUrl?: string;
  isFolder?: boolean;
  mime?: string;
  /**
   * @default false
   */
  iconMode?: boolean;
  /**
   * @default 'thumbnail'
   */
  representationType?: 'icon' | 'thumbnail';
  /**
   * @default 'contain'
   */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /**
   * @default 200
   */
  threshold?: number;
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ImageStyle | ViewStyle>;
}

function FileThumbnail(props: FileThumbnailProps): JSX.Element {
  const [mime, setMime] = useState(props.mime);
  const ext = useMemo(
    () =>
      props.uri ? extname(props.uri)?.replace('.', '')?.toLowerCase() : null,
    [props.uri],
  );
  const IconView = useMemo(
    () => getIconView(ext, mime, props.isFolder),
    [ext, mime, props.isFolder],
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(
    getThumbnailPath({
      sourceId: props.sourceId,
      size: 'default',
    }),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!props.mime && props.uri) {
      getMimeType(filePathWithScheme(props.uri)).then(setMime);
    }
  }, [props.mime, props.uri]);

  useEffect(() => {
    if (!props.iconMode && !props.isFolder && props.sourceId) {
      setLoading(true);
      const toFileAtDir = getThumbnailPath({
        sourceId: props.sourceId,
        isDir: true,
      });
      mkdir(toFileAtDir);
      exists(thumbnailUrl ?? '').then(exist => {
        if (exist) {
          return;
        }

        setThumbnailUrl(undefined);
        const toFileAtURL = join(toFileAtDir, 'default.jpg');
        ThumbnailGenerator.generate({
          path: props.uri,
          toFileAtURL,
          width: 200,
          height: 200,
          scale: 1,
          iconMode: true,
          representationType: 'lowQualityThumbnail',
        })
          .then(res => {
            setThumbnailUrl(res.path);
          })
          .catch(async error => {
            if (await exists(toFileAtURL)) {
              unlink(toFileAtURL);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      });
    }
  }, [props.uri, props.iconMode]);

  const size = {
    width: props.width ?? props.height ?? DEFAULT_SIZE,
    height: props.height ?? props.width ?? DEFAULT_SIZE,
  };

  const renderError = useCallback(() => {
    return <IconView {...size} />;
  }, [size]);

  const renderIndicator = useCallback(() => {
    return <ActivityIndicator />;
  }, []);

  return (
    <View style={[props.style, styles.container, size]}>
      {thumbnailUrl && !props.iconMode && !props.isFolder ? (
        <FastImageProgress
          style={size}
          source={{
            uri: thumbnailUrl,
          }}
          resizeMode={props.resizeMode ?? 'contain'}
          threshold={props.threshold ?? 200}
          renderError={renderError}
          renderIndicator={renderIndicator}
        />
      ) : loading ? (
        renderIndicator()
      ) : (
        <IconView {...size} />
      )}
    </View>
  );
}

export default memo(FileThumbnail);

function getIconView(ext?: string | null, mime?: string, isFolder = false) {
  if (isFolder) return CoverFolder;

  if (ext === 'pdf') {
    return CoverPDF;
  } else if (WebExtensionNames.includes(ext as string)) {
    return CoverWeb;
  } else if (
    mime?.startsWith('text/') ||
    TextExtensionNames.includes(ext as string)
  ) {
    return CoverTXT;
  } else if (ArchiveExtensionNames.includes(ext as string)) {
    return CoverZip;
  } else if (WordExtensionNames.includes(ext as string)) {
    return CoverWord;
  } else if (PPTExtensionNames.includes(ext as string)) {
    return CoverPPT;
  } else if (ExcelExtensionNames.includes(ext as string)) {
    return CoverExcel;
  } else if (
    mime?.startsWith('image/') ||
    ImageExtensionNames.includes(ext as string)
  ) {
    return CoverImage;
  } else if (
    mime?.startsWith('audio/') ||
    AudioExtensionNames.includes(ext as string)
  ) {
    return CoverAudio;
  } else if (
    mime?.startsWith('video/') ||
    VideoExtensionNames.includes(ext as string)
  ) {
    return CoverVideo;
  } else {
    return CoverOther;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
