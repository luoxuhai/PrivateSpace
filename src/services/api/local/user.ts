import {
  getRepository,
  InsertResult,
  UpdateResult,
  DeleteResult,
} from 'typeorm/browser';
import { isUndefined } from 'lodash';

import UserEntity, { EUserType } from '@/services/db/user';
import {
  IUpdateUserRequest,
  IUpdateUserResponse,
  IGetUserRequest,
  IGetUserResponse,
} from './type';

export async function updateUser(
  params: IUpdateUserRequest,
): Promise<IUpdateUserResponse> {
  const res = await getRepository(UserEntity).update(
    {
      id: params.id,
    },
    params.data,
  );

  return {
    code: 0,
    data: res,
  };
}

export async function getUser(
  params: IGetUserRequest,
): Promise<IGetUserResponse> {
  if (isUndefined(params.password)) delete params.password;
  if (isUndefined(params.type)) delete params.type;

  const res = await getRepository(UserEntity).findOne(params);

  return {
    code: 0,
    data: res,
  };
}
