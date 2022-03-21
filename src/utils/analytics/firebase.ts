import analytics, {
  FirebaseAnalyticsTypes,
} from '@react-native-firebase/analytics';

import { applicationInfo } from '../system';

export default applicationInfo.env === 'AppStore'
  ? analytics()
  : (null as null | FirebaseAnalyticsTypes.Module);
