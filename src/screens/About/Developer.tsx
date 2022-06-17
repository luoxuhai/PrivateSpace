import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import { observer } from 'mobx-react-lite';
import { stat } from 'react-native-fs';

import { clearPersistedStores, useStore } from '@/store';
import { applicationInfo, systemInfo } from '@/utils/system';
import { services } from '@/services';
import { DynamicUpdate } from '@/utils/dynamicUpdate';
import { THUMBNAIL_PATH, SOURCE_PATH, STATIC_PATH, TEMP_PATH } from '@/config';
import useDynamicUpdateMetadata from '@/hooks/useDynamicUpdateMetadata';

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
  const updateMetadata = useDynamicUpdateMetadata();
  const { global } = useStore();

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
    <ScrollView style={styles.container}>
      {global.debug && (
        <>
          <Button
            title="清除数据库"
            onPress={() => {
              services.db.clear();
            }}
          />
          <Button
            title="清除 Storage"
            onPress={() => {
              clearPersistedStores();
            }}
          />
        </>
      )}
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
      <View>
        <Text selectable>uniqueId: {systemInfo.uniqueId}</Text>
        <Text>{JSON.stringify(applicationInfo ?? {}, null, 2)}</Text>
        <Text>{JSON.stringify(systemInfo ?? {}, null, 2)}</Text>
        <Text>{JSON.stringify(updateMetadata ?? {}, null, 2)}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
  },
});

export default observer(DeveloperScreen);
