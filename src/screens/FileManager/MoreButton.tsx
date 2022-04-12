import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { MenuConfig } from 'react-native-ios-context-menu';
import { PopoverMenu } from '@/components/PopoverMenu';
import { useStore } from '@/store';
import IconEllipsisCircle from '@/assets/icons/ellipsis.circle.svg';
import { HapticFeedback } from '@/utils';

interface IContextMenuProps {
  item: API.PhotoWithSource;
  albumId?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onRefetch?: (onCallback?: () => void) => void;
  onSelect?: () => void;
}

const getDefaultOrder = (key: string) => {
  switch (key) {
    case 'size':
    case 'ctime':
      return 'DESC';
    default:
      return 'ASC';
  }
};

const getMenuState = (value: boolean) => (value ? 'on' : 'off');

const MoreButton = observer<IContextMenuProps>(props => {
  const { t } = useTranslation();
  const { ui, file: fileStore } = useStore();

  const handleMenuItemPress = useCallback(
    (key: string) => {
      switch (key) {
        case 'name':
        case 'ctime':
        case 'size':
          const order = fileStore.orderBy?.[key];

          fileStore.setOrderBy({
            [key]: order
              ? order === 'ASC'
                ? 'DESC'
                : 'ASC'
              : getDefaultOrder(key),
          });
          props.onRefetch?.();
          break;
      }
    },
    [fileStore.view, fileStore.orderBy],
  );

  const menuConfig: MenuConfig = {
    menuTitle: '排序方式',
    menuItems: [
      {
        actionKey: 'ctime',
        actionTitle: t('fileManage:ctime'),
        menuState: getMenuState(!!fileStore.orderBy?.ctime),
      },
      {
        actionKey: 'name',
        actionTitle: t('fileManage:name'),
        menuState: getMenuState(!!fileStore.orderBy?.name),
      },
      {
        actionKey: 'size',
        actionTitle: t('fileManage:size'),
        menuState: getMenuState(!!fileStore.orderBy?.size),
      },
    ].map(item => ({
      ...item,
      icon: {
        iconType: 'SYSTEM',
        iconValue:
          item.menuState === 'on' &&
          (fileStore.orderBy?.[item.actionKey] === 'ASC'
            ? 'chevron.up'
            : 'chevron.down'),
      },
    })),
  };

  return (
    <PopoverMenu
      menus={menuConfig}
      style={styles.contextMenuButton}
      onMenuWillShow={() => {
        fileStore.setMoreContextVisible(true);
        HapticFeedback.impactAsync.light();
      }}
      onMenuWillHide={() => {
        fileStore.setMoreContextVisible(false);
      }}
      onPressMenuItem={({ nativeEvent }) =>
        handleMenuItemPress(nativeEvent.actionKey)
      }>
      <TouchableOpacity activeOpacity={0.5}>
        <IconEllipsisCircle
          style={styles.icon}
          width={24}
          height={24}
          fill={ui.themes.primary}
        />
      </TouchableOpacity>
    </PopoverMenu>
  );
});

export default MoreButton;

const styles = StyleSheet.create({
  popoverContent: {
    width: 250,
    height: 400,
  },
  contextMenuButton: {
    padding: 1,
    paddingLeft: 0,
  },
  menuItem: {
    padding: 16,
  },
  icon: {
    marginLeft: 5,
  },
});
