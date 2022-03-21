import React, { useCallback } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import FS from 'react-native-fs';
import { observer } from 'mobx-react-lite';
import { cloneDeep } from 'lodash';

import { PopoverMenu, MenuConfig } from '@/components/PopoverMenu';
import { useUpdateFile } from '@/hooks';
import { services } from '@/services';
import { extname, getSourcePath } from '@/utils';

interface IContextMenuProps {
  item: API.PhotoWithSource;
  images: API.PhotoWithSource[];
  disabled?: boolean;
  children?: React.ReactNode;
  onChange?: (value: any) => void;
}

export const MorePopoverMenu = observer<IContextMenuProps>(props => {
  const { mutateAsync: updateFile } = useUpdateFile();

  const menus: MenuConfig = {
    menuTitle: '',
    menuItems: [
      {
        actionKey: 'description',
        actionTitle: '描述',
        icon: {
          iconType: 'SYSTEM',
          iconValue: 'text.bubble',
        },
      },
      {
        actionKey: 'rename',
        actionTitle: '重命名',
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
          '重命名',
          undefined,
          [
            {
              text: '取消',
              style: 'cancel',
            },
            {
              text: '确定',
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
      }}>
      <TouchableOpacity>{props.children}</TouchableOpacity>
    </PopoverMenu>
  );
});
