import { Options } from 'react-native-navigation';

import { stores } from '@/store';
import { withQueryClientProvider } from '@/services';
import BlurMask from '@/components/BlurMask';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { CameraPage } from '@/screens/Camera';
import { MoreButton } from '@/screens/PhotoList/MoreButton';
import FileManagerMoreButton from '@/screens/FileManager/MoreButton';
import { ImageViewTitle } from '@/screens/PhotoView/ImageViewTitle';
import TopBarButtonVip from '@/components/TopBarButtonVip';

export function getDefaultOptions(): Options {
  return {
    layout: {
      orientation: ['portrait', 'landscape'],
    },
    topBar: {
      background: {
        translucent: true,
      },
      scrollEdgeAppearance: {
        active: true,
        background: {
          color: 'transparent',
        },
        noBorder: true,
      },
      rightButtonColor: stores.ui.themes.primary,
      leftButtonColor: stores.ui.themes.primary,
      backButton: {
        color: stores.ui.themes.primary,
      },
      animateRightButtons: false,
      animateLeftButtons: false,
      searchBar: {
        tintColor: stores.ui.themes.primary,
      },
    },
    bottomTabs: {
      translucent: true,
      tabsAttachMode: 'afterInitialTab',
      hideShadow: true,
    },
    bottomTab: {
      selectedTextColor: stores.ui.themes.primary,
      selectedIconColor: stores.ui.themes.primary,
      iconColor: stores.ui.colors.tabBar,
      textColor: stores.ui.colors.tabBar,
    },
  };
}

export const withLargeTitle = {
  largeTitle: {
    visible: true,
  },
};

export const components = [
  {
    id: 'BlurMask',
    componentProvider: () => BlurMask,
  },
  {
    id: 'Camera',
    componentProvider: () => CameraPage,
  },
  {
    id: 'ImageListMoreButton',
    componentProvider: () => withQueryClientProvider(MoreButton),
  },
  {
    id: 'FileManagerMoreButton',
    componentProvider: () => withQueryClientProvider(FileManagerMoreButton),
  },
  {
    id: 'LoadingOverlay',
    componentProvider: () => LoadingOverlay,
  },
  {
    id: 'ImageViewTitle',
    componentProvider: () => ImageViewTitle,
  },
  {
    id: 'TopBarButtonVip',
    componentProvider: () => TopBarButtonVip,
  },
];
