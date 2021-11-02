import React from 'react';
import { VibrancyView } from '@react-native-community/blur';
import { StyleSheet } from 'react-native';

export default () => (
  <VibrancyView
    style={{
      flex: 1,
    }}
    blurType="dark"
  />
);
