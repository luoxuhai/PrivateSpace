import { useState, useEffect } from 'react';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { NavigationConstants } from 'react-native-navigation';

import baidumobstat, { PageName } from '@/utils/analytics/baidumob';
import { getUIFrame } from '@/utils';

// HACK: 重新渲染
export function useForceRender(): {
  visible: boolean;
  forceRender: () => void;
} {
  const [visible, setVisible] = useState(true);

  function forceRender() {
    if (visible) {
      setVisible(false);
      setTimeout(() => {
        setVisible(true);
      });
    }
  }

  return { forceRender, visible };
}

export function useStat(pageName: PageName): void {
  useEffect(() => {
    baidumobstat.onPageStart(pageName);
    return () => {
      baidumobstat.onPageEnd(pageName);
    };
  }, []);
}

export function useUIFrame(): NavigationConstants {
  const orientation = useDeviceOrientation();
  const [UIFrame, setUIFrame] = useState<NavigationConstants>(getUIFrame());

  useEffect(() => {
    setTimeout(() => {
      setUIFrame(getUIFrame());
    }, 20);
  }, [orientation.landscape]);

  return UIFrame;
}
