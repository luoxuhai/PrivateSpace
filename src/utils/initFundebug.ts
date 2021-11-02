import fundebug from 'fundebug-reactnative';
import * as Application from 'expo-application';
import config from '@/config';
import { platformInfo } from '@/utils';
import { DynamicUpdate } from '@/utils/dynamicUpdate';

export function initFundebug(): void {
  Application.getIosApplicationReleaseTypeAsync().then(async type => {
    if (type === Application.ApplicationReleaseType.APP_STORE) {
      const updateMetadata = await DynamicUpdate.getUpdateMetadataAsync();
      const ip = await platformInfo.getIpAddressAsync();
      const networkType = await platformInfo.getNetworkStateTypeAsync();

      fundebug.init({
        apikey: config.fundebugApiKey,
        releaseStage: 'production',
        appVersion: Application.nativeApplicationVersion ?? '',
        metaData: {
          updateMetadata: {
            label: updateMetadata?.label,
          },
          device: {
            modelName: platformInfo.modelName,
            supportedCpuArchitectures: platformInfo.supportedCpuArchitectures,
            totalMemory: platformInfo.totalMemory,
            os: platformInfo.os,
            version: platformInfo.version,
            networkType,
            ip,
          },
        },
      });
    }
  });
}
