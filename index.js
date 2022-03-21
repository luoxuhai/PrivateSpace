import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'intl-pluralrules';
import { Navigation } from 'react-native-navigation';

import { start } from './src/app';
import analytics from '@/utils/analytics/firebase';

Navigation.events().registerAppLaunchedListener(start);

Navigation.events().registerComponentDidAppearListener(
  ({ componentName, componentType }) => {
    if (componentType === 'Component' && analytics?.logScreenView) {
      analytics.logScreenView({
        screen_name: componentName,
        screen_class: componentName,
      });
    }
  },
);
