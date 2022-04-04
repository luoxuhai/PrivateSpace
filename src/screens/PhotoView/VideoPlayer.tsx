import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { NavigationComponentProps } from 'react-native-navigation';
import { useNavigationComponentDidDisappear } from 'react-native-navigation-hooks';
import { observer } from 'mobx-react-lite';
import Video from 'react-native-video';

import { services } from '@/services';

interface IVideoPlayerProps extends NavigationComponentProps {
  uri?: string;
}

const VideoPlayer = observer<IVideoPlayerProps>(
  forwardRef((props, ref) => {
    const videoRef = useRef<Video>(null);
    const [paused, setPaused] = useState(false);

    useNavigationComponentDidDisappear(() => {
      setPaused(true);
    }, props.componentId);

    useImperativeHandle(ref, () => videoRef.current!);

    return (
      <Video
        style={styles.backgroundVideo}
        ref={videoRef}
        source={{ uri: encodeURI('file://' + props.uri) }}
        controls
        repeat
        paused={paused}
        ignoreSilentSwitch="ignore"
        onFullscreenPlayerWillDismiss={() => {
          setPaused(true);
          services.nav.screens?.dismissModal('VideoPlayer');
        }}
        onError={() => {
          services.nav.screens?.dismissModal('VideoPlayer');
        }}
      />
    );
  }),
);

export default VideoPlayer;

const styles = StyleSheet.create({
  backgroundVideo: {
    flex: 1,
  },
});
