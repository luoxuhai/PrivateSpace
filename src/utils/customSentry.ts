import * as Sentry from '@sentry/react-native';
import { Navigation } from 'react-native-navigation';
import * as Device from 'expo-device';
import { DeviceMotion } from 'expo-sensors';
import * as Network from 'expo-network';
import { CaptureContext } from '@sentry/types';

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
  const networkState = await Network.getNetworkStateAsync();
  const updateMetadata = await DynamicUpdate.getUpdateMetadataAsync();
  const motionAvailable = await DeviceMotion.isAvailableAsync();

  Sentry.setContext('deviceExtra', {
    arch: Device.supportedCpuArchitectures,
    networkState,
    motionAvailable,
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
