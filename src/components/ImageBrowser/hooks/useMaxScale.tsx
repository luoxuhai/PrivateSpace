import { useMemo } from 'react';

import { getImageTransform } from '../utils';
import { Dimensions } from '../type.d';

const DEFAULT_SCALE = 2;

export default function useMaxScale(
  imageDimensions?: Dimensions,
  containerDimensions?: Dimensions,
): number {
  return useMemo(() => {
    if (imageDimensions && containerDimensions) {
      const [_, scale] = getImageTransform(
        imageDimensions,
        containerDimensions,
      );
      return scale && scale > 0
        ? Math.max(1 / scale, DEFAULT_SCALE)
        : DEFAULT_SCALE;
    } else return DEFAULT_SCALE;
  }, [imageDimensions, containerDimensions]);
}
