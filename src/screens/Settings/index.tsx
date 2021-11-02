import React from 'react';
import {
  Switch,
  Share,
  Linking,
  StyleSheet,
  Text,
  Pressable,
  View,
  TouchableOpacity,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { NavigationComponentProps } from 'react-native-navigation';
import { useTranslation } from 'react-i18next';
import * as StoreReview from 'expo-store-review';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Application from 'expo-application';
import LinearGradient from 'react-native-linear-gradient';

import { ScreenName } from '@/screens';
import { services } from '@/services';
import { ELanguage } from '@/services/locale';
import config from '@/config';
import { useStore } from '@/store';
import { UserRole } from '@/store/user';
import { colors } from '@/utils/designSystem';
import { EUserType } from '@/services/db/user';
import { IListItem } from '@/components/List';
import CustomButton from '@/components/CustomButton';
import PasscodeLockOverlay, { EInputType } from '@/screens/PasscodeLock';
import SimpleSelectionList, {
  ISimpleSelectionListItem,
} from '@/components/SimpleSelectionList';
import { SafeAreaScrollView } from '@/components';
import { appearanceModeOptions } from './Theme';
import { platformInfo } from '@/utils';
import { DynamicUpdate } from '@/utils/dynamicUpdate';

import IconVip from '@/assets/icons/vip.svg';
import ImageVipCrown from '@/assets/images/vip/crown.svg';
import ImageVipRight from '@/assets/images/vip/right.svg';

function SettingsPage(props: NavigationComponentProps) {
  const { ui, global, user } = useStore();
  const { t, i18n } = useTranslation();

  function handleToPage(name: ScreenName) {
    services.nav.screens?.push(props.componentId, name);
  }

  const list: (
    | ISimpleSelectionListItem<IListItem | undefined>
    | undefined
    | null
  )[] = [
    user.userRole === UserRole.VIP
      ? {
          data: [
            {
              title: '隐私空间 高级版',
              icon: <IconVip width={26} />,
              onPress: handleToPurchases,
            },
          ],
        }
      : undefined,
    {
      data: [
        {
          title: t('setting:changePass'),
          onPress() {
            PasscodeLockOverlay.open({
              type: EInputType.Change,
              userType: user.userInfo?.type,
            });
          },
        },
        user.userInfo?.type === EUserType.ADMIN
          ? {
              title: t('fakePass:navigation.title'),
              onPress: () => handleToPage('FakePasswordSetting'),
            }
          : undefined,
        {
          title: t('autoLock:navigation.title'),
          onPress: () => handleToPage('AutoLockSetting'),
        },
        user.userInfo?.type === EUserType.ADMIN && global.localAuthTypes?.length
          ? {
              title: t('setting:autoLockAuth', {
                authType: global.localAuthTypes?.includes(
                  LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
                )
                  ? t('common:faceID')
                  : t('common:touchID'),
              }),
              render: () => (
                <Switch
                  value={global.settingInfo.autoLocalAuth}
                  onValueChange={value => {
                    global.setSettingInfo({
                      autoLocalAuth: value,
                    });
                  }}
                />
              ),
            }
          : undefined,
        {
          title: t('urgent:navigation.title'),
          onPress() {
            handleToPage('UrgentSetting');
          },
        },
        {
          title: t('setting:autoClearOrigin'),
          render: () => (
            <Switch
              value={global.settingInfo.autoClearOrigin}
              onValueChange={value => {
                global.setSettingInfo({
                  autoClearOrigin: value,
                });
              }}
            />
          ),
          onPress() {
            handleToPage('UrgentSetting');
          },
        },
      ].filter(item => item),
    },
    {
      data: [
        {
          title: t('appearance:navigation.title'),
          extra: appearanceModeOptions().find(item =>
            ui.isSystemAppearance
              ? item.value === 'system'
              : item.value === ui.appearance,
          )?.title,
          onPress: () => handleToPage('ThemeSetting'),
        },
        // {
        //   title: t('setting:language'),
        //   extra: languageOptions(t('common:followSystem')).find(
        //     item => item.value === ui.language,
        //   )?.title,
        //   onPress: () => handleToPage('LanguageSetting'),
        // },
        {
          title: t('setting:hapticFeedback'),
          render: () => (
            <Switch
              value={global.settingInfo.hapticFeedback}
              onValueChange={value => {
                global.setSettingInfo({
                  hapticFeedback: value,
                });
              }}
            />
          ),
        },
      ],
    },
    {
      data: [
        {
          title: t('setting:grade'),
          onPress: async () => {
            try {
              if (!(await StoreReview.hasAction())) {
                await StoreReview.requestReview();
              } else {
                toAppStoreReview();
              }
            } catch {
              toAppStoreReview();
            }

            function toAppStoreReview() {
              Linking.openURL(
                `https://apps.apple.com/app/apple-store/id${config.appId}?action=write-review`,
              );
            }
          },
        },
        {
          title: t('setting:feedback'),
          onPress: async () => {
            const updateMetadata = await DynamicUpdate.getUpdateMetadataAsync();
            const ip = await platformInfo.getIpAddressAsync();
            const networkType = await platformInfo.getNetworkStateTypeAsync();
            const installationTime =
              await Application.getInstallationTimeAsync();

            InAppBrowser.open(
              encodeURI(
                `${config.TXC_FEEDBACK_URL}?os=${platformInfo.os}&osVersion=${
                  platformInfo.version
                }&
                clientInfo=${JSON.stringify({
                  label: updateMetadata?.label,
                  packageHash: updateMetadata?.packageHash,
                  installationTime,
                })}&
                clientVersion=${Application.nativeApplicationVersion}&
                netType=${networkType}&
                customInfo=${JSON.stringify({
                  modelName: platformInfo.modelName,
                  supportedCpuArchitectures:
                    platformInfo.supportedCpuArchitectures,
                  ip,
                })}`,
              ),
              {
                dismissButtonStyle: 'close',
                preferredControlTintColor: ui.themes.primary,
                modalEnabled: false,
                animated: true,
                enableBarCollapsing: true,
              },
            );
          },
        },
        {
          title: t('setting:shareApp'),
          onPress: () => {
            Share.share({
              url:
                i18n.language === ELanguage.ZH_CN
                  ? config.APP_URL.cn
                  : config.APP_URL.global,
            });
          },
        },
        {
          title: t('about:navigation.title'),
          onPress: () => {
            services.nav.screens?.push(props.componentId, 'About');
          },
        },
      ],
    },
  ];

  return (
    <SafeAreaScrollView
      style={{
        backgroundColor:
          ui.appearance === 'dark'
            ? ui.colors.systemBackground
            : ui.colors.secondarySystemBackground,
      }}>
      {user.userRole === UserRole.NORMAL && <PurchasesCard />}
      <SimpleSelectionList sections={list} />
    </SafeAreaScrollView>
  );
}

function handleToPurchases() {
  services.nav.screens?.show('Purchase');
}

function PurchasesCard(): JSX.Element {
  const { ui } = useStore();
  return (
    <TouchableOpacity
      style={styles.purchasesCard}
      activeOpacity={0.8}
      onPress={handleToPurchases}>
      <LinearGradient
        style={styles.purchasesCardBg}
        start={{
          x: 0,
          y: 0.5,
        }}
        colors={['rgba(239, 134, 25, 0.6)', 'rgba(244, 164, 68, 0.5)']}
      />
      <ImageVipRight style={styles.vipRight} />
      <ImageVipCrown style={styles.vipCrown} />
      <View>
        <Text
          style={[
            styles.purchasesCardTitle,
            {
              color: colors.light.label,
            },
          ]}>
          隐私空间高级版
        </Text>
        <Text
          style={[
            styles.purchasesCardSubTitle,
            {
              color: ui.colors.secondaryLabel,
            },
          ]}>
          解锁全部特权
        </Text>
      </View>

      <CustomButton
        style={styles.purchasesCardButton}
        textStyle={styles.purchasesCardButtonText}
        color={colors.light.label}
        onPress={handleToPurchases}>
        立即开通
      </CustomButton>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  purchasesCard: {
    height: 160,
    marginTop: 30,
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
    padding: 20,
    overflow: 'hidden',
  },
  purchasesCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  purchasesCardSubTitle: {
    marginTop: 8,
  },
  purchasesCardButton: {
    width: 100,
    height: 34,
    borderRadius: 20,
  },
  purchasesCardButtonText: {
    fontSize: 13,
  },
  purchasesCardBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  vipRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  vipCrown: {
    position: 'absolute',
    bottom: '50%',
    right: 30,
  },
});

export default observer(SettingsPage);
