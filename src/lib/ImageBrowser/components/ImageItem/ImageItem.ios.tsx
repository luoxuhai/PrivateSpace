/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Animated,
  ScrollView,
  StyleSheet,
  NativeScrollEvent,
  Pressable,
  NativeSyntheticEvent,
  GestureResponderEvent,
  useWindowDimensions,
} from 'react-native';
import FS from 'react-native-fs';

import useDoubleTapToZoom from '../../hooks/useDoubleTapToZoom';
import useImageDimensions from '../../hooks/useImageDimensions';

import { getImageStyles, getImageTransform } from '../../utils';
import { ImageSource } from '../../@types';
import { SourceType } from '@/services/db/file';
import { ImageLoading } from './ImageLoading';
import { getSourceByMime, getThumbnailPath } from '@/utils';
import IconPlayCircleFill from '@/assets/icons/play.circle.fill.svg';
import { useStore } from '@/store';

const SWIPE_CLOSE_OFFSET = 75;
const SWIPE_CLOSE_VELOCITY = 1.55;
// const SCREEN = Dimensions.get('screen');
// const SCREEN_WIDTH = SCREEN.width;
// const SCREEN_HEIGHT = SCREEN.height;

// console.log('SCREEN', SCREEN);

type Props = {
  imageSrc: ImageSource;
  onImageExtraPress?: () => void;
  onRequestClose: () => void;
  onZoom: (scaled: boolean) => void;
  onLongPress: (image: ImageSource) => void;
  onDoublePress: () => void;
  onPress: () => void;
  delayLongPress: number;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
};

const ImageItem = ({
  imageSrc,
  onZoom,
  onRequestClose,
  onLongPress,
  onDoublePress,
  onPress,
  onImageExtraPress,
  delayLongPress,
  swipeToCloseEnabled = true,
  doubleTapToZoomEnabled = true,
}: Props) => {
  const SCREEN = useWindowDimensions();
  const { ui } = useStore();
  const isVideo = getSourceByMime(imageSrc.mime) === SourceType.Video;
  const thumbnailPath = getThumbnailPath({
    sourceId: imageSrc.extra.source_id,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const [loaded, setLoaded] = useState(false);
  const [scaled, setScaled] = useState(false);

  const imageDimensions = useImageDimensions({
    uri: isVideo ? thumbnailPath : imageSrc.uri,
  });
  const handleDoubleTap = useDoubleTapToZoom(
    scrollViewRef,
    scaled,
    SCREEN,
    onDoublePress,
    onPress,
  );

  const [translate, scale] = getImageTransform(imageDimensions, SCREEN);
  const scrollValueY = new Animated.Value(0);
  const scaleValue = new Animated.Value(scale || 1);
  const translateValue = new Animated.ValueXY(translate);
  const maxScale = scale && scale > 0 ? Math.max(1 / scale, 1) : 1;

  const imageOpacity = scrollValueY.interpolate({
    inputRange: [-SWIPE_CLOSE_OFFSET, 0, SWIPE_CLOSE_OFFSET],
    outputRange: [0.5, 1, 0.5],
  });
  const imagesStyles = getImageStyles(
    imageDimensions,
    translateValue,
    scaleValue,
  );
  const imageStylesWithOpacity = { ...imagesStyles, opacity: imageOpacity };

  const onScrollEndDrag = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocityY = nativeEvent?.velocity?.y ?? 0;
      const scaled = nativeEvent?.zoomScale > 1;

      onZoom(scaled);
      setScaled(scaled);

      if (
        !scaled &&
        swipeToCloseEnabled &&
        Math.abs(velocityY) > SWIPE_CLOSE_VELOCITY
      ) {
        onRequestClose();
      }
    },
    [scaled],
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

  const onLongPressHandler = useCallback(
    (event: GestureResponderEvent) => {
      onLongPress(imageSrc);
    },
    [imageSrc, onLongPress],
  );

  useEffect(() => {
    FS.exists(thumbnailPath).then(v => {
      if (!v) {
        setLoaded(true);
      }
    });
  }, [imageSrc.uri]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{
        width: SCREEN.width,
        height: SCREEN.height,
      }}
      pinchGestureEnabled
      nestedScrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      maximumZoomScale={maxScale}
      contentContainerStyle={{ height: SCREEN.height }}
      scrollEnabled={swipeToCloseEnabled}
      onScrollEndDrag={onScrollEndDrag}
      scrollEventThrottle={1}
      {...(swipeToCloseEnabled && {
        onScroll,
      })}>
      {(!loaded || !imageDimensions) && <ImageLoading />}
      <Pressable
        onPress={doubleTapToZoomEnabled ? handleDoubleTap : undefined}
        onLongPress={onLongPressHandler}
        delayLongPress={delayLongPress}>
        <>
          <Animated.Image
            source={{
              uri: isVideo ? thumbnailPath : imageSrc.uri,
            }}
            style={[imageStylesWithOpacity]}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
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
        </>
      </Pressable>
    </ScrollView>
  );
};

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
});

export default React.memo(ImageItem);
