import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import IconCheckMark from '@/assets/icons/checkmark.svg';
import { useStore } from '@/store';
import { HapticFeedback } from '@/utils';
import { useUpdateEffect } from '@/hooks';
import List, { IListItem, IListProps } from './List';

type CheckValue = string | number;

export interface ICheckList<T extends CheckValue = CheckValue>
  extends Pick<IListProps, 'header'> {
  options: ICheckListItem<T>[];
  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
}

export interface ICheckListItem<T> {
  title: string;
  value: T;
  icon?: JSX.Element;
  onPress?: () => void;
  render?: () => JSX.Element;
}

function CheckList(props: ICheckList): JSX.Element {
  const [checkedValue, setCheckedValue] = useState<CheckValue>(
    props.defaultValue ?? props.options[0].value,
  );
  const { ui } = useStore();

  useUpdateEffect(() => {
    props.onChange?.(checkedValue);
  }, [checkedValue]);

  const renderIconCheckMark = () => (
    <IconCheckMark fill={ui?.themes?.primary} height={16} />
  );

  const data: IListItem[] | undefined = useMemo(
    () =>
      props.options?.map(item => ({
        title: item.title,
        icon: item.icon,
        onPress: () => {
          HapticFeedback.impactAsync.light();
          setCheckedValue(item.value);
        },
        render:
          (props.value ?? checkedValue) === item.value
            ? renderIconCheckMark
            : null,
      })),
    [props.options, checkedValue, props.value],
  );

  return <List data={data} header={props.header} />;
}

export default observer(CheckList);
