import RNFS from 'react-native-fs';

/** 根目录 */
export const ROOT_PATH = RNFS.LibraryDirectoryPath;

/** 数据目录 */
export const DATA_PATH = ROOT_PATH + '/data';

/** 源文件目录 */
export const SOURCE_PATH = DATA_PATH + '/source';

/** 缩略图文件目录 */
export const THUMBNAIL_PATH = DATA_PATH + '/thumbnail';

/** 静态资源目录 */
export const STATIC_PATH = DATA_PATH + '/static';

/** 临时目录 */
export const TEMP_PATH = RNFS.TemporaryDirectoryPath + '/temp';

/** iCloud 数据目录 */
export const ICLOUD_DATA_PATH = '/data';

/** iCloud 源文件目录 */
export const ICLOUD_SOURCE_PATH = ICLOUD_DATA_PATH + '/source';

/** iCloud 源文件名 */
export const ICLOUD_SOURCE_NAME = 'content';

/** 视频封面名 */
export const VIDEO_POSTER_NAME = 'poster';

export const enum AppLaunchType {
  Unknown = 0,
  QuickAction = 1,
}

export const BOTTOM_TABS_HEIGHT = 84;

export const MIN_SCREEN_WIDTH = 360;
