import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { FlatGrid } from 'react-native-super-grid';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { useTranslation } from 'react-i18next';

import { ScreenName } from '..';
import { services } from '@/services';
import { useStore, stores } from '@/store';
import { UIStore } from '@/store/ui';
import { UserRole } from '@/store/user';
import WebClient from '@/screens/Transfer/WebClient';

// import IconGlobe from '@/assets/icons/globe.svg';
import IconRectangleSwap from '@/assets/icons/rectangle.2.swap.svg';
import IconTrashCircle from '@/assets/icons/trash.circle.svg';

const iconProps = {
  fill: stores.ui?.colors?.white,
};

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

  const list = [
    {
      title: t('recycleBin:navigation.title'),
      icon: <IconTrashCircle width={30} height={30} {...iconProps} />,
      color: ui.colors.systemTeal,
      onPress: () => handlePushPage('RecycleBin'),
    },
    {
      title: 'WI-FI 互传',
      icon: <IconRectangleSwap width={30} height={30} {...iconProps} />,
      color: ui.colors.systemPurple,
      onPress: () => {
        if (user.userRole !== UserRole.VIP) {
          services.nav.screens?.show('Purchase');
          return;
        }

        handlePushPage('Transfer');
      },
    },
  ];

  return (
    <View>
      <FlatGrid
        style={[
          styles.flatGrid,
          {
            backgroundColor: ui.colors.systemBackground,
          },
        ]}
        itemDimension={160}
        spacing={17}
        data={list}
        renderItem={({ item }) => <Item item={item} ui={ui} />}
      />
    </View>
  );
};

function Item({ ui, item }: { ui: UIStore; item: any }): JSX.Element {
  return (
    <TouchableOpacity onPress={item.onPress} activeOpacity={0.8}>
      <View
        style={[
          itemStyles.container,
          {
            backgroundColor: item.color,
          },
        ]}>
        {item.icon}
        <Text style={itemStyles.title}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flatGrid: {
    height: '100%',
    marginHorizontal: -4,
  },
});

const itemStyles = StyleSheet.create({
  container: {
    height: 120,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
  },
});

export default observer(MiniAppsScreen);
