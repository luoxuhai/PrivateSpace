import { isUndefined } from 'lodash';

import AlbumService from './album.service';
import * as Types from './types.d';
import FileEntity from '@/services/database/entities/file.entity';

class AlbumController {
  public async list(
    params: Types.FindAll,
  ): Promise<API.ResponseMulti<Types.FindAllData>> {
    deleteUndefined(params);

    const [items, total] = await AlbumService.findAll(params);

    return {
      items,
      total,
    };
  }

  public async get(
    params: Types.FetchAlbumParams,
  ): Promise<FileEntity | undefined> {
    const res = await AlbumService.findOne(params);

    return res;
  }

  public async create(params: Types.CreateAlbumParams) {
    const res = await AlbumService.create(params);
    return res;
  }

  public async update(
    params: Types.UpdateAlbumParams,
  ): Promise<Types.Response<undefined>> {
    if (!params.data) return;

    if (params.data.extra) {
      let pathAndValue = '';
      for (const key in params.data.extra) {
        const value = params.data.extra[key];
        pathAndValue += `, '$.${key}', '${value}'`;
      }

      params.data.extra = () => `json_set(file.extra${pathAndValue})`;
    }

    await AlbumService.update(params);
  }

  public async delete(params: Types.FetchAlbumParams): PVoid {
    if (!params.id) return;

    await AlbumService.delete({
      id: params.id,
    });
  }

  public async softDelete(params: Types.FetchAlbumParams): PVoid {
    if (!params.id) return;

    await AlbumService.softDelete({
      id: params.id,
    });
  }
}

export default new AlbumController();

export function deleteUndefined(obj: { [key: string]: any }): void {
  for (const key in obj) {
    if (isUndefined(obj[key])) {
      delete obj[key];
    }
  }
}
