/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useEffect, useRef, useState, memo } from 'react';

import {
  ScrollView,
  StyleSheet,
  NativeScrollEvent,
  Pressable,
  NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { createImageProgress } from 'react-native-image-progress';
import Animated, { FadeOut } from 'react-native-reanimated';

import useDoubleTapToZoom from '../../hooks/useDoubleTapToZoom';
import useImageDimensions from '../../hooks/useImageDimensions';
import { getImageStyles, getImageTransform } from '../../utils';
import { ImageSource } from '../../@types';
import { SourceType } from '@/services/database/entities/file.entity';
import { getSourceByMime } from '@/utils';
import IconPlayCircleFill from '@/assets/icons/play.circle.fill.svg';
import { useStore } from '@/store';

const SWIPE_CLOSE_OFFSET = 75;
const SWIPE_CLOSE_VELOCITY = 1.55;

const Image = createImageProgress(FastImage);
const AnimatedImage = Animated.createAnimatedComponent(FastImage);

interface ImageItemProps {
  source: ImageSource;
  onImageExtraPress?: () => void;
  onRequestClose: () => void;
  onZoom?: (scaled: boolean) => void;
  onZoomScale?: (scale: number) => void;
  onLongPress: (image: ImageSource) => void;
  onDoublePress: () => void;
  onScroll: () => void;
  onScrollEndDrag: () => void;
  onPress: () => void;
  delayLongPress: number;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  isDisplay?: boolean;
}

const ImageItem = memo<ImageItemProps>(
  ({
    source,
    onRequestClose,
    onLongPress,
    onDoublePress,
    onPress,
    onZoom,
    onImageExtraPress,
    onZoomScale,
    onScroll,
    onScrollEndDrag,
    delayLongPress,
    swipeToCloseEnabled = true,
    doubleTapToZoomEnabled = true,
    isDisplay,
  }) => {
    const SCREEN = useWindowDimensions();
    const { ui } = useStore();
    const isVideo = getSourceByMime(source.mime) === SourceType.Video;

    const scrollViewRef = useRef<ScrollView>(null);
    const [loaded, setLoaded] = useState(false);
    const [scaled, setScaled] = useState(false);

    useEffect(() => {
      if (!isDisplay) {
        scrollViewRef.current?.setNativeProps({
          zoomScale: 1,
        });
        setScaled(false);
        onZoom?.(false);
      }
    }, [isDisplay]);

    const imageDimensions = useImageDimensions({
      uri: isVideo ? source.thumbnail : source.uri,
    });
    const handleDoubleTap = useDoubleTapToZoom(
      scrollViewRef,
      scaled,
      SCREEN,
      onDoublePress,
      onPress,
    );

    const [translate, scale] = getImageTransform(imageDimensions, SCREEN);
    const maxScale = scale && scale > 0 ? Math.max(1 / scale, 2) : 2;

    // const onScrollEndDrag = useCallback(
    //   ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    //     const velocityY = nativeEvent?.velocity?.y ?? 0;
    //     const scaled = nativeEvent?.zoomScale > 1;
    //     onZoomScale?.(nativeEvent?.zoomScale);
    //     onZoom?.(scaled);
    //     setScaled(scaled);

    //     if (
    //       !scaled &&
    //       swipeToCloseEnabled &&
    //       Math.abs(velocityY) > SWIPE_CLOSE_VELOCITY
    //     ) {
    //       onRequestClose?.();
    //     }
    //   },
    //   [scaled],
    // );

    const onLongPressHandler = useCallback(() => {
      onLongPress?.(source);
    }, [source, onLongPress]);

    return (
      <ScrollView
        ref={scrollViewRef}
        pinchGestureEnabled
        scrollEnabled
        centerContent
        bounces
        contentInsetAdjustmentBehavior="never"
        decelerationRate={0.8}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
        maximumZoomScale={maxScale}
        contentContainerStyle={{
          height: SCREEN.height,
        }}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={1}
        onScroll={e => {
          // if (
          //   e.nativeEvent.contentOffset.x >
          //     e.nativeEvent.contentSize.width - 5 ||
          //   e.nativeEvent.contentOffset.x < 10
          // ) {
          //   scrollViewRef.current?.setNativeProps({
          //     scrollEnabled: false,
          //   });
          // } else {
          //   scrollViewRef.current?.setNativeProps({
          //     scrollEnabled: true,
          //   });
          // }
        }}
        {...(swipeToCloseEnabled && {
          onScroll,
        })}>
        <Pressable
          onPress={doubleTapToZoomEnabled ? handleDoubleTap : undefined}
          onLongPress={onLongPressHandler}
          delayLongPress={delayLongPress}>
          <Image
            style={styles.image}
            source={{
              uri: isVideo ? source.thumbnail : source.uri,
            }}
            resizeMode="contain"
            threshold={0}
            renderIndicator={() => (
              <AnimatedImage
                exiting={FadeOut.duration(200)}
                source={{
                  uri: source.thumbnail ?? source.uri,
                }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
          />
          {isVideo && (
            <Pressable
              style={[
                styles.imageExtra,
                {
                  backgroundColor: ui.colors.tabBar,
                  top: SCREEN.height / 2 - 30,
                  left: SCREEN.width / 2 - 30,
                },
              ]}
              onPress={onImageExtraPress}>
              <IconPlayCircleFill
                width={60}
                height={60}
                fill={ui.colors.white}
              />
            </Pressable>
          )}
        </Pressable>
      </ScrollView>
    );
  },
);

const styles = StyleSheet.create({
  imageExtra: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    overflow: 'hidden',
    opacity: 0.95,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default React.memo(ImageItem);
