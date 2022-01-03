import {
  NativeEventEmitter,
  AppState,
  NativeEventSubscription,
} from 'react-native';
import { OptionsModalPresentationStyle } from 'react-native-navigation';
import Shortcuts, { ShortcutItem } from 'react-native-actions-shortcuts';
import { getI18n } from 'react-i18next';
import { RNToasty } from 'react-native-toasty';

import { CustomSentry } from '@/utils/customSentry';
import { services, initAlbums } from '@/services';
import { stores } from '@/store';
import { UserRole } from '@/store/user';
import { HapticFeedback, getDefaultAlbum } from '@/utils';
import { FileImporter } from '@/screens/ImageList/FileImporter';
import { transformResult } from '@/screens/ImageList/AddButton';

const fileImporter = new FileImporter();

const getShortcuts = (): ShortcutItem[] => [
  {
    type: 'quick.transfer',
    title: 'WI-FI 互传',
    shortTitle: '互传',
    iconType: 'system',
    iconName: 'wifi',
  },
  {
    type: 'quick.capture',
    title: getI18n().t('quickAction:capture.title'),
    shortTitle: getI18n().t('quickAction:capture.shortTitle'),
    iconType: 'system',
    iconName: 'camera',
  },
];

export class QuickAction {
  shortcutsEmitter: NativeEventEmitter;
  appStateEventSubscription?: NativeEventSubscription;

  constructor() {
    this.shortcutsEmitter = new NativeEventEmitter(Shortcuts as never);
    this.shortcutsEmitter.addListener('onShortcutItemPressed', e => {
      switch (e.type) {
        case 'quick.capture':
          this.handleCameraShortcut();
          break;
        case 'quick.transfer':
          this.handleTransferShortcuts();
      }
    });
  }

  async init(): PVoid {
    Shortcuts.setShortcuts(getShortcuts());
  }

  async handleTransferShortcuts(): PVoid {
    this.removeAppStateListener();
    this.addAppStateListener();

    if (services.nav.screens?.getConstants()) {
      this.showTransferModal();
    } else {
      const timer = setInterval(() => {
        if (services.nav.screens?.getConstants()) {
          clearInterval(timer);
          this.showTransferModal();
        }
      }, 200);
    }
  }

  showTransferModal(): void {
    if (stores.user.userRole !== UserRole.VIP) {
      services.nav.screens?.show('Purchase');
      return;
    }

    services.nav.screens?.show(
      'Transfer',
      {},
      {
        modalPresentationStyle: OptionsModalPresentationStyle.fullScreen,
        animations: {
          showModal: {
            enabled: false,
          },
        },
        topBar: {
          rightButtons: [
            {
              id: 'cancel',
              text: '关闭',
            },
          ],
        },
      },
    );
  }

  handleCameraShortcut(): void {
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
            CustomSentry.captureException(error);
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
          services.nav.screens?.dismissModal('Transfer', {
            animations: {
              dismissModal: {
                enabled: false,
              },
            },
          });
          this.removeAppStateListener();
        }
      },
    );
  }

  removeAppStateListener(): void {
    this.appStateEventSubscription?.remove();
  }
}
