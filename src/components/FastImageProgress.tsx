import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { createImageProgress } from 'react-native-image-progress';

const Image = createImageProgress(FastImage);

export default function FastImageProgress(props) {
  return (
    <Image
      renderIndicator={() => (
        <View
          style={{
            flex: 1,
            backgroundColor: 'red',
          }}
        />
      )}
      {...props}
    />
  );
}
