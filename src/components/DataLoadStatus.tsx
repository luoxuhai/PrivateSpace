import React from 'react';
import { ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { observer } from 'mobx-react-lite';

import { Empty } from './Empty';

interface IDataLoadStatus {
  loading?: boolean;
  text?: string;
  // TODO: 提示信息
  message?: string;
}

export const DataLoadStatus = observer<IDataLoadStatus>(props => {
  return props.loading ? (
    <ActivityIndicator style={styles.container} size="large" />
  ) : (
    <Empty style={styles.container} text={props.text} />
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: Dimensions.get('window').height / 2 - 120,
  },
});
