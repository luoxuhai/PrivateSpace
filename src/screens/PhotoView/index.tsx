import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ActionSheetIOS,
  Pressable,
} from 'react-native';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
  OptionsModalPresentationStyle,
  OptionsModalTransitionStyle,
} from 'react-native-navigation';
import {
  useNavigationButtonPress,
  useNavigationComponentDidAppear,
  useNavigationComponentDidDisappear,
} from 'react-native-navigation-hooks';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import * as MediaLibrary from 'expo-media-library';
import * as KeepAwake from 'expo-keep-awake';
import { RNToasty } from 'react-native-toasty';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { services } from '@/services';
import ImageBrowser, {
  ImageBrowserInstance,
  LoadStatus,
  ImageSource,
} from '@/components/ImageBrowser';
import { useStore } from '@/store';
import { HapticFeedback, getSourceByMime } from '@/utils';
import { SourceType } from '@/services/database/entities/file.entity';
import { useUpdateEffect } from '@/hooks';
import { ToolbarContainer } from './ToolbarContainer';

import IconPlayCircleFill from '@/assets/icons/play.circle.fill.svg';
import { isUndefined } from 'lodash';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const iconPlaySize = {
  width: 60,
  height: 60,
};

interface IImageViewProps extends NavigationComponentProps {
  images: API.PhotoWithSource[];
  initialIndex: number;
  onRefetch?: () => void;
}

const ImageView: NavigationFunctionComponent<IImageViewProps> = props => {
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const { ui } = useStore();
  const { t } = useTranslation();
  const imageBrowserRef = useRef<ImageBrowserInstance>(null);
  const [index, setIndex] = useState(props.initialIndex ?? 0);
  const [images, setImages] = useState(props.images ?? []);
  const currentItem = useMemo(() => images[index], [index, images]);
  const iconPlayOpacity = useSharedValue(1);

  const imageSources = useMemo<ImageSource[]>(
    () =>
      images.map(image => ({
        id: image.id as string,
        uri: image.uri as string,
        thumbnail: image.thumbnail,
        blurhash: image.extra?.blurhash,
        poster: image.poster,
        width: image.extra?.width,
        height: image.extra?.height,
      })),
    [images],
  );

  useEffect(() => {
    if (currentItem) {
      const ctime = currentItem?.ctime ? dayjs(currentItem?.ctime) : null;
      services.nav.screens?.N.updateProps('ImageViewTitle', {
        title: currentItem.name,
        subtitle:
          (ctime?.isBefore(dayjs().startOf('year'))
            ? ctime?.format('YYYY年MM月DD日 HH:mm')
            : ctime?.format('MM月DD日 HH:mm')) || '-',
      });
    }
  }, [currentItem]);

  useUpdateEffect(() => {
    if (images.length === 0) {
      handleDismissAllModals();
    }
  }, [images]);

  useNavigationComponentDidAppear(() => {
    mergeOptions();
    KeepAwake.activateKeepAwake('image.view');
  }, props.componentId);

  useNavigationComponentDidDisappear(() => {
    KeepAwake.deactivateKeepAwake('image.view');
  }, props.componentId);

  useNavigationButtonPress(handleDismissAllModals, props.componentId, 'back');

  useEffect(() => {
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  useEffect(() => {
    mergeOptions();
    StatusBar.setHidden(!toolbarVisible);
  }, [toolbarVisible]);

  const iconPlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(iconPlayOpacity.value, {
        duration: 150,
      }),
    };
  }, []);

  function mergeOptions() {
    services.nav.screens?.N.mergeOptions(props.componentId, {
      topBar: {
        visible: toolbarVisible,
        animate: false,
        background: {
          translucent: true,
        },
      },
    });
  }

  function handleLongPress() {
    HapticFeedback.impactAsync.heavy();
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['保存到相册', t('common:cancel')],
        cancelButtonIndex: 1,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          saveImageToLocal();
        }
      },
    );
  }

  async function saveImageToLocal() {
    try {
      await MediaLibrary.saveToLibraryAsync(currentItem.uri as string);
      RNToasty.Show({
        title: '已保存到相册',
        position: 'top',
      });
    } catch (error) {
      RNToasty.Show({
        title: '保存到相册失败',
        position: 'top',
      });
      HapticFeedback.notificationAsync.error();
    }
  }

  function showVideo() {
    services.nav.screens?.show(
      'VideoPlayer',
      {
        uri: currentItem?.uri,
      },
      {
        layout: {
          componentBackgroundColor: 'transparent',
        },
        modalPresentationStyle: OptionsModalPresentationStyle.overFullScreen,
        modalTransitionStyle: OptionsModalTransitionStyle.crossDissolve,
      },
    );
  }

  function handleDismissAllModals() {
    services.nav.screens?.dismissModal('ImageView');
  }

  const handlePress = useCallback(() => {
    setToolbarVisible(visible => {
      StatusBar.setHidden(visible);
      return !visible;
    });
  }, [toolbarVisible]);

  return (
    <View style={styles.container} nativeID="container">
      <ImageBrowser
        style={{
          backgroundColor:
            !toolbarVisible || ui.appearance === 'dark'
              ? ui.colors.black
              : ui.colors.white,
        }}
        ref={imageBrowserRef}
        images={imageSources}
        initialIndex={index}
        renderExtraElements={({ index: i, loadStatus }) => {
          return getSourceByMime(images?.[i]?.mime) === SourceType.Video &&
            loadStatus === LoadStatus.Succeeded ? (
            <AnimatedPressable
              style={[
                styles.imageExtra,
                iconPlayStyle,
                {
                  backgroundColor: ui.colors.tabBar,
                },
              ]}
              entering={FadeIn}
              exiting={FadeOut}
              onPress={showVideo}>
              <IconPlayCircleFill {...iconPlaySize} fill={ui.colors.white} />
            </AnimatedPressable>
          ) : null;
        }}
        keyExtractor={item => item.uri}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPageChanged={setIndex}
        onScrollBeginDrag={() => {
          iconPlayOpacity.value = 0;
        }}
        onScrollEndDrag={event => {
          iconPlayOpacity.value = 1;
          if (event.nativeEvent.zoomScale > 1) {
            setToolbarVisible(false);
          }
        }}
      />
      <ToolbarContainer
        visible={toolbarVisible}
        item={currentItem}
        images={images}
        onChange={(value, i) => {
          setImages(value);
          props.onRefetch?.();
          if (!isUndefined(i)) {
            setTimeout(() => {
              imageBrowserRef.current?.setPage(i, false);
            });
          }
        }}
      />
    </View>
  );
};

export default observer(ImageView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageExtra: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: iconPlaySize.width / 2,
    position: 'absolute',
    overflow: 'hidden',
    opacity: 0.95,
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -iconPlaySize.width / 2 },
      { translateY: -iconPlaySize.height / 2 },
    ],
  },
});
