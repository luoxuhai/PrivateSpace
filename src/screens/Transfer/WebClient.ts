import { unzip } from 'react-native-zip-archive';
import { downloadFile, exists, mkdir } from 'react-native-fs';

import { CustomSentry } from '@/utils/customSentry';
import { TEMP_PATH, STATIC_PATH } from '@/config';
import { join, generateID } from '@/utils';
import { initDataDirectory } from '@/services';

const HOME_DIR = 'wifi-transfer-web';
const WEB_CLIENT_URL = `https://private-space-storage.oss-cn-beijing.aliyuncs.com/web/${HOME_DIR}.zip`;
const TEMP_SAVE_PATH = join(TEMP_PATH, generateID());
const SAVE_PATH = join(STATIC_PATH, HOME_DIR);
const FILE_NAME = `${HOME_DIR}.zip`;

export default class WebClient {
  static path: string = SAVE_PATH;

  static async update(force?: boolean): PVoid {
    try {
      if (!force && (await exists(join(this.path, 'index.html')))) {
        return;
      }

      await mkdir(TEMP_SAVE_PATH);
      initDataDirectory();

      await downloadFile({
        fromUrl: WEB_CLIENT_URL,
        toFile: join(TEMP_SAVE_PATH, FILE_NAME),
        cacheable: true,
      }).promise;

      await unzip(join(TEMP_SAVE_PATH, FILE_NAME), STATIC_PATH, 'UTF-8');
    } catch (error) {
      CustomSentry.captureException(error);
    }
  }

  static async getPath(): Promise<string | null> {
    return (await exists(this.path)) ? this.path : null;
  }
}
