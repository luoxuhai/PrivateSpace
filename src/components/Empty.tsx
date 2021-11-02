import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/store';
import { useTranslation } from 'react-i18next';

interface IEmptyProps {
  text?: string;
  style?: StyleProp<ViewStyle>;
}

export const Empty = observer<IEmptyProps>(props => {
  const { ui } = useStore();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, props.style]}>
      <Text
        style={[
          styles.text,
          {
            color: ui.colors.secondaryLabel,
          },
        ]}>
        {props.text ?? t('common:noData')}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    fontSize: 20,
    fontWeight: '500',
  },
});
