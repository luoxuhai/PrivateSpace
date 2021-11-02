import { Linking } from 'react-native';
import {
  observable,
  runInAction,
  reaction,
  makeObservable,
  action,
} from 'mobx';
import {
  hydrateStore,
  makePersistable,
  clearPersistedStore,
} from 'mobx-persist-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { DeviceMotion } from 'expo-sensors';

import { services } from '@/services';
import PasscodeLock from '@/screens/PasscodeLock';

export const enum EAppOpenUrl {
  /** 备忘录 */
  Notes = 'mobilenotes://',
  /** 邮件 */
  Mailto = 'mailto:2639415619@qq.com',
  /** 相册 */
  Photos = 'photos-redirect://',
  /** 浏览器 */
  Safari = 'https://www.baidu.com',
  /** 哔哩哔哩动画 */
  Bilibili = 'bilibili://',
  /** 抖音 */
  Douyin = 'snssdk1128://',
  /** QQ */
  QQ = 'mqq://',
  /** 微信 */
  Weixin = 'weixin://',
}

interface ISetting {
  autoLocalAuth: boolean;
  // 秒
  autoLockDuration: number;
  hapticFeedback: boolean;
  fakePassword: {
    enabled: boolean;
  };
  /** 紧急切换 */
  urgentSwitchUrl: EAppOpenUrl | null;
  /** 自动提示删除原文件 */
  autoClearOrigin: boolean;
  /** 回收站 */
  recycleBin: {
    enabled: boolean;
  };
}

interface IAppUpdateIgnore {
  version?: string;
  ctime?: number;
  interval?: number;
}

export class GlobalStore implements IStore {
  @observable localAuthTypes?: LocalAuthentication.AuthenticationType[];
  @observable settingInfo: ISetting = {
    autoLocalAuth: false,
    autoLockDuration: 0,
    hapticFeedback: true,
    fakePassword: {
      enabled: false,
    },
    urgentSwitchUrl: null,
    autoClearOrigin: true,
    recycleBin: {
      enabled: true,
    },
  };
  @observable maskVisible = false;
  @observable enableMask = true;
  @observable lockScreenVisible = true;
  @observable appUpdateIgnore?: IAppUpdateIgnore;
  @observable debug = false;

  constructor() {
    makeObservable(this);
    makePersistable(this, {
      name: 'Global',
      properties: ['localAuthTypes', 'settingInfo', 'appUpdateIgnore', 'debug'],
    });
    this.setLocalAuthType();
  }

  @action async setLocalAuthType(
    _types?: LocalAuthentication.AuthenticationType[],
  ): PVoid {
    const types =
      _types ?? (await LocalAuthentication.supportedAuthenticationTypesAsync());
    runInAction(() => {
      this.localAuthTypes = types;
    });
  }

  @action setMaskVisible(visible: boolean): void {
    this.maskVisible = visible;
  }

  @action setEnableMask(enabled: boolean): void {
    this.enableMask = enabled;
  }

  @action setLockScreenVisible(visible: boolean): void {
    this.lockScreenVisible = visible;
  }

  @action setAppUpdateIgnore(appUpdateIgnore?: IAppUpdateIgnore): void {
    this.appUpdateIgnore = appUpdateIgnore;
  }

  @action setSettingInfo(settingInfo: Partial<ISetting>): void {
    this.settingInfo = {
      ...this.settingInfo,
      ...settingInfo,
    };
  }

  @action setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  async hydrate(): PVoid {
    return hydrateStore(this);
  }

  async clearPersisted(): PVoid {
    return clearPersistedStore(this);
  }
}

const globalStore = new GlobalStore();

// 控制遮罩显隐
reaction(
  () => globalStore.maskVisible,
  maskVisible => {
    if (maskVisible) {
      services.nav.screens?.N.showOverlay({
        component: {
          id: 'BlurMask',
          name: 'BlurMask',
        },
      });
    } else {
      services.nav.screens?.N.dismissOverlay('BlurMask');
    }
  },
);

reaction(
  () => globalStore.lockScreenVisible,
  lockScreenVisible => {
    // 控制锁屏显隐
    if (lockScreenVisible) {
      globalStore.setMaskVisible(false);
      PasscodeLock.open();
    } else {
      PasscodeLock.close();
    }
  },
);

reaction(
  () => globalStore.settingInfo.urgentSwitchUrl,
  urgentSwitchUrl => {
    let isOpened = false;
    if (urgentSwitchUrl) {
      DeviceMotion.setUpdateInterval(500);
      DeviceMotion.removeAllListeners();
      DeviceMotion.addListener(d => {
        const x = (180 / Math.PI) * d.rotation.gamma;
        const y = (180 / Math.PI) * d.rotation.beta;
        if (Math.abs(x) >= 165 && Math.abs(y) <= 20) {
          if (urgentSwitchUrl && !isOpened) {
            isOpened = true;
            Linking.openURL(urgentSwitchUrl).then(() => {
              isOpened = false;
            });
          }
        }
      });
    } else {
      DeviceMotion.removeAllListeners();
    }
  },
);

export default globalStore;
