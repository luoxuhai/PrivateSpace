import React from 'react';
import { requireNativeComponent } from 'react-native';

interface QuickLookViewProps {
  url?: string;
  assetFileName?: string;
}

function QuickLookView(props: QuickLookViewProps) {
  return <RNQuickLookView {...props} />;
}

// eslint-disable-next-line no-var
var RNQuickLookView = requireNativeComponent('RNQuickLookView');

export default QuickLookView;
