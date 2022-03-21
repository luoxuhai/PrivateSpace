import FileEntity from '@/services/database/entities/file.entity';
import { FindOperator } from 'typeorm/browser';
export interface ListPhotos
  extends Partial<
    Pick<FileEntity, 'name' | 'id' | 'parent_id' | 'owner' | 'type'>
  > {
  status?: FileEntity['status'] | FindOperator<FileEntity['status']>;
  mime?: FileEntity['mime'] | FindOperator<FileEntity['mime']>;
  order_by?: API.OrderBy<Partial<FileEntity>>;
  select?: (keyof FileEntity & ('thumbnail' | 'uri'))[];
}

export type FetchAlbumParams = Partial<
  Pick<FileEntity, 'name' | 'status' | 'id'>
>;

export interface FetchPhotoParams extends Partial<Omit<FileEntity, 'extra'>> {
  order_by?: API.OrderBy<Partial<FileEntity>>;
}

export type Response<T> = T;

type UpdatePhotoParamsWhere = {
  ids?: string[];
} & Partial<Pick<FileEntity, 'type' | 'parent_id' | 'id' | 'status'>>;

export interface UpdatePhotoParams {
  where: UpdatePhotoParamsWhere;
  data?: Partial<Omit<FileEntity, 'id' | 'mime' | 'type'>>;
}

export interface CreatePhotoParams extends Partial<Omit<FileEntity, 'id'>> {
  /** 文件地址 */
  uri: string;
}

export interface DeletePhotoParams {
  id?: string;
  ids?: string[];
  parent_id?: string;
}

export interface RestorePhotoParams {
  where: {
    id?: string;
    ids?: string[];
    parent_id?: string;
  };
  to: {
    parent_id?: string;
  };
}
