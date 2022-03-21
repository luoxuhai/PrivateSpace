import * as ClassifyImage from 'react-native-classify-image';

import { services } from '@/services';
import { CustomSentry } from '@/utils/customSentry';
import Process from './Process';

class ClassifyImageProcess extends Process {
  public async start(): PVoid {
    this.status = 'STARTED';
    this.sendEvent('start');
    try {
      const images = await this.getAllImages();
      const untreatedImages = images.filter(item => item.uri && !item.labels);
      this.progress = images.length - untreatedImages.length;

      untreatedImages.forEach(async (image, index) => {
        if (this.status !== 'STARTED' || !image.uri) {
          return;
        }

        try {
          const result = await ClassifyImage.request(image.uri, {
            minConfidence: 0.7,
          });
          await this.updateImageLabels(image.id as string, result);
          this.sendEvent('progress', {
            progress: ++this.progress,
            total: images.length,
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

  private async updateImageLabels(
    id: string,
    labels?: {
      confidence: number;
      identifier: {
        en: string;
        zh_cn: string;
      };
    }[],
  ) {
    const labelsEN = labels?.map(label => label.identifier.en);
    const labelsZH_CN = labels?.map(label => label.identifier.zh_cn);

    return await services.api.photo.update({
      where: {
        id,
      },
      data: {
        labels: {
          en: labelsEN,
          zh_cn: labelsZH_CN,
        },
      },
    });
  }
}

const classifyImageProcess = new ClassifyImageProcess();

classifyImageProcess.once('error', error => {
  CustomSentry.captureException(error);
});

export default classifyImageProcess;
