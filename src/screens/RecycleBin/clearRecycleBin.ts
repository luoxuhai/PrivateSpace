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
    const files = res.data.list.filter(item =>
      dayjs(item.mtime).add(30, 'day').isBefore(dayjs()),
    );

    services.api.local.deleteFile({
      ids: files.map(file => file.id),
      isMark: false,
    });
  } catch (error) {
    console.log(error);
  }
};
