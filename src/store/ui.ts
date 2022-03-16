import { observable, computed, action, makeObservable } from 'mobx';
import { Appearance, StatusBar } from 'react-native';
import {
  hydrateStore,
  makePersistable,
  clearPersistedStore,
} from 'mobx-persist-store';
import { getI18n } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import UserInterfaceStyle from 'react-native-user-interface-style';

import {
  getColors,
  getThemes,
  Themes,
  SystemColors,
  AppearanceMode,
  UIAppearance,
  EThemeName,
  EAppIcon,
} from '@/utils/designSystem';
import { Language } from '@/services/locale';
import { services } from '@/services';
import { getLocalLanguage, getSystemAppearance } from '@/utils';

export class UIStore implements IStore {
  @observable isSystemAppearance = true;
  @observable appearance: AppearanceMode = 'light';
  @observable colors: SystemColors = getColors(this.appearance);
  @observable themeName: EThemeName = EThemeName.Blue;
  @observable customThemeColor: string = this.themes.primary;

  @observable language: Language = 'zh-CN';
  @observable isSystemLanguage = this.language === 'system';

  @observable appIcon: EAppIcon = EAppIcon.Default;

  @computed
  get themes(): Themes {
    return getThemes(this.colors, this.themeName);
  }

  constructor() {
    makeObservable(this);
    makePersistable(this, {
      name: 'UI',
      properties: [
        'appearance',
        'isSystemAppearance',
        'language',
        'isSystemLanguage',
        'themeName',
        'appIcon',
        'customThemeColor',
      ],
    });
    this.addSystemAppearanceChangeListener();
    this.addSystemLocalizationChangeListener();
  }

  @action.bound setAppearanceMode = (appearance: UIAppearance): void => {
    this.isSystemAppearance = appearance === 'system';
    this.appearance = this.appearanceFromUIToInternal(appearance);
    this.colors = getColors(this.appearance);

    setTimeout(() => {
      UserInterfaceStyle.setStyle(
        this.isSystemAppearance ? 'unspecified' : this.appearance,
      );
      StatusBar.setBarStyle(
        this.appearance === 'dark' ? 'light-content' : 'dark-content',
        true,
      );
    });
    services.nav.updateOptions();
  };

  @action.bound setTheme(name: EThemeName, color?: string): void {
    this.themeName = name;

    if (color) {
      this.customThemeColor = color;
    }
    services.nav.updateOptions();
  }

  @action.bound setLanguage = (language: Language): void => {
    this.isSystemLanguage = language === 'system';
    this.language = language;
    let currentLanguage = language;

    if (this.isSystemLanguage) {
      currentLanguage = getLocalLanguage();
    }

    getI18n().changeLanguage(currentLanguage);
    services.nav.updateOptions();
  };

  @action.bound setAppIcon(appIcon: EAppIcon): void {
    this.appIcon = appIcon;
  }

  addSystemAppearanceChangeListener(): void {
    Appearance.addChangeListener(() => {
      if (this.isSystemAppearance) {
        this.setAppearanceMode('system');
      }
    });
  }

  addSystemLocalizationChangeListener(): void {
    RNLocalize.addEventListener('change', () => {
      if (this.isSystemLanguage) {
        this.setLanguage('system');
      }
    });
  }

  private appearanceFromUIToInternal(v: UIAppearance): AppearanceMode {
    if (v === 'system') {
      return getSystemAppearance() ?? 'light';
    }
    return v;
  }

  async hydrate(): PVoid {
    return hydrateStore(this).finally(() => {
      this.setAppearanceMode(
        this.isSystemAppearance ? 'system' : this.appearance,
      );
      this.setLanguage(this.language);
    });
  }

  async clearPersisted(): PVoid {
    return clearPersistedStore(this);
  }
}

const uiStore = new UIStore();

export default uiStore;
