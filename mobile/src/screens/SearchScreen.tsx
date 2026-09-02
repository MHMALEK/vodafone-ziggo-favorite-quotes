import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Searchbar, Snackbar } from 'react-native-paper';

import { api } from '../api/client';
import QuoteCard from '../components/QuoteCard';
import StatusView from '../components/StatusView';
import { useLikeQuote } from '../hooks/useLikeQuote';
import type { Quote } from '../models/quote';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Quote[] | null>(null);
  const [searched, setSearched] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { like, likingId, isLiked } = useLikeQuote();
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const search = async () => {
    const keyword = query.trim();
    if (!keyword) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResults(await api.searchQuotes(keyword));
      setSearched(keyword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search quotes"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={search}
        returnKeyType="search"
        style={styles.searchbar}
      />
      {loading ? (
        <StatusView loading />
      ) : error ? (
        <StatusView error={error} onRetry={search} />
      ) : results === null ? (
        <StatusView message="Search FavQs by keyword — try “coffee”." />
      ) : results.length === 0 ? (
        <StatusView message={`Nothing found for “${searched}”.`} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(quote) => String(quote.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <QuoteCard
              quote={item}
              actions={
                <Button
                  icon="heart"
                  mode="contained-tonal"
                  loading={likingId === item.id}
                  disabled={isLiked(item.id) || likingId === item.id}
                  onPress={() => like(item).catch((err: Error) => setSnackbar(err.message))}
                >
                  {isLiked(item.id) ? 'Liked' : 'Like'}
                </Button>
              }
            />
          )}
        />
      )}
      <Snackbar visible={snackbar !== null} onDismiss={() => setSnackbar(null)} duration={4000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchbar: { margin: 16 },
  list: { paddingBottom: 16 },
});
