import { Image } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { FFprobeKit } from 'ffmpeg-kit-react-native';
import * as Toolkit from 'react-native-app-toolkit';

import { CustomSentry } from '@/utils/customSentry';
import config, { SOURCE_PATH, THUMBNAIL_PATH } from '@/config';
import FileEntity, {
  SourceType,
} from '@/services/database/entities/file.entity';
import { initAlbums, services } from '@/services';
import { join } from './path';

/**
 * 获取资源文件地址
 *
 * @param sourceId
 * @param filename
 * @returns 本地路径
 */
export function getSourcePath(sourceId: string, filename?: string): string {
  return join(SOURCE_PATH, sourceId, filename);
}

/**
 * 获取视频封面地址
 *
 * @param sourceId
 * @returns 本地路径
 */
export function getPosterPath(sourceId?: string) {
  return sourceId ? join(SOURCE_PATH, sourceId, 'poster.jpg') : undefined;
}

/**
 * 获取缩略图文件地址
 *
 * @param sourceId
 * @param size
 * @returns 本地路径
 */
export function getThumbnailPath({
  sourceId,
  size = 'default',
  isDir = false,
}: {
  sourceId: string;
  size?: 'small' | 'default' | 'large';
  isDir?: boolean;
}): string {
  const dir = join(THUMBNAIL_PATH, sourceId);
  if (isDir) {
    return dir;
  }

  return join(dir, `${size}.jpg`);
}

/**
 * [formatFileSize 格式化文件大小]
 * @param  {[int]} size [文件大小]
 * @param  {[int]} n     [total参数的原始单位如果为Byte，则n设为1，如果为kb，则n设为2，如果为mb，则n设为3，以此类推]
 * @return {[string]}       [带单位的文件大小的字符串]
 */
export function formatFileSize(size = 0 as number | string, n = 1): string {
  const len = Number(size) / 1024;
  if (len > 1000) {
    return formatFileSize(len, ++n);
  } else {
    switch (n) {
      case 1:
        return len.toFixed(2) + 'KB';
      case 2:
        return len.toFixed(2) + 'MB';
      case 3:
        return len.toFixed(2) + 'GB';
      case 4:
        return len.toFixed(2) + 'TB';
      default:
        return String(size);
    }
  }
}

/**
 * 生成缩略图，支持图片、视频
 *
 */
export async function generateThumbnail(
  path: string,
  type: SourceType,
): Promise<{ path: string } | undefined | null> {
  const TARGET_SIZE = 300;

  switch (type) {
    case SourceType.Image:
      try {
        const res = await resizeImage({ uri: path, width: TARGET_SIZE });
        return res;
      } catch {
        return null;
      }
    case SourceType.Video: {
      // const outputPath = join(TEMP_PATH, `${generateID()}.jpg`);
      // 截取时间，ms
      const stime = 1000;

      try {
        const result = await Toolkit.VideoThumbnail.getThumbnail(
          path.startsWith('file://') ? path : `file://${path}`,
          {
            time: stime,
          },
        );

        return {
          path: result.uri,
        };
      } catch (error) {
        CustomSentry.captureException(error, {
          extra: {
            title: '截取视频封面失败',
          },
        });
        return null;
      }
    }
  }
}

export async function resizeImage({
  uri,
  width,
  compress = 0.5,
}: {
  uri?: string;
  width?: number;
  compress?: number;
}): Promise<
  | {
      path: string;
    }
  | undefined
> {
  if (!uri) return;
  const res = await manipulateAsync(
    uri,
    [
      {
        resize: {
          width,
        },
      },
    ],
    { compress, format: SaveFormat.JPEG, base64: false },
  );

  return {
    path: res.uri,
  };
}

export function getImageSize(
  uri: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) =>
        resolve({
          width,
          height,
        }),
      reject,
    );
  });
}

export async function getMediaInfo(path?: string): Promise<
  | {
      /** 毫秒 */
      duration: number;
      width: number;
      height: number;
    }
  | undefined
> {
  if (!path) return;

  const session = await FFprobeKit.getMediaInformation(path);

  try {
    const information = session.getMediaInformation();
    const allProperties = information.getAllProperties();
    const stream = allProperties.streams.find(item => item.width);

    return {
      duration: allProperties.format.duration * 1000,
      width: stream.width,
      height: stream.height,
    };
  } catch (error) {
    return;
  }
}

/**
 * 获取默认相册
 */
export async function getDefaultAlbum(
  owner: string,
): Promise<FileEntity | undefined> {
  await initAlbums();

  const result = services.api.album.get({
    name: config.defaultAlbum[0].name,
    owner,
  });

  return result;
}
