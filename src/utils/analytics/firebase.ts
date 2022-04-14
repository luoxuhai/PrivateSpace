import analytics, {
  FirebaseAnalyticsTypes,
} from '@react-native-firebase/analytics';

import { applicationInfo, systemInfo } from '../system';
import config from '@/config';

const enabled =
  applicationInfo.env === 'AppStore' &&
  !config.testDevices.includes(systemInfo.uniqueId as string);

export default enabled
  ? analytics()
  : (null as null | FirebaseAnalyticsTypes.Module);
