import React from 'react';
import { observer } from 'mobx-react-lite';
import { Switch, ActionSheetIOS } from 'react-native';
import { useTranslation } from 'react-i18next';
import RNShare from 'react-native-share';
import * as MediaLibrary from 'expo-media-library';

import { SafeAreaScrollView } from '@/components';
import { useStore } from '@/store';
import { services } from '@/services';
import { UserRole } from '@/store/user';
import SimpleSelectionList from '@/components/SimpleSelectionList';
import { LoadingOverlay } from '@/components/LoadingOverlay';

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

  async function getAllFileUri() {
    return (await services.api.file.list({})).items
      .map(item => item.uri)
      .filter(item => item);
  }

  async function getAllPhotoUri() {
    return (await services.api.photo.list({})).items
      .map(item => item.uri)
      .filter(item => item);
  }

  async function handleExportToAlbum(urls: string[]) {
    LoadingOverlay.show();

    try {
      for (const url of urls) {
        await MediaLibrary.saveToLibraryAsync(url);
      }
    } catch {}

    LoadingOverlay.hide();
  }

  function handleExportToFile(urls: string[]) {
    if (!urls?.length) {
      return;
    }

    RNShare.open({
      urls,
      saveToFiles: true,
    });
  }

  function handleSelectDest() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: t('setting:advanced.exportData.destination.title'),
        options: [
          t('setting:advanced.exportData.destination.album'),
          t('setting:advanced.exportData.destination.file'),
          t('common:cancel'),
        ],
        cancelButtonIndex: 2,
      },
      async buttonIndex => {
        const urls = (await getAllPhotoUri()) as string[];
        switch (buttonIndex) {
          case 0:
            handleExportToAlbum(urls);
            break;
          case 1:
            handleExportToFile(urls);
        }
      },
    );
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
    {
      title: t('setting:advanced.exportData.title'),
      data: [
        {
          title: t('setting:advanced.exportData.album'),
          onPress: () => {
            handleSelectDest();
          },
        },
        {
          title: t('setting:advanced.exportData.file'),
          onPress: async () => {
            handleExportToFile((await getAllFileUri()) as string[]);
          },
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
