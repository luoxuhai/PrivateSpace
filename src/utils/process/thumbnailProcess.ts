import { mkdir, moveFile, exists } from 'react-native-fs';

import { THUMBNAIL_PATH } from '@/config';
import { CustomSentry } from '@/utils/customSentry';
import Process from './Process';
import { generateThumbnail, join } from '@/utils';
import { SourceType } from '@/services/database/entities/file.entity';
import { getSourceByMime } from '../common';
import { getPosterPath } from '../file';

/**
 * 图片/视频缩略图、封面处理器
 */
class ThumbnailProcess extends Process {
  public async start(): PVoid {
    this.status = 'STARTED';
    this.sendEvent('start');
    try {
      const items = await this.getAllPhoto();
      const untreatedImages: API.PhotoWithSource[] = [];

      for (const item of items) {
        if (getSourceByMime(item.mime) === SourceType.Video) {
          const posterPath = getPosterPath(item?.extra?.source_id);
          if (!posterPath || !(await exists(posterPath))) {
            untreatedImages.push(item);
          }
        } else if (!item.thumbnail || !(await exists(item.thumbnail))) {
          untreatedImages.push(item);
        }
      }

      this.progress = items.length - untreatedImages.length;

      untreatedImages.forEach(async (item, index) => {
        const sourceId = item.extra?.source_id;
        if (this.status !== 'STARTED' || !item.uri || !sourceId || !item.mime) {
          return;
        }

        const sourceType = getSourceByMime(item.mime);
        try {
          let res = await generateThumbnail(item.uri, sourceType);
          if (!res?.path) throw Error('Failed to get thumbnail');

          const thumbnailDir = join(THUMBNAIL_PATH, sourceId);
          const thumbnailPath = join(thumbnailDir, 'default.jpg');
          await mkdir(thumbnailDir);

          // 视频需要获取封面
          if (sourceType === SourceType.Video) {
            const posterPath = getPosterPath(sourceId) as string;
            await moveFile(res.path, posterPath);

            try {
              res =
                (await generateThumbnail(posterPath, SourceType.Image)) ?? res;
            } catch (error) {
              console.error(error);
            }
          }

          await moveFile(res.path, thumbnailPath);
          this.sendEvent('progress', {
            progress: ++this.progress,
            total: items.length,
          });
          untreatedImages.splice(index, 1);
        } catch (error) {
          this.sendEvent('error', error);
        }
      });
    } catch (error) {
      this.sendEvent('error', error);
    }
  }
}

const thumbnailProcess = new ThumbnailProcess();

thumbnailProcess.once('error', error => {
  CustomSentry.captureException(error);
});

export default thumbnailProcess;
