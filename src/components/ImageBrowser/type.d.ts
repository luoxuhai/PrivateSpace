import {
  NativeSyntheticEvent,
  NativeScrollEvent,
  NativeTouchEvent,
} from 'react-native';

export type Dimensions = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export type NativeSyntheticScrollEvent =
  NativeSyntheticEvent<NativeScrollEvent>;

export type NativeSyntheticTouchEvent = NativeSyntheticEvent<NativeTouchEvent>;

export interface ImageSource {
  id: string;
  /** 源文件地址 */
  uri: string;
  /** 视频封面 */
  poster?: string;
  /** 缩略图 */
  thumbnail?: string;
  /** See https://blurha.sh/ */
  blurhash?: string;
  width?: number;
  height?: number;
  type?: 'image' | 'video';
  [key: string]: any;
}

export enum LoadStatus {
  Loading = 1,
  Succeeded = 2,
  Failed = 3,
}
