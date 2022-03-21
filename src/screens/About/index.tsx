import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Linking, Pressable } from 'react-native';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { useQuery } from 'react-query';
import Clipboard from '@react-native-clipboard/clipboard';
import { RNToasty } from 'react-native-toasty';

import { useStore } from '@/store';
import { services } from '@/services';
import config from '@/config';
import { ELanguage } from '@/locales';
import SimpleSelectionList from '@/components/SimpleSelectionList';
import { SafeAreaScrollView } from '@/components';
import { getAppIcon } from '@/utils/designSystem';
import { applicationInfo } from '@/utils';
import { DynamicUpdate } from '@/utils/dynamicUpdate';

const AboutScreen: NavigationFunctionComponent<
  NavigationComponentProps
> = () => {
  const { ui } = useStore();
  const { t, i18n } = useTranslation();
  const isDark = ui.appearance === 'dark';
  const webLanguageKey = useMemo(
    () => (i18n.language === ELanguage.ZH_CN ? 'zh_cn' : 'en_us'),
    [i18n.language],
  );

  const handleOpenBrowserPress = useCallback(
    ({ url }) => {
      InAppBrowser.open(url, {
        dismissButtonStyle: 'close',
        preferredControlTintColor: ui.themes.primary,
        modalEnabled: false,
        animated: true,
        enableBarCollapsing: true,
      });
    },
    [ui.themes.primary],
  );

  const sections = [
    {
      data: [
        {
          title: t('about:changelog'),
          onPress: () => {
            Linking.openURL(config.APP_URL.cn);
          },
          // handleOpenBrowserPress({
          //   url: `${config.CHANGELOG[webLanguageKey]}`,
          // }),
        },
        {
          title: t('setting:grade'),
          onPress: async () => {
            Linking.openURL(
              `https://apps.apple.com/app/apple-store/id${config.appId}?action=write-review`,
            );
          },
        },
      ],
    },
    {
      data: [
        {
          title: t('about:private'),
          onPress: () =>
            handleOpenBrowserPress({
              url: `${config.PRIVACY_POLICY_URL[webLanguageKey]}`,
            }),
        },
        {
          title: t('about:agreement'),
          onPress: () =>
            handleOpenBrowserPress({
              url: `${config.USER_AGREEMENT[webLanguageKey]}`,
            }),
        },
      ],
    },
    {
      title: t('about:connect'),
      data: [
        i18n.language === ELanguage.ZH_CN
          ? {
              title: t('about:QQgroup'),
              extra: config.qqGroup,
              onPress: async () => {
                if (await Linking.canOpenURL('mqq://')) {
                  Linking.openURL(
                    `mqq://card/show_pslcard?src_type=internal&version=1&uin=${config.qqGroup}&key=d6758f2f4dee2c7e73a455f674a888651b0c05e24904f7001cbad20f7f859f82&card_type=group&source=external`,
                  );
                } else {
                  Clipboard.setString(config.qqGroup);
                  RNToasty.Show({
                    title: '已复制群号',
                    position: 'top',
                  });
                }
              },
            }
          : null,
        {
          title: t('about:email'),
          extra: config.email,
          onPress: () => {
            Linking.openURL(`mailto:${config.email}`);
          },
        },
      ].filter(item => item),
    },
    // {
    //   title: t('about:moreApps'),
    //   onPress: () =>
    //     Linking.openURL(
    //       `https://apps.apple.com/developer/id${config.developerId}`,
    //     ),
    // },
  ];

  return (
    <SafeAreaScrollView
      style={[
        {
          backgroundColor: isDark
            ? ui.colors.systemBackground
            : ui.colors.secondarySystemBackground,
        },
      ]}>
      <IconCover />
      <SimpleSelectionList sections={sections} />
    </SafeAreaScrollView>
  );
};

const IconCover = observer(() => {
  const { ui, global } = useStore();
  const { version: appVersion, name: applicationName } = applicationInfo;

  const { data: updateMetadata } = useQuery('update.metadata', async () => {
    return await DynamicUpdate.getUpdateMetadataAsync();
  });

  const AppIcon = useMemo(() => getAppIcon(ui.appIcon), [ui.appIcon]);

  return (
    <View style={styles.iconCoverContainer}>
      <View
        style={[
          styles.logoContainer,
          {
            backgroundColor:
              ui.appearance === 'dark'
                ? ui.colors.secondarySystemBackground
                : ui.colors.systemBackground,
          },
        ]}>
        <AppIcon style={styles.logo} width="100%" height="100%" />
      </View>
      <Text
        style={[
          styles.name,
          {
            color: ui.colors.label,
          },
        ]}
        selectable>
        {applicationName}
      </Text>
      <Text
        style={{
          color: ui.colors.secondaryLabel,
        }}>
        V{appVersion}
        {updateMetadata?.label && ` (${updateMetadata.label.replace('v', '')})`}
      </Text>
      {(global.debug || __DEV__) && (
        <Pressable
          onPress={() => {
            services.nav.screens?.show('Developer');
          }}>
          <Text style={styles.debug}>调试模式</Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  iconCoverContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 12,
    padding: 12,
    borderRadius: 18,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debug: {
    marginTop: 10,
    color: 'red',
  },
});

export default observer(AboutScreen);
