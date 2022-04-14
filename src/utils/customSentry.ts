import * as Sentry from '@sentry/react-native';
import { DeviceMotion } from 'expo-sensors';
import { CaptureContext } from '@sentry/types';
import CodePush from 'react-native-code-push';

import { systemInfo, applicationInfo } from '@/utils/system';
import config from '@/config';

export async function initSentry(): PVoid {
  let updateMetadata;
  try {
    updateMetadata = await CodePush.getUpdateMetadata();
  } catch {}
  const dist = updateMetadata?.label ?? '0';

  Sentry.init({
    debug: __DEV__,
    dsn: config.sentry.dsn,
    release: `${applicationInfo.bundleId}@${applicationInfo.version}(${applicationInfo.buildNumber})+codepush:${dist}`,
    dist,
    tracesSampleRate: config.sentry.tracesSampleRate,
  });

  const networkState = await systemInfo.getNetworkStateTypeAsync();
  const motionAvailable = await DeviceMotion.isAvailableAsync();
  const usedMemory = await systemInfo.getUsedMemory();

  Sentry.setContext('deviceExtra', {
    arch: systemInfo.supportedCpuArchitectures,
    networkState,
    motionAvailable,
    usedMemory,
  });

  Sentry.setContext('appExtra', {
    dynamicUpdateLabel: updateMetadata?.label,
  });
}

export { Sentry };

export class CustomSentry {
  static enabled = false;

  static async init(): PVoid {
    await initSentry();
    this.enabled = true;
  }

  static captureException(
    exception: any,
    captureContext?: CaptureContext | undefined,
  ): string | void {
    if (this.enabled) {
      return Sentry.captureException(exception, captureContext);
    }
  }
}
