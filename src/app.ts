import { DevSettings } from 'react-native';

import { hydrateStores, clearPersistedStores } from '@/store';
import { initServices, services, initDataDirectory } from '@/services';
import { clearRecycleBin } from '@/screens/RecycleBin/clearRecycleBin';
import { DynamicUpdate } from '@/utils/dynamicUpdate';
import { initFundebug } from '@/utils/initFundebug';

initFundebug();

export const start = async (): PVoid => {
  const { nav } = services;

  // 创建数据存放目录
  initDataDirectory();

  await hydrateStores();

  // init services
  await initServices();

  // start app
  await nav.start();

  clearRecycleBin();

  DynamicUpdate.sync();
  DynamicUpdate.timingSync();

  if (__DEV__) {
    DevSettings.addMenuItem('清除数据库', () => {
      services.db.clear();
      DevSettings.reload();
    });
    DevSettings.addMenuItem('清除 mobx persist', () => {
      clearPersistedStores();
      DevSettings.reload();
    });
  }

  console.log('start app');
};
