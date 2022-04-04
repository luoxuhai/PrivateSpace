import React from 'react';
import { observer } from 'mobx-react-lite';
import { Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaScrollView } from '@/components';
import { useStore } from '@/store';
import { services } from '@/services';
import { UserRole } from '@/store/user';
import SimpleSelectionList from '@/components/SimpleSelectionList';

const AdvancedSetting = observer(() => {
  const { ui, global, user } = useStore();
  const { t } = useTranslation();

  function canOpen() {
    if (user.userRole !== UserRole.VIP) {
      services.nav.screens?.show('Purchase');
      return false;
    }

    return true;
  }

  const list = [
    {
      title: t('setting:advanced.smartSearch.header'),
      data: [
        {
          title: t('setting:advanced.smartSearch.title'),
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
