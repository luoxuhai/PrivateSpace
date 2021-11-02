import React from 'react';
import { StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
import SimpleSelectionList, {
  ISimpleSelectionListItem,
} from '@/components/SimpleSelectionList';
import { ICheckListItem } from '@/components/CheckList';
import { SafeAreaScrollView } from '@/components';

function AutoLockSettingScreen(): JSX.Element {
  const { ui, global } = useStore();

  const { t } = useTranslation();

  const options: ISimpleSelectionListItem<ICheckListItem<number>>[] = [
    {
      title: t('autoLock:tableViewHeader'),
      data: [
        {
          value: 0,
          title: t('autoLock:immediate'),
        },
        {
          value: 30,
          title: `30 ${t('common:second')}`,
        },
        {
          value: 60,
          title: `1 ${t('common:minute')}`,
        },
        {
          value: 60 * 5,
          title: `5 ${t('common:minute')}`,
        },
        {
          value: 60 * 60,
          title: `1 ${t('common:hour')}`,
        },
        {
          value: 60 * 60 * 5,
          title: `5 ${t('common:hour')}`,
        },
      ],
      defaultValue: global.settingInfo.autoLockDuration,
      onChange(value) {
        global.setSettingInfo({
          autoLockDuration: Number(value),
        });
      },
    },
  ];

  return (
    <SafeAreaScrollView
      style={[
        {
          backgroundColor:
            ui.appearance === 'dark'
              ? ui.colors.systemBackground
              : ui.colors.secondarySystemBackground,
        },
      ]}>
      <SimpleSelectionList
        style={styles.list}
        sections={options}
        listType="check"
      />
    </SafeAreaScrollView>
  );
}

export default observer(AutoLockSettingScreen);

const styles = StyleSheet.create({
  list: {
    marginTop: 20,
  },
});
