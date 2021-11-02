import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  OpaqueColorValue,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IconProps } from 'react-native-vector-icons/Icon';

export default function Icon(props: IconProps): JSX.Element {
  return <Ionicons {...props} />;
}

export function IconButton({
  containerStyle,
  onPress,
  ...rest
}: TouchableOpacityProps &
  IconProps & {
    color?: OpaqueColorValue | string;
    containerStyle?: StyleProp<ViewStyle>;
  }): JSX.Element {
  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      <Icon {...rest} />
    </TouchableOpacity>
  );
}
