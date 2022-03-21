import ShareMenu, { ShareData } from 'react-native-share-menu';

import { transformResult } from '@/screens/PhotoList/AddButton';
import { services } from '@/services';
import { stores } from '@/store';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { RNToasty } from 'react-native-toasty';
import { randomNum, extname, getDefaultAlbum } from '@/utils';
import classifyImageProcess from '@/utils/process/classifyImageProcess';

export function initShare(): void {
  ShareMenu.getInitialShare(handleShare);
  ShareMenu.addNewShareListener(handleShare);
}

const handleShare = async (shareData?: ShareData) => {
  if (!shareData?.data) {
    return;
  }

  LoadingOverlay.show({
    text: {
      value: '保存中...',
    },
  });
  try {
    await createFiles(
      await Promise.all(
        shareData.data?.map(async item =>
          transformResult(
            {
              uri: item.data,
              mime: item.mimeType,
              name: `IMG_${randomNum(10)}${extname(item.data)}`,
            },
            (
              await getDefaultAlbum(stores.user.current!.id)
            )?.id as string,
          ),
        ) ?? [],
      ),
    );
    stores.album.setRefetchAlbum(stores.album.refetchAlbum + 1);
  } catch {
    RNToasty.Show({
      title: '保存失败',
      position: 'top',
    });
  }

  LoadingOverlay.hide();
  classifyImageProcess.start();
};

export const createFiles = async files => {
  try {
    for (const file of files) {
      await services.api.photo.create(file);
    }
  } catch (error) {
    console.error('error', error);
  }
};
