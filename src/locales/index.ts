import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import enUS from './en-us';
import zhCN from './zh-cn';
import zhTW from './zh-tw';
import koKR from './ko-kr';

export type Language =
  | 'en-US'
  | 'zh-CN'
  | 'ko-KR'
  | 'ja-JP'
  | 'zh-TW'
  | 'ru-RU'
  | 'es-ES'
  | 'system';

export enum ELanguage {
  /** 简体中文 */
  EN_US = 'en-US',
  /** 英文 */
  ZH_CN = 'zh-CN',
  /** 繁体中文 */
  ZH_TW = 'zh-TW',
  /** 韩语 */
  KO_KR = 'ko-KR',
  /** 日语 */
  JA_JP = 'ja-JP',
  /** 俄语 */
  RU_RU = 'ru-RU',
  /** 西班牙语 */
  ES_ES = 'es-ES',
}

export const Languages = [
  ELanguage.ZH_CN,
  ELanguage.ZH_TW,
  ELanguage.EN_US,
  ELanguage.KO_KR,
  // ELanguage.JA_JP,
  // ELanguage.RU_RU,
  // ELanguage.ES_ES,
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
    [ELanguage.ZH_TW]: zhTW,
    [ELanguage.KO_KR]: koKR,
  },
  lng: DEFAULT_LANGUAGE,
});
