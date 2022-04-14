import { useMutation, UseMutationResult } from 'react-query';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { services } from '@/services';
import {
  CreatePhotoParams,
  UpdatePhotoParams,
  RestorePhotoParams,
} from '@/services/api/photo/types.d';
import { CopyFileParams } from '@/services/api/file/types.d';
import { useStore, stores } from '@/store';

export function useDeleteFile(): UseMutationResult<
  void,
  unknown,
  { ids: string[]; isMark?: boolean }
> {
  const result = useMutation<
    void,
    unknown,
    { ids: string[]; isMark?: boolean }
  >(async ({ ids, isMark }) => {
    try {
      const res = await (isMark
        ? services.api.photo.softDelete
        : services.api.photo.delete)({
        ids,
      });
      return res;
    } catch (error) {
      console.error('error', error);
    }
  });

  return result;
}

export function useUpdateFile(): UseMutationResult<
  void,
  unknown,
  UpdatePhotoParams
> {
  const result = useMutation<void, unknown, UpdatePhotoParams>(async params => {
    try {
      await services.api.photo.update(params);
    } catch (error) {
      console.error('error', error);
    }
  });

  return result;
}

export function useCopyFile(): UseMutationResult<
  void,
  unknown,
  CopyFileParams
> {
  const result = useMutation<void, unknown, CopyFileParams>(async params => {
    try {
      await services.api.file.copy(params);
    } catch (error) {
      console.error('error', error);
    }
  });

  return result;
}

export function useRestorePhoto(): UseMutationResult<
  void,
  unknown,
  RestorePhotoParams
> {
  const result = useMutation<void, unknown, RestorePhotoParams>(
    async params => {
      try {
        await services.api.photo.restore(params);
      } catch (error) {
        console.error('error', error);
      }
    },
  );

  return result;
}

export function useCreateAlbum(): UseMutationResult<
  API.CreateResult,
  unknown,
  { name: string }
> {
  const { user } = useStore();
  const { t } = useTranslation();
  const result = useMutation<void, unknown, { name: string }>(
    async ({ name }) => {
      try {
        const hasAlbum = await services.api.album.get({
          name,
          owner: user.current?.id,
        });
        if (hasAlbum) {
          Alert.alert(
            t('createAlbum:existAlert.title'),
            t('createAlbum:existAlert.msg'),
          );
        } else {
          await services.api.album.create({
            name,
            owner: user.current?.id,
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
  API.CreateResult,
  unknown,
  CreatePhotoParams[]
> {
  const { user, global } = useStore();
  const result = useMutation<
    void,
    unknown,
    (CreatePhotoParams & { localIdentifier?: string })[]
  >(async files => {
    const localIdentifiers: string[] = [];
    try {
      for (const file of files) {
        file.localIdentifier && localIdentifiers.push(file.localIdentifier);
        delete file.localIdentifier;
        await services.api.photo.create({
          ...file,
          owner: user.current?.id,
        });
      }
      if (global.settingInfo.autoClearOrigin) {
        setTimeout(async () => {
          stores.global.setEnableMask(false);
          try {
            await MediaLibrary.deleteAssetsAsync(localIdentifiers);
            stores.global.setEnableMask(true);
          } catch {
            stores.global.setEnableMask(true);
          }
        }, 250);
      }
    } catch (error) {
      console.error('error', error);
    }
  });

  return result;
}
