import { useState, useEffect } from 'react';
import { useDeviceOrientation } from '@react-native-community/hooks';
import { NavigationConstants } from 'react-native-navigation';

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
