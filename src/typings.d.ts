import { ColorValue } from 'react-native';

declare global {
  type PVoid = Promise<void>;

  type Color = ColorValue;

  interface IStore {
    hydrate?: () => PVoid;
  }
}
