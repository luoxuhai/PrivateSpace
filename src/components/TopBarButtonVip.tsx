import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { BounceIn } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import { services } from '@/services';

// import IconVip from '@/assets/icons/vip.svg';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const ICON_SIZE = 40;
const animation = require('@/assets/lottie/premium-gold.json');

function TopBarButtonVip() {
  return (
    <AnimatedTouchableOpacity
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
      }}
      entering={BounceIn.duration(400)}
      onPress={() => {
        services.nav.screens?.show('Purchase');
      }}>
      <LottieView source={animation} autoPlay loop />
      {/* <IconVip width={ICON_SIZE} height={ICON_SIZE} /> */}
    </AnimatedTouchableOpacity>
  );
}

export default TopBarButtonVip;
