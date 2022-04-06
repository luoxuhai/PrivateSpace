import React from 'react';
import { ActivityIndicator } from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image';

import {
  createImageProgress,
  ImageProgressWrapperProps,
} from './ImageProgress';

const Image = createImageProgress(FastImage);

export default (
  props: Omit<ImageProgressWrapperProps, 'renderIndicator' | 'renderError'> &
    FastImageProps & {
      renderIndicator?: ImageProgressWrapperProps['renderIndicator'];
      renderError?: ImageProgressWrapperProps['renderError'];
    },
) => (
  <Image
    renderIndicator={() => <ActivityIndicator />}
    renderError={() => null}
    {...props}
  />
);
