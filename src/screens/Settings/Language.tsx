import React from 'react';
import { StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
import { Language } from '@/services/locale';
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
          ui.setLanguage(language);
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
    value: 'zh-CN',
  },
  {
    title: 'English',
    value: 'en-US',
  },
];

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
});