import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, IconButton, Searchbar, Snackbar, Text } from 'react-native-paper';

import { api } from '../api/client';
import QuoteCard from '../components/QuoteCard';
import StatusView from '../components/StatusView';
import { useLikeQuote } from '../hooks/useLikeQuote';
import type { Quote } from '../models/quote';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;
const THROTTLE_MAX_WAIT_MS = 1200;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Quote[] | null>(null);
  const [searched, setSearched] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleLike, likingId, isLiked } = useLikeQuote();
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const seq = useRef(0);

  const runSearch = useCallback(async (keyword: string) => {
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const quotes = await api.searchQuotes(keyword);
      if (id === seq.current) {
        setResults(quotes);
        setSearched(keyword);
      }
    } catch (err) {
      if (id === seq.current) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      if (id === seq.current) {
        setLoading(false);
      }
    }
  }, []);

  // Auto-search while typing: debounced 400ms, but never more than 1.2s between
  // searches during continuous typing (throttle). Clearing the input resets everything.
  const lastSearchAt = useRef(0);
  useEffect(() => {
    const keyword = query.trim();
    if (keyword.length < MIN_QUERY_LENGTH) {
      seq.current++;
      setResults(null);
      setSearched('');
      setError(null);
      setLoading(false);
      return;
    }
    const overdue = Date.now() - lastSearchAt.current >= THROTTLE_MAX_WAIT_MS;
    const timer = setTimeout(
      () => {
        lastSearchAt.current = Date.now();
        void runSearch(keyword);
      },
      overdue ? 0 : DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const submit = () => {
    const keyword = query.trim();
    if (keyword.length >= MIN_QUERY_LENGTH) {
      void runSearch(keyword);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search quotes"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={submit}
        returnKeyType="search"
        loading={loading}
        style={styles.searchbar}
      />
      {error ? (
        <StatusView error={error} onRetry={submit} />
      ) : results === null ? (
        loading ? (
          <StatusView loading />
        ) : (
          <StatusView
            icon="magnify"
            message="Type at least 3 characters — results appear as you type."
          />
        )
      ) : results.length === 0 ? (
        <StatusView icon="emoticon-neutral-outline" message={`Nothing found for “${searched}”.`} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(quote) => String(quote.id)}
          contentContainerStyle={styles.list}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text variant="labelLarge" style={styles.count}>
              {results.length} {results.length === 1 ? 'result' : 'results'} for “{searched}”
            </Text>
          }
          renderItem={({ item }) => (
            <QuoteCard
              quote={item}
              actions={[
                <IconButton
                  key="hide"
                  icon="thumb-down-outline"
                  accessibilityLabel={`Hide quote ${item.id}`}
                  onPress={() =>
                    api
                      .dislikeQuote(item.id)
                      .then(() =>
                        setResults((prev) => prev?.filter((q) => q.id !== item.id) ?? prev),
                      )
                      .catch((err: Error) => setSnackbar(err.message))
                  }
                />,
                <Button
                  key="like"
                  icon={isLiked(item.id) ? 'heart' : 'heart-outline'}
                  mode={isLiked(item.id) ? 'contained-tonal' : 'contained'}
                  loading={likingId === item.id}
                  disabled={likingId === item.id}
                  onPress={() => toggleLike(item).catch((err: Error) => setSnackbar(err.message))}
                >
                  {isLiked(item.id) ? 'Liked' : 'Like'}
                </Button>,
              ]}
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
  count: { marginHorizontal: 20, marginBottom: 6, opacity: 0.7 },
});
