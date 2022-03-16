import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation, getI18n } from 'react-i18next';
import AppIconManager from 'react-native-dynamic-app-icon';
import ColorPicker from 'react-native-color-picker-ios';

import { useStore } from '@/store';
import { ICheckListItem } from '@/components/CheckList';
import { SafeAreaScrollView } from '@/components';
import { ListContainer, ListTitle } from '@/components/List';
import Icon from '@/components/Icon';
import { platformInfo, HapticFeedback } from '@/utils';
import SimpleSelectionList, {
  ISimpleSelectionListItem,
} from '@/components/SimpleSelectionList';
import {
  AppearanceMode,
  UIAppearance,
  EThemeName,
  EAppIcon,
} from '@/utils/designSystem';
import IconCheckMark from '@/assets/icons/checkmark.svg';

function ThemeSettingScreen(): JSX.Element {
  const { ui } = useStore();
  const { t } = useTranslation();

  const appearanceSections: ISimpleSelectionListItem<
    ICheckListItem<AppearanceMode>
  >[] = [
    {
      title: t('appearance:mode'),
      defaultValue: ui.isSystemAppearance ? 'system' : ui.appearance,
      data: appearanceModeOptions(),
      onChange: value => {
        ui.setAppearanceMode(value);
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
      {parseInt(platformInfo.version, 10) >= 13 && (
        <SimpleSelectionList listType="check" sections={appearanceSections} />
      )}
      <ListTitle title={t('appearance:theme')} />
      <ThemeColorList />
      <ListTitle title={t('appearance:appIcon')} />
      <AppIconList />
    </SafeAreaScrollView>
  );
}

const AppIconList = observer(() => {
  const { ui } = useStore();
  const [curIconName, setCurIconName] = useState<EAppIcon>(EAppIcon.Default);

  useEffect(() => {
    AppIconManager.getIconName(({ iconName }) => {
      setCurIconName(iconName as EAppIcon);
    });
  }, []);

  useEffect(() => {
    ui.setAppIcon(curIconName);
  }, [curIconName]);

  const appIcons = [
    {
      title: '默认',
      name: EAppIcon.Default,
      icon: require('@/assets/icons/app-icon/privatespace.png'),
    },
    {
      title: '深色',
      name: EAppIcon.Dark,
      icon: require('@/assets/icons/app-icon/privatespace.dark.png'),
    },
    {
      title: '橙色',
      name: EAppIcon.Orange,
      icon: require('@/assets/icons/app-icon/privatespace.orange.png'),
    },
  ];

  return (
    <ListContainer style={styles.listContainer}>
      <ScrollView horizontal>
        {appIcons.map(item => {
          const checked = curIconName === item.name;

          return (
            <TouchableOpacity
              style={styles.iconItemContainer}
              key={item.name}
              activeOpacity={0.8}
              onPress={async () => {
                HapticFeedback.impactAsync.light();
                const isSupported =
                  await AppIconManager.supportsDynamicAppIcon();
                if (isSupported) {
                  AppIconManager.setAppIcon(
                    item.name === EAppIcon.Default ? null : item.name,
                  );
                  setCurIconName(item.name);
                }
              }}>
              <Image
                style={[
                  styles.iconItem,
                  {
                    borderColor: ui.colors.quaternaryLabel,
                  },
                  checked && {
                    borderWidth: 2,
                    borderColor: ui.themes.primary,
                  },
                ]}
                source={item.icon}
              />
              <Text
                style={[
                  styles.iconTitle,
                  {
                    color: checked ? ui.themes.primary : ui.colors.label,
                    fontWeight: checked ? '500' : '400',
                  },
                ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ListContainer>
  );
});

const ThemeColorList = observer(() => {
  const { ui } = useStore();

  const themeSections = [
    {
      title: '默认',
      name: EThemeName.Blue,
      color: ui.colors.systemBlue,
    },
    {
      title: '橘色',
      name: EThemeName.Orange,
      color: ui.colors.systemOrange,
    },
    {
      title: '紫色',
      name: EThemeName.Purple,
      color: ui.colors.systemPurple,
    },
    {
      title: '红色',
      name: EThemeName.Red,
      color: ui.colors.systemRed,
    },
    {
      title: '水鸭蓝',
      name: EThemeName.Teal,
      color: ui.colors.systemTeal,
    },
    {
      title: '靛蓝',
      name: EThemeName.Indigo,
      color: ui.colors.systemIndigo,
    },
    {
      title: '绿色',
      name: EThemeName.Green,
      color: ui.colors.systemGreen,
    },
    parseInt(platformInfo.version, 10) >= 14 && {
      title: '自定义',
      name: EThemeName.Custom,
      color: ui.customThemeColor,
    },
  ];

  function handleColorPicker() {
    ColorPicker.showColorPicker(
      {
        supportsAlpha: false,
        initialColor: ui.customThemeColor,
        title: '自定义主题色',
      },
      color => {
        console.log(color);
        ui.setTheme(EThemeName.Custom, color);
      },
    );
  }

  const iconColor =
    ui.appearance === 'dark'
      ? ui.colors.secondarySystemBackground
      : ui?.colors?.systemBackground;

  return (
    <ListContainer style={styles.listContainer}>
      <>
        {(
          themeSections.filter(item => item) as {
            title: string;
            name: EThemeName;
            color: string;
          }[]
        ).map(item => {
          const checked = ui.themeName === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.8}
              onPress={() => {
                HapticFeedback.impactAsync.light();
                if (item.name === EThemeName.Custom) {
                  handleColorPicker();
                } else {
                  ui.setTheme(item.name);
                }
              }}>
              <View
                style={[
                  styles.themeItem,
                  styles.colorBlock,
                  {
                    backgroundColor: item.color,
                  },
                ]}>
                {item.name === EThemeName.Custom && !checked && (
                  <Icon name="ios-brush-outline" size={20} color={iconColor} />
                )}
                {checked &&
                  (item.name === EThemeName.Custom ? (
                    <Icon name="ios-brush" size={20} color={iconColor} />
                  ) : (
                    <IconCheckMark
                      style={styles.iconCheckMark}
                      fill={iconColor}
                      width={16}
                      height={16}
                    />
                  ))}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={styles.themeItem} />
      </>
    </ListContainer>
  );
});

export default observer(ThemeSettingScreen);

export const appearanceModeOptions = (): {
  title: string;
  value: UIAppearance;
}[] => {
  const t = getI18n().t;
  return [
    {
      title: t('common:followSystem'),
      value: 'system',
    },
    {
      title: t('appearance:light'),
      value: 'light',
    },
    {
      title: t('appearance:dark'),
      value: 'dark',
    },
  ];
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  themeItem: {
    margin: 6,
  },
  colorBlock: {
    width: 40,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCheckMark: {},
  colorName: {
    marginTop: 6,
    fontSize: 12,
  },
  iconItemContainer: {
    alignItems: 'center',
  },
  iconTitle: {
    fontSize: 12,
  },
  iconItem: {
    width: 60,
    height: 60,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
