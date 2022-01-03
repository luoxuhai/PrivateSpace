import FileEntity from '@/services/db/file';
import UserEntity, { EUserType } from '@/services/db/user';
import { InsertResult, UpdateResult, DeleteResult } from 'typeorm/browser';

export interface IListAlbumRequest {
  owner: string;
  parent_id?: string;
  offset?: number;
  limit?: number;
}

export interface IListFileRequest extends Partial<Omit<FileEntity, 'extra'>> {
  offset?: number;
  limit?: number;
  order?: { [key: string]: 'ASC' | 'DESC' };
}

export interface ISearchFileRequest extends Partial<Omit<FileEntity, 'extra'>> {
  offset?: number;
  limit?: number;
  order?: { [key: string]: 'ASC' | 'DESC' };
  keywords?: string;
}

export interface IGetFileRequest {
  where?: Partial<FileEntity>;
  order?: { [key: string]: 'ASC' | 'DESC' };
}

export interface IGetFileResponse extends IBaseResponse {
  data?: FileEntity;
}

export type ICreateFileRequest = Partial<FileEntity> & {
  uri?: string;
  width?: number;
  height?: number;
  duration?: number;
};

export interface ICreateFileResponse extends IBaseResponse {
  data?: InsertResult;
}

export interface IUpdateFileRequest {
  id?: string;
  ids?: string[];
  data: Partial<Omit<FileEntity, 'id'>>;
}

export interface IDeleteFileRequest {
  ids: string[];
  isMark?: boolean;
}

export interface IDeleteAlbumRequest {
  ids: string[];
  isMark?: boolean;
}

export interface IListAlbumData extends FileEntity {
  file_count?: number;
  cover?: string;
}

export interface IListAlbumResponse extends IBaseResponse {
  data: {
    list: IListAlbumData[];
    total: number;
  };
}

interface IBaseResponse {
  code: number;
  message?: string;
}

export interface IUpdateUserRequest {
  id: string;
  data: Partial<Omit<UserEntity, 'id'>>;
}

export interface IUpdateUserResponse extends IBaseResponse {
  data: UpdateResult;
}

export interface IGetUserRequest {
  id?: string;
  password?: string;
  type?: EUserType;
}

export interface IGetUserResponse extends IBaseResponse {
  data?: UserEntity;
}

export interface IListFileData extends FileEntity {
  id: string;
  uri: string;
  name: string;
  thumbnail: string;
}

export interface IListFileResponse extends IBaseResponse {
  data: {
    list: IListFileData[];
    total: number;
  };
}

export interface IDeleteResult extends IBaseResponse {
  data: DeleteResult;
}
