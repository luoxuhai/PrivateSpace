import { Blurhash } from 'react-native-blurhash';
import { unlink } from 'react-native-fs';

import { services } from '@/services';
import { CustomSentry } from '@/utils/customSentry';
import Process from './Process';
import { resizeImage } from '@/utils';
import { getSourceByMime } from '../common';
import { SourceType } from '@/services/database/entities/file.entity';

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
          let imageUri =
            file.thumbnail ||
            file.poster ||
            getSourceByMime(file.mime) === SourceType.Image
              ? file.uri
              : undefined;

          const compressed = await resizeImage({
            uri: imageUri,
            width: 64,
          });
          imageUri = compressed?.path;
          if (!imageUri) return;

          let componentsX = 8;
          let componentsY = 8;

          const width = file.extra?.width ?? file.metadata?.width ?? 0;
          const height = file.extra?.height ?? file.metadata?.height ?? 0;

          if (width > height) {
            componentsY = componentsX / (width / height);
          } else if (width < height) {
            componentsX = componentsY * (width / height);
          }

          const blurhashStr = await Blurhash.encode(
            `file://${encodeURI(imageUri)}`,
            componentsX,
            componentsY,
          );

          unlink(imageUri);

          await this.updateFileBlurhash(file.id as string, blurhashStr);
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
  if (errorCount <= 1) {
    CustomSentry.captureException(error);
  }
});

export default blurhashImageProcess;
