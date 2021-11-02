import React from 'react';
import {
  StyleSheet,
  Linking,
  Alert,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
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
      data: [
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
              source={require('@/assets/icons/app-icon/safari.png')}
            />
          ),
          title: '浏览器',
        },
        {
          value: EAppOpenUrl.Notes,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/notes.png')} />
          ),
          title: '备忘录',
        },
        {
          value: EAppOpenUrl.Photos,
          icon: (
            <AppIcon
              noRadius
              source={require('@/assets/icons/app-icon/photo.png')}
            />
          ),
          title: '相册',
        },
        {
          value: EAppOpenUrl.Mailto,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/email.png')} />
          ),
          title: '邮箱',
        },
        {
          value: EAppOpenUrl.QQ,
          icon: <AppIcon source={require('@/assets/icons/app-icon/qq.jpg')} />,
          title: 'QQ',
        },
        {
          value: EAppOpenUrl.Weixin,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/weixin.jpg')} />
          ),
          title: '微信',
        },
        {
          value: EAppOpenUrl.Douyin,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/douyin.jpg')} />
          ),
          title: '抖音',
        },
        {
          value: EAppOpenUrl.Bilibili,
          icon: (
            <AppIcon source={require('@/assets/icons/app-icon/bilibili.jpg')} />
          ),
          title: 'B站',
        },
      ],
      defaultValue: global.settingInfo.urgentSwitchUrl,
      async onChange(value) {
        console.log(value)
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
