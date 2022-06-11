import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ViewStyle,
  Share,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
} from 'react-native-reanimated';

import { Slider } from 'react-native-awesome-slider';
import { SFSymbol } from 'react-native-sfsymbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OrientationLocker, {
  OrientationType,
} from 'react-native-orientation-locker';
import { useAppState } from '@react-native-community/hooks';
import { formatDuration } from '@/utils/common';
import { isUndefined } from 'lodash';
import {
  showRoutePicker,
  useExternalPlaybackAvailability,
} from 'react-airplay';

const iconProps = {
  size: 26,
  color: '#FFF',
};

type Orientation = 'portrait' | 'landscape-left' | 'landscape-right';

interface VideoPlayerInstance {
  getCurrentTime: () => void;
  seek: (seconds: number) => void;
}

interface ControlsProps {
  orientation: Orientation;
  videoInfo?: VideoInfo;
  paused?: boolean;
  progress?: number;
  visible: boolean;
  onBack?: () => void;
  onPlay: () => void;
  onPause: () => void;
  onProgress: (progress: number) => void;
  onVisible: () => void;
}

export default function Controls(props: ControlsProps) {
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  const insets = useSafeAreaInsets();
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const appState = useAppState();
  const isExternalPlaybackAvailable = useExternalPlaybackAvailability();

  useEffect(() => {
    OrientationLocker.getOrientation(value => {
      switch (value) {
        case OrientationType['LANDSCAPE-LEFT']:
          setOrientation('landscape-left');
          break;
        case OrientationType['LANDSCAPE-RIGHT']:
          setOrientation('landscape-right');
          break;
        default:
          setOrientation('portrait');
      }
    });
  }, []);

  useEffect(() => {
    if (!isUndefined(props.progress) && props.videoInfo?.duration) {
      const _progress = (props.progress / props.videoInfo.duration) * 100;
      progress.value = _progress;
      if (_progress === 100) {
        props.onProgress(0);
      }
    }
  }, [props.progress]);

  useEffect(() => {
    if (orientation === 'portrait') {
      OrientationLocker.lockToPortrait();
    } else {
      OrientationLocker.lockToLandscape();
    }

    return () => {
      OrientationLocker.unlockAllOrientations();
    };
  }, [orientation]);

  useEffect(() => {
    if (appState === 'background' || appState === 'inactive') {
      props.onPause();
    }
  }, [appState]);

  const containerStyle: ViewStyle = useMemo(() => {
    const spacing = 16;
    const { left, right, top, bottom } = insets;
    return {
      paddingLeft: left === 0 ? left + spacing : left,
      paddingRight: right === 0 ? right + spacing : right,
      paddingBottom: bottom === 0 ? bottom + spacing : bottom,
      paddingTop: top === 0 ? top + spacing : top,
    };
  }, [insets]);

  function handleShare() {
    Share.share({
      url: '',
    });
  }

  function handleOrientation() {
    setOrientation(old => {
      return old === 'portrait' ? 'landscape-left' : 'portrait';
    });
  }

  function handlePlayState() {
    if (props.paused) {
      props.onPlay();
    } else {
      props.onPause();
    }
  }

  const iconStyle = useMemo(
    () => ({
      width: iconProps.size,
      height: iconProps.size,
    }),
    [iconProps],
  );

  function onSlidingComplete() {
    props.onPlay();
  }

  function onValueChange(value: number) {
    if (!props.videoInfo?.duration) {
      return;
    }
    props.onProgress((value / 100) * props.videoInfo.duration);
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          display: props.visible ? 'flex' : 'none',
        },
      ]}>
      <View
        style={[
          styles.topToolbar,
          {
            paddingLeft: containerStyle.paddingLeft,
            paddingRight: containerStyle.paddingRight,
            paddingTop: containerStyle.paddingTop,
          },
        ]}>
        <TouchableOpacity onPress={props.onBack}>
          <SFSymbol
            name="chevron.backward"
            color={iconProps.color}
            style={iconStyle}
          />
        </TouchableOpacity>
        <ViewGroup>
          <TouchableOpacity
            disabled={!isExternalPlaybackAvailable}
            onPress={() => showRoutePicker({ prioritizesVideoDevices: true })}>
            <SFSymbol
              name="airplayvideo"
              color={iconProps.color}
              style={[
                iconStyle,
                {
                  marginRight: 20,
                },
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare}>
            <SFSymbol
              name="square.and.arrow.up"
              color={iconProps.color}
              style={iconStyle}
            />
          </TouchableOpacity>
        </ViewGroup>
      </View>
      <Pressable
        style={styles.background}
        onPress={() => {
          props.onVisible();
        }}
      />
      <View
        style={[
          styles.bottomToolbar,
          {
            paddingLeft: containerStyle.paddingLeft,
            paddingRight: containerStyle.paddingRight,
            paddingBottom: containerStyle.paddingBottom + 10,
          },
        ]}>
        <Slider
          progress={progress}
          minimumValue={min}
          maximumValue={max}
          onSlidingStart={props.onPause}
          onSlidingComplete={onSlidingComplete}
          onValueChange={onValueChange}
          renderBubble={() => null}
          containerStyle={styles.slider}
          theme={{
            minimumTrackTintColor: '#FFF',
            maximumTrackTintColor: '#999999',
          }}
          disable={!props.videoInfo}
        />
        <View style={styles.bottomControls}>
          <ViewGroup>
            <TouchableOpacity onPress={handlePlayState}>
              <SFSymbol
                name={props.paused ? 'play.fill' : 'pause.fill'}
                color={iconProps.color}
                style={[
                  iconStyle,
                  {
                    marginRight: 20,
                  },
                ]}
              />
            </TouchableOpacity>
            <Progress
              currentTime={props.progress}
              duration={props.videoInfo?.duration}
            />
          </ViewGroup>

          <TouchableOpacity onPress={handleOrientation}>
            <SFSymbol
              name={
                orientation === 'portrait'
                  ? 'arrow.up.backward.and.arrow.down.forward'
                  : 'arrow.down.forward.and.arrow.up.backward'
              }
              color={iconProps.color}
              style={iconStyle}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

function Progress(props: { currentTime?: number; duration?: number }) {
  return !isUndefined(props?.currentTime) ? (
    <Animated.Text style={styles.time} entering={FadeIn}>
      {props?.currentTime ? formatDuration(props?.currentTime * 1000) : 0}
      {' / '}
      {props?.duration ? formatDuration(props?.duration * 1000) : '-'}
    </Animated.Text>
  ) : null;
}

function ViewGroup(props) {
  return <View style={styles.group}>{props.children}</View>;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  topToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingBottom: 20,
  },
  bottomToolbar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  bottomControlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    color: '#FFF',
  },
  slider: {
    borderRadius: 4,
  },
  backwardText: {
    color: '#FFF',
    fontSize: 16,
  },
});
