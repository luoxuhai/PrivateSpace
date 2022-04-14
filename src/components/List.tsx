import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { isUndefined } from 'lodash';

import IconChevronRight from '@/assets/icons/chevron.right.svg';
import { useStore, stores } from '@/store';

export interface IListProps {
  data?: IListItem[];
  style?: StyleProp<ViewStyle>;
  header?: React.ReactNode;
}

type ExtraValue = JSX.Element | string;

const renderIconRight = () => (
  <IconChevronRight fill={stores.ui.colors.opaqueSeparator} height={12} />
);

function List(props: IListProps): JSX.Element {
  const { colors } = useStore().ui;

  return (
    <>
      <ListTitle title={props.header} />
      <ListContainer style={props.style}>
        {props.data?.map(
          (item, index) =>
            item.renderItem?.() ?? (
              <TouchableHighlight
                key={item.title}
                underlayColor={colors.systemGray5}
                onPress={item.onPress}>
                {renderItem(item, index !== props.data!.length - 1)}
              </TouchableHighlight>
            ),
        )}
      </ListContainer>
    </>
  );
}

export default observer(List);

export const ListContainer = observer(
  ({
    children,
    style,
  }: {
    children?: JSX.Element | JSX.Element[];
    style?: StyleProp<ViewStyle>;
  }): JSX.Element => {
    const { colors, appearance } = useStore().ui;

    return (
      <View
        style={[
          styles.list,
          {
            backgroundColor:
              appearance === 'dark'
                ? colors.secondarySystemBackground
                : colors.systemBackground,
          },
          style,
        ]}>
        {children}
      </View>
    );
  },
);

export const ListTitle = observer(
  ({ title }: { title?: React.ReactNode }): JSX.Element | null => {
    const { colors } = useStore().ui;

    return title ? (
      <Text
        style={[
          styles.selectionTitle,
          {
            color: colors.secondaryLabel,
          },
        ]}>
        {title}
      </Text>
    ) : null;
  },
);

export interface IListItem {
  title?: ExtraValue;
  icon?: JSX.Element;
  extra?: ExtraValue;
  onPress?: () => void;
  render?: (() => JSX.Element) | null;
  renderItem?: (() => JSX.Element) | null;
}

const renderItem = (item: IListItem, hasBorder: boolean): JSX.Element => {
  return (
    <View style={styles.listItem}>
      {item.icon && <View style={styles.icon}>{item.icon}</View>}
      <View
        style={[
          styles.body,
          hasBorder && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: stores.ui.colors.systemGray4,
          },
        ]}>
        <Text
          style={[
            styles.title,
            {
              color: stores.ui.colors.label,
            },
          ]}
          numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.right}>
          {renderExtra(item.extra)}
          {isUndefined(item.render) ? renderIconRight() : item.render?.()}
        </View>
      </View>
    </View>
  );
};

const renderExtra = (value?: ExtraValue): JSX.Element | null => {
  return isUndefined(value) ? null : (
    <View style={styles.extra}>
      {typeof value === 'string' ? (
        <Text
          style={[
            styles.extraText,
            {
              color: stores.ui.colors.secondaryLabel,
            },
          ]}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    margin: 16,
    alignSelf: 'stretch',
    borderRadius: 10,
    overflow: 'hidden',
  },
  listItem: {
    minHeight: 45,
    paddingLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 15,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 14,
  },
  title: {
    marginRight: 12,
    fontSize: 17,
    flex: 1,
  },
  image: {
    width: 36,
    height: 36,
    borderRadius: 4,
  },
  right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  extra: {
    marginRight: 10,
  },
  extraText: {
    fontSize: 17,
  },
  selectionTitle: {
    fontSize: 13,
    marginHorizontal: 32,
    marginTop: 10,
    marginBottom: -8,
  },
});
