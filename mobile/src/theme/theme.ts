import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#1F6F5C',
  onPrimary: '#FFFFFF',
  primaryContainer: '#BFE8D9',
  onPrimaryContainer: '#0B2E25',
  secondary: '#8A6D4B',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F0E2CF',
  onSecondaryContainer: '#3E2E1A',
  background: '#F8F4EE',
  surface: '#FFFFFF',
  surfaceVariant: '#ECE5DA',
  onSurfaceVariant: '#4F473C',
  outline: '#8A8172',
  elevation: {
    ...MD3LightTheme.colors.elevation,
    level1: '#FDFAF5',
    level2: '#FBF7F0',
  },
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#86D3B8',
  onPrimary: '#06382B',
  primaryContainer: '#175243',
  onPrimaryContainer: '#BFE8D9',
  secondary: '#D8BE9C',
  onSecondary: '#3A2C17',
  secondaryContainer: '#57432B',
  onSecondaryContainer: '#F0E2CF',
  background: '#15130F',
  surface: '#1E1B16',
  surfaceVariant: '#494336',
  onSurfaceVariant: '#CFC6B8',
  outline: '#98907F',
};

const paperThemes = {
  light: { ...MD3LightTheme, colors: lightColors },
  dark: { ...MD3DarkTheme, colors: darkColors },
};

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
  materialLight: paperThemes.light,
  materialDark: paperThemes.dark,
});

export const themes = {
  light: { paper: paperThemes.light, navigation: LightTheme },
  dark: { paper: paperThemes.dark, navigation: DarkTheme },
} as const;
