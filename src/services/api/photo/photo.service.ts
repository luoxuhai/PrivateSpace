import { getRepository } from 'typeorm/browser';
import FS from 'react-native-fs';
import { isEmpty } from 'lodash';
import { getMimeType } from '@qeepsake/react-native-file-utils';

import { SOURCE_PATH, THUMBNAIL_PATH } from '@/config';
import * as Types from './types.d';
import FileEntity, {
  FileRepository,
  FileStatus,
  FileType,
  SourceType,
} from '@/services/database/entities/file.entity';
import {
  generateID,
  join,
  getSourceByMime,
  generateThumbnail,
  getThumbnailPath,
  getSourcePath,
  getImageSize,
  getPosterPath,
  filePathWithScheme,
} from '@/utils';
import { setPhotoSource } from '../common/utils';
import { stores } from '@/store';

class PhotoService {
  public async findAll(params?: Types.ListPhotos) {
    const order = params?.order_by;
    delete params?.order_by;
    const items = (await getRepository(FileEntity).find({
      where: {
        owner: stores.user.current?.id,
        status: FileStatus.Normal,
        ...params,
        type: FileType.File,
        repository: FileRepository.Album,
      },
      order,
    })) as API.PhotoWithSource[];

    await setPhotoSource(items);

    return items;
  }

  public async findByIds(ids: string[]) {
    return await getRepository(FileEntity).findByIds(ids);
  }

  public async findOne(params?: Types.FetchPhotoParams) {
    const order = params?.order_by;
    delete params?.order_by;

    const item = (await getRepository(FileEntity).findOne({
      where: {
        owner: stores.user.current?.id,
        ...params,
        type: FileType.File,
      },
      order,
    })) as API.PhotoWithSource;

    if (item) {
      await setPhotoSource(item);
    }

    return item;
  }

  public async create(params: Types.CreatePhotoParams) {
    const fileId = generateID();
    const sourceId = generateID();

    const sourceDir = join(SOURCE_PATH, sourceId);
    const sourcePath = join(sourceDir, params.name);
    const thumbnailDir = join(THUMBNAIL_PATH, sourceId);
    const thumbnailPath = join(thumbnailDir, 'default.jpg');

    let metadata = params.metadata ?? {};
    const { width, height, duration } = metadata;
    const imgSize = width ? { width, height } : await getImageSize(params.uri);
    const size = params.size ?? Number((await FS.stat(params.uri)).size);
    const mime =
      params.mime || (await getMimeType(filePathWithScheme(params.uri)));

    metadata = {
      duration: duration,
      width: width || imgSize.width,
      height: height || imgSize.width,
    };

    let thumbnail: { path: string } | undefined | null;
    if (getSourceByMime(mime) === SourceType.Image && imgSize.width < 400) {
      thumbnail = undefined;
    } else {
      thumbnail = await generateThumbnail(params.uri, getSourceByMime(mime));
    }

    await FS.mkdir(sourceDir);
    await FS.mkdir(thumbnailDir);
    // 移动资源
    await FS.moveFile(params.uri, sourcePath);

    if (thumbnail) {
      if (getSourceByMime(mime) === SourceType.Video) {
        const posterPath = getPosterPath(sourceId) as string;
        await FS.moveFile(thumbnail.path, posterPath);
      } else {
        await FS.moveFile(thumbnail.path, thumbnailPath);
      }
    }

    const ctime = params.ctime || Date.now();

    await getRepository(FileEntity).insert({
      id: fileId,
      ctime,
      mtime: ctime,
      name: params.name,
      parent_id: params.parent_id,
      mime,
      size,
      type: FileType.File,
      owner: params.owner ?? stores.user.current?.id,
      extra: {
        source_id: sourceId,
        in_album: true,
        ...metadata,
      },
      metadata,
      repository: params.repository ?? FileRepository.Album,
    });

    return {
      id: fileId,
    };
  }

  public async update(params: Types.UpdatePhotoParams): PVoid {
    const ids = params.where.id ? [params.where.id] : params.where.ids ?? [];

    const repository = getRepository(FileEntity)
      .createQueryBuilder('file')
      .update(FileEntity)
      .set({
        mtime: Date.now(),
        ...params?.data,
      });

    if (!isEmpty(ids)) {
      repository.whereInIds(
        params.where.id ? [params.where.id] : params.where.ids ?? [],
      );
    } else {
      repository.where(params.where);
    }

    await repository.execute();
  }

  public async delete(params: Types.DeletePhotoParams) {
    const ids = params.id ? [params.id] : params.ids ?? [];

    const repository = getRepository(FileEntity)
      .createQueryBuilder('file')
      .delete();

    let photos: FileEntity[] = [];

    if (!isEmpty(ids)) {
      repository.whereInIds(ids);
      photos = await this.findByIds(ids);
    } else if (params.parent_id) {
      repository.where(`parent_id = '${params.parent_id}'`);
      photos = await this.findAll({
        id: params.parent_id,
      });
    }

    // 删除数据库
    await repository.execute();

    // 删除文件
    photos.forEach(item => {
      const sourceId = item.extra!.source_id!;
      const thumbnailPath = getThumbnailPath({
        sourceId,
        isDir: true,
      });
      const sourcePath = getSourcePath(sourceId);
      FS.unlink(sourcePath);
      FS.unlink(thumbnailPath);
    });
  }

  public async softDelete(params: Types.DeletePhotoParams) {
    const ids = params.id ? [params.id] : params.ids ?? [];

    const repository = getRepository(FileEntity)
      .createQueryBuilder('file')
      .update(FileEntity)
      .set({
        mtime: Date.now(),
        status: FileStatus.Deleted,
      });

    if (!isEmpty(ids)) {
      repository.whereInIds(ids);
    }

    if (params.parent_id) {
      repository.andWhere(`parent_id = '${params.parent_id}'`);
    }

    await repository.execute();
  }

  public async restore(params: Types.RestorePhotoParams) {
    const ids = params.where.id ? [params.where.id] : params.where.ids ?? [];

    if (isEmpty(ids)) {
      return;
    }

    const ctime = Date.now();
    await getRepository(FileEntity)
      .createQueryBuilder('file')
      .update(FileEntity)
      .set({
        parent_id: params.to.parent_id,
        status: FileStatus.Normal,
        ctime,
        mtime: ctime,
      })
      .whereInIds(ids)
      .execute();
  }
}

export default new PhotoService();
