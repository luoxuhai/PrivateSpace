import * as FS from 'react-native-fs';
import { formatFileSize } from '@/utils';

function outputDir(dir: string) {
  FS.readDir(dir).then(res => {
    console.log(
      JSON.stringify(
        res.map(i => ({
          ...i,
          isFile: i.isFile(),
        })),
        null,
        2,
      ),
    );
  });
}

function outputFileStat(path: string) {
  FS.stat(path).then(res => {
    console.log(
      JSON.stringify(
        {
          ...res,
          isFile: res.isFile(),
          isDirectory: res.isDirectory(),
          size: formatFileSize(res.size),
        },
        null,
        2,
      ),
    );
  });
}

export default { outputDir, outputFileStat };
