import UserEntity, {
  EUserType,
} from '@/services/database/entities/user.entity';

export type FindAll = Partial<
  Pick<UserEntity, 'email' | 'id' | 'type' | 'password'>
>;

export type FetchUserParams = FindAll;

export type Response<T> = T;

export interface UpdateUserParams {
  id: string;
  data?: Partial<Pick<UserEntity, 'password' | 'email'>>;
}
