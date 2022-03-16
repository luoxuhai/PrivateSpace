declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-dynamic-app-icon' {
  interface IRNDynamicAppIcon {
    supportsDynamicAppIcon: () => Promise<boolean>;
    setAppIcon: (name: string | null) => void;
    getIconName: (callback: (result: { iconName: string }) => void) => void;
  }
  const reactNativeDynamicAppIcon: IRNDynamicAppIcon;
  export default reactNativeDynamicAppIcon;
}

declare module 'react-native-ios-popover' {
  export const PopoverView: React.FC;
}

declare module 'react-native-popover-menu' {
  const content: React.FC;
  export default content;
}

declare module 'react-native-quicklook-view' {
  const content: React.FC;
  export default content;
}
