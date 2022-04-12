import React, { useEffect, useState } from 'react';
import { Image, ImageProps, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export interface ImageProgressWrapperProps extends ImageProps {
  renderIndicator: (
    progress: number,
    indeterminate: boolean,
  ) => React.ReactNode;
  renderError: (error: any) => React.ReactNode;
  threshold?: number;
  component?: React.FunctionComponent | React.Component;
}

export const createImageProgress =
  (ImageComponent: any) => (props: ImageProgressWrapperProps) => {
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [thresholdReached, setThresholdReached] = useState(!props.threshold);
    const indicatorOpacity = useSharedValue(1);

    const indicatorStyle = useAnimatedStyle(() => {
      return {
        opacity: withTiming(indicatorOpacity.value, {
          duration: 150,
        }),
      };
    }, []);

    useEffect(() => {
      if (!loading) {
        indicatorOpacity.value = 0;
      }
    }, [loading]);

    useEffect(() => {
      let thresholdTimer: NodeJS.Timeout;
      if (props.threshold) {
        thresholdTimer = setTimeout(() => {
          setThresholdReached(true);
          clearTimeout(thresholdTimer);
        }, props.threshold);
      }

      return () => {
        clearTimeout(thresholdTimer);
      };
    }, []);

    function bubbleEvent(propertyName: keyof ImageProps, event?: any) {
      const property = props[propertyName];
      if (typeof property === 'function') {
        property?.(event);
      }
    }

    function handleLoadStart() {
      if (!loading && progress !== 1) {
        setError(null);
        setLoading(true);
        setProgress(0);
      }
      bubbleEvent('onLoadStart');
    }

    function handleProgress(event: any) {
      const _progress = event.nativeEvent.loaded / event.nativeEvent.total;
      // RN is a bit buggy with these events, sometimes a loaded event and then a few
      // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
      // actually means the image is no longer loading
      if (_progress !== progress && progress !== 1) {
        setLoading(_progress < 1);
        setProgress(_progress);
      }
      bubbleEvent('onProgress', event);
    }

    function handleError(event: any) {
      setLoading(false);
      setError(event);
      bubbleEvent('onError', event);
    }

    function handleLoad(event: any) {
      if (progress !== 1) {
        setLoading(false);
        setError(null);
        setProgress(1);
      }
      bubbleEvent('onLoad', event);
    }

    function handleLoadEnd(event: any) {
      setLoading(false);
      setProgress(1);
      bubbleEvent('onLoadEnd', event);
    }

    return (
      <>
        {error ? (
          props.renderError?.(error)
        ) : (
          <>
            <ImageComponent
              {...props}
              style={props.style}
              onLoadStart={handleLoadStart}
              onProgress={handleProgress}
              onError={handleError}
              onLoad={handleLoad}
              onLoadEnd={handleLoadEnd}
            />
            {thresholdReached && indicatorOpacity.value !== 0 && (
              <Animated.View
                style={[
                  {
                    ...StyleSheet.absoluteFillObject,
                  },
                  indicatorStyle,
                ]}>
                {props.renderIndicator(progress, !loading || !progress)}
              </Animated.View>
            )}
          </>
        )}
      </>
    );
  };

export default createImageProgress(Image);
