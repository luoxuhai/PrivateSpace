import { useMutation, UseMutationResult } from 'react-query';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

import { services } from '@/services';
import {
  IDeleteResult,
  IUpdateFileRequest,
  ICreateFileResponse,
  ICreateFileRequest,
} from '@/services/api/local/type.d';
import { FileType } from '@/services/db/file';
import { useStore, stores } from '@/store';

export function useDeleteFile(): UseMutationResult<
  IDeleteResult | void,
  unknown,
  { ids: string[]; isMark?: boolean }
> {
  const result = useMutation<
    IDeleteResult | void,
    unknown,
    { ids: string[]; isMark?: boolean }
  >(async ({ ids, isMark }) => {
    try {
      const res = await services.api.local.deleteFile({
        ids,
        isMark,
      });
      return res;
    } catch (error) {
      console.error('error', error);
    }
  });

  return result;
}

export function useUpdateFile(): UseMutationResult<
  IDeleteResult | void,
  unknown,
  IUpdateFileRequest
> {
  const result = useMutation<IDeleteResult | void, unknown, IUpdateFileRequest>(
    async params => {
      try {
        const res = await services.api.local.updateFile(params);
        return res;
      } catch (error) {
        console.error('error', error);
      }
    },
  );

  return result;
}

export function useCreateAlbum(): UseMutationResult<
  ICreateFileResponse | void,
  unknown,
  { name: string }
> {
  const { user } = useStore();
  const result = useMutation<void, unknown, { name: string }>(
    async ({ name }) => {
      try {
        const { data: album } = await services.api.local.getFile({
          where: {
            name,
            type: FileType.Folder,
            owner: user.userInfo!.id,
          },
        });
        if (album) {
          Alert.alert('该相册名已存在，请重新输入', '相册名称不能相同');
        } else {
          await services.api.local.createFolder({
            name,
            owner: user.userInfo!.id,
            type: FileType.Folder,
            extra: {
              is_album: true,
            },
          });
        }
      } catch (error) {
        console.error('error', error);
      }
    },
  );

  return result;
}

export function useCreateFile(): UseMutationResult<
  ICreateFileResponse | void,
  unknown,
  ICreateFileRequest[]
> {
  const { user, global } = useStore();
  const result = useMutation<void, unknown, ICreateFileRequest[]>(
    async files => {
      const localIdentifiers: string[] = [];
      try {
        for (const file of files) {
          await services.api.local.createFile({
            ...file,
            owner: user.userInfo!.id,
          });
          if (file.localIdentifier) {
            localIdentifiers.push(file.localIdentifier);
          }
        }
        if (global.settingInfo.autoClearOrigin) {
          stores.global.setEnableMask(false);
          try {
            await MediaLibrary.deleteAssetsAsync(localIdentifiers);
            stores.global.setEnableMask(true);
          } catch {
            stores.global.setEnableMask(true);
          }
        }
      } catch (error) {
        console.error('error', error);
      }
    },
  );

  return result;
}
