import FileEntity from '@/services/database/entities/file.entity';

export type FindAll = Partial<Pick<FileEntity, 'name' | 'status' | 'owner'>>;

export interface FindAllData extends FileEntity {
  item_total: number;
  cover?: string | null;
  image_total: number;
  video_total: number;
}

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
