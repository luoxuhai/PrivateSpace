import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';

import { Dimensions, NativeSyntheticTouchEvent } from '../type.d';

let lastTime: number | undefined;
let timer: NodeJS.Timeout | undefined;

interface UseDoubleTapToZoomParams {
  scrollViewRef: React.RefObject<ScrollView>;
  scaled: boolean;
  doublePressDelay: number;
  containerDimensions?: Dimensions;
  onDoublePress?: (event: Event) => void;
  onPress?: (event: Event) => void;
}

const clearLastTime = () => (lastTime = undefined);

function useDoubleTapToZoom({
  scrollViewRef,
  scaled,
  containerDimensions,
  doublePressDelay,
  onDoublePress,
  onPress,
}: UseDoubleTapToZoomParams): (event: NativeSyntheticTouchEvent) => void {
  const handleDoublePress = useCallback(
    (event: NativeSyntheticTouchEvent) => {
      timer && clearTimeout(timer);
      const nowTime = event.nativeEvent.timestamp;
      const scrollResponderRef = scrollViewRef?.current?.getScrollResponder();
      // 双击
      if (lastTime && nowTime - lastTime < doublePressDelay) {
        clearLastTime();
        onDoublePress?.(event);
        if (!containerDimensions) return;

        const { width, height } = containerDimensions;
        const { locationX, locationY } = event.nativeEvent;
        let targetX = 0;
        let targetY = 0;
        let targetWidth = width;
        let targetHeight = height;

        // Zooming in
        // TODO: Add more precise calculation of targetX, targetY based on touch
        if (!scaled) {
          targetX = locationX / 2;
          targetY = locationY / 2;
          targetWidth = width / 2;
          targetHeight = height / 2;
        }

        scrollResponderRef?.scrollResponderZoomTo({
          x: targetX,
          y: targetY,
          width: targetWidth,
          height: targetHeight,
          animated: true,
        });

        return;
      }

      if (!lastTime) {
        lastTime = nowTime;
      }

      timer = setTimeout(() => {
        onPress?.(event);
        clearLastTime();
      }, doublePressDelay);
    },
    [scaled, containerDimensions],
  );

  return handleDoublePress;
}

export default useDoubleTapToZoom;
