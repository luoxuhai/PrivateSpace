import * as RNLocalize from 'react-native-localize';
import {
  Platform,
  Appearance,
  ColorSchemeName,
  PlatformIOSStatic,
  Settings,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Device from 'react-native-device-info';
import NetInfo, {
  NetInfoStateType,
  NetInfoWifiState,
} from '@react-native-community/netinfo';
import { NavigationConstants } from 'react-native-navigation';

import { ELanguage, Language, Languages } from '@/locales';
import { services } from '@/services';
import { stores } from '@/store';

export function getLocalLanguage(isBest = true): Language {
  const { languageTag, countryCode } = RNLocalize.getLocales()[0];

  const _languageTag = languageTag.replace(`-${countryCode}`, '');
  if (
    isBest &&
    !Languages.includes(languageCodeFromSystemToInternal(_languageTag))
  ) {
    const bestLanguage = RNLocalize.findBestAvailableLanguage(
      Languages.map(item => languageCodeFromInternalToSystem(item)),
    );
    return languageCodeFromSystemToInternal(bestLanguage?.languageTag);
  }

  return languageCodeFromSystemToInternal(_languageTag);
}

/**
 * 设置 App 语言
 * @param language
 */
export function setAppLanguage(language: Language) {
  const languages = Settings.get('AppleLanguages') as string[];
  const systemLanguage = languageCodeFromInternalToSystem(language);
  const languageTag = languages.find(l => l.startsWith(systemLanguage));
  if (languageTag) {
    Settings.set({
      AppleLanguages: [
        languageTag,
        ...languages.filter(l => l !== languageTag),
      ],
    });
  }
}

function languageCodeFromSystemToInternal(languageCode?: string): ELanguage {
  switch (languageCode) {
    case 'zh-Hans':
      return ELanguage.ZH_CN;
    case 'zh-Hant':
      return ELanguage.ZH_TW;
    case 'ko':
      return ELanguage.KO_KR;
    case 'ja':
      return ELanguage.JA_JP;
    default:
      return ELanguage.EN_US;
  }
}

function languageCodeFromInternalToSystem(languageCode?: string) {
  switch (languageCode) {
    case 'zh-CN':
      return 'zh-Hans';
    case 'zh-TW':
      return 'zh-Hant';
    case 'en-US':
      return 'en';
    case 'ko-KR':
      return 'ko';
    case 'ja-JP':
      return 'ja';
    default:
      return 'en';
  }
}

interface SystemInfo {
  os: 'ios' | 'android' | 'windows' | 'macos' | 'web';
  isPad: boolean;
  version: string;
  modelName?: string | null;
  totalMemory?: number | null;
  supportedCpuArchitectures?: string[] | null;
  getUsedMemory: () => Promise<number>;
  getIpAddressAsync: () => Promise<string | null>;
  getNetworkStateTypeAsync: () => Promise<NetInfoStateType | undefined>;
  getFreeDiskStorage: () => Promise<number>;
}

interface ApplicationInfo {
  name: string;
  version: string;
  env: 'AppStore' | 'TestFlight' | 'Other';
}

export const systemInfo: SystemInfo = {
  os: Platform.OS,
  isPad: (Platform as PlatformIOSStatic).isPad,
  version: String(Platform.Version),
  modelName: Device.getModel(),
  totalMemory: Device.getTotalMemorySync(),
  supportedCpuArchitectures: Device.supportedAbisSync(),
  getUsedMemory: async () => Device.getUsedMemory(),
  getFreeDiskStorage: async () => Device.getFreeDiskStorage(),
  getIpAddressAsync: async () =>
    ((await NetInfo.fetch()) as NetInfoWifiState)?.details?.ipAddress,
  getNetworkStateTypeAsync: async () => (await NetInfo.fetch()).type,
};

export const applicationInfo: ApplicationInfo = {
  name: Device.getApplicationName(),
  version: Device.getVersion(),
  env: Device.getInstallerPackageNameSync() as
    | 'AppStore'
    | 'TestFlight'
    | 'Other',
};

export function getSystemAppearance(): ColorSchemeName {
  return Appearance.getColorScheme();
}

export class HapticFeedback {
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

export function getUIFrame(): NavigationConstants {
  return services.nav.screens!.getConstants();
}
