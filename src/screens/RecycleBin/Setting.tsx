import React from 'react';
import { StyleSheet, Switch } from 'react-native';
import { observer } from 'mobx-react-lite';

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

  const keepOptions: ISimpleSelectionListItem<ICheckListItem<number>>[] = [
    {
      title: '保留天数',
      data: [
        {
          value: 3,
          title: '3天',
        },
        {
          value: 15,
          title: '15天',
        },
        {
          value: 30,
          title: '30天',
        },
        {
          value: 60,
          title: '60天',
        },
        {
          value: 90,
          title: '90天',
        },
        {
          value: 120,
          title: '120天',
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
            title: '关闭后，删除的文件不可恢复',
            data: [
              {
                title: '开启回收站',
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
