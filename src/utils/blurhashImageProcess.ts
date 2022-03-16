import { Blurhash } from 'react-native-blurhash';

import { services } from '@/services';
import { CustomSentry } from '@/utils/customSentry';
import Process from './Process';

class BlurhashImageProcess extends Process {
  public async start(): PVoid {
    this.status = 'STARTED';
    this.sendEvent('start');
    try {
      const files = await this.getAllImageAndVideo();
      const untreatedImages = files.filter(item => !item.extra?.blurhash);
      this.progress = files.length - untreatedImages.length;

      untreatedImages.forEach(async (file, index) => {
        if (this.status !== 'STARTED') {
          return;
        }

        try {
          const imageUri = file.mime?.startsWith('image/')
            ? file.uri
            : file.poster || file.thumbnail;
          if (!imageUri) return;

          let componentsX = 32;
          let componentsY = 32;

          const width = file.extra?.width ?? file.metadata?.width ?? 0;
          const height = file.extra?.height ?? file.metadata?.height ?? 0;

          if (width > height) {
            componentsY = Math.trunc(componentsX / (width / height));
          } else if (width < height) {
            componentsX = Math.trunc(componentsY * (width / height));
          }
          const blurhashStr = await Blurhash.encode(
            `file://${encodeURI(imageUri)}`,
            componentsX,
            componentsY,
          );

          await this.updateFileBlurhash(file.id as string, blurhashStr);
          this.sendEvent('progress', {
            progress: ++this.progress,
            total: files.length,
          });
          untreatedImages.splice(index, 1);
        } catch (error) {
          console.log('--------------', error);
          this.sendEvent('error', error);
        }
      });
    } catch (error) {
      this.sendEvent('error', error);
    }
    // 所有图片数据
  }

  private async updateFileBlurhash(id: string, blurhash?: string) {
    console.log(id, blurhash);
    return await services.api.photo.update({
      where: {
        id,
      },
      data: {
        extra: {
          blurhash,
        },
      },
    });
  }

  private async getAllImageAndVideo() {
    const files = await this.getAllPhoto();
    return files.filter(
      file => file.mime && /(image\/|video\/).+/.test(file.mime),
    );
  }
}

const blurhashImageProcess = new BlurhashImageProcess();

let errorCount = 0;

blurhashImageProcess.on('error', error => {
  errorCount++;
  console.log(error);
  if (errorCount <= 1) {
    CustomSentry.captureException(error);
  }
});

export default blurhashImageProcess;
