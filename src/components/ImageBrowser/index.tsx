import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { LazyPagerView, LazyPagerViewProps } from 'react-native-pager-view';

import ImageView, { ImageViewProps } from './ImageView';
import { ImageSource, LoadStatus } from './type.d';

export * from './type.d';

export type ImageBrowserProps = {
  initialIndex: number;
  images: ImageSource[];
  renderExtraElements?: (params: {
    index: number;
    loadStatus: LoadStatus;
  }) => JSX.Element | JSX.Element[] | null;
  onPageChanged?: (index: number) => void;
} & Pick<
  LazyPagerViewProps<ImageSource>,
  'buffer' | 'keyExtractor' | 'maxRenderWindow' | 'style'
> &
  Pick<
    ImageViewProps,
    | 'onScrollBeginDrag'
    | 'onScrollEndDrag'
    | 'onPress'
    | 'onDoublePress'
    | 'onLongPress'
    | 'onZoomScaleChange'
  >;

export interface ImageBrowserInstance {
  setPage: (index: number, animation?: boolean) => void;
  setScrollEnabled: (scrollEnabled: boolean) => void;
}

const ImageBrowser = forwardRef<ImageBrowserInstance, ImageBrowserProps>(
  (props, ref) => {
    const pagerViewRef = useRef<LazyPagerView<ImageSource>>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(
      props.initialIndex,
    );

    useImperativeHandle(ref, () => ({
      setPage(index: number, animation = true) {
        if (animation) {
          pagerViewRef.current?.setPage(index);
        } else {
          pagerViewRef.current?.setPageWithoutAnimation(index);
        }
      },
      setScrollEnabled(scrollEnabled: boolean) {
        pagerViewRef.current?.setScrollEnabled(scrollEnabled);
      },
    }));

    return (
      <LazyPagerView
        style={[styles.pageView, props.style]}
        ref={pagerViewRef}
        buffer={4}
        maxRenderWindow={20}
        pageMargin={20}
        overdrag
        initialPage={props.initialIndex}
        data={props.images}
        keyExtractor={props.keyExtractor ?? (item => item.id)}
        renderItem={({ item, index }) => (
          <ImageView
            source={item}
            inViewport={index === currentIndex}
            renderExtraElements={loadStatus =>
              props.renderExtraElements?.({ index, loadStatus })
            }
            onPress={props.onPress}
            onDoublePress={props.onDoublePress}
            onLongPress={props.onLongPress}
            onZoomScaleChange={props.onZoomScaleChange}
            onScrollEndDrag={props.onScrollEndDrag}
            onScrollBeginDrag={props.onScrollBeginDrag}
          />
        )}
        onPageSelected={e => {
          const index = e.nativeEvent.position;
          setCurrentIndex(index);
          props.onPageChanged?.(index);
        }}
      />
    );
  },
);

export default ImageBrowser;

const styles = StyleSheet.create({
  pageView: {
    flex: 1,
  },
});
