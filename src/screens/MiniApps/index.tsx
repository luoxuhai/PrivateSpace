import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { FlatGrid } from 'react-native-super-grid';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { useTranslation } from 'react-i18next';
import chroma from 'chroma-js';

import { ScreenName } from '..';
import { services } from '@/services';
import { useStore, stores } from '@/store';
import { UserRole } from '@/store/user';
import WebClient from '@/screens/Transfer/WebClient';

import IconICloud from '@/assets/icons/vip.icloud.svg';
import IconRectangleSwap from '@/assets/icons/rectangle.2.swap.svg';
import IconTrashCircle from '@/assets/icons/trash.circle.svg';

const iconProps = {
  fill: stores.ui?.colors?.white,
};

function luminance(color: string, l = 0.45) {
  return chroma(color).luminance(l).css();
}

const MiniAppsScreen: NavigationFunctionComponent<
  NavigationComponentProps
> = props => {
  const { ui, user } = useStore();
  const { t } = useTranslation();

  useEffect(() => {
    WebClient.update();
  }, []);

  function handlePushPage(name: ScreenName) {
    services.nav.screens?.push(props.componentId, name);
  }

  const canOpen = useCallback(() => {
    if (user.userRole === UserRole.VIP) {
      return true;
    } else {
      services.nav.screens?.show('Purchase');
      return false;
    }
  }, [user.userRole]);

  const list = [
    {
      title: t('recycleBin:navigation.title'),
      icon: <IconTrashCircle width={30} height={30} {...iconProps} />,
      color: luminance(ui.colors.systemOrange),
      onPress: () => handlePushPage('RecycleBin'),
    },
    {
      title: t('transfer:navigation.title'),
      icon: <IconRectangleSwap width={30} height={30} {...iconProps} />,
      color: luminance(ui.colors.systemGreen),
      onPress: () => {
        if (canOpen()) {
          handlePushPage('Transfer');
        }
      },
    },
    // {
    //   title: 'iCloud 备份',
    //   icon: <IconICloud width={30} height={30} {...iconProps} />,
    //   color: luminance(ui.colors.systemPurple, 0.4),
    //   onPress: () => {
    //     if (canOpen()) {
    //       handlePushPage('ICloud');
    //     }
    //   },
    // },
  ];

  const renderItem = useCallback(({ item }) => <Item item={item} />, []);

  return (
    <FlatGrid
      style={[
        {
          backgroundColor: ui.colors.systemBackground,
        },
      ]}
      itemDimension={160}
      spacing={17}
      data={list}
      renderItem={renderItem}
      keyExtractor={item => item.title}
    />
  );
};

function Item({ item }: { item: any }): JSX.Element {
  return (
    <TouchableOpacity onPress={item.onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: item.color,
          },
        ]}>
        {item.icon}
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default observer(MiniAppsScreen);
