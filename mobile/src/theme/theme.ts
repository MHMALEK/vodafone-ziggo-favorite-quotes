import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export const themes = {
  light: { paper: MD3LightTheme, navigation: LightTheme },
  dark: { paper: MD3DarkTheme, navigation: DarkTheme },
} as const;
