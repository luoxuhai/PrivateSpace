import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Button,
  PlatformColor,
} from 'react-native';
import { ShareMenuReactView } from 'react-native-share-menu';

const ShareScreen = () => {
  const [sharedData, setSharedData] =
    useState<{ mimeType: string; data: string }[]>();

  const isLoading = false;
  useEffect(() => {
    ShareMenuReactView.data()
      .then(result => {
        setSharedData(result);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const handleAddPress = useCallback(async () => {
    ShareMenuReactView.continueInApp();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Button
            title="关闭"
            onPress={() => {
              ShareMenuReactView.dismissExtension();
            }}
            color={PlatformColor('systemRed')}
          />
          <Button
            title={isLoading ? '添加中...' : '添加'}
            onPress={handleAddPress}
            disabled={isLoading}
          />
        </View>
        <View style={styles.content}>
          {sharedData && (
            <Text style={styles.tip}>
              添加{sharedData?.length}个图片或视频到默认相册
            </Text>
          )}
          {sharedData && sharedData?.[0]?.mimeType?.startsWith('image/') && (
            <Image
              style={styles.image}
              resizeMode="cover"
              source={{ uri: sharedData?.[0]?.data }}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  body: {
    height: 300,
    borderRadius: 10,
    backgroundColor: PlatformColor('systemBackground'),
    padding: 10,
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tip: {
    marginBottom: 20,
    textAlign: 'center',
    color: PlatformColor('label'),
  },
  destructive: {
    color: 'red',
  },
  send: {
    color: 'blue',
  },
  sending: {
    color: 'grey',
  },
  imageBox: {
    overflow: 'hidden',
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 4,
  },
  buttonGroup: {
    alignItems: 'center',
  },
});

export default ShareScreen;
