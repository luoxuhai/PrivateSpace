import { generateRNNScreens, Screens } from 'rnn-screens';
import { getI18n } from 'react-i18next';
import { OptionsModalPresentationStyle } from 'react-native-navigation';

import { stores, withStores } from '@/store';
import { withQueryClientProvider } from '@/services';
import { withLargeTitle } from '@/services/navigation/options';
import { EUserType } from '@/services/db/user';
import AlbumScreen from './Album';
import TransferScreen from './Transfer';
import SettingsScreen from './Settings';
import MiniAppsScreen from './MiniApps';
import ImageListScreen from './ImageList';
import AlbumSettingModal from './Album/AlbumSetting';
import AboutScreen from './About';
import WebViewScreen from './WebView';
import BrowserScreen from './Browser';
import LanguageSettingScreen from './Settings/Language';
import ThemeSettingScreen from './Settings/Theme';
import AutoLockSettingScreen from './Settings/AutoLock';
import FakePasswordSettingScreen from './Settings/FakePassword';
import UrgentSettingScreen from './Settings/Urgent';
import PasscodeLockScreen, { EInputType } from './PasscodeLock';
import RecycleBinScreen from './RecycleBin';
import RecycleBinSettingScreen from './RecycleBin/Setting';
import ImageViewScreen from './ImageView';
import AlbumCoverScreen from './Album/AlbumCover';
import FolderPickerScreen from './FolderPicker';
import VideoPlayerScreen from './ImageList/VideoPlayer';
import PurchaseScreen from './Purchase';
import DeveloperScreen from './About/Developer';

const t = getI18n().t;

export type ScreenName =
  | 'Album'
  | 'Transfer'
  | 'Settings'
  | 'miniApps'
  | 'ImageList'
  | 'AlbumSetting'
  | 'FeedBack'
  | 'About'
  | 'WebView'
  | 'Browser'
  | 'LanguageSetting'
  | 'ThemeSetting'
  | 'FakePasswordSetting'
  | 'AutoLockSetting'
  | 'ImageView'
  | 'UrgentSetting'
  | 'RecycleBin'
  | 'RecycleBinSetting'
  | 'AlbumCover'
  | 'FolderPicker'
  | 'VideoPlayer'
  | 'Purchase'
  | 'Developer'
  | 'PasscodeLock';

export const getScreens = (): Screens<ScreenName> =>
  generateRNNScreens<ScreenName>(
    {
      Album: {
        component: AlbumScreen,
        options: {
          topBar: {
            title: {
              text: t('album:navigation.title'),
            },
            ...withLargeTitle,
            rightButtons: [
              {
                id: 'add',
                icon: require('@/assets/icons/navigation/plus.circle.fill.png'),
                text: t('album:add:title'),
              },
            ],
          },
          bottomTab: {
            text: t('album:navigation.title'),
            icon: {
              system: 'photo.fill.on.rectangle.fill',
              fallback: require('@/assets/icons/navigation/photo.fill.on.rectangle.fill.png'),
            },
          },
        },
      },
      FolderPicker: {
        component: FolderPickerScreen,
        options: {
          topBar: {
            rightButtons: [
              {
                id: 'cancel',
                text: t('common:cancel'),
              },
            ],
            leftButtons: [
              {
                id: 'add',
                text: t('album:add:title'),
              },
            ],
          },
        },
      },
      miniApps: {
        component: MiniAppsScreen,
        options: {
          topBar: {
            title: {
              text: t('miniApps:navigation.title'),
            },
            ...withLargeTitle,
          },
          bottomTab: {
            text: t('miniApps:navigation.title'),
            icon: require('@/assets/icons/navigation/apps.png'),
          },
        },
      },

      Settings: {
        component: SettingsScreen,
        options: {
          topBar: {
            title: {
              text: t('setting:navigation:title'),
            },
            ...withLargeTitle,
          },
          bottomTab: {
            text: t('setting:navigation:title'),
            icon: {
              system: 'gearshape.fill',
              fallback: require('@/assets/icons/navigation/gearshape.fill.png'),
            },
          },
        },
      },

      ImageList: {
        component: ImageListScreen,
      },

      AlbumSetting: {
        component: AlbumSettingModal,
        options: {
          topBar: {
            title: {
              text: t('albumSetting:navigation.title'),
            },
            rightButtons: [
              {
                id: 'dismiss',
                text: t('common:done'),
              },
            ],
            animateRightButtons: false,
          },
        },
      },

      PasscodeLock: {
        id: 'PasscodeLock',
        component: PasscodeLockScreen,
        options: {
          modalPresentationStyle: OptionsModalPresentationStyle.fullScreen,
        },
        passProps: {
          type: EInputType.Verify,
          userType: EUserType.ADMIN,
        },
      },

      About: {
        component: AboutScreen,
        options: {
          topBar: {
            barStyle: 'black',
            title: {
              text: t('about:navigation.title'),
            },
          },
        },
      },

      WebView: {
        component: WebViewScreen,
      },

      RecycleBin: {
        component: RecycleBinScreen,
        options: {
          topBar: {
            title: {
              text: t('recycleBin:navigation.title'),
            },
            rightButtons: [
              {
                id: 'config',
                icon: {
                  system: 'slider.horizontal.3',
                  fallback: require('@/assets/icons/navigation/slider.horizontal.png'),
                },
              },
            ],
          },
        },
      },

      RecycleBinSetting: {
        component: RecycleBinSettingScreen,
        options: {
          topBar: {
            title: {
              text: t('recycleBinSetting:navigation.title'),
            },
          },
        },
      },

      Browser: {
        component: BrowserScreen,
        options: {
          topBar: {
            title: {
              text: '隐私浏览器',
            },
          },
        },
      },

      Transfer: {
        component: TransferScreen,
        options: {
          topBar: {
            title: {
              text: 'WI-FI 互传',
            },
          },
          bottomTabs: {
            visible: false,
          },
        },
      },

      LanguageSetting: {
        component: LanguageSettingScreen,
        options: {
          topBar: {
            title: {
              text: t('langSetting:navigation.title'),
            },
          },
        },
      },

      ThemeSetting: {
        component: ThemeSettingScreen,
        options: {
          topBar: {
            title: {
              text: t('appearance:navigation.title'),
            },
          },
        },
      },

      AutoLockSetting: {
        component: AutoLockSettingScreen,
        options: {
          topBar: {
            title: {
              text: t('autoLock:navigation.title'),
            },
          },
        },
      },

      FakePasswordSetting: {
        component: FakePasswordSettingScreen,
        options: {
          topBar: {
            title: {
              text: t('fakePass:navigation.title'),
            },
          },
        },
      },

      UrgentSetting: {
        component: UrgentSettingScreen,
        options: {
          topBar: {
            title: {
              text: t('urgent:navigation.title'),
            },
          },
        },
      },

      AlbumCover: {
        id: 'AlbumCover',
        component: AlbumCoverScreen,
        options: {
          topBar: {
            title: {
              text: t('albumCover:navigation.title'),
            },
            rightButtons: [
              {
                id: 'cancel',
                text: t('common:cancel'),
                color: stores.ui.themes.primary,
              },
            ],
          },
        },
      },

      ImageView: {
        component: ImageViewScreen,
        options: {
          topBar: {
            title: {
              fontWeight: '400',
            },
            leftButtons: [
              {
                id: 'back',
                icon: require('@/assets/icons/navigation/chevron.backward.png'),
              },
            ],
          },
          bottomTabs: {
            visible: false,
          },
        },
      },

      VideoPlayer: {
        component: VideoPlayerScreen,
        options: {
          topBar: {
            visible: false,
          },
          bottomTabs: {
            visible: false,
          },
        },
      },

      Developer: {
        component: DeveloperScreen,
        options: {
          topBar: {
            rightButtons: [
              {
                id: 'cancel',
                systemItem: 'cancel',
              },
            ],
          },
        },
      },

      Purchase: {
        component: PurchaseScreen,
        options: {
          topBar: {
            title: {
              text: '会员',
            },
            leftButtons: [
              {
                id: 'cancel',
                text: '关闭',
              },
            ],
            rightButtons: [
              {
                id: 'restore',
                text: '恢复购买',
              },
            ],
          },
          modal: {
            swipeToDismiss: false,
          },
        },
      },
    },
    [withStores, withQueryClientProvider],
  );
