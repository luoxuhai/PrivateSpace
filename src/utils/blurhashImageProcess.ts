import * as ClassifyImage from 'react-native-classify-image';
import { Blurhash } from 'react-native-blurhash';
import { Like } from 'typeorm/browser';
import * as FS from 'react-native-fs';

import { services } from '@/services';
import { CustomSentry } from '@/utils/customSentry';
import Process from './Process';

interface ImageResult {
  id: string;
  uri: string;
  labels?: FileLabel;
  mime: string;
  poster: string;
}

class BlurhashImageProcess extends Process {
  public async start(): PVoid {
    this.status = 'STARTED';
    this.sendEvent('start');
    try {
      const files: ImageResult[] = await this.getAllImageAndVideo();
      const untreatedImages = files.filter(
        item => item.uri && !item.extra.blurhash,
      );
      this.progress = files.length - untreatedImages.length;

      untreatedImages.forEach(async (file, index) => {
        if (this.status !== 'STARTED') {
          return;
        }

        try {
          const result = await Blurhash.encode(
            file.mime.startsWith('image/') ? file.uri : file.poster,
            32,
            32,
          );
          await this.updateFileBlurhash(file.id, result);
          this.sendEvent('progress', {
            progress: ++this.progress,
            total: files.length,
          });
          untreatedImages.splice(index, 1);
        } catch (error) {
          this.sendEvent('error', error);
        }
      });
    } catch (error) {
      this.sendEvent('error', error);
    }
    // 所有图片数据
  }

  private async updateFileBlurhash(id: string, blurhash?: string) {
    return await services.api.local.updateFile({
      id,
      data: {
        extra: {
          blurhash,
        },
      },
    });
  }

  private async getAllImageAndVideo() {
    const files = await this.getAllFile();
    return files.filter(file => /(image\/|video\/).+/.test(file.mime!));
  }
}

const blurhashImageProcess = new BlurhashImageProcess();

blurhashImageProcess.on('error', error => {
  CustomSentry.captureException(error);
});

export default blurhashImageProcess;
