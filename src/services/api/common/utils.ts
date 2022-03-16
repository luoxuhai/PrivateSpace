import { isNull, isUndefined } from 'lodash';
import isUUID from 'validator/es/lib/isUUID';
import FS from 'react-native-fs';
import { Asset } from 'expo-asset';

import { getThumbnailPath, join, getSourcePath } from '@/utils';
import { SOURCE_PATH } from '@/config';
import PhotoController from '../photo/photo.controller';
import { FileStatus, FileType } from '@/services/database/entities/file.entity';
import { stores } from '@/store';

const defaultCover = Asset.fromModule(
  require('@/assets/images/noimage.png'),
).uri;

export function deleteUndefined(obj?: { [key: string]: any }): void {
  if (!obj) return;

  for (const key in obj) {
    if (isUndefined(obj[key])) {
      delete obj[key];
    }
  }
}

export async function getAlbumCover(
  album: API.AlbumType,
): Promise<string | undefined | null> {
  const cover = album.extra?.cover;
  let coverUri = cover;

  // 封面为图片
  if (!isUndefined(cover) && !isNull(cover)) {
    if (isUUID(cover)) {
      const thumbnail = getThumbnailPath({
        sourceId: cover,
      });
      coverUri = (await FS.exists(thumbnail))
        ? thumbnail
        : (await FS.readDir(join(SOURCE_PATH, cover)))[0].path;
    }
  } else {
    const sort = stores.album.photoViewConfig?.sort;
    // 获取首张图片作为封面
    const photo = await PhotoController.get({
      status: FileStatus.Normal,
      parent_id: album.id,
      // TODO
      order_by: {
        [sort?.field ?? 'ctime']: sort?.order === 'desc' ? 'DESC' : 'ASC',
      },
    });

    coverUri = photo?.thumbnail || photo?.poster || photo?.uri;

    if (!coverUri) {
      coverUri = defaultCover;
    }
  }

  return coverUri;
}

export async function getPhotoThumbnailPath(
  photo: API.PhotoType,
): Promise<(string | undefined)[]> {
  const sourceId = photo.extra?.source_id;
  if (!sourceId) return [];

  let thumbnailPath: string = getThumbnailPath({ sourceId });
  const sourcePath = getSourcePath(sourceId, photo.name);
  if (photo.extra?.width) {
    if (photo.extra.width < 400) {
      thumbnailPath = sourcePath;
    }
  } else if (!(await FS.exists(thumbnailPath))) {
    thumbnailPath = sourcePath;
  }

  return [thumbnailPath, sourcePath];
}

export async function setPhotoSource(
  photo: API.PhotoWithSource | API.PhotoWithSource[],
): PVoid {
  const newPhoto = Array.isArray(photo) ? photo : [photo];

  for (const [index, item] of newPhoto.entries()) {
    if (item.type === FileType.Folder) continue;
    const [thumbnail, uri] = await getPhotoThumbnailPath(item);
    newPhoto[index].thumbnail = thumbnail;
    newPhoto[index].uri = uri;
    // TODO 视频的 `poster` 暂时取 `thumbnail`
    if (item.mime?.startsWith('video/')) {
      newPhoto[index].poster = thumbnail;
    }
  }
}

// export async function setAlbumExtra(params: type) {

// }
