import FS from 'react-native-fs';
import { getMimeType } from '@qeepsake/react-native-file-utils';

import { transformResult } from '@/screens/PhotoList/AddButton';
import { services } from '@/services';
import { stores } from '@/store';
import { getDefaultAlbum } from '@/utils';
import config from '@/config';
import { CustomSentry } from './customSentry';

export async function initShareData() {
  if (!stores.user.current?.id) return;
  const albumId = (await getDefaultAlbum(stores.user.current.id))?.id;
  if (!albumId) return;

  const sharedPath = await FS.pathForGroup(config.groupIdentifier);
  const sourcePath = `${sharedPath}/Library/data/source`;
  const files = await FS.readDir(sourcePath);

  files.forEach(async file => {
    try {
      const normalizedFile = await transformResult(
        {
          uri: file.path,
          name: file.name,
          size: file.size,
          mime: await getMimeType(`file://${file.path}`),
        },
        albumId,
      );
      await services.api.photo.create(normalizedFile);
      FS.unlink(file.path);
    } catch (error) {
      CustomSentry.captureException(error, {
        extra: {
          title: '创建分享的文件失败',
        },
      });
    }
  });
}

export const createFiles = async files => {
  try {
    for (const file of files) {
      await services.api.photo.create(file);
    }
  } catch (error) {
    console.error('error', error);
  }
};
