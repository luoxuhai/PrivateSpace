import { getRepository } from 'typeorm/browser';
import FS from 'react-native-fs';
import { isEmpty } from 'lodash';
import { getMimeType } from '@qeepsake/react-native-file-utils';

import PhotoService from '../photo/photo.service';
import { SOURCE_PATH } from '@/config';
import * as Types from './types';
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
  getThumbnailPath,
  getSourcePath,
} from '@/utils';
import { setPhotoSource } from '../common/utils';
import { stores } from '@/store';

class FileService {
  public async findAll(params?: Types.ListFiles) {
    const order = params?.order_by;
    delete params?.order_by;
    const items = (await getRepository(FileEntity).find({
      where: {
        owner: stores.user.current?.id,
        status: FileStatus.Normal,
        ...params,
        repository: FileRepository.File,
      },
      order: {
        type: 'DESC',
        ...order,
      },
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
    const mime = params.mime || (await getMimeType(`file://${params.uri}`));

    if ([SourceType.Image, SourceType.Video].includes(getSourceByMime(mime))) {
      return await PhotoService.create({
        ...params,
        mime,
        repository: FileRepository.File,
      });
    }

    const fileId = generateID();
    const sourceId = generateID();
    const sourceDir = join(SOURCE_PATH, sourceId);
    const sourcePath = join(sourceDir, params.name);
    const metadata = params.metadata ?? {};
    const size = params.size ?? Number((await FS.stat(params.uri)).size);

    await FS.mkdir(sourceDir);
    // 移动资源
    await FS.moveFile(params.uri, sourcePath);

    const ctime = params.ctime || Date.now();
    await getRepository(FileEntity).insert({
      id: fileId,
      ctime,
      mtime: ctime,
      name: params.name,
      parent_id: params.parent_id,
      mime,
      size,
      owner: params.owner ?? stores.user.current?.id,
      extra: {
        source_id: sourceId,
      },
      metadata,
      type: FileType.File,
      repository: FileRepository.File,
    });

    return {
      id: fileId,
    };
  }

  public async createFolder(params: Types.CreateFolderParams) {
    const id = generateID();
    const ctime = Date.now();
    await getRepository(FileEntity).insert({
      id,
      ctime,
      mtime: ctime,
      owner: stores.user.current?.id,
      ...params,
      type: FileType.Folder,
      repository: FileRepository.File,
    });

    return id;
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

export default new FileService();
