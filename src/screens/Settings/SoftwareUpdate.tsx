import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import CodePush from 'react-native-code-push';
import { observer } from 'mobx-react-lite';

import List from '@/components/List';
import { DynamicUpdate } from '@/utils/dynamicUpdate';
import useDynamicUpdate from '@/hooks/useDynamicUpdateMetadata';
import useAppUpdate from '@/hooks/useAppUpdate';
import { useStore } from '@/store';
import config from '@/config';
import { services } from '@/services';

interface SoftwareUpdateCardProps {
  componentId: string;
}

export const SoftwareUpdateCard = observer<SoftwareUpdateCardProps>(props => {
  const { ui } = useStore();
  const { t } = useTranslation();
  const { data: updateMetadata } = useDynamicUpdate(
    CodePush.UpdateState.PENDING,
  );
  const appUpdateInfo = useAppUpdate();

  const isAppStoreUpdate = appUpdateInfo?.existNewVersion;
  const isMandatory = updateMetadata?.isMandatory;
  const needUpdate = isAppStoreUpdate || isMandatory;

  useEffect(() => {
    if (needUpdate) {
      const id = services.nav.screens?.get('Settings').id;
      if (id) {
        services.nav.screens?.N.mergeOptions(id, {
          bottomTab: {
            badge: '1',
          },
        });
      }
    }
  }, [needUpdate]);

  function handleUpdate() {
    if (isAppStoreUpdate) {
      Linking.openURL(config.APP_URL.urlSchema);
    } else if (isMandatory) {
      Alert.alert(
        t('appUpdate:card.alert.title'),
        t('appUpdate:card.alert.msg'),
        [
          {
            text: t('appUpdate:card.alert.ok'),
            style: 'default',
            onPress: () => {
              DynamicUpdate.restartApp();
            },
          },
        ],
      );
    }
  }

  return needUpdate ? (
    <List
      style={styles.card}
      data={[
        {
          title: t('appUpdate:card.title'),
          extra: (
            <View style={styles.extra}>
              <Text style={{ color: ui.colors.label }}>
                Version {appUpdateInfo?.latestVersion}
                {!isAppStoreUpdate &&
                  `-${updateMetadata?.labelWithoutPrefix ?? 0}`}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: ui.colors.systemRed,
                  },
                ]}
              />
            </View>
          ),
          onPress: handleUpdate,
        },
      ]}
    />
  ) : null;
});

const BADGE_SIZE = 16;

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  extra: {
    flexDirection: 'row',
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    marginLeft: 6,
  },
  safeAreaScrollView: {
    flex: 1,
  },
});
