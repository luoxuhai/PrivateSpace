import React from 'react';
import { observer } from 'mobx-react-lite';
import { Switch } from 'react-native';

import { SafeAreaScrollView } from '@/components';
import { useStore } from '@/store';
import { services } from '@/services';
import { UserRole } from '@/store/user';
import SimpleSelectionList from '@/components/SimpleSelectionList';

interface IAdvancedSettingProps {}

const AdvancedSetting = observer<IAdvancedSettingProps>(() => {
  const { ui, global, user } = useStore();

  function canOpen() {
    if (user.userRole !== UserRole.VIP) {
      services.nav.screens?.show('Purchase');
      return false;
    }

    return true;
  }

  const list = [
    {
      title: '智能搜索',
      data: [
        {
          title: '开启智能搜索',
          render: () => (
            <Switch
              value={global.settingInfo.advanced?.smartSearch?.enabled ?? false}
              onValueChange={value => {
                if (value && !canOpen()) {
                  return;
                }

                global.setSettingInfo({
                  advanced: {
                    smartSearch: {
                      enabled: value,
                    },
                  },
                });
              }}
            />
          ),
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
      <SimpleSelectionList sections={list} />
    </SafeAreaScrollView>
  );
});

export default AdvancedSetting;
