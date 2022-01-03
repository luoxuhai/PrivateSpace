import dayjs from 'dayjs';
import { services } from '@/services';
import { FileStatus } from '@/services/db/file';
import { stores } from '@/store';

/**
 * 清理回收站到期文件
 */
export const clearRecycleBin = async (): PVoid => {
  try {
    const res = await services.api.local.listFile({
      owner: stores.user.userInfo!.id,
      status: FileStatus.Deleted,
    });
    const keep = stores.global.settingInfo.recycleBin.keep ?? 30;
    const files = res.data.list.filter(item =>
      dayjs(item.mtime).add(keep, 'day').isBefore(dayjs()),
    );
    const ids = files.map(file => file.id);
    if (ids.length)
      services.api.local.deleteFile({
        ids,
        isMark: false,
      });
  } catch (error) {
    console.log(error);
  }
};
