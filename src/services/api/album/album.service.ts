import { getRepository, Like } from 'typeorm/browser';

import * as Types from './types.d';
import FileEntity, {
  FileStatus,
  FileType,
  FileRepository,
} from '@/services/database/entities/file.entity';
import PhotoService from '../photo/photo.service';
import { generateID } from '@/utils';
import { getAlbumCover } from '../common/utils';
import { stores } from '@/store';
import { isEmpty } from 'lodash';

class AlbumService {
  public async findAll(
    params?: Types.FindAll,
  ): Promise<[Types.FindAllData[], number]> {
    const res = (await getRepository(FileEntity).find({
      where: {
        owner: stores.user.current?.id,
        ...params,
        type: FileType.Folder,
        repository: FileRepository.Album,
      },
      order: {
        mtime: 'DESC',
      },
    })) as Types.FindAllData[];

    for (const [index, item] of res.entries()) {
      const id = item.id as string;
      res[index].item_total = await this.getAlbumItemTotal(id);
      res[index].image_total = await this.getAlbumImageTotal(id);
      res[index].video_total = await this.getAlbumVideoTotal(id);
      res[index].cover = await getAlbumCover(item);
    }

    return [res, res.length];
  }

  public async findOne(
    params?: Types.FetchAlbumParams,
  ): Promise<FileEntity | undefined> {
    const res = await getRepository(FileEntity).findOne({
      where: {
        owner: stores.user.current?.id,
        ...params,
        type: FileType.Folder,
      },
    });

    return res;
  }

  public async create(
    params?: Types.CreateAlbumParams,
  ): Promise<{ id: string }> {
    const id = generateID();
    const ctime = Date.now();

    await getRepository(FileEntity).insert({
      id,
      ctime,
      mtime: ctime,
      type: FileType.Folder,
      ...params,
    });

    return {
      id,
    };
  }

  public async update(params: Types.UpdateAlbumParams): PVoid {
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

    repository.andWhere({
      type: FileType.Folder,
    });

    await repository.execute();
  }

  public async delete(params: { id: string }) {
    await getRepository(FileEntity).delete({
      id: params.id,
    });
    await PhotoService.delete({
      parent_id: params.id,
    });
  }

  public async softDelete(params: { id: string }) {
    await getRepository(FileEntity).delete({
      id: params.id,
    });
    // TODO: 软删除图片/视频
    await PhotoService.softDelete({
      parent_id: params.id,
    });
  }

  public async getAlbumItemTotal(id: string) {
    const total = await getRepository(FileEntity).count({
      where: {
        parent_id: id,
        status: FileStatus.Normal,
        owner: stores.user.current?.id,
      },
    });
    return total;
  }

  public async getAlbumImageTotal(id: string) {
    const total = await getRepository(FileEntity).count({
      where: {
        parent_id: id,
        status: FileStatus.Normal,
        mime: Like('image/%'),
        owner: stores.user.current?.id,
      },
    });
    return total;
  }

  public async getAlbumVideoTotal(id: string) {
    const total = await getRepository(FileEntity).count({
      where: {
        parent_id: id,
        status: FileStatus.Normal,
        mime: Like('video/%'),
        owner: stores.user.current?.id,
      },
    });
    return total;
  }
}

export default new AlbumService();
