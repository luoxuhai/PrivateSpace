import React, { Fragment } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/store';
import List, { IListItem } from './List';
import CheckList, { ICheckListItem, ICheckList } from './CheckList';

type ListType = 'check' | 'normal';

interface ISimpleSelectionList<
  T extends IListItem | ICheckListItem = IListItem,
> {
  style?: StyleProp<ViewStyle>;
  sections: (ISimpleSelectionListItem<T> | undefined | null)[];
  listType?: ListType;
}

export interface ISimpleSelectionListItem<T>
  extends Omit<ICheckList, 'options'> {
  title?: string;
  data: T[];
}

function SimpleSelectionList(props: ISimpleSelectionList): JSX.Element {
  return (
    <View style={props.style}>
      {props.sections
        .filter(section => section)
        .map((selection: any) => (
          <Fragment key={selection.title}>
            {props.listType === 'check' ? (
              <CheckList
                options={selection.data as ICheckListItem<string>[]}
                defaultValue={selection.defaultValue}
                value={selection.value}
                header={selection.title}
                onChange={selection.onChange}
              />
            ) : (
              <List data={selection.data} header={selection.title} />
            )}
          </Fragment>
        ))}
    </View>
  );
}

export default SimpleSelectionList;
