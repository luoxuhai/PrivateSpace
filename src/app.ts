import { DevSettings, LogBox } from 'react-native';

import '@/locales';
import { hydrateStores, clearPersistedStores } from '@/store';
import { initServices, services, initDataDirectory } from '@/services';
import { clearRecycleBin } from '@/screens/RecycleBin/clearRecycleBin';
import { CustomSentry } from '@/utils/customSentry';
import classifyImageProcess from '@/utils/process/classifyImageProcess';
import thumbnailProcess from '@/utils/process/thumbnailProcess';

export const start = async (): PVoid => {
  // 创建数据存放目录
  initDataDirectory();

  await hydrateStores();

  // init services
  await initServices();

  // start app
  await services.nav.start();

  setTimeout(() => {
    clearRecycleBin();
    classifyImageProcess.start();
    thumbnailProcess.start();
    // blurhashImageProcess.start();
  }, 1000 * 5);

  if (__DEV__) {
    LogBox.ignoreAllLogs();
    DevSettings.addMenuItem('清除数据库', () => {
      services.db.clear();
      DevSettings.reload();
    });
    DevSettings.addMenuItem('清除表列', () => {
      // services.db.clearFiled();
    });
    DevSettings.addMenuItem('清除 mobx persist', () => {
      clearPersistedStores();
      DevSettings.reload();
    });
  } else {
    CustomSentry.init();
  }
};
