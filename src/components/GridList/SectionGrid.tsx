import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Dimensions,
  SectionList,
  SectionListProps,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { generateStyles, calculateDimensions, chunkArray } from './utils';

interface SectionGridProps extends SectionListProps<any> {
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

export type SectionGridInstance = Animated.FlatList & SectionList;

const defaultProps = {
  fixed: false,
  itemDimension: 120,
  spacing: 10,
  horizontal: false,
};

const SectionGrid = forwardRef<SectionGridInstance, SectionGridProps>(
  (props, ref) => {
    const {
      sections,
      style,
      spacing,
      fixed,
      itemDimension,
      staticDimension,
      maxDimension,
      renderItem: originalRenderItem,
      keyExtractor,
      onLayout,
      additionalRowStyle: externalRowStyle,
      itemContainerStyle,
      externalGutter,
      ...restProps
    } = useMemo(() => ({ ...defaultProps, ...props }), [props]);

    const [totalDimension, setTotalDimension] = useState(() => {
      let defaultTotalDimension = staticDimension;

      if (!staticDimension) {
        defaultTotalDimension = maxDimension || Dimensions.get('window').width;
      }

      return defaultTotalDimension;
    });

    const onLocalLayout = useCallback(
      e => {
        if (!staticDimension) {
          let { width: newTotalDimension } = e.nativeEvent.layout || {};

          if (maxDimension && newTotalDimension > maxDimension) {
            newTotalDimension = maxDimension;
          }

          if (totalDimension !== newTotalDimension) {
            setTotalDimension(newTotalDimension);
          }
        }

        // call onLayout prop if passed
        if (onLayout) {
          onLayout(e);
        }
      },
      [staticDimension, maxDimension, totalDimension, onLayout],
    );

    const renderRow = useCallback(
      ({
        renderItem,
        rowItems,
        rowIndex,
        section,
        itemsPerRow,
        rowStyle,
        separators,
        isFirstRow,
        containerStyle,
      }) => {
        // Add spacing below section header
        let additionalRowStyle = {};
        if (isFirstRow) {
          additionalRowStyle = {
            marginTop: spacing,
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
                    height: section.itemHeight ?? containerStyle.width,
                  },
                ]}>
                {renderItem({
                  item,
                  index: rowIndex * itemsPerRow + i,
                  section,
                  separators,
                  rowIndex,
                })}
              </View>
            ))}
          </View>
        );
      },
      [spacing, keyExtractor, externalRowStyle, itemContainerStyle],
    );

    const groupSectionsFunc = useCallback(
      section => {
        const { containerDimension, itemsPerRow, fixedSpacing } =
          calculateDimensions({
            itemDimension: section.itemWidth ?? itemDimension,
            staticDimension,
            totalDimension,
            spacing,
            fixed,
          });

        const chunkedData = chunkArray(section.data, itemsPerRow);
        const renderItem = section.renderItem || originalRenderItem;

        const { rowStyle, containerStyle } = generateStyles({
          itemDimension: section.itemWidth ?? itemDimension,
          containerDimension,
          spacing: section?.gutter ?? spacing,
          fixedSpacing,
          fixed,
          externalGutter: section?.externalGutter ?? externalGutter,
        });

        return {
          ...section,
          renderItem: ({ item, index, section }) =>
            renderRow({
              renderItem,
              rowItems: item,
              rowIndex: index,
              section,
              isFirstRow: index === 0,
              itemsPerRow,
              rowStyle,
              containerStyle,
            }),
          data: chunkedData,
          originalData: section.data,
        };
      },
      [originalRenderItem, renderRow, staticDimension, totalDimension],
    );

    const groupedSections = sections.map(groupSectionsFunc);

    const localKeyExtractor = useCallback(
      (rowItems, index) => {
        if (keyExtractor) {
          return rowItems
            .map((rowItem, rowItemIndex) => keyExtractor(rowItem, rowItemIndex))
            .join('_');
        }
        return `row_${index}`;
      },
      [keyExtractor],
    );

    return (
      <SectionList
        ref={ref}
        onLayout={onLocalLayout}
        extraData={totalDimension}
        sections={groupedSections}
        keyExtractor={localKeyExtractor}
        style={style}
        {...restProps}
      />
    );
  },
);

export default SectionGrid;
