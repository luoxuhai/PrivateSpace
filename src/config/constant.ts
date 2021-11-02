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
