import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import {
  ContextMenuButton,
  MenuConfig,
  OnPressMenuItemEventObject,
} from 'react-native-ios-context-menu';

interface PopoverMenuProps {
  menus: MenuConfig;
  permittedArrowDirections?: string[];
  children?: React.ReactNode;
  style?: ViewStyle;
  onPressMenuItem?: (event?: OnPressMenuItemEventObject) => void;
  onMenuWillShow?: () => void;
  onMenuWillHide?: () => void;
  onMenuDidShow?: () => void;
  onMenuDidHide?: () => void;
}

export type { MenuConfig };

export const PopoverMenu = observer<PopoverMenuProps>(props => {
  const [visibleOutside, setVisibleOutside] = useState(false);
  const window = useWindowDimensions();

  function hideOutsideView() {
    setVisibleOutside(false);
  }

  function showOutsideView() {
    setVisibleOutside(true);
  }

  const maskStyle: ViewStyle = {
    display: visibleOutside ? 'flex' : 'none',
    top: -window.width * 2,
    left: -window.width * 2,
    right: -window.width * 2,
    bottom: -window.height * 2,
  };

  return (
    <>
      <ContextMenuButton
        isMenuPrimaryAction
        menuConfig={props.menus}
        onMenuWillShow={showOutsideView}
        onMenuWillHide={hideOutsideView}
        {...props}>
        {props.children}
      </ContextMenuButton>
      <View style={[styles.mask, maskStyle]} />
    </>
  );
});

const styles = StyleSheet.create({
  mask: {
    opacity: 0,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F00',
  },
});
