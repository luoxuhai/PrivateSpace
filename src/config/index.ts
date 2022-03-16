import defaultConfig from './default';
import devConfig from './dev';

export default __DEV__ ? { ...defaultConfig, ...devConfig } : defaultConfig;

export * from './constant';
