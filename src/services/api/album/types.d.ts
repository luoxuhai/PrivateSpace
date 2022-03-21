import FileEntity from '@/services/database/entities/file.entity';

export type FindAll = Partial<Pick<FileEntity, 'name' | 'status' | 'owner'>>;

export type FindAllData = API.AlbumWithSource;

export type FetchAlbumParams = Partial<
  Pick<FileEntity, 'id' | 'name' | 'owner'>
>;

export type CreateAlbumParams = Partial<FileEntity>;

export type Response<T> = T;

export interface UpdateAlbumParams {
  where: {
    ids?: string[];
  } & Partial<Omit<FileEntity, 'extra' | 'metadata'>>;
  data?: Partial<Pick<FileEntity, 'name' | 'extra' | 'ctime' | 'mtime'>>;
}
