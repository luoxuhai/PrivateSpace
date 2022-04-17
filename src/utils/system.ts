import {
  Platform,
  Appearance,
  ColorSchemeName,
  PlatformIOSStatic,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Device from 'react-native-device-info';
import NetInfo, {
  NetInfoStateType,
  NetInfoWifiState,
} from '@react-native-community/netinfo';
import { NavigationConstants } from 'react-native-navigation';

import { services } from '@/services';
import { stores } from '@/store';

interface SystemInfo {
  os: 'ios' | 'android' | 'windows' | 'macos' | 'web';
  isPad: boolean;
  version: string;
  modelName?: string | null;
  totalMemory?: number | null;
  supportedCpuArchitectures?: string[] | null;
  uniqueId?: string;
  getUsedMemory: () => Promise<number>;
  getIpAddressAsync: () => Promise<string | null>;
  getNetworkStateTypeAsync: () => Promise<NetInfoStateType | undefined>;
  getFreeDiskStorage: () => Promise<number>;
}

interface ApplicationInfo {
  name: string;
  version: string;
  bundleId: string;
  buildNumber: string;
  env: 'AppStore' | 'TestFlight' | 'Other';
}

export const systemInfo: SystemInfo = {
  os: Platform.OS,
  isPad: (Platform as PlatformIOSStatic).isPad,
  version: String(Platform.Version),
  modelName: Device.getModel(),
  totalMemory: Device.getTotalMemorySync(),
  supportedCpuArchitectures: Device.supportedAbisSync(),
  uniqueId: Device.getUniqueId(),
  getUsedMemory: async () => Device.getUsedMemory(),
  getFreeDiskStorage: async () => Device.getFreeDiskStorage(),
  getIpAddressAsync: async () =>
    ((await NetInfo.fetch()) as NetInfoWifiState)?.details?.ipAddress,
  getNetworkStateTypeAsync: async () => (await NetInfo.fetch()).type,
};

export const applicationInfo: ApplicationInfo = {
  name: Device.getApplicationName(),
  version: Device.getVersion(),
  bundleId: Device.getBundleId(),
  buildNumber: Device.getBuildNumber(),
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

  static selection() {
    if (this.canUse()) return Haptics.selectionAsync();
  }
}

export function getUIFrame(): NavigationConstants {
  return services.nav.screens!.getConstants();
}
