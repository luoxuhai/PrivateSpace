import React from 'react';
import { ScrollView, SafeAreaView, ScrollViewProps } from 'react-native';

interface ISafeAreaScrollView extends ScrollViewProps {
  children?: React.ReactNode;
}

export default function SafeAreaScrollView({
  children,
  ...props
}: ISafeAreaScrollView): JSX.Element {
  return (
    <ScrollView {...props}>
      <SafeAreaView>{children}</SafeAreaView>
    </ScrollView>
  );
}
