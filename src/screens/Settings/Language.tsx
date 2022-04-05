import React from 'react';
import { StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
import { ELanguage, Language, Languages } from '@/locales';
import CheckList from '@/components/CheckList';
import { SafeAreaScrollView } from '@/components';

function LanguageSettingScreen(): JSX.Element {
  const { ui } = useStore();
  const { t } = useTranslation();

  return (
    <SafeAreaScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            ui.appearance === 'dark'
              ? ui.colors.systemBackground
              : ui.colors.secondarySystemBackground,
        },
      ]}>
      <CheckList
        defaultValue={ui.language}
        options={languageOptions(t('common:followSystem'))}
        onChange={language => {
          ui.setLanguage(language as Language);
        }}
      />
    </SafeAreaScrollView>
  );
}

export default observer(LanguageSettingScreen);

export const languageOptions = (
  title: string,
): { title: string; value: Language }[] => [
  {
    title,
    value: 'system',
  },
  {
    title: '简体中文',
    value: ELanguage.ZH_CN,
  },
  {
    title: '繁體中文',
    value: ELanguage.ZH_TW,
  },
  {
    title: 'English',
    value: ELanguage.EN_US,
  },
  // {
  //   title: '日本語',
  //   value: ELanguage.JA_JP,
  // },
  {
    title: '한국어',
    value: ELanguage.KO_KR,
  },
  // {
  //   title: 'Русский',
  //   value: ELanguage.RU_RU,
  // },
  // {
  //   title: 'Español',
  //   value: ELanguage.ES_ES,
  // },
];

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
});
