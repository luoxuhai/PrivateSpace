import React, { useCallback, useMemo, useRef } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import FS from 'react-native-fs';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/store';
import { PopoverMenu, MenuItem } from '@/components/PopoverMenu';
import { useUpdateFile } from '@/hooks';
import { IListFileData } from '@/services/api/local/type.d';
import { services } from '@/services';
import { extname, getSourcePath } from '@/utils';

import IconPencil from '@/assets/icons/pencil.svg';
import IconTextBubble from '@/assets/icons/text.bubble.svg';
import { cloneDeep } from 'lodash';

interface IContextMenuProps {
  item: IListFileData;
  images: any[];
  disabled?: boolean;
  children?: React.ReactNode;
  onChange?: (value: any) => void;
}

export const MorePopoverMenu = observer<IContextMenuProps>(props => {
  const { ui } = useStore();
  const popoverRef = useRef();

  const { mutateAsync: updateFile } = useUpdateFile();

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
          key: 'rename',
          title: '重命名',
          icon: <IconPencil {...iconProps} width={16} height={16} />,
        },
        {
          key: 'description',
          title: '描述',
          icon: <IconTextBubble {...iconProps} width={16} height={16} />,
        },
        // {
        //   key: 'label',
        //   title: t('fileManage:list'),
        //   icon: <IconListBullet {...iconProps} width={16} height={16} />,
        // },
      ].map(item => ({
        ...item,
        onPress: () => handleMenuItemPress(item.key),
      })),
    [],
  );

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
                await updateFile({
                  where: {
                    id: props.item.id,
                  },
                  data: {
                    name: fullName,
                  },
                });
                FS.moveFile(
                  props.item.uri,
                  getSourcePath(props.item.extra!.source_id!, fullName),
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
        popoverRef.current?.setVisibility(false);
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
          onDismiss() {
            popoverRef.current?.setVisibility(false);
          },
        });
    }
  }, []);

  return (
    <PopoverMenu
      ref={popoverRef}
      menus={menus}
      permittedArrowDirections={['down']}>
      <TouchableOpacity
        onPress={() => {
          popoverRef.current?.setVisibility(true);
        }}>
        {props.children}
      </TouchableOpacity>
    </PopoverMenu>
  );
});
