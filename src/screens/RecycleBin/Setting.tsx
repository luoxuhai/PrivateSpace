import React, { useMemo } from 'react';
import { StyleSheet, Switch } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
import { services } from '@/services';
import { UserRole } from '@/store/user';
import SimpleSelectionList, {
  ISimpleSelectionListItem,
} from '@/components/SimpleSelectionList';
import { ICheckListItem } from '@/components/CheckList';

import { SafeAreaScrollView } from '@/components';

function LanguageSettingScreen(): JSX.Element {
  const { ui, global, user } = useStore();
  const { t } = useTranslation();

  const suffix = useMemo(() => t('recycleBinSetting:day'), [t]);

  const keepOptions: ISimpleSelectionListItem<ICheckListItem<number>>[] = [
    {
      title: t('recycleBinSetting:durationHeader'),
      data: [
        {
          value: 3,
          title: '3' + suffix,
        },
        {
          value: 15,
          title: '15' + suffix,
        },
        {
          value: 30,
          title: '30' + suffix,
        },
        {
          value: 60,
          title: '60' + suffix,
        },
        {
          value: 90,
          title: '90' + suffix,
        },
        {
          value: 120,
          title: '120' + suffix,
        },
      ],
      value: global.settingInfo.recycleBin.keep ?? 30,
      onChange(value) {
        if (user.userRole === UserRole.VIP) {
          global.setSettingInfo({
            recycleBin: {
              ...global.settingInfo.recycleBin,
              keep: Number(value),
            },
          });
        } else {
          services.nav.screens?.show('Purchase');
        }
      },
    },
  ];

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
      <SimpleSelectionList
        sections={[
          {
            title: t('recycleBinSetting:enableHeader'),
            data: [
              {
                title: t('recycleBinSetting:enableTitle'),
                render: () => (
                  <Switch
                    value={global.settingInfo.recycleBin?.enabled}
                    onValueChange={checked => {
                      global.setSettingInfo({
                        recycleBin: {
                          ...global.settingInfo.recycleBin,
                          enabled: checked,
                        },
                      });
                    }}
                  />
                ),
              },
            ],
          },
        ]}
      />
      <SimpleSelectionList sections={keepOptions} listType="check" />
    </SafeAreaScrollView>
  );
}

export default observer(LanguageSettingScreen);

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
});
