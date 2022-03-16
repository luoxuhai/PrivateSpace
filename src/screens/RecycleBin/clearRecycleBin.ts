import dayjs from 'dayjs';
import { services } from '@/services';
import { FileStatus } from '@/services/database/entities/file.entity';
import { stores } from '@/store';

/**
 * 清理回收站到期文件
 */
export const clearRecycleBin = async (): PVoid => {
  try {
    const res = await services.api.photo.list({
      status: FileStatus.Deleted,
    });
    const keep = stores.global.settingInfo.recycleBin.keep ?? 30;
    const files = res.items.filter(item =>
      dayjs(item.mtime).add(keep, 'day').isBefore(dayjs()),
    );
    const ids = files.map(file => file.id!);
    if (ids.length)
      services.api.photo.delete({
        ids,
      });
  } catch (error) {
    console.log(error);
  }
};
