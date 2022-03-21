import React, { forwardRef, useState, useCallback, useMemo } from 'react';
import { View, Dimensions, FlatListProps, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { chunkArray, calculateDimensions, generateStyles } from './utils';

interface FlatGridProps extends FlatListProps<any> {
  spacing?: number;
  fixed?: boolean;
  itemDimension?: number;
  maxDimension?: number;
  staticDimension?: number;
  horizontal?: boolean | null;
  externalGutter?: boolean;
  itemHeight?: number;
  gridEnabled?: boolean;
  additionalRowStyle?: ViewStyle;
  externalRowStyle?: ViewStyle;
  itemContainerStyle?: ViewStyle;
}

export type FlatGridInstance = Animated.FlatList;

const defaultProps = {
  fixed: false,
  itemDimension: 120,
  spacing: 10,
  horizontal: false,
  data: [],
};

const FlatGrid = forwardRef<FlatGridInstance, FlatGridProps>((props, ref) => {
  const {
    staticDimension,
    maxDimension,
    horizontal,
    spacing,
    externalRowStyle,
    itemContainerStyle,
    onLayout,
    keyExtractor,
    renderItem,
    itemDimension,
    data,
    fixed,
    style,
    externalGutter,
    itemHeight,
    gridEnabled,
    ...restProps
  } = useMemo(() => ({ ...defaultProps, ...props }), [props]);

  const [totalDimension, setTotalDimension] = useState(() => {
    let defaultTotalDimension = staticDimension;

    if (!staticDimension) {
      const dimension = props.horizontal ? 'height' : 'width';
      defaultTotalDimension =
        maxDimension || Dimensions.get('window')[dimension];
    }

    return defaultTotalDimension;
  });

  const onLayoutLocal = useCallback(
    e => {
      if (!staticDimension) {
        const { width, height } = e.nativeEvent.layout || {};
        let newTotalDimension = horizontal ? height : width;

        if (maxDimension && newTotalDimension > maxDimension) {
          newTotalDimension = maxDimension;
        }

        if (totalDimension !== newTotalDimension) {
          setTotalDimension(newTotalDimension);
        }
      }

      if (onLayout) {
        onLayout?.(e);
      }
    },
    [staticDimension, maxDimension, totalDimension, horizontal, onLayout],
  );

  const renderRow = useCallback(
    ({
      rowItems,
      rowIndex,
      separators,
      isLastRow,
      itemsPerRow,
      rowStyle,
      containerStyle,
    }) => {
      // To make up for the top padding
      let additionalRowStyle = {};
      if (isLastRow) {
        additionalRowStyle = {
          ...(!horizontal ? { marginBottom: spacing } : {}),
          ...(horizontal ? { marginRight: spacing } : {}),
        };
      }

      return (
        <View style={[rowStyle, additionalRowStyle, externalRowStyle]}>
          {rowItems.map((item, i) => (
            <View
              key={
                keyExtractor
                  ? keyExtractor(item, i)
                  : `item_${rowIndex * itemsPerRow + i}`
              }
              style={[
                containerStyle,
                itemContainerStyle,
                {
                  height: itemHeight ?? containerStyle.width,
                },
              ]}>
              {renderItem({
                item,
                index: rowIndex * itemsPerRow + i,
                separators,
              })}
            </View>
          ))}
        </View>
      );
    },
    [
      renderItem,
      spacing,
      keyExtractor,
      externalRowStyle,
      itemContainerStyle,
      horizontal,
    ],
  );

  const { containerDimension, itemsPerRow, fixedSpacing } = useMemo(
    () =>
      calculateDimensions({
        itemDimension,
        staticDimension,
        totalDimension,
        spacing,
        fixed,
      }),
    [
      itemDimension,
      staticDimension,
      totalDimension,
      spacing,
      fixed,
      gridEnabled,
    ],
  );

  const { containerStyle, rowStyle } = useMemo(
    () =>
      generateStyles({
        horizontal,
        itemDimension,
        containerDimension,
        spacing,
        fixedSpacing,
        fixed,
        externalGutter,
      }),
    [
      horizontal,
      itemDimension,
      containerDimension,
      spacing,
      fixedSpacing,
      fixed,
      externalGutter,
    ],
  );

  const rows = useMemo(
    () => chunkArray(data, itemsPerRow),
    [data, itemsPerRow],
  );

  const localKeyExtractor = useCallback(
    (rowItems, index) => {
      if (keyExtractor) {
        return rowItems
          .map((rowItem: any, rowItemIndex: number) =>
            keyExtractor(rowItem, rowItemIndex),
          )
          .join('_');
      }
      return `row_${index}`;
    },
    [keyExtractor],
  );

  return (
    <Animated.FlatList
      data={gridEnabled ? rows : data}
      extraData={totalDimension}
      entering={FadeIn.duration(500)}
      renderItem={
        gridEnabled
          ? ({ item, index }) =>
              renderRow({
                rowItems: item,
                rowIndex: index,
                isLastRow: index === rows.length - 1,
                itemsPerRow,
                rowStyle,
                containerStyle,
              })
          : renderItem
      }
      style={[
        {
          ...(horizontal ? { paddingLeft: spacing } : { paddingTop: spacing }),
        },
        style,
      ]}
      {...(gridEnabled && {
        onLayout: onLayoutLocal,
        keyExtractor: localKeyExtractor,
      })}
      {...restProps}
      horizontal={horizontal}
    />
  );
});

export default FlatGrid;
