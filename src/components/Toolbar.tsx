import React, { useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextStyle,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { SvgProps } from 'react-native-svg';
import { useDeviceOrientation } from '@react-native-community/hooks';

import { useStore } from '@/store';
import { services } from '@/services';
import { VibrancyView } from '@react-native-community/blur';
import { platformInfo } from '@/utils';

interface IToolbarItem {
  title: string;
  titleStyle?: TextStyle;
  key: string | number;
  icon?: React.FC<SvgProps>;
  iconProps?: SvgProps;
}

interface IToolbarProps {
  visible: boolean;
  list: IToolbarItem[];
  disabled?: boolean;
  onPress?: (key: string | number) => void;
}

export const Toolbar = observer<IToolbarProps>(
  ({ list, visible = false, disabled = false, ...rest }) => {
    const { ui } = useStore();
    const orientation = useDeviceOrientation();
    const bottomTabsHeight = useMemo(
      () => services.nav.screens?.getConstants().bottomTabsHeight ?? 44,
      [orientation],
    );

    return visible ? (
      <View
        style={[
          styles.container,
          {
            borderColor: ui.colors.opaqueSeparator,
            height: bottomTabsHeight,
          },
          (platformInfo.isPad || orientation.landscape) && {
            paddingBottom: 20,
          },
        ]}>
        <VibrancyView
          style={StyleSheet.absoluteFill}
          blurType={ui.appearance === 'dark' ? 'extraDark' : 'materialLight'}
        />
        {list.map(item => {
          return (
            <TouchableOpacity
              disabled={disabled}
              style={[
                platformInfo.isPad || orientation.landscape
                  ? styles.itemRow
                  : styles.item,
              ]}
              key={item.key}
              onPress={() => {
                rest.onPress?.(item.key);
              }}>
              {item.icon && (
                <item.icon
                  width={24}
                  height={24}
                  {...item.iconProps}
                  fill={
                    disabled
                      ? ui.colors.systemGray3
                      : item.iconProps?.fill ?? ui.themes.primary
                  }
                />
              )}
              <Text
                style={[
                  styles.title,
                  item.icon &&
                    (platformInfo.isPad || orientation.landscape
                      ? styles.titleWithIconRow
                      : styles.titleWithIcon),
                  item.titleStyle,
                  {
                    color: disabled
                      ? ui.colors.systemGray3
                      : item.titleStyle?.color
                      ? item.titleStyle?.color
                      : item.icon
                      ? ui.colors.secondaryLabel
                      : ui.themes.primary,
                  },
                ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ) : null;
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 26,
    paddingTop: 6,
  },
  item: {
    alignItems: 'center',
    width: '25%',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '25%',
  },
  title: {
    fontSize: 17,
  },
  titleWithIcon: {
    fontSize: 10,
    marginTop: 6,
  },
  titleWithIconRow: {
    fontSize: 10,
    marginLeft: 6,
  },
});
