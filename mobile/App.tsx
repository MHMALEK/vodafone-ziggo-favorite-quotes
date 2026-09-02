import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import { themes } from './src/theme/theme';

export default function App() {
  const scheme = useColorScheme();
  const theme = themes[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <PaperProvider theme={theme.paper}>
      <ErrorBoundary>
        <NavigationContainer theme={theme.navigation}>
          <AppNavigator />
        </NavigationContainer>
      </ErrorBoundary>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
