import React from 'react';
import { Switch, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import * as LocalAuthentication from 'expo-local-authentication';

import { useStore } from '@/store';
import { services } from '@/services';
import List, { IListItem } from '@/components/List';
import { SafeAreaScrollView } from '@/components';
import PasscodeLock, { EInputType } from '@/screens/PasscodeLock';
import { EUserType } from '@/services/database/entities/user.entity';
import { useStat } from '@/hooks';

function FakePasswordSettingScreen(): JSX.Element {
  const { ui, global, user } = useStore();
  const { t } = useTranslation();
  useStat('FakePasswordSetting');

  const localAuthText = global.localAuthTypes?.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  )
    ? t('common:faceID')
    : t('common:touchID');

  const list: IListItem[] = [
    {
      title: t('fakePass:enable'),
      render: () => (
        <Switch
          value={global.settingInfo.fakePassword?.enabled}
          onValueChange={async value => {
            // 开启假密码时没有设置初始密码
            if (value && !(await getUserPassword())) {
              PasscodeLock.open({
                type: EInputType.Create,
                userType: EUserType.GHOST,
                async onClose() {
                  const password = await getUserPassword();
                  if (password) {
                    global.setSettingInfo({
                      fakePassword: {
                        ...global.settingInfo.fakePassword,
                        enabled: true,
                      },
                    });
                    user.setGhostUser({
                      password,
                    });
                  }
                },
              });
            } else {
              global.setSettingInfo({
                fakePassword: {
                  ...global.settingInfo.fakePassword,
                  enabled: value,
                },
              });
            }
          }}
        />
      ),
    },
    {
      title: `隐藏解锁界面${localAuthText}解锁按钮`,
      render: () => (
        <Switch
          disabled={!global.settingInfo.fakePassword?.enabled}
          value={global.settingInfo.fakePassword?.hideLocalAuth ?? false}
          onValueChange={value => {
            global.setSettingInfo({
              fakePassword: {
                ...global.settingInfo.fakePassword,
                hideLocalAuth: value,
              },
            });
          }}
        />
      ),
    },
    {
      title: `${
        user.ghostUser?.password ? t('common:change') : t('common:create')
      }${t('fakePass:navigation.title')}`,
      onPress() {
        PasscodeLock.open({
          type: user.ghostUser?.password
            ? EInputType.Change
            : EInputType.Create,
          userType: EUserType.GHOST,
        });
      },
    },
  ];

  async function getUserPassword() {
    const result = await services.api.user.get({
      type: EUserType.GHOST,
    });

    return result?.password;
  }

  const headerText = global.settingInfo.autoLocalAuth
    ? `开启后将关闭自动${localAuthText}识别解锁功能`
    : null;

  return (
    <SafeAreaScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            ui.appearance === 'dark'
              ? ui.colors.systemBackground
              : ui.colors.secondarySystemBackground,
        },
      ]}>
      <List data={list} header={headerText} />
    </SafeAreaScrollView>
  );
}

export default observer(FakePasswordSettingScreen);

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
});
