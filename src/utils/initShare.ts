import ShareMenu, { ShareData } from 'react-native-share-menu';

import { transformResult } from '@/screens/ImageList/AddButton';
import { createFile } from '@/services/api/local/file';
import albumStore from '@/store/album';
import userStore from '@/store/user';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { RNToasty } from 'react-native-toasty';
import { randomNum, extname, getDefaultAlbum } from '@/utils';
import baidumobstat from '@/utils/baidumobstat';
import classifyImageProcess from '@/utils/classifyImageProcess';

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
              await getDefaultAlbum(userStore.userInfo!.id)
            )?.id as string,
          ),
        ) ?? [],
      ),
    );
    albumStore.setRefetchAlbum(albumStore.refetchAlbum + 1);
  } catch {
    RNToasty.Show({
      title: '保存失败',
      position: 'top',
    });
  }

  baidumobstat.onEvent('operate_share');
  LoadingOverlay.hide();
  classifyImageProcess.start();
};

export const createFiles = async files => {
  try {
    for (const file of files) {
      await createFile({
        ...file,
        owner: userStore.userInfo!.id ?? '',
      });
    }
  } catch (error) {
    console.error('error', error);
  }
};
