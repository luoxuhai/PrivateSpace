import React from 'react';
import {
  StyleSheet,
  Linking,
  Alert,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation, TFunction } from 'react-i18next';

import { useStore } from '@/store';
import { locale } from '@/locales';
import { UIStore } from '@/store/ui';
import { EAppOpenUrl } from '@/store/global';
import SimpleSelectionList, {
  ISimpleSelectionListItem,
} from '@/components/SimpleSelectionList';
import { ICheckListItem } from '@/components/CheckList';
import { SafeAreaScrollView } from '@/components';
import IconXmarkCircle from '@/assets/icons/xmark.circle.svg';

const appIconStyle = {
  width: 30,
  height: 30,
};

const AppIcon = ({
  source,
  noRadius = false,
}: {
  source: ImageSourcePropType;
  noRadius?: boolean;
}) => (
  <Image
    style={[
      appIconStyle,
      !noRadius && {
        borderRadius: 4,
      },
    ]}
    source={source}
  />
);

function UrgentSettingScreen(): JSX.Element {
  const { ui, global } = useStore();
  const { t } = useTranslation();

  const options: ISimpleSelectionListItem<
    ICheckListItem<EAppOpenUrl | null>
  >[] = [
    {
      title: t('urgent:tableViewHeader'),
      data: getUrgentOptions(t, ui),
      defaultValue: global.settingInfo.urgentSwitchUrl,
      async onChange(value) {
        if (value !== null) {
          const res = await Linking.canOpenURL(value);
          if (!res) {
            Alert.alert('未安装该应用');
            return;
          }
        }

        global.setSettingInfo({
          urgentSwitchUrl: value,
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

export default observer(UrgentSettingScreen);

const styles = StyleSheet.create({
  list: {
    marginTop: 20,
  },
});

export function getUrgentOptions(t: TFunction, ui: UIStore) {
  const baseOptions = [
    {
      value: null,
      icon: (
        <IconXmarkCircle
          width={26}
          height={26}
          fill={ui.colors.secondaryLabel}
        />
      ),
      title: t('common:close'),
    },
    {
      value: EAppOpenUrl.Safari,
      icon: (
        <AppIcon
          noRadius
          source={require('@/assets/icons/app-icon/Safari.png')}
        />
      ),
      title: t('thirdPartyApp:browser'),
    },
    {
      value: EAppOpenUrl.Notes,
      icon: <AppIcon source={require('@/assets/icons/app-icon/Notes.png')} />,
      title: t('thirdPartyApp:note'),
    },
    {
      value: EAppOpenUrl.Photos,
      icon: (
        <AppIcon
          noRadius
          source={require('@/assets/icons/app-icon/Photos.png')}
        />
      ),
      title: t('thirdPartyApp:album'),
    },
    {
      value: EAppOpenUrl.Mailto,
      icon: <AppIcon source={require('@/assets/icons/app-icon/Mail.png')} />,
      title: t('thirdPartyApp:email'),
    },
  ];

  let options = baseOptions;

  if (locale.country === 'CN') {
    options = [
      ...baseOptions,
      ...[
        {
          value: EAppOpenUrl.QQ,
          icon: <AppIcon source={require('@/assets/icons/app-icon/qq.jpg')} />,
          title: t('thirdPartyApp:qq'),
        },
        {
          value: EAppOpenUrl.Weixin,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/WeChat.png')} />
          ),
          title: t('thirdPartyApp:wechat'),
        },
        {
          value: EAppOpenUrl.Douyin,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/TikTok.png')} />
          ),
          title: t('thirdPartyApp:douyin'),
        },
        {
          value: EAppOpenUrl.Kwai,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/Kwai.png')} />
          ),
          title: t('thirdPartyApp:kwai'),
        },
        {
          value: EAppOpenUrl.Bilibili,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/Bilibili.png')} />
          ),
          title: t('thirdPartyApp:bilibili'),
        },
      ],
    ];
  } else {
    options = [
      ...baseOptions,
      ...[
        {
          value: EAppOpenUrl.Facebook,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/Facebook.png')} />
          ),
          title: t('thirdPartyApp:facebook'),
        },
        {
          value: EAppOpenUrl.Twitter,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/Twitter.png')} />
          ),
          title: t('thirdPartyApp:twitter'),
        },
        {
          value: EAppOpenUrl.TikTok,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/TikTok.png')} />
          ),
          title: t('thirdPartyApp:tikTok'),
        },
        {
          value: EAppOpenUrl.Instagram,
          icon: (
            <AppIcon
              source={require('@/assets/icons/app-icon/Instagram.png')}
            />
          ),
          title: t('thirdPartyApp:instagram'),
        },
        {
          value: EAppOpenUrl.WeChat,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/WeChat.png')} />
          ),
          title: t('thirdPartyApp:wechat'),
        },
      ],
    ];
  }
  return options;
}
