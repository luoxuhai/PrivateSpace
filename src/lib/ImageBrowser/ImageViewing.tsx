/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, {
  ComponentType,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  StyleSheet,
  View,
  ModalProps,
  StyleProp,
  ViewStyle,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { LazyPagerView } from 'react-native-pager-view';

import ImageItem from './components/ImageItem';

import useRequestClose from './hooks/useRequestClose';
import { useUpdateEffect } from '@/hooks';
import { ImageSource } from './@types';

type Props = {
  images: ImageSource[];
  initialIndex: number;
  containerStyle?: StyleProp<ViewStyle>;
  presentationStyle?: ModalProps['presentationStyle'];
  animationType?: ModalProps['animationType'];
  backgroundColor?: string;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  delayLongPress?: number;

  HeaderComponent?: ComponentType<{ imageIndex: number }>;
  FooterComponent?: ComponentType<{ imageIndex: number }>;

  keyExtractor?: (imageSrc: ImageSource, index: number) => string;
  onImageExtraPress?: () => void;
  onRequestClose: () => void;
  onLongPress?: (image: ImageSource) => void;
  onDoublePress?: () => void;
  onZoomScale?: (scale: number) => void;
  onPress?: () => void;
  onPageChanged?: (index: number) => void;
};

const DEFAULT_DELAY_LONG_PRESS = 500;
const SWIPE_CLOSE_OFFSET = 75;
const SWIPE_CLOSE_VELOCITY = 1.55;

const ImageViewing = forwardRef(
  (
    {
      images,
      keyExtractor,
      initialIndex,
      onImageExtraPress,
      containerStyle,
      onRequestClose,
      onLongPress,
      onPress,
      onDoublePress,
      onZoomScale,
      onPageChanged,
      swipeToCloseEnabled,
      doubleTapToZoomEnabled,
      delayLongPress = DEFAULT_DELAY_LONG_PRESS,
    }: Props,
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const pagerViewRef = useRef<{
      setPage(page: number): void;
      setPageWithoutAnimation(page: number): void;
      setScrollEnabled(scrollEnabled: boolean): void;
    }>();
    const [opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);

    useImperativeHandle(ref, () => ({
      setPage(index: number, animated = true) {
        if (animated) {
          pagerViewRef.current?.setPage(index);
        } else {
          pagerViewRef.current?.setPageWithoutAnimation(index);
        }
        setCurrentIndex(index);
      },
      setScrollEnabled(enabled: boolean) {
        pagerViewRef.current?.setScrollEnabled(enabled);
      },
    }));

    // const [translate, scale] = getImageTransform(imageDimensions, SCREEN);
    const scrollValueY = new Animated.Value(0);

    const imageOpacity = scrollValueY.interpolate({
      inputRange: [-SWIPE_CLOSE_OFFSET, 0, SWIPE_CLOSE_OFFSET],
      outputRange: [0.5, 1, 0.5],
    });
    // const imagesStyles = getImageStyles(
    //   imageDimensions,
    //   translateValue,
    //   scaleValue,
    // );
    const imageStylesWithOpacity = { opacity: imageOpacity };

    const onScrollEndDrag = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const velocityY = nativeEvent?.velocity?.y ?? 0;
        const scaled = nativeEvent?.zoomScale > 1;
        onZoomScale?.(nativeEvent?.zoomScale);

        if (
          !scaled &&
          swipeToCloseEnabled &&
          Math.abs(velocityY) > SWIPE_CLOSE_VELOCITY
        ) {
          onRequestClose?.();
        }
      },
      [],
    );

    const onScroll = ({
      nativeEvent,
    }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = nativeEvent?.contentOffset?.y ?? 0;

      if (nativeEvent?.zoomScale > 1) {
        return;
      }

      scrollValueY.setValue(offsetY);
    };

    return (
      <Animated.View style={[styles.container, containerStyle, { opacity }]}>
        <LazyPagerView
          style={styles.pageView}
          ref={pagerViewRef}
          buffer={4}
          maxRenderWindow={20}
          pageMargin={20}
          overdrag
          initialPage={initialIndex}
          data={images}
          keyExtractor={keyExtractor ?? (item => item.id)}
          renderItem={({ item, index }) => {
            return (
              <ImageItem
                isDisplay={index === currentIndex}
                onImageExtraPress={onImageExtraPress}
                source={item}
                onRequestClose={onRequestCloseEnhanced}
                onLongPress={onLongPress}
                onPress={onPress}
                onScroll={onScroll}
                onScrollEndDrag={onScrollEndDrag}
                onZoomScale={onZoomScale}
                onDoublePress={onDoublePress}
                delayLongPress={delayLongPress}
                swipeToCloseEnabled={swipeToCloseEnabled}
                doubleTapToZoomEnabled={doubleTapToZoomEnabled}
              />
            );
          }}
          onPageSelected={e => {
            setCurrentIndex(e.nativeEvent.position);
            onPageChanged?.(e.nativeEvent.position);
          }}
        />
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
  },
  pageView: {
    width: '100%',
    height: '100%',
  },
});

export default ImageViewing;
