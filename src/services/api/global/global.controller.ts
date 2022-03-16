import GlobalService from './global.service';
import * as Types from './types';
import { deleteUndefined } from '../common/utils';
import { stores } from '@/store';
import FileEntity from '@/services/database/entities/file.entity';

class GlobalController {
  public async search(
    params: Types.SearchParams,
  ): Promise<API.ResponseMulti<FileEntity>> {
    deleteUndefined(params);

    if (!params?.keyword) {
      return {
        items: [],
        total: 0,
      };
    }

    const [items, total] = await GlobalService.search({
      ...params,
      smart_search_enabled:
        stores.global.settingInfo.advanced?.smartSearch?.enabled,
    });

    return {
      items,
      total,
    };
  }
}

export default new GlobalController();
