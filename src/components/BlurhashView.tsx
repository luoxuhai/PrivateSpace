import { merge } from 'lodash';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Blurhash, BlurhashProps } from 'react-native-blurhash';

interface BlurhashViewProps extends BlurhashProps {
  ratio?: number;
}

const defaultProps = {
  ratio: 1,
  decodeWidth: 32,
  resizeMode: 'contain',
};

export default function BlurhashView(props: BlurhashViewProps) {
  const mergedProps = merge(defaultProps, props);

  return (
    <Blurhash
      style={[styles.container, props.style]}
      decodeHeight={(mergedProps.decodeWidth as number) / mergedProps.ratio}
      {...mergedProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
