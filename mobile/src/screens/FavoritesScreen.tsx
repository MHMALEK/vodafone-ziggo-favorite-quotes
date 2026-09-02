import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { IconButton, Snackbar, Text } from 'react-native-paper';

import QuoteCard from '../components/QuoteCard';
import StatusView from '../components/StatusView';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesScreen() {
  const { favorites, loading, error, refresh, remove } = useFavorites();
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (loading && favorites === null) {
    return <StatusView loading />;
  }
  if (error && favorites === null) {
    return <StatusView error={error} onRetry={refresh} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites ?? []}
        keyExtractor={(favorite) => String(favorite.id)}
        contentContainerStyle={favorites?.length ? styles.list : styles.emptyList}
        ListEmptyComponent={
          <StatusView message="No favorites yet — like something on Home or Search." />
        }
        renderItem={({ item }) => (
          <QuoteCard
            quote={item}
            actions={
              <View style={styles.actions}>
                <Text variant="labelSmall" style={styles.savedAt}>
                  saved {new Date(item.savedAt).toLocaleDateString()}
                </Text>
                <IconButton
                  icon="heart-remove"
                  accessibilityLabel={`Unlike quote ${item.id}`}
                  onPress={() => remove(item.id).catch((err: Error) => setSnackbar(err.message))}
                />
              </View>
            }
          />
        )}
      />
      <Snackbar visible={snackbar !== null} onDismiss={() => setSnackbar(null)} duration={4000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingVertical: 10 },
  emptyList: { flexGrow: 1 },
  actions: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  savedAt: { opacity: 0.6, marginLeft: 8 },
});
