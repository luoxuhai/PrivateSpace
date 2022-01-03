import * as ClassifyImage from 'react-native-classify-image';
import { Like } from 'typeorm/browser';
import * as FS from 'react-native-fs';

import { services } from '@/services';
import { CustomSentry } from '@/utils/customSentry';

interface ImageResult {
  id: string;
  uri: string;
  labels?: FileLabel;
}

interface Listener {
  type: 'progress' | 'error' | 'stop' | 'start';
  listener: (event: any) => void;
}

class ClassifyImageProcess {
  private progress = 0;
  private status?: 'STARTED' | 'STOPPED' = 'STOPPED';
  private listeners = new Set<Listener>();

  public async start(): PVoid {
    this.status = 'STARTED';
    this.sendEvent('start');
    try {
      const images: ImageResult[] = await this.getAllImages();
      const untreatedImages = images.filter(item => item.uri && !item.labels);
      this.progress = images.length - untreatedImages.length;

      untreatedImages.forEach(async (image, index) => {
        if (this.status !== 'STARTED') {
          return;
        }

        try {
          const result = await ClassifyImage.request(image.uri, {
            minConfidence: 0.8,
          });
          await this.updateImageLabels(image.id, result);
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

  public stop(): void {
    this.status = 'STOPPED';
    this.progress = 0;
    this.sendEvent('stop');
  }

  public on(
    type: Listener['type'],
    listener: Listener['listener'],
  ): () => void {
    const listenerItem = {
      type,
      listener,
    };
    this.listeners.add(listenerItem);

    return () => {
      this.listeners.delete(listenerItem);
    };
  }

  public removeAllListeners(): void {
    this.listeners.clear();
  }

  private sendEvent(type: Listener['type'], event?: any): void {
    this.listeners.forEach(item => {
      if (item.type === type) {
        item.listener(event);
      }
    });
  }

  private async getAllImages() {
    const images = await services.api.local.listFile({
      mime: Like('image/%'),
    });

    for (const [index, image] of images?.data?.list?.entries()) {
      if (!(await FS.exists(image.uri))) {
        images?.data.list.splice(index, 1);
      }
    }

    return (
      images?.data.list.map(image => ({
        id: image.id,
        uri: image.uri,
        labels: image.labels,
      })) ?? []
    );
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

    return await services.api.local.updateFile({
      id,
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

classifyImageProcess.on('error', error => {
  CustomSentry.captureException(error);
});

export default classifyImageProcess;
