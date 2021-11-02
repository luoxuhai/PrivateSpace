import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import { observer } from 'mobx-react-lite';

import { clearPersistedStores } from '@/store';
import { services } from '@/services';

const DeveloperScreen: NavigationFunctionComponent<
  NavigationComponentProps
> = props => {
  useNavigationButtonPress(
    () => {
      services.nav.screens?.dismissModal('Developer');
    },
    props.componentId,
    'cancel',
  );

  return (
    <ScrollView>
      <Button
        title="清除数据库"
        onPress={() => {
          services.db.clear();
        }}
      />
      <Button
        title="清除 mobx persist"
        onPress={() => {
          clearPersistedStores();
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
  },
});

export default observer(DeveloperScreen);
