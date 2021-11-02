import React from 'react';
import { Switch, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
import { services } from '@/services';
import List, { IListItem } from '@/components/List';
import { SafeAreaScrollView } from '@/components';
import PasscodeLock, { EInputType } from '@/screens/PasscodeLock';
import { EUserType } from '@/services/db/user';

function FakePasswordSettingScreen(): JSX.Element {
  const { ui, global, user } = useStore();
  const { t } = useTranslation();

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
                  enabled: value,
                },
              });
            }
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
    const result = await services.api.local.getUser({
      type: EUserType.GHOST,
    });

    return result.data?.password;
  }

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
      <List data={list} />
    </SafeAreaScrollView>
  );
}

export default observer(FakePasswordSettingScreen);

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
});
