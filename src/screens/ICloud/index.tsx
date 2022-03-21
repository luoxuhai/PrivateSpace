import React, { useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import { FlatGrid } from 'react-native-super-grid';
import * as CloudStore from 'react-native-cloud-store';

import IconGlobe from '@/assets/icons/globe.svg';
import IconRectangleSwap from '@/assets/icons/rectangle.2.swap.svg';
import { useStore } from '@/store';
import Icon from '@/components/Icon';

function CloudSpaceScreen(props): JSX.Element {
  const { ui } = useStore();

  useEffect(() => {
    CloudStore.isICloudAvailable().then(async v => {
      await CloudStore.createDir('/PrivateSpace');
      const r = await CloudStore.stat('/33');
    });
  }, []);

  return <View />;
}

export default observer(CloudSpaceScreen);
