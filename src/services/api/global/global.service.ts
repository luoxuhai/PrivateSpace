import { getRepository } from 'typeorm/browser';

import * as Types from './types';
import FileEntity, {
  FileStatus,
  FileType,
} from '@/services/database/entities/file.entity';
import { stores } from '@/store';
import AlbumService from '../album/album.service';
import { getAlbumCover, setPhotoSource } from '../common/utils';
import { FindAllData } from '../album/types.d';

class GlobalService {
  public async search(
    params: Types.SearchParams & { smart_search_enabled: boolean },
  ): Promise<[FileEntity[], number]> {
    const { keyword, mime, type, smart_search_enabled } = params;

    let sqlStr = '';

    sqlStr += `(name LIKE "%${keyword ?? ''}%" OR description LIKE "%${
      keyword ?? ''
    }%"`;

    if (smart_search_enabled) {
      sqlStr += ` OR exists (SELECT * FROM json_each(json_extract(file.labels, '$.zh_cn')) WHERE json_each.value LIKE "%${
        keyword ?? ''
      }%")`;
    }

    sqlStr += ')';

    if (mime) {
      sqlStr += ` AND mime LIKE "${mime}/%"`;
    }

    if (type) {
      sqlStr += ` AND type = ${type}`;
    }

    sqlStr += ` AND status = ${FileStatus.Normal} AND owner = "${stores.user.current?.id}"`;

    const files = (await getRepository<FileEntity>(FileEntity).query(
      `SELECT * FROM file WHERE ${sqlStr} ORDER BY type DESC`,
    )) as FindAllData[];

    for (const [index, item] of files.entries()) {
      const extra = files[index].extra;
      const id = item.id as string;
      files[index].extra = extra ? JSON.parse(extra as string) : undefined;
      if (item.type === FileType.File) continue;
      files[index].item_total = await AlbumService.getAlbumItemTotal(
        item.id as string,
      );
      files[index].cover = await getAlbumCover(item);
      files[index].image_total = await AlbumService.getAlbumImageTotal(id);
      files[index].video_total = await AlbumService.getAlbumVideoTotal(id);
    }

    await setPhotoSource(files);

    return [files, files.length];
  }
}

export default new GlobalService();
