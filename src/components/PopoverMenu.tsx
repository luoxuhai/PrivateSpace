import React from 'react';
import { View, Text, TouchableHighlight, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { PopoverView } from 'react-native-ios-popover';
import Popover from 'react-native-popover-view';
import chroma from 'chroma-js';

import { useStore } from '@/store';

interface IContextMenuProps {
  menus: MenuItem[];
  permittedArrowDirections?: string[];
  children?: React.ReactNode;
}

export interface MenuList {
  title?: string;
  onChange?: (key: string) => void;
  data: MenuItem[];
}

export interface MenuItem {
  key?: string;
  title?: string;
  subTitle?: string;
  icon?: JSX.Element;
  checkedIcon?: JSX.Element;
  /**
   * @default 'default'
   */
  type?: 'destructive' | 'default';
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 是否显示分段
   * @default false
   */
  withSeparator?: boolean;
  onPress?: () => void;
}

export const PopoverMenu = observer<
  IContextMenuProps,
  { toggleVisibility: () => void }
>(
  (props, ref) => {
    const { ui } = useStore();

    return (
      <PopoverView
        ref={ref}
        lazyPopover={false}
        permittedArrowDirections={props.permittedArrowDirections ?? []}
        popoverBackgroundColor={chroma(ui.colors.systemBackground)
          .alpha(0.4)
          .css()}
        renderPopoverContent={() => (
          <View style={styles.menuContainer}>
            {props.menus?.map((menu, index) => (
              <TouchableHighlight
                key={menu.key ?? menu.title}
                underlayColor={ui.colors.systemGray4}
                onPress={menu.onPress}>
                <View
                  style={[
                    styles.menuItem,
                    index !== props.menus.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: ui.colors.separator,
                    },
                    menu.withSeparator &&
                      StyleSheet.flatten([
                        styles.separator,
                        {
                          borderBottomColor: ui.colors.systemGray4,
                        },
                      ]),
                  ]}>
                  {menu.checkedIcon && (
                    <View style={styles.menuIcon}>{menu.checkedIcon}</View>
                  )}
                  <Text
                    style={[
                      styles.menuTitle,
                      {
                        color: ui.colors.label,
                      },
                    ]}>
                    {menu.title}
                  </Text>
                  {menu.icon}
                </View>
              </TouchableHighlight>
            ))}
          </View>
        )}>
        {props.children}
      </PopoverView>
    );
  },
  {
    forwardRef: true,
  },
);

const styles = StyleSheet.create({
  menuContainer: {
    width: 250,
  },
  menuItem: {
    padding: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuTitle: {
    fontSize: 17,
    marginRight: 'auto',
    marginLeft: 4,
  },
  menuIcon: {
    width: 16,
  },
  separator: {
    borderBottomWidth: 8,
  },
});
