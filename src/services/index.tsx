import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import FS from 'react-native-fs';
// import { HoldMenuProvider } from '@/lib/context-menu/src';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { CustomSentry } from '@/utils/customSentry';
import Navigation from './navigation';
import { SOURCE_PATH, THUMBNAIL_PATH, TEMP_PATH, STATIC_PATH } from '@/config';
import DB from './db';
import Locale from './locale';
import { EUserType } from './db/user';
import { FileType } from './db/file';
import * as localApi from './api/local';
import config from '@/config';
import { stores } from '@/store';
import { generateID, getDefaultAlbum } from '@/utils';
import { QuickAction } from '@/extensions/quickAction';

interface IService {
  init?: () => Promise<unknown>;
}

type Services = Record<string, IService>;

export const services = {
  locale: new Locale(),
  db: new DB(),
  nav: new Navigation(),
  api: {
    local: localApi,
  },
  quickAction: new QuickAction(),
};

export const initServices = async (): PVoid => {
  for (const key in services) {
    if (Object.prototype.hasOwnProperty.call(services, key)) {
      const service = (services as Services)[key];

      if (service.init) {
        await service.init();
      }
    }
  }
};

export const initDataDirectory = async (): PVoid => {
  const options = {
    NSURLIsExcludedFromBackupKey: true,
  };
  await FS.mkdir(SOURCE_PATH, options);
  await FS.mkdir(THUMBNAIL_PATH, options);
  await FS.mkdir(TEMP_PATH, options);
  await FS.mkdir(STATIC_PATH, options);
};

export const initAlbums = async (): PVoid => {
  for (const userType of [EUserType.ADMIN, EUserType.GHOST]) {
    try {
      const owner =
        userType === EUserType.ADMIN
          ? stores.user.userInfo?.id
          : stores.user.ghostUser?.id;
      const result = await services.api.local.getFile({
        where: {
          name: config.defaultAlbum[0].name,
          type: FileType.Folder,
          owner,
        },
      });

      if (result?.data) {
        return;
      }

      await services.api.local.createFolder({
        id: generateID(),
        name: config.defaultAlbum[0].name,
        owner,
        extra: {
          is_album: true,
        },
      });
    } catch (error) {
      CustomSentry.captureException(error);
    }
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 重试3次
      retry: 3,
    },
  },
});

export const withQueryClientProvider = (C: NavigationFunctionComponent) => {
  return (props: NavigationComponentProps): React.ReactElement => {
    return (
      <QueryClientProvider client={queryClient}>
        <C {...props} />
      </QueryClientProvider>
    );
  };
};

// export const withHoldMenuProvider = (C: NavigationFunctionComponent) => {
//   return (props: NavigationComponentProps): React.ReactElement => {
//     return (
//       <HoldMenuProvider theme="light">
//         <C {...props} />
//       </HoldMenuProvider>
//     );
//   };
// };

export const withBottomSheetModalProvider = (
  C: NavigationFunctionComponent,
) => {
  return (props: NavigationComponentProps): React.ReactElement => {
    return (
      <BottomSheetModalProvider>
        <C {...props} />
      </BottomSheetModalProvider>
    );
  };
};
