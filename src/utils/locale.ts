import * as RNLocalize from 'react-native-localize';
import { Settings } from 'react-native';

import { ELanguage, Language, Languages } from '@/locales';

export function getLocalLanguage(isBest = true): Language {
  const { languageTag, countryCode } = RNLocalize.getLocales()[0];

  const _languageTag = languageTag.replace(`-${countryCode}`, '');
  if (
    isBest &&
    !Languages.includes(languageCodeFromSystemToInternal(_languageTag))
  ) {
    const bestLanguage = RNLocalize.findBestAvailableLanguage(
      Languages.map(item => languageCodeFromInternalToSystem(item)),
    );
    return languageCodeFromSystemToInternal(bestLanguage?.languageTag);
  }

  return languageCodeFromSystemToInternal(_languageTag);
}

/**
 * 设置 App 语言
 * @param languageTag
 */
export function setAppLanguage(languageTag: string) {
  const languages = Settings.get('AppleLanguages') as string[];
  if (languageTag) {
    Settings.set({
      AppleLanguages: [...new Set([languageTag, ...languages])],
    });
  }
}

function languageCodeFromSystemToInternal(languageCode?: string): ELanguage {
  switch (languageCode) {
    case 'zh-Hans':
      return ELanguage.ZH_CN;
    case 'zh-Hant':
      return ELanguage.ZH_TW;
    case 'ko':
      return ELanguage.KO_KR;
    case 'ja':
      return ELanguage.JA_JP;
    case 'ru':
      return ELanguage.RU_RU;
    case 'es':
      return ELanguage.ES_ES;
    default:
      return ELanguage.EN_US;
  }
}

function languageCodeFromInternalToSystem(languageCode?: string) {
  switch (languageCode) {
    case 'zh-CN':
      return 'zh-Hans';
    case 'zh-TW':
      return 'zh-Hant';
    case 'en-US':
      return 'en';
    case 'ko-KR':
      return 'ko';
    case 'ja-JP':
      return 'ja';
    case 'ru-RU':
      return 'ru';
    case 'es-ES':
      return 'es';
    default:
      return 'en';
  }
}
