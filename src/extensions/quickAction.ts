import {
  NativeEventEmitter,
  AppState,
  NativeEventSubscription,
} from 'react-native';
import Shortcuts, { ShortcutItem } from 'react-native-actions-shortcuts';
import { getI18n } from 'react-i18next';
import { RNToasty } from 'react-native-toasty';
import fundebug from 'fundebug-reactnative';

import { services, initAlbums } from '@/services';
import { stores } from '@/store';
import { HapticFeedback, getDefaultAlbum } from '@/utils';
import { FileImporter } from '@/screens/ImageList/FileImporter';
import { transformResult } from '@/screens/ImageList/AddButton';

const fileImporter = new FileImporter();

const getShortcuts = (): ShortcutItem[] => [
  {
    type: 'quick.capture',
    title: getI18n().t('quickAction:capture.title'),
    shortTitle: getI18n().t('quickAction:capture.shortTitle'),
    iconName: 'capturePhoto',
  },
];

export class QuickAction {
  shortcutsEmitter: NativeEventEmitter;
  appStateEventSubscription?: NativeEventSubscription;

  constructor() {
    this.shortcutsEmitter = new NativeEventEmitter(Shortcuts as never);
    this.shortcutsEmitter.addListener('onShortcutItemPressed', () =>
      this.handleShortcut(),
    );
  }

  async init(): PVoid {
    Shortcuts.setShortcuts(getShortcuts());
  }

  handleShortcut(): void {
    this.removeAppStateListener();
    this.addAppStateListener();
    if (services.nav.screens?.getConstants()) {
      fileImporter.camera().close?.();
      this.openCamera();
    } else {
      const timer = setInterval(() => {
        if (services.nav.screens?.getConstants()) {
          clearInterval(timer);
          this.openCamera();
        }
      }, 200);
    }
  }

  openCamera() {
    const owner = stores.user.userInfo?.id as string;
    return fileImporter
      .camera(
        async file => {
          try {
            await initAlbums();
            const res = await transformResult(
              file,
              (
                await getDefaultAlbum(owner)
              )?.id as string,
            );
            await services.api.local.createFile({
              ...res,
              owner,
            });
            HapticFeedback.impactAsync.medium();
            RNToasty.Show({
              title: '已导入',
              position: 'top',
            });
            stores.album.setRefetchAlbum(stores.album.refetchAlbum + 1);
          } catch (error) {
            fundebug.notify('快速拍摄导入图片视频出错', error?.message ?? '');
          }
        },
        () => {
          this.removeAppStateListener;
        },
      )
      .open();
  }

  addAppStateListener(): void {
    this.appStateEventSubscription = AppState.addEventListener(
      'change',
      state => {
        if (state === 'background') {
          fileImporter.camera().close?.().then(this.removeAppStateListener);
        }
      },
    );
  }

  removeAppStateListener(): void {
    this.appStateEventSubscription?.remove();
  }
}
