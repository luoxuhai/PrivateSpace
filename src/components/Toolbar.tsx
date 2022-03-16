import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { SvgProps } from 'react-native-svg';
import { useDeviceOrientation } from '@react-native-community/hooks';

import { useStore } from '@/store';
import { useUIFrame } from '@/hooks';
import { VibrancyView } from '@react-native-community/blur';
import { platformInfo } from '@/utils';

interface IToolbarItem {
  title: string;
  titleStyle?: TextStyle;
  key: string | number;
  icon?: React.FC<SvgProps>;
  iconProps?: SvgProps;
}

interface IToolbarProps extends ViewProps {
  visible: boolean;
  list: IToolbarItem[];
  disabled?: boolean;
  hideBorder?: boolean;
  onPress?: (key: string | number) => void;
}

export const Toolbar = observer<IToolbarProps>(
  ({
    list,
    visible = false,
    disabled = false,
    hideBorder = false,
    ...rest
  }) => {
    const { ui } = useStore();
    const orientation = useDeviceOrientation();
    const UIFrame = useUIFrame();

    const displayStyle: ViewStyle = {
      display: visible ? 'flex' : 'none',
    };

    const borderStyle: ViewStyle | undefined = hideBorder
      ? undefined
      : {
          borderColor: ui.colors.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
        };

    const paddingStyle = {
      paddingBottom: platformInfo.isPad || orientation.landscape ? 20 : 28,
    };

    return (
      <View
        style={[
          styles.container,
          rest.style,
          {
            borderColor: ui.colors.separator,
            minHeight: UIFrame.bottomTabsHeight,
          },
          displayStyle,
          borderStyle,
          paddingStyle,
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
                {
                  width: `${100 / list.length}%`,
                },
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
    );
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
    paddingTop: 5,
  },
  item: {
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
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
