import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  PlatformColor,
} from 'react-native';
import FastImage, { FastImageStaticProperties } from 'react-native-fast-image';
import { createImageProgress } from 'react-native-image-progress';
import { Blurhash } from 'react-native-blurhash';
import Animated, { FadeOut } from 'react-native-reanimated';

import { useUpdateEffect } from '@/hooks';
import { useDoubleTapToZoom, useMaxScale } from './hooks';
import {
  Dimensions,
  NativeSyntheticScrollEvent,
  NativeSyntheticTouchEvent,
  ImageSource,
  LoadStatus,
} from './type.d';

const Image = createImageProgress(FastImage);
const AnimatedBlurhash = Animated.createAnimatedComponent(Blurhash);

export interface ImageViewProps
  extends Pick<ScrollViewProps, 'onScrollEndDrag' | 'onScrollBeginDrag'> {
  source: ImageSource;
  inViewport: boolean;
  renderExtraElements?: (
    loadStatus: LoadStatus,
  ) => JSX.Element | JSX.Element[] | null | undefined;
  onPress?: () => void;
  onLongPress?: () => void;
  onDoublePress?: () => void;
  onZoomScaleChange?: (scale: number) => void;
}

// 开始缩放前的值
let beginZoomScale: number;
// onPressIn 事件值
let pressInEvent: NativeSyntheticTouchEvent['nativeEvent'];

function ImageView(props: ImageViewProps): JSX.Element {
  const [imageDimension, setImageDimension] = useState<Dimensions>();
  const [containerDimensions, setContainerDimensions] = useState<Dimensions>();
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.Loading);
  const loaded = loadStatus === LoadStatus.Succeeded;
  const [scaled, setScaled] = useState<boolean>(false);
  const maxScale = useMaxScale(imageDimension, containerDimensions);
  const scrollViewRef = useRef<ScrollView>(null);
  const handleDoublePress = useDoubleTapToZoom({
    scrollViewRef,
    scaled,
    containerDimensions,
    onDoublePress: props.onDoublePress,
    onPress: props.onPress,
  });

  useEffect(() => {
    scrollViewRef.current?.setNativeProps({
      pinchGestureEnabled: loaded,
      scrollEnabled: loaded,
    });
  }, [loadStatus]);

  // 重制缩放
  useUpdateEffect(() => {
    scrollViewRef.current?.setNativeProps({
      zoomScale: 1,
    });
  }, [props.inViewport]);

  const renderIndicator = useCallback(() => {
    const { blurhash } = props.source;
    return blurhash ? (
      <AnimatedBlurhash
        style={styles.blurhash}
        blurhash={blurhash}
        exiting={FadeOut.duration(100)}
      />
    ) : (
      <ActivityIndicator />
    );
  }, [props.source.blurhash]);

  const renderError = useCallback(() => {
    return <Text style={styles.loadFailed}>加载失败！</Text>;
  }, []);

  function handleScroll(event: NativeSyntheticScrollEvent) {
    const { zoomScale } = event.nativeEvent;
    setScaled(zoomScale !== 1);
    props.onZoomScaleChange?.(zoomScale);
  }

  const handlePressOut = useCallback(
    (event: NativeSyntheticTouchEvent) => {
      if (!loaded) return;

      const { locationX: lastX, locationY: lastY } = pressInEvent;
      const { locationX, locationY } = event.nativeEvent;

      if (
        // HACK: 处理滑动页面事件
        !event.nativeEvent.touches?.length &&
        Math.abs(locationX - lastX) < 50 &&
        Math.abs(locationY - lastY) < 50
      ) {
        handleDoublePress(event);
      }
    },
    [handleDoublePress, loaded],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        ref={scrollViewRef}
        contentContainerStyle={styles.contentContainerStyle}
        pinchGestureEnabled
        scrollEnabled
        centerContent
        bounces
        contentInsetAdjustmentBehavior="never"
        decelerationRate={0.8}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        maximumZoomScale={maxScale}
        scrollEventThrottle={1}
        onScroll={handleScroll}
        onScrollBeginDrag={event => {
          beginZoomScale = event.nativeEvent.zoomScale;
          props.onScrollBeginDrag?.(event);
        }}
        onScrollEndDrag={props.onScrollEndDrag}
        onLayout={event => {
          const { width, height } = event.nativeEvent.layout;
          setContainerDimensions({
            width,
            height,
          });
        }}>
        <Pressable
          onPressIn={event => {
            pressInEvent = event.nativeEvent;
          }}
          onPressOut={handlePressOut}
          onLongPress={() => loaded && props.onLongPress}>
          <Image
            style={[styles.image]}
            source={{
              uri: props.source.poster || props.source.uri,
            }}
            resizeMode="contain"
            threshold={20}
            onLoadStart={() => {
              setLoadStatus(LoadStatus.Loading);
            }}
            onLoad={e => {
              setImageDimension(e.nativeEvent);
              setLoadStatus(LoadStatus.Succeeded);
            }}
            onError={() => {
              setLoadStatus(LoadStatus.Failed);
            }}
            renderIndicator={renderIndicator}
            renderError={renderError}
          />
        </Pressable>
      </ScrollView>
      {props.renderExtraElements?.(loadStatus)}
    </View>
  );
}

export default ImageView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  contentContainerStyle: {
    flex: 1,
  },
  blurhash: {
    width: '100%',
    height: '100%',
  },
  loadFailed: {
    fontSize: 16,
    color: PlatformColor('systemRed'),
  },
});
