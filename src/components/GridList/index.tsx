import React, { forwardRef, useRef, useImperativeHandle, useMemo } from 'react';
import { FlatListProps, StyleSheet, useWindowDimensions } from 'react-native';

import FlatGrid, { FlatGridInstance } from './FlatGrid';
import { platformInfo } from '@/utils';

export interface GridListProps extends FlatListProps<any> {
  data: any[];
  /** 项目固定宽度 */
  itemWidth?: number;
  /** 每个项目之间的间距 */
  gutter?: number;
  fixedItemWidth?: boolean;
  /** 外部间距 */
  externalGutter?: boolean;
  /** 列表容器宽度，默认为屏幕宽度 */
  containerWidth?: number;
  gridEnabled?: boolean;
}

export type GridListInstance = FlatGridInstance;

const DEFAULT_PROPS: Partial<GridListProps> = {
  gutter: 10,
  gridEnabled: false,
  horizontal: false,
  fixedItemWidth: false,
};

const GridList = forwardRef<GridListInstance, GridListProps>((props, ref) => {
  const { itemWidth, gutter, fixedItemWidth, style, ...restProps } = useMemo(
    () => ({ ...DEFAULT_PROPS, ...props }),
    [props],
  );
  const windowDimensions = useWindowDimensions();
  const containerWidth = restProps.containerWidth ?? windowDimensions.width;
  const flatListRef = useRef<GridListInstance>(null);

  const windowSize = useMemo(
    () => ((platformInfo.totalMemory ?? 0) >= 1024 * 1024 * 1024 * 3 ? 3 : 2),
    [],
  );

  useImperativeHandle(ref, () => flatListRef.current!);

  return (
    <FlatGrid
      style={[styles.container, style]}
      ref={flatListRef}
      windowSize={windowSize}
      {...restProps}
      spacing={gutter}
      itemDimension={itemWidth}
      fixed={fixedItemWidth}
      staticDimension={containerWidth}
      maxDimension={containerWidth}
    />
  );
});

export default GridList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
