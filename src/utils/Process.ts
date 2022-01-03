import { Like } from 'typeorm/browser';
import * as FS from 'react-native-fs';

import { services } from '@/services';
import { FileType } from '@/services/db/file';

interface ImageResult {
  id: string;
  uri: string;
  labels?: FileLabel;
}

interface Listener {
  type: 'progress' | 'error' | 'stop' | 'start';
  listener: (event: any) => void;
}

class Process {
  public progress = 0;
  public status?: 'STARTED' | 'STOPPED' = 'STOPPED';
  public listeners = new Set<Listener>();

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

  public sendEvent(type: Listener['type'], event?: any): void {
    this.listeners.forEach(item => {
      if (item.type === type) {
        item.listener(event);
      }
    });
  }

  public async getAllImages() {
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

  public async getAllFile() {
    const files = await services.api.local.listFile({
      type: FileType.File,
    });

    for (const [index, file] of files?.data?.list?.entries()) {
      if (!(await FS.exists(file.uri))) {
        files?.data.list.splice(index, 1);
      }
    }

    return files?.data.list;
  }
}

export default Process;
