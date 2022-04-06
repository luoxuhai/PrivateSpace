import { BottomTabs, Component, Root, Stack, Screens } from 'rnn-screens';
import { AppState, AppStateStatus } from 'react-native';

import { getScreens, ScreenName } from '@/screens';
import { getDefaultOptions, components } from './options';
import { DynamicUpdate } from '@/utils/dynamicUpdate';
import { stores } from '@/store';
import { initShare } from '@/utils/initShare';

export default class Nav {
  screens?: Screens<ScreenName>;

  async init(): PVoid {
    this.screens = getScreens();
    this.setDefaultOptions();
    this.registerComponents();
  }

  async start(): PVoid {
    // if (__DEV__) {
    //   await this.startMainScreen();
    // } else {
    await this.startLockScreen();
    // }
    this.addAppStateListener();
    initShare();
  }

  async startMainScreen(): Promise<string | undefined> {
    return this.screens?.N.setRoot(
      Root(
        BottomTabs([
          Stack(Component(this.screens.get('Album'))),
          Stack(Component(this.screens.get('FileManager'))),
          Stack(Component(this.screens.get('MiniApps'))),
          Stack(Component(this.screens.get('Settings'))),
        ]),
      ),
    );
  }

  async startLockScreen(): Promise<string | undefined> {
    return this.screens?.N.setRoot(
      Root(Stack(Component(this.screens.get('PasscodeLock')))),
    );
  }

  registerComponents(): void {
    components.forEach(component => {
      this.screens?.N.registerComponent(
        component.id,
        component.componentProvider,
      );
    });
  }

  setDefaultOptions(): void {
    this.screens?.N.setDefaultOptions(getDefaultOptions());
  }

  updateOptions(): void {
    setTimeout(() => {
      this.screens = getScreens();
      this.setDefaultOptions();
      const allScreen = this.screens.getAll();
      const primaryColor = stores.ui.themes.primary;
      for (const key in allScreen) {
        const screen = allScreen[key as ScreenName];
        const bottomTabIcon = this.screens?.getById(screen.id).options
          ?.bottomTab?.icon;
        this.screens?.N.mergeOptions(screen.id, {
          topBar: {
            ...screen.options?.topBar,
            backButton: { color: primaryColor },
            rightButtons: screen.options?.topBar?.rightButtons?.map(btn => ({
              ...btn,
              color: primaryColor,
            })),
          },

          bottomTab: bottomTabIcon
            ? {
                ...screen.options?.bottomTab,
                icon: bottomTabIcon,
                selectedTextColor: primaryColor,
                selectedIconColor: primaryColor,
                iconColor: stores.ui.colors.tabBar,
                textColor: stores.ui.colors.tabBar,
              }
            : undefined,
        });
      }
    });
  }

  addAppStateListener(): void {
    let timer: NodeJS.Timeout;
    AppState.addEventListener('change', (state: AppStateStatus) => {
      const { lockScreenVisible, maskVisible, settingInfo, enableMask } =
        stores.global;

      switch (state) {
        case 'background':
          if (!lockScreenVisible) {
            clearTimeout(timer);
            timer = setTimeout(() => {
              stores.global.setLockScreenVisible(true);
            }, settingInfo.autoLockDuration * 1000);
          }
          break;
        case 'inactive':
          if (!maskVisible && !lockScreenVisible && enableMask) {
            stores.global.setMaskVisible(true);
          }
          // if (!__DEV__) {
          //   DynamicUpdate.sync();
          // }
          DynamicUpdate.sync();
          break;
        case 'active':
          stores.global.setMaskVisible(false);
          clearTimeout(timer);
          DynamicUpdate.sync();
      }
    });
  }
}
