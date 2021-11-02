import { createConnection, Connection, InsertResult } from 'typeorm/browser';
import fundebug from 'fundebug-reactnative';

import FileEntity from './file';
import UserEntity, { EUserType } from './user';
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
        logging: ['error', 'query', 'schema'],
        synchronize: true,
        entities: [FileEntity, UserEntity],
      });
      console.log('数据库连接成功！');
      await this.initUser();
      await initAlbums();
    } catch (error) {
      fundebug.notify('数据库连接失败！', error?.message ?? '');
    }
  }

  async initUser(): Promise<InsertResult | void> {
    const repository = this.connection?.getRepository(UserEntity);

    for (const value of [EUserType.ADMIN, EUserType.GHOST]) {
      let user = await repository?.findOne({
        where: {
          type: value,
        },
      });

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
        stores.user.setUserInfo(user);
      } else {
        stores.user.setGhostUser(user);
      }
    }
  }

  clear(): void {
    this.connection?.getRepository(UserEntity).clear();
    this.connection?.getRepository(FileEntity).clear();
  }
}

export default DataBase;
