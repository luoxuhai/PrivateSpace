import {} from 'react-native';
import * as CloudStore from 'react-native-cloud-store';

import Process from '@/utils/process/Process';
import {
  VIDEO_POSTER_NAME,
  ICLOUD_SOURCE_NAME,
  ICLOUD_SOURCE_PATH,
} from '@/config';
import { join } from '@/utils';

class ICloudProcess extends Process {
  constructor() {
    super();
    this.syncKV();
  }

  public async start(): PVoid {
    this.status = 'STARTED';
    this.sendEvent('start');

    try {
      const userId = await CloudStore.kvGetItem('user_id');

      const files = await this.getAllPhoto();
      const untreated = files;
      this.progress = files.length - untreated.length;

      untreated.forEach(async item => {
        const iCloudPath = join(
          ICLOUD_SOURCE_PATH,
          item.id,
          ICLOUD_SOURCE_NAME,
        );
        const exist = await CloudStore.exist(iCloudPath);

        if (!exist) {
          await CloudStore.upload(item.uri, iCloudPath);

          this.sendEvent('progress', {
            progress: ++this.progress,
            total: untreated.length,
          });
        }
      });
    } catch (error) {}
  }

  public syncKV() {
    return CloudStore.kvSync();
  }
}

export default new ICloudProcess();
