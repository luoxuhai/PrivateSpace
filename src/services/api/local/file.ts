import { getRepository, InsertResult, UpdateResult } from 'typeorm/browser';
import FS from 'react-native-fs';
import isUUID from 'validator/es/lib/isUUID';
import { Asset } from 'expo-asset';

import { SOURCE_PATH, THUMBNAIL_PATH } from '@/config';
import {
  generateID,
  join,
  getSourceByMime,
  generateThumbnail,
  getThumbnailPath,
  getSourcePath,
  getImageSize,
} from '@/utils';
import FileEntity, {
  FileType,
  FileStatus,
  SourceType,
} from '@/services/db/file';
import { stores } from '@/store';
import {
  IListAlbumRequest,
  IListAlbumResponse,
  ICreateFileRequest,
  IUpdateFileRequest,
  IDeleteFileRequest,
  IListFileData,
  IListFileResponse,
  IListFileRequest,
  ISearchFileRequest,
  IListAlbumData,
  IDeleteResult,
  ICreateFileResponse,
  IGetFileResponse,
  IGetFileRequest,
  IDeleteAlbumRequest,
} from './type';
import { isNull } from 'lodash';

const defaultCover = Asset.fromModule(
  require('@/assets/images/noimage.png'),
).uri;

export async function listAlbum(
  params: IListAlbumRequest,
): Promise<IListAlbumResponse> {
  const albums = await getRepository<IListAlbumData>(FileEntity)
    .createQueryBuilder('file')
    .where(
      `json_extract(file.extra, '$.is_album') = true AND owner = '${params.owner}'`,
    )
    .orderBy({
      mtime: 'DESC',
    })
    .getMany();

  for (const [index, album] of albums.entries()) {
    albums[index] = await getAlbumExtraInfo(album);
  }

  return {
    code: 0,
    data: {
      list: albums,
      total: albums.length,
    },
  };
}

async function getAlbumExtraInfo(
  album: FileEntity & { cover: string; file_count: number },
) {
  const fileCount = await getRepository(FileEntity).count({
    where: {
      parent_id: album.id,
      status: FileStatus.Normal,
    },
  });

  album.file_count = fileCount;

  try {
    if (album.extra?.cover) {
      // 封面为图片
      if (isUUID(album.extra?.cover)) {
        const thumbnail = getThumbnailPath({
          sourceId: album.extra?.cover,
        });
        album.cover = (await FS.exists(thumbnail))
          ? thumbnail
          : (await FS.readDir(join(SOURCE_PATH, album.extra?.cover)))[0].path;
        // 封面为内置图片
      } else {
        album.cover = album.extra?.cover;
      }
      // 为设置封面
    } else {
      const firstFile = await getFile({
        where: {
          parent_id: album.id,
          status: FileStatus.Normal,
        },
        order: {
          ctime: 'DESC',
        },
      });
      const sourceId = firstFile.data?.extra?.source_id;

      if (sourceId) {
        album.cover =
          firstFile.data!.extra!.width! < 400
            ? getSourcePath(sourceId, firstFile.data?.name)
            : getThumbnailPath({
                sourceId,
              });
      } else {
        album.cover = defaultCover;
      }
    }

    return album;
  } catch {}
}

export async function listFile(
  params?: IListFileRequest,
): Promise<IListFileResponse> {
  const order = params?.order;
  delete params?.order;
  const refetchFileListTime = Date.now();

  const where = {
    type: FileType.File,
    ...params,
  };
  const files = await getRepository<FileEntity & IListFileData>(
    FileEntity,
  ).find({
    where,
    order: order ?? {
      ctime: 'DESC',
    },
  });

  const fileTotal = await getRepository(FileEntity).count({
    where,
  });

  for (const [index, file] of files.entries()) {
    const sourceId = file.extra?.source_id;
    if (!sourceId) continue;
    files[index].uri = getSourcePath(sourceId, file.name);
    files[index].thumbnail =
      file.extra!.width! < 400
        ? files[index].uri
        : getThumbnailPath({ sourceId });

    if (getSourceByMime(file.mime!) === SourceType.Video) {
      files[index].poster = file.thumbnail;
    }
  }

  return {
    code: 0,
    data: {
      list: files,
      total: fileTotal,
    },
  };
}

export async function searchFile(params: ISearchFileRequest) {
  const { keywords, mime, type, status, owner } = params;
  delete params.order;
  delete params.keywords;
  let sqlStr = '';

  if (keywords) {
    sqlStr += `(name LIKE "%${keywords ?? ''}%" OR description LIKE "%${
      keywords ?? ''
    }%"`;

    if (stores.global.settingInfo.advanced?.smartSearch?.enabled) {
      sqlStr += ` OR exists (SELECT * FROM json_each(json_extract(file.labels, '$.zh_cn')) WHERE json_each.value LIKE "%${
        keywords ?? ''
      }%")`;
    }

    sqlStr += ')';
  }

  if (mime) {
    sqlStr += ` AND mime LIKE "${mime}/%"`;
  }

  if (type) {
    sqlStr += ` AND type = ${type}`;
  }

  if (status) {
    sqlStr += ` AND status = ${status}`;
  }

  if (owner) {
    sqlStr += ` AND owner = "${owner}"`;
  }

  const files = await getRepository<FileEntity & IListFileData>(
    FileEntity,
  ).query(`SELECT * FROM file WHERE ${sqlStr}`);

  const fileTotal = files.length;

  for (const [index, file] of files.entries()) {
    if (!isNull(file.extra)) {
      files[index].extra = JSON.parse(file.extra);
    }

    if (files[index].extra.is_album) {
      files[index] = {
        ...files[index],
        ...(await getAlbumExtraInfo(file)),
      };
    }

    const sourceId = file.extra?.source_id;
    if (!sourceId) continue;
    files[index].uri = getSourcePath(sourceId, file.name);
    files[index].thumbnail =
      file.extra!.width! < 400
        ? files[index].uri
        : getThumbnailPath({ sourceId });

    if (getSourceByMime(file.mime!) === SourceType.Video) {
      files[index].poster = file.thumbnail;
    }
  }

  return {
    code: 0,
    data: {
      list: files,
      total: fileTotal,
    },
  };
}

export async function getFile(
  params: IGetFileRequest,
): Promise<IGetFileResponse> {
  const file = await getRepository<FileEntity & IListFileData>(
    FileEntity,
  ).findOne({
    where: params.where,
    order: params.order,
  });

  return {
    code: 0,
    data: file,
  };
}

export async function createFolder(
  params: ICreateFileRequest,
): Promise<ICreateFileResponse> {
  const ctime = Date.now();
  const res = await getRepository(FileEntity).insert({
    ctime,
    mtime: ctime,
    type: FileType.Folder,
    ...params,
  });

  return {
    code: 0,
    data: res,
  };
}

export async function createFile(
  params: ICreateFileRequest,
): Promise<InsertResult | null> {
  const fileId = generateID();
  const sourceId = generateID();
  const sourceDir = join(SOURCE_PATH, sourceId);
  const sourcePath = join(sourceDir, params.name);
  const thumbnailDir = join(THUMBNAIL_PATH, sourceId);
  const thumbnailPath = join(thumbnailDir, 'default.jpg');

  try {
    const imgSize = params.width
      ? { width: params.width, height: params.height }
      : await getImageSize(params.uri!);
    const size = params.size ?? Number((await FS.stat(params.uri!)).size);

    let thumbnail: any;
    if (
      getSourceByMime(params.mime!) === SourceType.Image &&
      imgSize.width < 400
    ) {
      thumbnail = undefined;
    } else {
      thumbnail = await generateThumbnail(
        params.uri!,
        getSourceByMime(params.mime!),
      );
    }

    await FS.mkdir(sourceDir);
    await FS.moveFile(params.uri!, sourcePath);

    if (thumbnail) {
      await FS.mkdir(thumbnailDir);
      await FS.moveFile(thumbnail!.path!, thumbnailPath);
    }
    const ctime = params.ctime || Date.now();
    const res = await getRepository(FileEntity).insert({
      id: fileId,
      ctime,
      mtime: ctime,
      name: params.name,
      parent_id: params.parent_id,
      mime: params.mime,
      size,
      type: FileType.File,
      owner: params.owner,
      extra: {
        source_id: sourceId,
        in_album: true,
        duration: params.duration,
        width: params.width || imgSize.width,
        height: params.height || imgSize.width,
      },
    });

    return res;
  } catch (error) {
    getRepository(FileEntity).delete({
      id: fileId,
    });
    FS.unlink(sourcePath);
    FS.unlink(thumbnailPath);
    return null;
  }
}

export async function updateFile(
  params: IUpdateFileRequest,
): Promise<UpdateResult> {
  let pathAndValue = '';
  if (params.data.extra) {
    for (const key in params.data.extra) {
      const value = params.data.extra[key];
      pathAndValue += `, '$.${key}', '${value}'`;
    }
  }

  const res = await getRepository(FileEntity)
    .createQueryBuilder('file')
    .update(FileEntity)
    .set({
      mtime: Date.now(),
      ...params.data,
      extra: () =>
        params.data.extra ? `json_set(file.extra${pathAndValue})` : 'extra',
    })
    .whereInIds(params.ids ? params.ids : [params.id])
    .execute();

  return res;
}

export async function deleteFile({
  ids,
  isMark = true,
}: IDeleteFileRequest): Promise<IDeleteResult> {
  let result;
  if (isMark) {
    result = await getRepository(FileEntity).update(ids, {
      status: FileStatus.Deleted,
      mtime: Date.now(),
    });
  } else {
    const files = await getRepository(FileEntity).findByIds(ids);
    result = await getRepository(FileEntity).delete(ids);

    files.forEach(async file => {
      const album = await getRepository(FileEntity)
        .createQueryBuilder('file')
        .where(
          `json_extract(file.extra, '$.cover') = '${file.extra?.source_id}'`,
        )
        .getOne();

      if (album) {
        updateFile({
          id: album.id,
          data: {
            extra: {
              cover: null,
            },
          },
        });
      }

      const sourceId = file.extra!.source_id!;
      const thumbnailPath = getThumbnailPath({
        sourceId,
        isDir: true,
      });
      const sourcePath = getSourcePath(sourceId);
      FS.unlink(sourcePath);
      FS.unlink(thumbnailPath);
    });
  }

  if (result.affected === ids.length) {
    return {
      code: 0,
      data: result,
    };
  } else {
    return {
      code: 1,
      message: '删除失败',
      data: result,
    };
  }
}

export async function deleteAlbum(
  params: IDeleteAlbumRequest,
): Promise<IDeleteResult> {
  const res = await getRepository(FileEntity).delete(params.ids);
  // "generatedMaps": [],
  // "raw": [],
  // "affected": 1
  const images = await getRepository(FileEntity).find({
    where: {
      parent_id: params.ids[0],
    },
    select: ['id'],
  });

  let updateRes;
  if (images.length) {
    updateRes = await deleteFile({
      ids: images.map(item => item.id!),
      isMark: params.isMark,
    });
  }

  // TODO: 严格成功
  if (res.affected === 1 && images.length ? updateRes?.code === 0 : true) {
  }

  return {
    code: 0,
    data: res,
  };
}
