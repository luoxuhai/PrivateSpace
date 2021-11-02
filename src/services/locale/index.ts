import 'intl-pluralrules';
import i18next, { TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUS from './en-us';
import zhCN from './zh-cn';

export type Language = 'en-US' | 'zh-CN' | 'system';

export enum ELanguage {
  /** 简体中文 */
  EN_US = 'en-US',
  /** 英文 */
  ZH_CN = 'zh-CN',
}

const DEFAULT_LANGUAGE = ELanguage.ZH_CN;

export default class Locale {
  constructor() {
    i18next.use(initReactI18next).init({
      resources: {
        [ELanguage.EN_US]: enUS,
        [ELanguage.ZH_CN]: zhCN,
      },
      lng: DEFAULT_LANGUAGE,
    });
  }
}
