import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, StatusBar, ActionSheetIOS } from 'react-native';
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
import { useQuery } from 'react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import * as MediaLibrary from 'expo-media-library';
import * as KeepAwake from 'expo-keep-awake';
import { RNToasty } from 'react-native-toasty';

import { services } from '@/services';
import ImageBrowser from '@/lib/ImageBrowser';
import { useStore } from '@/store';
import { HapticFeedback } from '@/utils';
import { useUpdateEffect } from '@/hooks';
import { ToolbarContainer } from './ToolbarContainer';

interface IImageViewProps extends NavigationComponentProps {
  images: {
    name: string;
    uri: string;
    id: string;
  }[];
  currentIndex: number;
  albumId: string;
}

const ImageView: NavigationFunctionComponent<IImageViewProps> = props => {
  const [images, setImages] = useState(props.images ?? []);
  const [currentItem, setCurrentItem] = useState(
    images.find((_, index) => index === props.currentIndex),
  );
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const { ui } = useStore();
  const imageBrowserRef = useRef();
  const { t } = useTranslation();

  const { data: fileList } = useQuery(['image.list.list.item', props.albumId], {
    enabled: false,
  });

  useEffect(() => {
    if (currentItem) {
      services.nav.screens?.N.mergeOptions(props.componentId, {
        topBar: {
          title: {
            text: currentItem.name,
          },
          subtitle: {
            text: dayjs(currentItem?.ctime).format('MM月DD日 hh:mm'),
          },
        },
      });
    }
  }, [currentItem]);

  useUpdateEffect(() => {
    if (images.length === 1) {
      handleDismissAllModals();
      return;
    }

    const prevIndex = images.findIndex(item => item.id === currentItem?.id);
    let currentIndex = prevIndex;
    if (prevIndex === images.length - 1) {
      currentIndex = prevIndex - 1;
    }

    const newImages = fileList?.list ?? [];
    imageBrowserRef.current?.setIndex?.(currentIndex);
    setCurrentItem(newImages[currentIndex]);
    setImages(newImages);
  }, [fileList?.list]);

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
  }, [toolbarVisible]);

  function mergeOptions() {
    services.nav.screens?.N.mergeOptions(props.componentId, {
      topBar: {
        visible: toolbarVisible,
        background: {
          translucent: true,
        },
        animate: false,
      },
    });
  }

  function handleLongPress() {
    HapticFeedback.impactAsync.heavy();
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [t('imageList:saveToLocal'), t('common:cancel')],
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
      await MediaLibrary.saveToLibraryAsync(currentItem!.uri);
      RNToasty.Show({
        title: '已导出',
        position: 'top',
      });
    } catch (error) {
      RNToasty.Show({
        title: '导出失败',
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

  const handlePress = useCallback(() => {
    setToolbarVisible(visible => {
      StatusBar.setHidden(visible);
      return !visible;
    });
  }, [toolbarVisible]);

  return (
    <View style={styles.container}>
      <ImageBrowser
        ref={imageBrowserRef}
        images={images}
        imageIndex={props.currentIndex}
        visible={true}
        swipeToCloseEnabled={false}
        containerStyle={{
          backgroundColor:
            !toolbarVisible || ui.appearance === 'dark'
              ? ui.colors.black
              : ui.colors.white,
        }}
        onImageExtraPress={showVideo}
        onLongPress={handleLongPress}
        onPress={handlePress}
        onDoublePress={() => {
          StatusBar.setHidden(true);
          setToolbarVisible(false);
        }}
        onImageIndexChange={index => {
          setCurrentItem(images?.[index]);
        }}
      />
      <ToolbarContainer
        visible={toolbarVisible}
        item={currentItem}
        albumId={props.albumId}
      />
    </View>
  );
};

export default observer(ImageView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function handleDismissAllModals() {
  services.nav.screens?.N.dismissAllModals();
}
