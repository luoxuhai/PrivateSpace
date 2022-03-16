/* eslint-disable no-bitwise */
import { v4 } from 'uuid';
import {
  Alert,
  Linking,
  StatusBar,
  ActionSheetIOSOptions,
  ActionSheetIOS,
} from 'react-native';
import { getI18n } from 'react-i18next';
import axios from 'axios';
import * as Application from 'expo-application';
import {
  checkMultiple,
  requestMultiple,
  openSettings,
  RESULTS,
  IOSPermission,
} from 'react-native-permissions';

import { SourceType } from '@/services/database/entities/file.entity';
import config from '@/config';
import { stores } from '@/store';

export function generateID(): string {
  return v4();
}

export async function appUpdateCheck(): PVoid {
  try {
    StatusBar.setNetworkActivityIndicatorVisible(true);
    const res = await axios.get(
      `https://itunes.apple.com/cn/lookup?id=${config.appId}`,
    );

    if (!res?.data?.results?.[0]) return;

    const { version: latestVersion, releaseNotes } = res.data.results[0];
    const localVersion = Application.nativeApplicationVersion;
    const { appUpdateIgnore } = stores.global;
    // 存在最新版
    if (
      compareVersion(latestVersion, localVersion ?? '') === 1 &&
      latestVersion !== appUpdateIgnore?.version
    ) {
      Alert.alert(`发现新版本(V${latestVersion})`, releaseNotes, [
        {
          text: '更新',
          style: 'default',
          onPress: () => {
            Linking.openURL(
              `itms-apps://itunes.apple.com/app/id${config.appId}`,
            );
          },
        },
        {
          text: '不更新',
          style: 'cancel',
          onPress: () => {
            stores.global.setAppUpdateIgnore({
              version: latestVersion,
            });
          },
        },
      ]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    StatusBar.setNetworkActivityIndicatorVisible(false);
  }
}

export class PermissionManager {
  static permissionMap: { [key: string]: string } = {
    'ios.permission.CAMERA': getI18n().t('permission:camera'),
    'ios.permission.FACE_ID': getI18n().t('permission:faceID'),
    'ios.permission.MICROPHONE': getI18n().t('permission:microphone'),
    'ios.permission.PHOTO_LIBRARY': getI18n().t('permission:photoLibrary'),
    'ios.permission.MEDIA_LIBRARY': getI18n().t('permission:mediaLibrary'),
    'ios.permission.MOTION': getI18n().t('permission:motion'),
  };

  static async checkPermissions(
    permissions: IOSPermission[],
  ): Promise<boolean | undefined> {
    const statuses = await checkMultiple(permissions);
    const grantedList: IOSPermission[] = [];
    const deniedList: IOSPermission[] = [];
    const limitedList: IOSPermission[] = [];
    const blockedList: IOSPermission[] = [];

    for (const key in statuses) {
      const status = statuses[key as IOSPermission];

      switch (status) {
        case RESULTS.UNAVAILABLE:
          Alert.alert(
            getI18n().t('permission:unavailable', {
              permission: this.permissionMap[key],
            }),
          );
          return false;
        case RESULTS.GRANTED:
          grantedList.push(key as IOSPermission);
          break;
        case RESULTS.LIMITED:
          limitedList.push(key as IOSPermission);
          break;
        case RESULTS.DENIED:
          deniedList.push(key as IOSPermission);
          break;
        case RESULTS.BLOCKED:
          blockedList.push(key as IOSPermission);
          break;
      }
    }

    if ([...grantedList, ...limitedList].length === permissions.length) {
      return true;
    } else if (deniedList.length > 0) {
      await requestMultiple(deniedList);
      return await this.checkPermissions(deniedList);
    }

    if (blockedList.length) {
      Alert.alert(
        getI18n().t('permission:blocked', {
          permissions: blockedList
            .map(item => this.permissionMap[item])
            .join('、'),
        }),
        undefined,
        [
          {
            text: getI18n().t('common:cancel'),
            style: 'cancel',
          },
          {
            text: getI18n().t('common:confirm'),
            onPress: openSettings,
          },
        ],
      );
      return false;
    }
  }
}

export function randomNum(n: number): string {
  let t = '';
  for (let i = 0; i < n; i++) {
    t += Math.floor(Math.random() * 10);
  }
  return t;
}

export function randomNumRange(min, max) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * min + 1, 10);
    case 2:
      return parseInt(Math.random() * (max - min + 1) + min, 10);
    default:
      return 0;
  }
}

export function getSourceByMime(mime: string): SourceType {
  if (/^image/.test(mime)) {
    return SourceType.Image;
  } else if (/^audio/.test(mime)) {
    return SourceType.Audio;
  } else if (/^video/.test(mime)) {
    return SourceType.Video;
  } else if (/^text/.test(mime)) {
    return SourceType.Text;
  } else {
    return SourceType.Application;
  }
}

export function getSourceNameByType(type: SourceType): string {
  switch (type) {
    case SourceType.Text:
      return '文本';
    case SourceType.Image:
      return '图片';
    case SourceType.Audio:
      return '音频';
    case SourceType.Video:
      return '视频';
    default:
      return '其他';
  }
}

export function showDeleteActionSheet({
  title,
  message,
  onConfirm,
}: Partial<ActionSheetIOSOptions> & {
  onConfirm: () => void;
}): void {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      title: title,
      message,
      options: [
        `${getI18n().t('common:confirm')}${getI18n().t('common:delete')}`,
        getI18n().t('common:cancel'),
      ],
      cancelButtonIndex: 1,
      destructiveButtonIndex: 0,
    },
    async index => {
      if (index === 0) {
        onConfirm?.();
      }
    },
  );
}

/**
 * @returns 0 相等; 1: 大于; 2: 小于
 */
export function compareVersion(version1: string, version2: string): number {
  const arr1 = version1?.split('.');
  const arr2 = version2?.split('.');
  //获取最大数组长度
  const maxLen = arr1.length > arr2.length ? arr1.length : arr2.length;

  for (let i = 0; i < maxLen; i++) {
    //转换数字
    const p1 = arr1[i] >> 0 || 0;
    const p2 = arr2[i] >> 0 || 0;
    if (p1 > p2) {
      return 1;
    } else if (p1 < p2) {
      return -1;
    }
  }
  return 0;
}
