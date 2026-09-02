import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

interface Props {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  message?: string;
}

export default function StatusView({ loading, error, onRetry, message }: Props) {
  return (
    <View style={styles.container}>
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
        <Text variant="titleMedium" style={styles.text}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { textAlign: 'center' },
  retry: { marginTop: 16 },
});
