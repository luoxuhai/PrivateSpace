import React from 'react';
import { View, Text, Button } from 'react-native';

const ErrorFallback = (props: { error: Error; resetError: () => void }) => (
  <View>
    <Text>Something happened!</Text>
    <Text>{props.error.toString()}</Text>
    <Button onPress={props.resetError} title={'Try again'} />
  </View>
);

export default ErrorFallback;
