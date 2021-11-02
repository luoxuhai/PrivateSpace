import * as RNLocalize from 'react-native-localize';
import {
  Platform,
  Appearance,
  ColorSchemeName,
  PlatformIOSStatic,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

import { Language } from '@/services/locale';
import { stores } from '@/store';

export function getLocalLanguage(): Language {
  const { languageTag } = RNLocalize.getLocales()[0];
  if (/zh/.test(languageTag)) {
    return 'zh-CN';
  }
  return 'en-US';
}

interface IPlatformInfo {
  os: 'ios' | 'android' | 'windows' | 'macos' | 'web';
  isPad: boolean;
  version: string;
  modelName?: string | null;
  totalMemory?: number | null;
  supportedCpuArchitectures?: string[] | null;
  getIpAddressAsync: () => Promise<string>;
  getNetworkStateTypeAsync: () => Promise<Network.NetworkStateType | undefined>;
}

export const platformInfo: IPlatformInfo = {
  os: Platform.OS,
  isPad: (Platform as PlatformIOSStatic).isPad,
  version: String(Platform.Version),
  modelName: Device.modelName,
  totalMemory: Device.totalMemory,
  supportedCpuArchitectures: Device.supportedCpuArchitectures,
  getIpAddressAsync: Network.getIpAddressAsync,
  getNetworkStateTypeAsync: () =>
    Network.getNetworkStateAsync().then(value => value.type),
};

export function getSystemAppearance(): ColorSchemeName {
  return Appearance.getColorScheme();
}

interface IHapticFeedback {
  impactAsync: {
    light: () => PVoid;
    medium: () => PVoid;
    heavy: () => PVoid;
  };
  canUse: () => boolean;
}

export class HapticFeedback implements IHapticFeedback {
  static canUse(): boolean {
    return stores.global.settingInfo.hapticFeedback;
  }
  static impactAsync = {
    light: (): any => {
      if (this.canUse())
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    medium: (): any => {
      if (this.canUse())
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    heavy: (): any => {
      if (this.canUse())
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    },
  };

  static notificationAsync = {
    success: (): any => {
      if (this.canUse())
        return Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
    },
    error: (): any => {
      if (this.canUse())
        return Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error,
        );
    },
    warning: (): any => {
      if (this.canUse())
        return Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
    },
  };
}
