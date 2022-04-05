import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';

interface QuickLookViewProps {
  url?: string;
  assetFileName?: string;
  style?: ViewStyle;
}

function QuickLookView(props: QuickLookViewProps) {
  return <RNQuickLookView {...props} />;
}

// eslint-disable-next-line no-var
var RNQuickLookView = requireNativeComponent('RNQuickLookView');

export default QuickLookView;
