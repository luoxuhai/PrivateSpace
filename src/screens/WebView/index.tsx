import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewProps } from 'react-native-webview';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';

import { IWebViewScreenProps } from './type.d';

const WebViewScreen: NavigationFunctionComponent<
  IWebViewScreenProps & WebViewProps & NavigationComponentProps
> = props => {
  return (
    <WebView
      style={styles.container}
      source={{ uri: props.url }}
      contentInsetAdjustmentBehavior="automatic"
      startInLoadingState={props.startInLoadingState}
      cacheEnabled
      {...props}
    />
  );
};

WebViewScreen.options = props => ({
  topBar: {
    title: {
      text: props.title,
    },
    largeTitle: {
      visible: false,
    },
  },
});

const styles = StyleSheet.create({
  container: {},
});

export default WebViewScreen;
