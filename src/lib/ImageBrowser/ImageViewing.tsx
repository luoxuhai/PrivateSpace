/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, {
  ComponentType,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  StyleSheet,
  View,
  VirtualizedList,
  ModalProps,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

import ImageItem from './components/ImageItem/ImageItem';

import useImageIndexChange from './hooks/useImageIndexChange';
import useRequestClose from './hooks/useRequestClose';
import { useForceRender, useUpdateEffect } from '@/hooks';
import { ImageSource } from './@types';

type Props = {
  images: ImageSource[];
  onImageExtraPress?: () => void;
  keyExtractor?: (imageSrc: ImageSource, index: number) => string;
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  onLongPress?: (image: ImageSource) => void;
  onDoublePress?: () => void;
  onPress?: () => void;
  onImageIndexChange?: (imageIndex: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  presentationStyle?: ModalProps['presentationStyle'];
  animationType?: ModalProps['animationType'];
  backgroundColor?: string;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  delayLongPress?: number;
  HeaderComponent?: ComponentType<{ imageIndex: number }>;
  FooterComponent?: ComponentType<{ imageIndex: number }>;
};

const DEFAULT_DELAY_LONG_PRESS = 500;

const ImageViewing = forwardRef(
  (
    {
      images,
      keyExtractor,
      imageIndex,
      onImageExtraPress,
      visible,
      containerStyle,
      onRequestClose,
      onLongPress,
      onPress,
      onDoublePress,
      onImageIndexChange,
      swipeToCloseEnabled,
      doubleTapToZoomEnabled,
      delayLongPress = DEFAULT_DELAY_LONG_PRESS,
    }: Props,
    ref,
  ) => {
    const SCREEN = useWindowDimensions();
    const { visible: listVisible, forceRender } = useForceRender();
    const imageList = React.createRef<VirtualizedList<ImageSource>>();
    const [opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);
    const [currentImageIndex, setImageIndex, onScroll] = useImageIndexChange(
      imageIndex,
      SCREEN,
    );

    useImperativeHandle(ref, () => ({
      setIndex: (index: number) => {
        imageList?.current?.scrollToIndex({
          index,
          animated: false,
        });
        setImageIndex(index);
      },
    }));

    useEffect(() => {
      if (onImageIndexChange) {
        onImageIndexChange(currentImageIndex);
      }
    }, [currentImageIndex]);

    useUpdateEffect(() => {
      forceRender();
    }, [SCREEN]);

    const onZoom = useCallback(
      (isScaled: boolean) => {
        // @ts-ignore
        imageList?.current?.setNativeProps({ scrollEnabled: !isScaled });
      },
      [imageList],
    );

    if (!visible) {
      return null;
    }

    return (
      <View style={[styles.container, containerStyle, { opacity }]}>
        {listVisible && (
          <VirtualizedList
            ref={imageList}
            data={images}
            horizontal
            pagingEnabled
            windowSize={3}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={imageIndex}
            getItem={(_, index) => images[index]}
            getItemCount={() => images.length}
            getItemLayout={(_, index) => ({
              length: SCREEN.width,
              offset: SCREEN.width * index,
              index,
            })}
            renderItem={({ item: imageSrc }) => (
              <ImageItem
                onZoom={onZoom}
                onImageExtraPress={onImageExtraPress}
                imageSrc={imageSrc}
                onRequestClose={onRequestCloseEnhanced}
                onLongPress={onLongPress}
                onPress={onPress}
                onDoublePress={onDoublePress}
                delayLongPress={delayLongPress}
                swipeToCloseEnabled={swipeToCloseEnabled}
                doubleTapToZoomEnabled={doubleTapToZoomEnabled}
              />
            )}
            onMomentumScrollEnd={onScroll}
            //@ts-ignore
            keyExtractor={(imageSrc, index) =>
              keyExtractor
                ? keyExtractor(imageSrc, index)
                : imageSrc.uri || `${imageSrc}`
            }
          />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
  },
});

export default ImageViewing;
