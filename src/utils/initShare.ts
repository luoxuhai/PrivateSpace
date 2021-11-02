import ShareMenu, { ShareData } from 'react-native-share-menu';
import fundebug from 'fundebug-reactnative';

import { transformResult } from '@/screens/ImageList/AddButton';
import { createFile } from '@/services/api/local/file';
import config from '@/config';
import albumStore from '@/store/album';
import userStore from '@/store/user';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { randomNum, extname, getDefaultAlbum } from '@/utils';

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
  } catch (error) {
    fundebug.notify('保存分享图片视频出错', error?.message ?? '');
  }

  LoadingOverlay.hide();
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
