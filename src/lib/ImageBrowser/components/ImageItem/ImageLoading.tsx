/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

export const ImageLoading = () => {
  const SCREEN = useWindowDimensions();

  return (
    <View
      style={[
        styles.loading,
        {
          width: SCREEN.width,
          height: SCREEN.height,
        },
      ]}>
      <ActivityIndicator size="small" />
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
