import { unzip } from 'react-native-zip-archive';
import { downloadFile, unlink, exists, mkdir } from 'react-native-fs';

import { CustomSentry } from '@/utils/customSentry';
import { TEMP_PATH, STATIC_PATH } from '@/config';
import { join, generateID } from '@/utils';

const WEB_CLIENT_URL =
  'https://private-space-storage.oss-cn-beijing.aliyuncs.com/web/transfer-client.zip';
const TEMP_SAVE_PATH = join(TEMP_PATH, generateID());
const SAVE_PATH = join(STATIC_PATH, 'transfer-client');
const FILE_NAME = 'transfer-client.zip';

export default class WebClient {
  static path: string = SAVE_PATH;

  static async update(force?: boolean): PVoid {
    try {
      if (!force && (await exists(join(SAVE_PATH, 'index.html')))) {
        return;
      }

      await mkdir(TEMP_SAVE_PATH);
      if (!(await exists(SAVE_PATH))) {
        await mkdir(SAVE_PATH, {
          NSURLIsExcludedFromBackupKey: true,
        });
      }

      await downloadFile({
        fromUrl: WEB_CLIENT_URL,
        toFile: join(TEMP_SAVE_PATH, FILE_NAME),
        cacheable: true,
      }).promise;

      const path = await unzip(
        join(TEMP_SAVE_PATH, FILE_NAME),
        SAVE_PATH,
        'UTF-8',
      );

      this.path = path;
      unlink(TEMP_SAVE_PATH);
    } catch (error) {
      CustomSentry.captureException(error);
    }
  }

  static async getPath(): Promise<string | null> {
    return (await exists(this.path)) ? this.path : null;
  }
}
