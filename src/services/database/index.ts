import {
  createConnection,
  Connection,
  InsertResult,
  UpdateResult,
} from 'typeorm/browser';

import { CustomSentry, Sentry } from '@/utils/customSentry';
import FileEntity from './entities/file.entity';
import UserEntity, { EUserType } from './entities/user.entity';
import { stores } from '@/store';
import { initAlbums } from '@/services';

class DataBase {
  connection?: Connection;
  FileEntity = FileEntity;
  UserEntity = UserEntity;

  async init(): PVoid {
    try {
      this.connection = await createConnection({
        type: 'react-native',
        database: 'private-space',
        location: 'default',
        // logging: __DEV__ ? ['error', 'query', 'schema'] : undefined,
        synchronize: true,
        entities: [FileEntity, UserEntity],
      });
      __DEV__ && console.log('数据库连接成功！');
      await this.initUser();
      await initAlbums();
    } catch (error) {
      __DEV__ && console.log('数据库连接失败！', error);
      CustomSentry.captureException(error, {
        level: Sentry.Severity.Fatal,
      });
    }
  }

  async initUser(): Promise<InsertResult | void> {
    const repository = this.connection?.getRepository(UserEntity);

    for (const value of [EUserType.ADMIN, EUserType.GHOST]) {
      let user = (await repository?.findOne({
        where: {
          type: value,
        },
      })) as Partial<UserEntity>;

      if (!user) {
        const res = await repository?.insert({
          type: value,
        });

        user = {
          id: res?.identifiers[0].id,
          type: value,
        };
      }

      setUserToStore(user);
    }

    function setUserToStore(user: UserEntity) {
      if (user.type === EUserType.ADMIN) {
        stores.user.setCurrent(user);
      } else {
        stores.user.setGhostUser(user);
      }
    }
  }

  clear(): void {
    this.connection?.getRepository(UserEntity).clear();
    this.connection?.getRepository(FileEntity).clear();
  }

  clearFiled(filed: string): Promise<UpdateResult> | undefined {
    return this.connection
      ?.getRepository(FileEntity)
      .createQueryBuilder('file')
      .update(FileEntity)
      .set({
        [filed]: null,
      })
      .execute();
  }
}

export default DataBase;
