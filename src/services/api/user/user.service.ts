import { getRepository, UpdateResult } from 'typeorm/browser';

import { services } from '@/services';
import * as Types from './types.d';
import UserEntity from '@/services/database/entities/user.entity';

class UserService {
  public async findAll(params?: Types.FindAll): Promise<UserEntity[]> {
    const res = await getRepository(services.db.UserEntity).find({
      type: params?.type,
    });

    return res;
  }

  public async findOne(
    params?: Types.FetchUserParams,
  ): Promise<UserEntity | undefined> {
    const res = await getRepository(services.db.UserEntity).findOne(params);

    return res;
  }

  public async update(
    params?: Types.UpdateUserParams,
  ): Promise<UpdateResult | undefined> {
    const res = await getRepository(UserEntity).update(
      {
        id: params?.id,
      },
      {
        ...params?.data,
      },
    );

    return res;
  }
}

export default new UserService();
