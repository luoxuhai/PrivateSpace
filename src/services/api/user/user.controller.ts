import UserService from './user.service';
import * as Types from './types.d';
import UserEntity from '@/services/database/entities/user.entity';
import { deleteUndefined } from '../common/utils';

class UserController {
  public async list(
    params: Types.FindAll,
  ): Promise<API.ResponseMulti<UserEntity>> {
    deleteUndefined(params);

    const res = await UserService.findAll(params);

    return {
      items: res,
      total: res.length,
    };
  }

  public async get(
    params: Types.FetchUserParams,
  ): Promise<UserEntity | undefined> {
    deleteUndefined(params);

    const res = await UserService.findOne(params);

    return res;
  }

  public async update(
    params: Types.UpdateUserParams,
  ): Promise<Types.Response<undefined>> {
    if (!params.id || !params.data) return;

    await UserService.update(params);
  }
}

export default new UserController();
