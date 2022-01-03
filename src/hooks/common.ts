import { useState, useEffect } from 'react';

import baidumobstat, { PageName } from '@/utils/baidumobstat';
import { ScreenName } from '@/screens';

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
