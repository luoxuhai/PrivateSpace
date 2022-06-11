import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationComponentProps } from 'react-native-navigation';
import { observer } from 'mobx-react-lite';

import { services } from '@/services';
import { VideoPlayer as Player } from '@/components/VideoPlayer';
import { useTranslation } from 'react-i18next';

interface IVideoPlayerProps extends NavigationComponentProps {
  uri?: string;
}

const VideoPlayer = observer<IVideoPlayerProps>(
  forwardRef(props => {
    const { t } = useTranslation();

    return (
      <View style={styles.container}>
        <Player
          source={{ uri: encodeURI('file://' + props.uri) }}
          airplayTip={t('player:airplayTip')}
          onBack={() => {
            services.nav.screens?.dismissModal('VideoPlayer');
          }}
        />
      </View>
    );
  }),
);

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
