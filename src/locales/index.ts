import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import enUS from './en-us';
import zhCN from './zh-cn';

export type Language =
  | 'en-US'
  | 'zh-CN'
  | 'ko-KR'
  | 'ja-JP'
  | 'zh-TW'
  | 'system';

export enum ELanguage {
  /** 简体中文 */
  EN_US = 'en-US',
  /** 英文 */
  ZH_CN = 'zh-CN',
  /** 繁体中文 */
  ZH_TW = 'zh-CN',
  /** 韩语 */
  KO_KR = 'ko-KR',
  /** 日语 */
  JA_JP = 'ja-JP',
}

export const Languages = [
  ELanguage.ZH_CN,
  ELanguage.EN_US,
  // ELanguage.JA_JP,
  // ELanguage.KO_KR,
  // ELanguage.ZH_TW,
];

const DEFAULT_LANGUAGE = ELanguage.ZH_CN;

export const locale = {
  country: RNLocalize.getCountry(),
  currencies: RNLocalize.getCurrencies(),
};

i18next.use(initReactI18next).init({
  resources: {
    [ELanguage.EN_US]: enUS,
    [ELanguage.ZH_CN]: zhCN,
  },
  lng: DEFAULT_LANGUAGE,
});
