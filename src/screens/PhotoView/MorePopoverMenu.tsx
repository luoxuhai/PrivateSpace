import React, { useCallback } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import FS from 'react-native-fs';
import { observer } from 'mobx-react-lite';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';

import { PopoverMenu, MenuConfig } from '@/components/PopoverMenu';
import { useUpdateFile } from '@/hooks';
import { services } from '@/services';
import { extname, getSourcePath, HapticFeedback } from '@/utils';

interface IContextMenuProps {
  item: API.PhotoWithSource;
  images: API.PhotoWithSource[];
  disabled?: boolean;
  children?: React.ReactNode;
  onChange?: (value: any) => void;
}

export const MorePopoverMenu = observer<IContextMenuProps>(props => {
  const { mutateAsync: updateFile } = useUpdateFile();
  const { t } = useTranslation();

  const menus: MenuConfig = {
    menuTitle: '',
    menuItems: [
      {
        actionKey: 'description',
        actionTitle: t('photoView:toolbar.desc'),
        icon: {
          iconType: 'SYSTEM',
          iconValue: 'text.bubble',
        },
      },
      {
        actionKey: 'rename',
        actionTitle: t('photoView:toolbar.rename'),
        icon: {
          iconType: 'SYSTEM',
          iconValue: 'pencil',
        },
      },
    ],
  };

  function setCurrentFile(values: any) {
    const newImage = cloneDeep(props.images);
    for (const [index, item] of newImage.entries()) {
      if (item.id === props.item.id) {
        newImage[index] = {
          ...item,
          ...values,
        };
        break;
      }
    }

    return newImage;
  }

  const handleMenuItemPress = useCallback((key: string) => {
    switch (key) {
      case 'rename':
        Alert.prompt(
          t('photoView:toolbar.rename'),
          undefined,
          [
            {
              text: t('common:cancel'),
              style: 'cancel',
            },
            {
              text: t('common:confirm'),
              async onPress(value: string | undefined) {
                const name = value?.trim();
                if (!name || name === props.item.name) return;

                const fullName = `${name}${extname(props.item.name)}`;
                const sourceId = props.item.extra?.source_id as string;
                await updateFile({
                  where: {
                    id: props.item.id,
                  },
                  data: {
                    name: fullName,
                  },
                });
                FS.moveFile(
                  props.item.uri as string,
                  getSourcePath(sourceId, fullName),
                );

                props.onChange?.(
                  setCurrentFile({
                    name: fullName,
                  }),
                );
              },
            },
          ],
          'plain-text',
          props.item.name.replace(/\..+$/, ''),
        );
        break;
      case 'description':
        services.nav.screens?.show('DescriptionForm', {
          item: props.item,
          async onDone(value?: string) {
            await updateFile({
              where: {
                id: props.item.id,
              },
              data: {
                description: value,
              },
            });
            props.onChange?.(
              setCurrentFile({
                description: value,
              }),
            );
          },
        });
    }
  }, []);

  return (
    <PopoverMenu
      menus={menus}
      onPressMenuItem={event => {
        if (event?.nativeEvent.actionKey) {
          handleMenuItemPress(event?.nativeEvent.actionKey);
        }
      }}
      onMenuWillShow={() => {
        HapticFeedback.impactAsync.light();
      }}>
      <TouchableOpacity>{props.children}</TouchableOpacity>
    </PopoverMenu>
  );
});
