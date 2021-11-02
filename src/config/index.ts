import defaultConfig from './default';
import devConfig from './dev';

export default __DEV__
  ? Object.assign(defaultConfig, devConfig)
  : defaultConfig;

export * from './constant';
