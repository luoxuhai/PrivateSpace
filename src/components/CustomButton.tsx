import React from 'react';
import {
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  TextStyle,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import chroma from 'chroma-js';

import { stores } from '@/store';

interface IButtonProps extends TouchableOpacityProps {
  children?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  color?: string;
  loading?: boolean;
  disabled?: boolean;
}

export default function CustomButton(
  props: IButtonProps = {
    color: stores.ui.colors.white,
  },
): JSX.Element {
  const disabled = props.disabled || props.loading;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      {...props}
      disabled={disabled}
      style={StyleSheet.flatten([
        styles.button,
        props.style,
        {
          backgroundColor: props.color,
        },
        disabled && {
          backgroundColor: chroma(props.color!).luminance(0.1).css(),
        },
      ])}
      onPress={props.onPress}>
      {props.loading && (
        <ActivityIndicator
          style={styles.activityIndicator}
          animating={props.loading}
          color={stores.ui.colors.white}
        />
      )}

      <Text
        style={StyleSheet.flatten([
          styles.text,
          {
            color: stores.ui.colors.white,
          },
          props.textStyle,
        ])}>
        {props.children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  activityIndicator: {
    marginRight: 5,
  },
  text: {
    fontSize: 17,
    fontWeight: '500',
  },
});
