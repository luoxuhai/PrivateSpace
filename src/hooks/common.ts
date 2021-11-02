import { useState } from 'react';

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
