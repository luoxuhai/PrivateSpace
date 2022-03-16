import uiStore from '@/store/ui';
import chroma from 'chroma-js';

import IconAppIcon from '@/assets/icons/app-icon/privatespace.svg';
import IconAppIconDark from '@/assets/icons/app-icon/privatespace.dark.svg';
import IconAppIconOrange from '@/assets/icons/app-icon/privatespace.orange.svg';

export type AppearanceMode = 'dark' | 'light';
export type UIAppearance = 'dark' | 'light' | 'system';

export type SystemColors = {
  black: string;
  white: string;

  // Standard Colors
  systemRed: string;
  systemOrange: string;
  systemYellow: string;
  systemGreen: string;
  systemTeal: string;
  systemBlue: string;
  systemPurple: string;
  systemPink: string;
  systemIndigo: string;
  systemGray: string;
  systemGray2: string;
  systemGray3: string;
  systemGray4: string;
  systemGray5: string;
  systemGray6: string;

  // Label Colors
  label: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  quaternaryLabel: string;

  // Fill Colors
  primaryFill: string;
  secondaryFill: string;
  tertiaryFill: string;
  quaternaryFill: string;
  // Text Colors

  // Standard Content Background Colors
  systemBackground: string;
  secondarySystemBackground: string;
  tertiarySystemBackground: string;

  // Grouped Content Background Colors
  systemGroupedBackground: string;
  secondarySystemGroupedBackground: string;
  tertiarySystemGroupedBackground: string;

  // Separator Colors
  separator: string;
  opaqueSeparator: string;

  // Link Color

  tabBar: string;
};

export type Themes = {
  primary: string;
};

// 主题枚举
export enum EThemeName {
  Custom = 0,
  Blue = 1,
  Red = 2,
  Orange = 3,
  Purple = 4,
  Pink = 5,
  Teal = 6,
  Indigo = 7,
  Green = 8,
}

// 主题枚举
export enum EAppIcon {
  Default = 'default',
  Dark = 'dark',
  Orange = 'orange',
}

const BASE_COLORS: Pick<SystemColors, 'black' | 'white'> = {
  black: '#000000',
  white: '#FFFFFF',
};

const light = {
  ...BASE_COLORS,
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemGreen: '#34C759',
  systemTeal: '#5AC8FA',
  systemBlue: '#007AFF',
  systemIndigo: '#5E5CE6',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D55',
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  label: BASE_COLORS.black,
  secondaryLabel: chroma('#3C3C43').alpha(0.6).css(),
  tertiaryLabel: chroma('#3C3C43').alpha(0.3).css(),
  quaternaryLabel: chroma('#3C3C43').alpha(0.18).css(),

  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',

  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F2F2F7',

  separator: '#C6C6C8',
  opaqueSeparator: chroma('#3C3C43').alpha(0.36).css(),

  tabBar: '#999999',

  primaryFill: chroma('#787880').alpha(0.2).css(),
  secondaryFill: chroma('#787880').alpha(0.16).css(),
  tertiaryFill: chroma('#767680').alpha(0.12).css(),
  quaternaryFill: chroma('#747480').alpha(0.8).css(),
};

const dark = {
  ...BASE_COLORS,
  systemRed: '#FF453A',
  systemOrange: '#FF9F0A',
  systemYellow: '#FFD60A',
  systemGreen: '#32D74B',
  systemTeal: '#64D2FF',
  systemBlue: '#0A84FF',
  systemIndigo: '#7D7AFF',
  systemPurple: '#BF5AF2',
  systemPink: '#FF2D55',
  systemGray: '#8E8E93',
  systemGray2: '#636366',
  systemGray3: '#48484A',
  systemGray4: '#3A3A3C',
  systemGray5: '#2C2C2E',
  systemGray6: '#1C1C1E',

  label: BASE_COLORS.white,
  secondaryLabel: chroma('#EBEBF5').alpha(0.6).css(),
  tertiaryLabel: chroma('#EBEBF5').alpha(0.3).css(),
  quaternaryLabel: chroma('#EBEBF5').alpha(0.18).css(),

  systemBackground: '#000000',
  secondarySystemBackground: '#1C1C1E',
  tertiarySystemBackground: '#2C2C2E',

  systemGroupedBackground: '#000000',
  secondarySystemGroupedBackground: '#1C1C1E',
  tertiarySystemGroupedBackground: '#2C2C2E',

  separator: '#38383A',
  opaqueSeparator: chroma('#545458').alpha(0.65).css(),

  tabBar: '#757575',

  primaryFill: chroma('#787880').alpha(0.36).css(),
  secondaryFill: chroma('#787880').alpha(0.32).css(),
  tertiaryFill: chroma('#767680').alpha(0.24).css(),
  quaternaryFill: chroma('#747480').alpha(0.18).css(),
};

export const colors: Record<'light' | 'dark', SystemColors> = {
  light: {
    ...light,
  },
  dark: {
    ...dark,
  },
};

function configureThemes(systemColors: SystemColors): {
  [key: string]: Themes;
} {
  return {
    [EThemeName.Orange]: {
      primary: systemColors.systemOrange,
    },
    [EThemeName.Red]: {
      primary: systemColors.systemRed,
    },
    [EThemeName.Blue]: {
      primary: systemColors.systemBlue,
    },
    [EThemeName.Pink]: {
      primary: systemColors.systemPink,
    },
    [EThemeName.Purple]: {
      primary: systemColors.systemPurple,
    },
    [EThemeName.Teal]: {
      primary: systemColors.systemTeal,
    },
    [EThemeName.Indigo]: {
      primary: systemColors.systemIndigo,
    },
    [EThemeName.Green]: {
      primary: systemColors.systemGreen,
    },
    [EThemeName.Custom]: {
      primary: uiStore?.customThemeColor,
    },
  };
}

export function getThemes(
  systemColors: SystemColors,
  name: EThemeName,
): Themes {
  return (
    configureThemes(systemColors)?.[name] ?? {
      primary: systemColors.systemBlue,
    }
  );
}

export function getColors(appearance: AppearanceMode): SystemColors {
  return colors[appearance];
}

const appIconSourceMap = {
  [EAppIcon.Default]: IconAppIcon,
  [EAppIcon.Dark]: IconAppIconDark,
  [EAppIcon.Orange]: IconAppIconOrange,
};

export function getAppIcon(name: EAppIcon): React.FC<SvgProps> {
  return appIconSourceMap[name] ?? appIconSourceMap[EAppIcon.Default];
}
