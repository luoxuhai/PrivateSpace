import { Image } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import {
  FFprobeKit,
  FFmpegKit,
  MediaInformationSession,
  ReturnCode,
} from 'ffmpeg-kit-react-native';
import fundebug from 'fundebug-reactnative';

import config, { SOURCE_PATH, THUMBNAIL_PATH, TEMP_PATH } from '@/config';
import FileEntity, { SourceType, FileType } from '@/services/db/file';
import { getFile } from '@/services/api/local/file';
import { initAlbums } from '@/services';
import { join } from './path';
import { generateID } from './common';

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
): Promise<{ path: string } | void | null> {
  const TARGET_SIZE = 400;

  switch (type) {
    case SourceType.Image:
      try {
        const res = await ImageResizer.createResizedImage(
          path,
          TARGET_SIZE,
          TARGET_SIZE,
          'JPEG',
          80,
          undefined,
          undefined,
          undefined,
          {
            mode: 'cover',
          },
        );
        return res;
      } catch (e) {
        fundebug.notify('压缩图片失败', e?.message ?? '');
        return null;
      }
    case SourceType.Video: {
      const outputPath = join(TEMP_PATH, `${generateID()}.jpg`);
      // 截取时间，ms
      const stime = 100 / 1000;
      return new Promise(resolve => {
        FFmpegKit.executeAsync(
          `-ss ${stime} -i ${path.replace(
            /^file:\/\//,
            '',
          )} -frames:v 1 -an -q:v 1 -vcodec mjpeg ${outputPath}`,
          async session => {
            try {
              const code = await session.getReturnCode();
              if (ReturnCode.isSuccess(code)) {
                resolve({
                  path: outputPath,
                });
              } else {
                throw await session.getAllLogsAsString();
              }
            } catch (error) {
              resolve(null);
              fundebug.notify('截取视频封面失败', error?.message ?? '');
            }
          },
        );
      });
    }
  }
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

export async function getMediaInfo(path: string): Promise<{
  /** 毫秒 */
  duration: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    FFprobeKit.getMediaInformationAsync(path, async session => {
      try {
        const information = await (
          session as MediaInformationSession
        ).getMediaInformation();
        const allProperties = information.getAllProperties();
        const stream = allProperties.streams.find(item => item.width);

        resolve({
          duration: allProperties.format.duration * 1000,
          width: stream.width,
          height: stream.height,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function getDefaultAlbum(
  owner: string,
): Promise<FileEntity | undefined> {
  await initAlbums();
  const result = await getFile({
    where: {
      name: config.defaultAlbum[0].name,
      type: FileType.Folder,
      owner,
    },
  });

  return result.data;
}
