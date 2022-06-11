import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Video, { VideoProperties } from 'react-native-video';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAirplayConnectivity } from 'react-airplay';
import { SFSymbol } from 'react-native-sfsymbols';

import Controls from './Controls';
import { useRef } from 'react';
import { useState } from 'react';

interface VideoPlayerProps {
  source: VideoProperties['source'];
  /** @default 'ignore' */
  ignoreSilentSwitch?: VideoProperties['ignoreSilentSwitch'];
  airplayTip?: string;
  onBack?: () => void;
}

export default function VideoPlayer(props: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [paused, setPaused] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo>();
  const [progress, setProgress] = useState<number>();
  const isAirplayConnected = useAirplayConnectivity();
  const [controlsVisible, setControlsVisible] = useState(false);

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        setControlsVisible(true);
      }}>
      <SafeAreaProvider>
        <Video
          style={styles.video}
          ref={videoRef}
          ignoreSilentSwitch={props.ignoreSilentSwitch ?? 'ignore'}
          source={props.source}
          controls={false}
          paused={paused}
          onLoad={data => {
            setVideoInfo(data);
          }}
          onProgress={value => {
            setProgress(value.currentTime);
          }}
          onEnd={() => {
            if (videoInfo?.duration) {
              setProgress(videoInfo.duration);
            }
          }}
        />
        <Controls
          visible={controlsVisible}
          videoInfo={videoInfo}
          paused={paused}
          progress={progress}
          onBack={props.onBack}
          onPlay={() => {
            setPaused(false);
          }}
          onPause={() => {
            setPaused(true);
          }}
          onProgress={value => {
            setProgress(value);
            videoRef.current?.seek(value);
          }}
          onVisible={() => {
            setControlsVisible(false);
          }}
        />
        {isAirplayConnected && <Airplayvideo text={props.airplayTip} />}
      </SafeAreaProvider>
    </Pressable>
  );
}

function Airplayvideo({ text }: { text?: string }) {
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <SFSymbol
        name="airplayvideo.circle"
        color="#FFF"
        style={{
          width: 90,
          height: 90,
        }}
      />
      <Text
        style={{
          color: '#FFF',
          marginTop: 6,
        }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  video: {
    flex: 1,
  },
});
