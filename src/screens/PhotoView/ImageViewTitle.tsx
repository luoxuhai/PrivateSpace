import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/store';

export const ImageViewTitle = observer<{ title: string; subtitle: string }>(
  props => {
    const { ui } = useStore();
    const { width } = useWindowDimensions();

    return (
      <View style={styles.container}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: ui.colors.label,
              maxWidth: width - 150,
            },
          ]}
          ellipsizeMode="middle">
          {props.title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: ui.colors.label,
            },
          ]}>
          {props.subtitle}
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 11,
  },
});
