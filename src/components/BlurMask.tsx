import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { VibrancyView } from '@react-native-community/blur';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { observer } from 'mobx-react-lite';

import { useStore, stores } from '@/store';

const BlurMask: NavigationFunctionComponent<NavigationComponentProps> = () => {
  const { ui } = useStore();
  return (
    <View style={[StyleSheet.absoluteFill]}>
      <Image source={{ uri: 'icon-40' }} />
      <VibrancyView
        style={[StyleSheet.absoluteFill]}
        blurType={ui.appearance === 'dark' ? 'materialDark' : 'xlight'}
        blurAmount={80}
      />
    </View>
  );
};

BlurMask.options = () => ({
  overlay: {
    interceptTouchOutside: false,
  },
  layout: {
    componentBackgroundColor:
      stores.ui.appearance === 'dark' ? 'rgba(0,0,0,0.5)' : 'transparent',
  },
});

export default observer(BlurMask);
