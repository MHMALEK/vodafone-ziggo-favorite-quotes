import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Props {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  message?: string;
  icon?: IconName;
}

export default function StatusView({ loading, error, onRetry, message, icon }: Props) {
  const theme = useTheme();
  const iconName: IconName | undefined = loading ? undefined : (icon ?? (error ? 'cloud-off-outline' : undefined));

  return (
    <View style={styles.container}>
      {iconName ? (
        <MaterialCommunityIcons
          name={iconName}
          size={44}
          color={theme.colors.onSurfaceVariant}
          style={styles.icon}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator size="large" testID="loading-indicator" />
      ) : error ? (
        <>
          <Text variant="titleMedium" style={styles.text}>
            {error}
          </Text>
          {onRetry ? (
            <Button mode="contained-tonal" onPress={onRetry} style={styles.retry}>
              Retry
            </Button>
          ) : null}
        </>
      ) : message ? (
        <Text variant="titleMedium" style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { marginBottom: 12 },
  text: { textAlign: 'center' },
  retry: { marginTop: 16 },
});
