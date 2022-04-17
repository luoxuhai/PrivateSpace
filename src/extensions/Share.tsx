import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Button,
  PlatformColor,
  ActivityIndicator,
} from 'react-native';
import { ShareMenuReactView } from 'react-native-share-menu';
import FS from 'react-native-fs';
import Toast from 'react-native-toast-message';

import config from '@/config';
import { filename, extname } from '@/utils/path';
import { getLocalLanguage } from '@/utils/locale';

import CoverVideo from '@/assets/images/file/文件类型-缩略图-视频文件.svg';
import { useTranslation } from 'react-i18next';

function useSharedPath() {
  const [sharedPath, setSharedPath] = useState<string>();

  useEffect(() => {
    FS.pathForGroup(config.groupIdentifier).then(path => {
      setSharedPath(path);
    });
  }, []);

  return sharedPath;
}

function isImage(ext: string) {
  return /jpg|jpeg|gif|png|tiff|bmp|helc/.test(ext);
}

const ShareScreen = () => {
  const [sharedData, setSharedData] =
    useState<{ mimeType: string; data: string }[]>();
  const sharedPath = useSharedPath();
  const [saving, setSaving] = useState(false);
  const sourcePath = `${sharedPath}/Library/data/source`;
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(getLocalLanguage());
    ShareMenuReactView.data()
      .then(result => {
        setSharedData(result);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const handleAddPress = useCallback(async () => {
    if (!sharedData) return;

    const timer = setTimeout(() => {
      setSaving(true);
    }, 1000);

    try {
      await FS.mkdir(sourcePath, {
        NSURLIsExcludedFromBackupKey: true,
      });

      for (const item of sharedData) {
        const uri = decodeURI(item.data);

        await FS.copyFile(uri, `${sourcePath}/${filename(uri)}`);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('shareExtension:addStatus.fail'),
        text2: error.message,
      });
      return;
    } finally {
      clearTimeout(timer);
    }

    Toast.show({
      type: 'success',
      text1: t('shareExtension:addStatus.success'),
      topOffset: 100,
    });
    setSaving(false);
    setTimeout(() => {
      ShareMenuReactView.dismissExtension();
    }, 1500);
  }, [sharedData, sourcePath]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.body}>
          <View style={styles.header}>
            <Button
              title={t('shareExtension:close')}
              onPress={() => {
                ShareMenuReactView.dismissExtension();
              }}
              color={PlatformColor('systemRed')}
            />

            <View style={styles.button}>
              {saving ? (
                <ActivityIndicator />
              ) : (
                <Button
                  title={t('shareExtension:add')}
                  onPress={handleAddPress}
                  disabled={saving}
                />
              )}
            </View>
          </View>
          <View style={styles.content}>
            {sharedData && (
              <Text style={styles.tip}>
                {t('shareExtension:tip', {
                  count: sharedData?.length,
                })}
              </Text>
            )}
            {sharedData &&
            isImage(
              extname(sharedData?.[0].data)?.replace('.', '')?.toLowerCase(),
            ) ? (
              <Image
                style={styles.image}
                resizeMode="cover"
                source={{ uri: sharedData?.[0]?.data }}
              />
            ) : (
              <CoverVideo width={140} />
            )}
          </View>
        </View>
      </ScrollView>
      <Toast />
    </>
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
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 55,
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
