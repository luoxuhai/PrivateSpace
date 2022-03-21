import { Like, In } from 'typeorm/browser';
import * as FS from 'react-native-fs';

import { services } from '@/services';
import { FileStatus } from '@/services/database/entities/file.entity';
import { orderBy } from 'lodash';

interface Listener {
  type: 'progress' | 'error' | 'stop' | 'start';
  once?: boolean;
  listener: (event: any) => void;
}

interface Process {
  start(): PVoid;
}

class Process implements Process {
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

  public once(type: Listener['type'], listener: Listener['listener']) {
    const listenerItem = {
      type,
      once: true,
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

  public removeListeners(listener: Listener): void {
    this.listeners.delete(listener);
  }

  public sendEvent(type: Listener['type'], event?: any): void {
    this.listeners.forEach(item => {
      if (item.type === type) {
        item.listener(event);
        if (item.once) {
          this.removeListeners(item);
        }
      }
    });
  }

  public async getAllImages() {
    const images = await services.api.photo.list({
      mime: Like('image/%'),
    });

    for (const [index, image] of images?.items?.entries()) {
      if (!image.uri || !(await FS.exists(image.uri))) {
        images?.items.splice(index, 1);
      }
    }

    return images?.items;
  }

  public async getAllPhoto(
    status = [FileStatus.Normal],
  ): Promise<API.PhotoWithSource[]> {
    const res = await services.api.photo.list({
      status: In(status),
    });

    for (const [index, file] of res?.items?.entries()) {
      if (!file.uri || !(await FS.exists(file.uri))) {
        res?.items.splice(index, 1);
      }
    }

    if (status.length > 1) {
      return orderBy(res?.items, ['status']);
    }

    return res?.items;
  }
}

export default Process;
