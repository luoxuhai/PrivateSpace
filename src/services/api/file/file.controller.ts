import PhotoService from './file.service';
import * as Types from './types';
import FileEntity from '@/services/database/entities/file.entity';
import { CustomSentry } from '@/utils/customSentry';
import { stores } from '@/store';
import { deleteUndefined } from '../common/utils';

class FileController {
  public async list(params: Types.ListFiles) {
    deleteUndefined(params);

    if (!params.order_by) {
      params.order_by = {
        ctime: 'DESC',
      };
    }

    const res = await PhotoService.findAll({
      owner: stores.user.current?.id,
      ...params,
    });

    return {
      items: res,
      total: res.length,
    };
  }

  public async get(params?: Types.FetchPhotoParams) {
    deleteUndefined(params);

    if (!params?.order_by) {
      params = {
        ...params,
        order_by: {
          ctime: 'DESC',
        },
      };
    }

    const res = await PhotoService.findOne(params);

    return res;
  }

  public async fetchUserById(
    params: Types.FetchAlbumParams,
  ): Promise<FileEntity | undefined> {
    if (!params.id) return;

    const res = await PhotoService.findOne({
      id: params.id,
    });

    return res;
  }

  public async create(params: Types.CreatePhotoParams) {
    try {
      return await PhotoService.create(params);
    } catch (error) {
      CustomSentry.captureException(error, {
        extra: {
          title: '创建文件失败',
        },
      });
    }
  }

  public async createFolder(params: Types.CreateFolderParams) {
    if (!params.name) return;

    const id = await PhotoService.createFolder(params);

    return {
      id,
    };
  }

  public async update(
    params: Types.UpdatePhotoParams,
  ): Promise<Types.Response<undefined>> {
    if (!params.where || !params.data) return;

    if (params.data.extra) {
      let pathAndValue = '';
      for (const key in params.data.extra) {
        const value = params.data.extra[key];
        pathAndValue += `, '$.${key}', '${value}'`;
      }

      params.data.extra = () => `json_set(file.extra${pathAndValue})`;
    }

    await PhotoService.update(params);
  }

  public async delete(params: Types.DeletePhotoParams): PVoid {
    if (!params.id && !params.ids?.length) return;

    await PhotoService.delete(params);
  }

  public async softDelete(params: Types.DeletePhotoParams): PVoid {
    if (!params.id && !params.ids?.length) return;

    await PhotoService.softDelete(params);
  }

  public async restore(params: Types.RestorePhotoParams) {
    if (!params.where.id && !params.where.ids?.length) return;
    await PhotoService.restore({
      ...params,
    });
  }
}

export default new FileController();
