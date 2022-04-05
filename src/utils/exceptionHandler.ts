import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';

import { CustomSentry } from './customSentry';

setJSExceptionHandler(error => {
  CustomSentry.captureException(error, {
    extra: {
      title: 'JSException',
    },
  });
}, true);

setNativeExceptionHandler(error => {
  CustomSentry.captureException(Error(error), {
    extra: {
      title: 'NativeException',
    },
  });
}, false);
