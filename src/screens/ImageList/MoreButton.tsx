import React, { useCallback, useMemo, useRef } from 'react';
import { TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ContextMenuButton } from 'react-native-ios-context-menu';

import { useStore } from '@/store';
import { platformInfo } from '@/utils';
import { PopoverMenu, MenuItem } from '@/components/PopoverMenu';
import { IListFileData } from '@/services/api/local/type.d';
import IconEllipsisCircle from '@/assets/icons/ellipsis.circle.svg';
import IconSquareGrid from '@/assets/icons/square.grid.2x2.svg';
import IconListBullet from '@/assets/icons/list.bullet.svg';
import IconChevronUp from '@/assets/icons/chevron.up.svg';
import IconChevronDown from '@/assets/icons/chevron.down.svg';
import IconCheckmark from '@/assets/icons/checkmark.svg';

interface IContextMenuProps {
  item: IListFileData;
  albumId?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onDone?: () => void;
}

const getDefaultOrder = (key: string) => {
  switch (key) {
    case 'size':
    case 'ctime':
      return 'desc';
    default:
      return 'asc';
  }
};

const getMenuState = (value: boolean) => (value ? 'on' : 'off');

export const MoreButton = observer<IContextMenuProps>(props => {
  const { t } = useTranslation();
  const { ui, album } = useStore();
  const popoverRef = useRef();

  // const { refetch: refetchFileList } = useQuery(
  //   ['image.list.list.item', props.albumId],
  //   {
  //     enabled: false,
  //   },
  // );

  const iconProps = useMemo(
    () => ({
      width: 14,
      fill: ui.colors.label,
    }),
    [ui.colors],
  );

  const menus: MenuItem[] = useMemo(
    () =>
      [
        {
          key: 'gallery',
          title: t('fileManage:gallery'),
          checked: album.photoViewConfig?.view === 'gallery',
          icon: <IconSquareGrid {...iconProps} width={16} height={16} />,
        },
        {
          key: 'list',
          title: t('fileManage:list'),
          checked: album.photoViewConfig?.view === 'list',
          icon: <IconListBullet {...iconProps} width={16} height={16} />,
          withSeparator: true,
        },
        {
          key: 'ctime',
          title: t('fileManage:ctime'),
          checked: album.photoViewConfig?.sort.field === 'ctime',
        },
        {
          key: 'name',
          title: t('fileManage:name'),
          checked: album.photoViewConfig?.sort.field === 'name',
        },
        {
          key: 'size',
          title: t('fileManage:size'),
          checked: album.photoViewConfig?.sort.field === 'size',
        },
      ].map(menu => ({
        ...menu,
        icon:
          menu.icon ??
          (menu.checked &&
            (album.photoViewConfig?.sort.order === 'asc' ? (
              <IconChevronUp {...iconProps} />
            ) : (
              <IconChevronDown {...iconProps} />
            ))),
        checkedIcon: menu.checked && (
          <IconCheckmark {...iconProps} width={12} />
        ),
        onPress: () => handleMenuItemPress(menu.key),
      })),

    [t, album.photoViewConfig],
  );

  const handleMenuItemPress = useCallback((key: string) => {
    switch (key) {
      case 'name':
      case 'ctime':
      case 'size':
        album.setPhotoViewConfig({
          sort: {
            field: key,
            order:
              album.photoViewConfig?.sort.field === key
                ? album.photoViewConfig?.sort.order === 'asc'
                  ? 'desc'
                  : 'asc'
                : getDefaultOrder(key),
          },
        });
        props.onDone?.();
        break;
      case 'gallery':
      case 'list':
        album.setPhotoViewConfig({
          view: key,
        });
        break;
    }
    popoverRef.current?.setVisibility(false);
  }, []);

  const menuConfig = {
    menuTitle: '',
    menuItems: [
      {
        actionKey: 'gallery',
        actionTitle: t('fileManage:gallery'),
        menuState: getMenuState(album.photoViewConfig?.view === 'gallery'),
        icon: {
          iconType: 'SYSTEM',
          iconValue: 'square.grid.2x2',
        },
      },
      {
        actionKey: 'list',
        actionTitle: t('fileManage:list'),
        menuState: getMenuState(album.photoViewConfig?.view === 'list'),
        icon: {
          iconType: 'SYSTEM',
          iconValue: 'list.bullet',
        },
      },
      {
        menuTitle: '',
        menuOptions: ['displayInline'],
        menuItems: [
          {
            actionKey: 'ctime',
            actionTitle: t('fileManage:ctime'),
            menuState: getMenuState(
              album.photoViewConfig?.sort.field === 'ctime',
            ),
          },
          {
            actionKey: 'name',
            actionTitle: t('fileManage:name'),
            menuState: getMenuState(
              album.photoViewConfig?.sort.field === 'name',
            ),
          },
          {
            actionKey: 'size',
            actionTitle: t('fileManage:size'),
            menuState: getMenuState(
              album.photoViewConfig?.sort.field === 'size',
            ),
          },
        ].map(item => ({
          ...item,
          icon: {
            iconType: 'SYSTEM',
            iconValue:
              item.menuState === 'on' &&
              (album.photoViewConfig?.sort.order === 'asc'
                ? 'chevron.up'
                : 'chevron.down'),
          },
        })),
      },
    ],
  };

  const button = useMemo(
    () => (
      <TouchableOpacity activeOpacity={0.5}>
        <IconEllipsisCircle
          style={styles.icon}
          width={24}
          height={24}
          fill={ui.themes.primary}
        />
      </TouchableOpacity>
    ),
    [ui.themes.primary],
  );

  return (
    <>
      {platformInfo.os === 'ios' && parseInt(platformInfo.version, 10) >= 14 ? (
        <ContextMenuButton
          isMenuPrimaryAction
          menuConfig={menuConfig}
          style={styles.contextMenuButton}
          onMenuDidShow={() => {
            album.setMoreContextVisible(true);
          }}
          onMenuWillHide={() => {
            album.setMoreContextVisible(false);
          }}
          onPressMenuItem={({ nativeEvent }) =>
            handleMenuItemPress(nativeEvent.actionKey)
          }>
          {button}
        </ContextMenuButton>
      ) : (
        <PopoverMenu
          ref={popoverRef}
          menus={menus}
          permittedArrowDirections={['up']}>
          <TouchableOpacity
            onPress={() => {
              popoverRef.current?.setVisibility(true);
            }}>
            {button}
          </TouchableOpacity>
        </PopoverMenu>
      )}
    </>
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
