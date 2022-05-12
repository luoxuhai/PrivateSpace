import React from 'react';
import { Switch, Share, Linking } from 'react-native';
import { observer } from 'mobx-react-lite';
import { NavigationComponentProps } from 'react-native-navigation';
import { useTranslation } from 'react-i18next';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import * as LocalAuthentication from 'expo-local-authentication';

import { ScreenName } from '@/screens';
import { services } from '@/services';
import { ELanguage } from '@/locales';
import config from '@/config';
import { useStore } from '@/store';
import { UserRole } from '@/store/user';
import { EUserType } from '@/services/database/entities/user.entity';
import { IListItem } from '@/components/List';
import PasscodeLockOverlay, { EInputType } from '@/screens/PasscodeLock';
import SimpleSelectionList, {
  ISimpleSelectionListItem,
} from '@/components/SimpleSelectionList';
import { SafeAreaScrollView } from '@/components';
import PurchasesCard, { handleToPurchases } from '@/components/PurchasesCard';
import { appearanceModeOptions } from './Theme';
import { languageOptions } from './Language';
import { systemInfo, applicationInfo } from '@/utils';
import { getAutoLockOptions } from './AutoLock';
import { getUrgentOptions } from './Urgent';
import { SoftwareUpdateCard } from './SoftwareUpdate';

import IconVip from '@/assets/icons/vip.svg';

function SettingsPage(props: NavigationComponentProps) {
  const { ui, global, user } = useStore();
  const { t, i18n } = useTranslation();
  const localAuth = global.settingInfo.localAuth ?? true;

  function handleToPage(name: ScreenName) {
    services.nav.screens?.push(props.componentId, name);
  }

  const list: (
    | ISimpleSelectionListItem<IListItem | undefined>
    | undefined
    | null
  )[] = [
    user.userRole === UserRole.VIP && user.current?.type === EUserType.ADMIN
      ? {
          data: [
            {
              title: t('purchase:tableView.title'),
              icon: <IconVip width={26} height={26} />,
              onPress: handleToPurchases,
            },
          ],
        }
      : undefined,
    {
      data: [
        {
          title: t('setting:advanced.navigation.title'),
          onPress() {
            handleToPage('AdvancedSetting');
          },
        },
        {
          title: t('setting:changePass'),
          onPress() {
            PasscodeLockOverlay.open({
              type: EInputType.Change,
              userType: user.current?.type,
            });
          },
        },
        user.current?.type === EUserType.ADMIN
          ? {
              title: t('fakePass:navigation.title'),
              extra: global.settingInfo.fakePassword.enabled
                ? t('common:enabled')
                : null,
              onPress: () => handleToPage('FakePasswordSetting'),
            }
          : undefined,
        // user.current?.type === EUserType.ADMIN
        //   ? {
        //       title: t('fakePass:navigation.title'),
        //       extra: global.settingInfo.fakePassword.enabled
        //         ? t('common:enabled')
        //         : null,
        //       onPress: () => handleToPage('FakePasswordSetting'),
        //     }
        //   : undefined,
        {
          title: t('autoLock:navigation.title'),
          extra: getAutoLockOptions(t).find(
            o => o.value === global.settingInfo.autoLockDuration,
          )?.title,
          onPress: () => handleToPage('AutoLockSetting'),
        },
        user.current?.type === EUserType.ADMIN && global.localAuthTypes?.length
          ? {
              title: t('setting:localAuth', {
                authType: global.localAuthTypes?.includes(
                  LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
                )
                  ? t('common:faceID')
                  : t('common:touchID'),
              }),
              render: () => (
                <Switch
                  value={localAuth}
                  onValueChange={value => {
                    global.setSettingInfo({
                      localAuth: value,
                    });
                  }}
                />
              ),
            }
          : undefined,
        user.current?.type === EUserType.ADMIN &&
        localAuth &&
        global.localAuthTypes?.length
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
          extra: global.settingInfo.urgentSwitchUrl
            ? getUrgentOptions(t, ui).find(
                o => o.value === global.settingInfo.urgentSwitchUrl,
              )?.title
            : null,
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
        {
          title: t('setting:language'),
          extra: languageOptions(t('common:followSystem')).find(
            item => item.value === ui.language,
          )?.title,
          onPress: () => handleToPage('LanguageSetting'),
        },
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
          title: t('setting:feedback'),
          onPress: async () => {
            if (
              [ELanguage.ZH_CN, ELanguage.ZH_TW].includes(
                i18n.language as ELanguage,
              )
            ) {
              let networkType: string | undefined;
              try {
                networkType = await systemInfo.getNetworkStateTypeAsync();
              } catch {}

              const url = `${config.TXC_FEEDBACK_URL}?os=${
                systemInfo.os || '-'
              }&osVersion=${systemInfo.version || '-'}&clientVersion=${
                applicationInfo.version || '-'
              }&netType=${networkType || '-'}&customInfo=${JSON.stringify({
                modelName: systemInfo.modelName || '-',
                userId: user.current?.id || '-',
              })}`;

              InAppBrowser.open(encodeURI(url), {
                dismissButtonStyle: 'close',
                preferredControlTintColor: ui.themes.primary,
                modalEnabled: false,
                animated: true,
                enableBarCollapsing: true,
              });
            } else {
              Linking.openURL(`mailto:${config.email}`);
            }
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
  ].filter(item => item);

  return (
    <SafeAreaScrollView
      style={{
        backgroundColor:
          ui.appearance === 'dark'
            ? ui.colors.systemBackground
            : ui.colors.secondarySystemBackground,
      }}>
      <SoftwareUpdateCard componentId={props.componentId} />
      {user.userRole === UserRole.NORMAL && <PurchasesCard />}
      <SimpleSelectionList sections={list} />
    </SafeAreaScrollView>
  );
}

export default observer(SettingsPage);
