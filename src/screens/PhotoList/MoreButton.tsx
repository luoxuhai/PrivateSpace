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

export const MoreButton = observer<IContextMenuProps>(props => {
  const { t } = useTranslation();
  const { ui, album } = useStore();

  const handleMenuItemPress = useCallback(
    (key: string) => {
      switch (key) {
        case 'name':
        case 'ctime':
        case 'size':
          const order = album.orderBy?.[key];

          album.setOrderBy({
            [key]: order
              ? order === 'ASC'
                ? 'DESC'
                : 'ASC'
              : getDefaultOrder(key),
          });
          props.onRefetch?.();
          break;
        case 'gallery':
        case 'list':
          album.setView(key);
          break;
        case 'select':
          props.onSelect?.();
      }
    },
    [album.view, album.orderBy],
  );

  const menuConfig: MenuConfig = {
    menuTitle: '',
    menuItems: [
      {
        actionKey: 'select',
        actionTitle: t('common:select'),
        icon: {
          iconType: 'SYSTEM',
          iconValue: 'checkmark.circle',
        },
      },
      {
        menuTitle: '',
        menuOptions: ['displayInline'],
        menuItems: [
          {
            actionKey: 'gallery',
            actionTitle: t('fileManage:gallery'),
            menuState: getMenuState(album.view === 'gallery'),
            icon: {
              iconType: 'SYSTEM',
              iconValue: 'square.grid.2x2',
            },
          },
          {
            actionKey: 'list',
            actionTitle: t('fileManage:list'),
            menuState: getMenuState(album.view === 'list'),
            icon: {
              iconType: 'SYSTEM',
              iconValue: 'list.bullet',
            },
          },
        ],
      },
      {
        menuTitle: '',
        menuOptions: ['displayInline'],
        menuItems: [
          {
            actionKey: 'ctime',
            actionTitle: t('fileManage:ctime'),
            menuState: getMenuState(!!album.orderBy?.ctime),
          },
          {
            actionKey: 'name',
            actionTitle: t('fileManage:name'),
            menuState: getMenuState(!!album.orderBy?.name),
          },
          {
            actionKey: 'size',
            actionTitle: t('fileManage:size'),
            menuState: getMenuState(!!album.orderBy?.size),
          },
        ].map(item => ({
          ...item,
          icon: {
            iconType: 'SYSTEM',
            iconValue:
              item.menuState === 'on' &&
              (album.orderBy?.[item.actionKey] === 'ASC'
                ? 'chevron.up'
                : 'chevron.down'),
          },
        })),
      },
    ],
  };

  return (
    <PopoverMenu
      menus={menuConfig}
      style={styles.contextMenuButton}
      onMenuWillShow={() => {
        album.setMoreContextVisible(true);
        HapticFeedback.impactAsync.light();
      }}
      onMenuWillHide={() => {
        album.setMoreContextVisible(false);
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
