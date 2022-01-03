import React, { useImperativeHandle, forwardRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Text,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { useDeviceOrientation } from '@react-native-community/hooks';

import { HapticFeedback } from '@/utils';
import { useUpdateEffect } from '@/hooks';
import { useStore } from '@/store';
import IconDeleteLeft from '@/assets/icons/delete.left.svg';

interface PasswordKeyboard {
  valueLength?: number;
  extraButton?: Element;
  style?: StyleProp<ViewStyle>;
  header?: JSX.Element;
  onChange?: (value: string) => void;
  onDone?: (value: string) => void;
}

const transform = new Animated.Value(0);
const x = transform.interpolate({
  inputRange: [-1, 1],
  outputRange: [-14, 14],
});

function applyBounceAnimate() {
  const timingConfig = {
    duration: 100,
    easing: Easing.bounce,
    useNativeDriver: true,
  };
  Animated.sequence([
    Animated.timing(transform, {
      ...timingConfig,
      toValue: 1,
    }),
    Animated.timing(transform, {
      ...timingConfig,
      toValue: -1,
    }),
  ]).start(({ finished }) => {
    if (finished) {
      transform.setValue(0);
    }
  });
}

function PasswordKeyboard(
  {
    valueLength = 4,
    extraButton,
    style,
    header,
    onChange,
    onDone,
  }: PasswordKeyboard,
  ref: any,
) {
  const { ui } = useStore();
  const [code, setCode] = useState('');
  const orientation = useDeviceOrientation();
  const { width } = useWindowDimensions();

  useUpdateEffect(() => {
    onChange?.(code);
  }, [code]);

  useImperativeHandle(ref, () => ({
    validateError() {
      setCode('');
      applyBounceAnimate();
      HapticFeedback.notificationAsync.error();
    },
    clear() {
      setCode('');
    },
  }));

  function onKeyPress(val: string) {
    const newPassword = code + val;
    if (newPassword.length <= valueLength) {
      setCode(newPassword);
      if (newPassword.length === valueLength) {
        onDone?.(code);
      }
    }
  }

  function onDelete() {
    setCode(code.slice(0, code.length - 1));
  }

  const keyItemStyle = [
    styles.keyItem,
    {
      backgroundColor: ui.colors.systemGray6,
    },
  ];

  const keyItemNumberStyle = [
    styles.keyItemNumber,
    {
      color: ui.colors.label,
    },
  ];

  const keyItemContainerStyle = [
    styles.keyItemContainer,
    orientation.landscape && {
      height: 90,
    },
  ];

  return (
    <View
      style={[
        styles.key,
        style,
        orientation.portrait &&
          width >= 600 && {
            width: 450,
          },
      ]}>
      <View
        style={[
          styles.header,
          orientation.landscape && {
            width: '50%',
          },
        ]}>
        {header}
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              width: '60%',
              transform: [{ translateX: x }],
            },
          ]}>
          {Array.from({ length: valueLength }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.inputDot,
                code.length > index && {
                  backgroundColor: ui.colors.label,
                },
                {
                  borderColor: ui.colors.label,
                },
              ]}
            />
          ))}
        </Animated.View>
      </View>
      <View
        style={[
          styles.keyWrapper,
          orientation.landscape && {
            width: '50%',
            marginBottom: 0,
          },
        ]}>
        {Array.from({ length: 9 }, (_, k) => String(k + 1)).map(keyValue => (
          <View style={keyItemContainerStyle} key={keyValue}>
            <TouchableOpacity
              key={keyValue}
              style={keyItemStyle}
              onPress={() => {
                onKeyPress(keyValue);
              }}>
              <Text style={keyItemNumberStyle}>{keyValue}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={keyItemContainerStyle}>{extraButton}</View>
        <View style={keyItemContainerStyle}>
          <TouchableOpacity
            style={keyItemStyle}
            onPress={() => onKeyPress('0')}>
            <Text style={keyItemNumberStyle}>0</Text>
          </TouchableOpacity>
        </View>

        <View style={keyItemContainerStyle}>
          {!!code && (
            <TouchableOpacity style={styles.keyDelete} onPress={onDelete}>
              <IconDeleteLeft width={32} height={32} fill={ui.colors.label} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  key: {
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 10,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 25,
  },
  inputDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  keyWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 25,
    marginBottom: 80,
  },
  keyItemContainer: {
    width: `${100 / 3}%`,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyItem: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  keyItemNumber: {
    fontSize: 30,
  },
  keyDelete: {
    padding: 20,
  },
});

export default forwardRef(PasswordKeyboard);
