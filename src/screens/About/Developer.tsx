import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import { observer } from 'mobx-react-lite';
import { stat } from 'react-native-fs';

import { clearPersistedStores } from '@/store';
import { services } from '@/services';
import { DynamicUpdate } from '@/utils/dynamicUpdate';
import { THUMBNAIL_PATH, SOURCE_PATH, STATIC_PATH, TEMP_PATH } from '@/config';

const dirStats: {
  path: string;
  title: string;
  size?: number;
}[] = [
  {
    path: SOURCE_PATH,
    title: '资源',
  },
  {
    path: THUMBNAIL_PATH,
    title: '缩略图',
  },
  {
    path: STATIC_PATH,
    title: '静态文件',
  },
  {
    path: TEMP_PATH,
    title: '临时文件',
  },
];

const DeveloperScreen: NavigationFunctionComponent<
  NavigationComponentProps
> = props => {
  const [data, setData] = useState<any>([]);
  useNavigationButtonPress(
    () => {
      services.nav.screens?.dismissModal('Developer');
    },
    props.componentId,
    'cancel',
  );

  useEffect(() => {
    Promise.all(dirStats.map(item => stat(item.path))).then(value => {
      setData(
        value.map((item, index) => ({
          ...item,
          title: dirStats[index].title,
        })),
      );
    });
  }, []);

  return (
    <ScrollView>
      <Button
        title="清除数据库"
        onPress={() => {
          services.db.clear();
        }}
      />
      <Button
        title="清除 mobx persist"
        onPress={() => {
          clearPersistedStores();
        }}
      />
      <Button
        title="检测更新"
        onPress={() => {
          DynamicUpdate.sync(true);
        }}
      />
      <View>
        {data.map(item => {
          return (
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 5,
              }}>
              <Text>{item.title}：</Text>
              <Text>{item.size}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
  },
});

export default observer(DeveloperScreen);
