import FileEntity from '@/services/database/entities/file.entity';

export interface SearchParams
  extends Partial<Pick<FileEntity, 'mime' | 'type' | 'status'>> {
  keyword: string;
}

export type Response<T> = T;
