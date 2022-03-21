import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker, {
  DocumentPickerOptions,
} from 'react-native-document-picker';
import { SupportedPlatforms } from 'react-native-document-picker/src/fileTypes';
import { PhotoFile } from 'react-native-vision-camera';
// import ImagePicker from 'react-native-image-picker'

import { PermissionManager, randomNum, extname } from '@/utils';
import { CameraPage } from '@/screens/Camera';

export interface IResult {
  /** 文件的显示名称 */
  name?: string;
  uri?: string;
  /** 文件的 MIME 类型 */
  mime: string | null;
  size?: number | null;
  ctime?: number;
  mtime?: number;
  // 相册专属
  localIdentifier?: string;
  realPath?: string;
  width?: number;
  height?: number;
  // 视频时长
  duration?: number;
}

interface IMethod {
  open: (
    onCallback?: (error?: string, result?: IResult[]) => void,
  ) => Promise<IResult[] | void>;
  close?: () => PVoid;
}

interface IOptions {
  onCapture?: (result: IResult) => void;
}

interface IAlbumOptions {
  cropperCancelText?: string;
  cropperChooseText?: string;
  loadingLabelText: string;
}

type IDocumentOptions = DocumentPickerOptions<SupportedPlatforms>;

interface IFileImporter {
  /** 相册 */
  album: (options: IAlbumOptions) => IMethod;
  /** 文件 */
  document: (options: IDocumentOptions) => IMethod;
  /** 相机 */
  camera: (options: IOptions) => IMethod;
}

export class FileImporter implements IFileImporter {
  album(options?: IAlbumOptions): IMethod {
    return {
      async open() {
        if (
          !(await PermissionManager.checkPermissions([
            'ios.permission.PHOTO_LIBRARY',
          ]))
        ) {
          return;
        }

        try {
          const res = await ImagePicker.openPicker({
            multiple: true,
            writeTempFile: true,
            maxFiles: 999,
            compressVideo: false,
            compressVideoPreset: 'Passthrough',
            compressImageQuality: 1,
            smartAlbums: [
              'UserLibrary',
              'PhotoStream',
              'Panoramas',
              'Videos',
              'Bursts',
              'Screenshots',
            ],
            ...options,
          });
          return res.map(item => ({
            name: item.filename,
            uri: item.path ?? item.sourceURL,
            size: item.size,
            mime: item.mime,
            localIdentifier: item.localIdentifier,
            width: item.width,
            height: item.height,
            duration: item.duration,
          }));
        } catch (error) {
          throw error;
        }
      },
    };
  }

  document(options?: IDocumentOptions): IMethod {
    return {
      async open(): Promise<IResult[]> {
        try {
          const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.images, DocumentPicker.types.video],
            allowMultiSelection: true,
            presentationStyle: 'overFullScreen',
            ...options,
          });

          return res.map(item => ({
            name: item.name,
            uri: decodeURI(item.uri?.replace(/^file:\/\//, '')),
            size: item.size,
            mime: item.type,
          }));
        } catch (error) {
          if (DocumentPicker.isCancel(error)) {
            return [];
          } else {
            throw error;
          }
        }
      },
    };
  }

  camera(
    onCapture?: (result: IResult) => void,
    onCancel?: () => void,
  ): IMethod {
    return {
      open: async () => {
        if (
          !(await PermissionManager.checkPermissions(['ios.permission.CAMERA']))
        ) {
          return;
        }

        await CameraPage.open({
          onCapture: async (file, type) =>
            onCapture?.({
              name:
                type === 'photo'
                  ? `IMG_${randomNum(10)}${extname(file.path)}`
                  : `IMG_${randomNum(10)}${extname(file.path)}`,
              uri: file.path?.replace(/^file:\/\//, ''),
              mime: type === 'photo' ? `image/jpeg` : `video/mov`,
              width: (file as PhotoFile).width,
              height: (file as PhotoFile).height,
            }),
          onCancel,
        });
      },
      close: async () => {
        await CameraPage.close();
      },
    };
  }
}

interface ICameraComponentProps {
  onLoad?: () => void;
}
