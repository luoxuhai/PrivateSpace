import React from 'react';
import { View, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import { FlatGrid } from 'react-native-super-grid';
import Webview from 'react-native-webview';

import IconGlobe from '@/assets/icons/globe.svg';
import IconRectangleSwap from '@/assets/icons/rectangle.2.swap.svg';
import { useStore } from '@/store';
import Icon from '@/components/Icon';

function TransferPage(props): JSX.Element {
  const { ui } = useStore();

  return (
    <View>
      <View>
        <TextInput />
      </View>
      <Webview />
      <View />
    </View>
  );
}

export default observer(TransferPage);
