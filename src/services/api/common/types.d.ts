import type FileEntity from '@/services/database/entities/file.entity';
import type UserEntity from '@/services/database/entities/user.entity';

declare global {
  namespace API {
    type OrderBy<T> = {
      [key in keyof T]: 'DESC' | 'ASC';
    };

    interface Pagination {
      before?: string;
      after?: string;
    }

    type AlbumType = Omit<FileEntity, 'mime'>;

    type PhotoType = FileEntity;

    type PhotoWithSource = FileEntity & {
      uri?: string;
      thumbnail?: string;
      poster?: string;
    };

    type UserType = UserEntity;

    type DeleteResult = void;

    type UpdateResult = void;

    type CreateResult = {
      id: FileEntity['id'];
    } | void;

    interface ResponseMulti<T> {
      items: T[];
      total: number;
      pagination?: Pagination;
    }
  }
}
