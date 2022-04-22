import { generateRNNScreens, Screens } from 'rnn-screens';
import { getI18n } from 'react-i18next';
import { OptionsModalPresentationStyle } from 'react-native-navigation';

import { stores, withStores } from '@/store';
import { withQueryClientProvider } from '@/services';
import { withLargeTitle } from '@/services/navigation/options';
import { EUserType } from '@/services/database/entities/user.entity';
import AlbumScreen from './Album';
import TransferScreen from './Transfer';
import SettingsScreen from './Settings';
import MiniAppsScreen from './MiniApps';
import ImageListScreen from './PhotoList';
import AlbumSettingModal from './Album/AlbumSetting';
import AboutScreen from './About';
import WebViewScreen from './WebView';
// import ICloudScreen from './ICloud';
import LanguageSettingScreen from './Settings/Language';
import ThemeSettingScreen from './Settings/Theme';
import AutoLockSettingScreen from './Settings/AutoLock';
import FakePasswordSettingScreen from './Settings/FakePassword';
import UrgentSettingScreen from './Settings/Urgent';
import AdvancedSettingScreen from './Settings/Advanced';
import PasscodeLockScreen, { EInputType } from './PasscodeLock';
import RecycleBinScreen from './RecycleBin';
import RecycleBinSettingScreen from './RecycleBin/Setting';
import ImageViewScreen from './PhotoView';
import AlbumCoverScreen from './Album/AlbumCover';
import FolderPickerScreen from './Album/AlbumPicker';
import VideoPlayerScreen from './PhotoView/VideoPlayer';
import PurchaseScreen from './Purchase';
import DeveloperScreen from './About/Developer';
import DescriptionFormScreen from './PhotoView/DescriptionForm';
import FileManagerScreen from './FileManager';
import FileDirPikerScreen from './FileDirPiker';
// import FileViewScreen from './FileView';

const t = getI18n().t;

export type ScreenName =
  | 'Album'
  | 'Transfer'
  | 'Settings'
  | 'MiniApps'
  | 'ImageList'
  | 'AlbumSetting'
  | 'FeedBack'
  | 'About'
  | 'WebView'
  | 'ICloud'
  | 'LanguageSetting'
  | 'ThemeSetting'
  | 'FakePasswordSetting'
  | 'AutoLockSetting'
  | 'ImageView'
  | 'UrgentSetting'
  | 'AdvancedSetting'
  | 'RecycleBin'
  | 'RecycleBinSetting'
  | 'AlbumCover'
  | 'FolderPicker'
  | 'VideoPlayer'
  | 'Purchase'
  | 'Developer'
  | 'DescriptionForm'
  | 'PasscodeLock'
  | 'FileDirPiker'
  | 'FileView'
  | 'FileManager';

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
            leftButtons: [
              {
                id: 'vip',
                text: 'VIP',
                component: {
                  name: 'TopBarButtonVip',
                },
              },
            ],
            searchBar: {
              visible: true,
              hideTopBarOnFocus: true,
              hideOnScroll: false,
              placeholder: t('search:placeholder'),
              cancelText: t('search:cancel'),
              tintColor: stores.ui.themes.primary,
              scopeButtonTitles: ['全部', '图片', '视频', '相册'],
              showsScopeBar: true,
              selectedScopeButtonIndex: 1,
            },
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

      FileDirPiker: {
        component: FileDirPikerScreen,
      },

      FileManager: {
        component: FileManagerScreen,
        options: {
          topBar: {
            title: {
              text: t('fileManager:navigation.title'),
            },
            ...withLargeTitle,
            // leftButtons: [
            //   {
            //     id: 'vip',
            //     text: 'VIP',
            //     component: {
            //       name: 'TopBarButtonVip',
            //     },
            //   },
            // ],
          },
          bottomTab: {
            text: t('fileManager:navigation.title'),
            icon: {
              system: 'folder.fill',
            },
          },
        },
      },

      // FileView: {
      //   component: FileViewScreen,
      //   options: {
      //     bottomTabs: {
      //       visible: false,
      //     },
      //   },
      // },

      MiniApps: {
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
          bottomTabs: {
            animate: true,
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

      // ICloud: {
      //   component: ICloudScreen,
      //   options: {
      //     topBar: {
      //       title: {
      //         text: 'iCloud 备份',
      //       },
      //     },
      //   },
      // },

      Transfer: {
        component: TransferScreen,
        options: {
          topBar: {
            title: {
              text: t('transfer:navigation.title'),
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

      AdvancedSetting: {
        component: AdvancedSettingScreen,
        options: {
          topBar: {
            title: {
              text: t('setting:advanced.navigation.title'),
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
                text: t('common:done'),
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
              component: {
                id: 'ImageViewTitle',
                name: 'ImageViewTitle',
              },
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

      DescriptionForm: {
        component: DescriptionFormScreen,
        options: {
          topBar: {
            title: {
              text: t('photoView:toolbar.desc'),
            },
            rightButtons: [
              {
                id: 'done',
                text: t('common:done'),
              },
            ],
            leftButtons: [
              {
                id: 'cancel',
                text: t('common:cancel'),
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
              text: t('purchase:navigation.title'),
            },
            subtitle: {
              text: t('purchase:navigation.subtitle'),
              fontSize: 10,
            },
            leftButtons: [
              {
                id: 'cancel',
                text: t('common:cancel'),
              },
            ],
            rightButtons: [
              {
                id: 'restore',
                text: t('purchase:restore'),
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
