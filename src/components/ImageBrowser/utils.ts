import { Dimensions, Position } from './type.d';

export const getImageTransform = (
  image: Dimensions | null,
  screen: Dimensions,
): any[] => {
  if (!image?.width || !image?.height) {
    return [];
  }

  const wScale = screen.width / image.width;
  const hScale = screen.height / image.height;
  const scale = Math.min(wScale, hScale);
  const { x, y } = getImageTranslate(image, screen);

  return [{ x, y }, scale];
};

export const getImageTranslate = (
  image: Dimensions,
  screen: Dimensions,
): Position => {
  const getTranslateForAxis = (axis: 'x' | 'y'): number => {
    const imageSize = axis === 'x' ? image.width : image.height;
    const screenSize = axis === 'x' ? screen.width : screen.height;

    return (screenSize - imageSize) / 2;
  };

  return {
    x: getTranslateForAxis('x'),
    y: getTranslateForAxis('y'),
  };
};
