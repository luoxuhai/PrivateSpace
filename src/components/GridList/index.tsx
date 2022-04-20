import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useMemo,
  memo,
} from 'react';
import {
  FlatListProps,
  SectionListProps,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import FlatGrid, { FlatGridInstance } from './FlatGrid';
import SectionGrid, { SectionGridInstance } from './SectionGrid';
import { systemInfo } from '@/utils';

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

const GridList = memo(
  forwardRef<GridListInstance, GridListProps>((props, ref) => {
    const { itemWidth, gutter, fixedItemWidth, style, ...restProps } = useMemo(
      () => ({ ...DEFAULT_PROPS, ...props }),
      [props],
    );
    const windowDimensions = useWindowDimensions();
    const containerWidth = restProps.containerWidth ?? windowDimensions.width;
    const flatListRef = useRef<GridListInstance>(null);

    const windowSize = useMemo(
      () => ((systemInfo.totalMemory ?? 0) >= 1024 * 1024 * 1024 * 3 ? 4 : 3),
      [],
    );

    return (
      <FlatGrid
        style={[styles.container, style]}
        ref={flatListRef}
        windowSize={windowSize}
        initialNumToRender={restProps.gridEnabled ? 10 : 15}
        {...restProps}
        spacing={gutter}
        itemDimension={itemWidth}
        fixed={fixedItemWidth}
        staticDimension={containerWidth}
        maxDimension={containerWidth}
      />
    );
  }),
);

interface GridSectionListProps extends Omit<GridListProps, 'data'> {
  sections: SectionListProps<any, any>['sections'];
}

export const GridSectionList = memo(
  forwardRef<
    SectionGridInstance,
    GridSectionListProps & SectionListProps<any, any>
  >((props, ref) => {
    const { itemWidth, gutter, fixedItemWidth, style, ...restProps } = useMemo(
      () => ({ ...DEFAULT_PROPS, ...props }),
      [props],
    );
    const windowDimensions = useWindowDimensions();
    const containerWidth = restProps.containerWidth ?? windowDimensions.width;
    const flatListRef = useRef<SectionGridInstance>(null);

    const windowSize = useMemo(
      () => ((systemInfo.totalMemory ?? 0) >= 1024 * 1024 * 1024 * 3 ? 3 : 2),
      [],
    );

    useImperativeHandle(ref, () => flatListRef.current!);

    return (
      <SectionGrid
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
  }),
);

export default GridList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
