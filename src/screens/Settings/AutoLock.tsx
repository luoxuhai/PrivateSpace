import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation, TFunction } from 'react-i18next';

import { useStore } from '@/store';
import SimpleSelectionList from '@/components/SimpleSelectionList';
import { ICheckListItem } from '@/components/CheckList';
import { SafeAreaScrollView } from '@/components';

function AutoLockSettingScreen(): JSX.Element {
  const { ui, global } = useStore();

  const { t } = useTranslation();

  const options = useMemo(
    () => [
      {
        title: t('autoLock:tableViewHeader'),
        data: getAutoLockOptions(t),
        defaultValue: global.settingInfo.autoLockDuration,
        onChange(value) {
          global.setSettingInfo({
            autoLockDuration: Number(value),
          });
        },
      },
    ],
    [t, global],
  );

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

export function getAutoLockOptions(t: TFunction): ICheckListItem<number>[] {
  return [
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
  ];
}
