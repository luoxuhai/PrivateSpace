import * as Sentry from '@sentry/react-native';
import { Navigation } from 'react-native-navigation';
import { DeviceMotion } from 'expo-sensors';
import { CaptureContext } from '@sentry/types';

import { systemInfo } from '@/utils/system';
import config from '@/config';
import { DynamicUpdate } from '@/utils/dynamicUpdate';

export async function initSentry(): PVoid {
  Sentry.init({
    debug: __DEV__,
    dsn: config.sentry.dsn,
    tracesSampleRate: config.sentry.tracesSampleRate,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: new Sentry.ReactNativeNavigationInstrumentation(
          Navigation,
        ),
      }),
    ],
  });
  const networkState = await systemInfo.getNetworkStateTypeAsync();
  const updateMetadata = await DynamicUpdate.getUpdateMetadataAsync();
  const motionAvailable = await DeviceMotion.isAvailableAsync();
  const usedMemory = await systemInfo.getUsedMemory();

  Sentry.setContext('deviceExtra', {
    arch: systemInfo.supportedCpuArchitectures,
    networkState,
    motionAvailable,
    usedMemory,
  });

  Sentry.setContext('appExtra', {
    dynamicUpdateMeta: {
      label: updateMetadata?.label,
    },
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
