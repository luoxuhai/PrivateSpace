import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { observer } from 'mobx-react-lite';

import IconNodata from '@/assets/icons/nodata.svg';
import { useStore } from '@/store';

interface IEmptyWithIconProps {
  text?: string;
  style?: StyleProp<ViewStyle>;
}

export const EmptyWithIcon = observer<IEmptyWithIconProps>(props => {
  const { ui } = useStore();

  return (
    <View style={[styles.container, props.style]}>
      <IconNodata height={50} width={50} fill={ui.colors.secondaryLabel} />
      <Text
        style={[
          styles.text,
          {
            color: ui.colors.secondaryLabel,
          },
        ]}>
        {props.text ?? '无数据'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  text: {
    marginTop: 5,
  },
});
