import { Like } from 'typeorm/browser';
import * as FS from 'react-native-fs';

import { services } from '@/services';
import { FileStatus } from '@/services/database/entities/file.entity';

interface ImageResult {
  id?: string;
  uri?: string;
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

  public async getAllImages(): Promise<ImageResult[]> {
    const images = await services.api.photo.list({
      mime: Like('image/%'),
    });

    for (const [index, image] of images?.items?.entries()) {
      if (!image.uri || !(await FS.exists(image.uri))) {
        images?.items.splice(index, 1);
      }
    }

    return (
      images?.items.map(image => ({
        id: image.id,
        uri: image.uri,
        labels: image.labels,
      })) ?? []
    );
  }

  public async getAllPhoto(): Promise<API.PhotoWithSource[]> {
    const res = await services.api.photo.list({
      status: FileStatus.Normal,
    });

    for (const [index, file] of res?.items?.entries()) {
      if (!file.uri || !(await FS.exists(file.uri))) {
        res?.items.splice(index, 1);
      }
    }

    return res?.items;
  }
}

export default Process;
