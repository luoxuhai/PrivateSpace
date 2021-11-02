import React from 'react';
import { StyleSheet, Switch } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
import SimpleSelectionList from '@/components/SimpleSelectionList';
import { SafeAreaScrollView } from '@/components';

function LanguageSettingScreen(): JSX.Element {
  const { ui, global } = useStore();
  const { t } = useTranslation();

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
    </SafeAreaScrollView>
  );
}

export default observer(LanguageSettingScreen);

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
});
