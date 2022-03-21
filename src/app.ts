import { DevSettings, LogBox } from 'react-native';

import '@/locales';
import { hydrateStores, clearPersistedStores } from '@/store';
import { initServices, services, initDataDirectory } from '@/services';
import { clearRecycleBin } from '@/screens/RecycleBin/clearRecycleBin';
import { CustomSentry } from '@/utils/customSentry';
import classifyImageProcess from '@/utils/process/classifyImageProcess';
import thumbnailProcess from '@/utils/process/thumbnailProcess';
import blurhashImageProcess from '@/utils/process/blurhashImageProcess';

export const start = async (): PVoid => {
  const { nav } = services;

  // 创建数据存放目录
  initDataDirectory();

  await hydrateStores();

  // init services
  await initServices();

  // start app
  await nav.start();

  setTimeout(() => {
    clearRecycleBin();
    classifyImageProcess.start();
    blurhashImageProcess.start();
    thumbnailProcess.start();
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
