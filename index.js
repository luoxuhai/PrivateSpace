import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { Navigation } from 'react-native-navigation';

import { start } from './src/app';

Navigation.events().registerAppLaunchedListener(start);
