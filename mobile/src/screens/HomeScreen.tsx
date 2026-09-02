import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';

import { api } from '../api/client';
import QuoteCard from '../components/QuoteCard';
import StatusView from '../components/StatusView';
import { useAsync } from '../hooks/useAsync';
import { useLikeQuote } from '../hooks/useLikeQuote';

export default function HomeScreen() {
  const { data: quote, loading, error, reload } = useAsync(api.getQuote);
  const { like, likingId, isLiked } = useLikeQuote();
  const [snackbar, setSnackbar] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {loading ? (
        <StatusView loading />
      ) : error ? (
        <StatusView error={error} onRetry={reload} />
      ) : quote ? (
        <View style={styles.content}>
          <QuoteCard
            quote={quote}
            actions={
              <>
                <Button icon="refresh" onPress={reload}>
                  New Quote
                </Button>
                <Button
                  icon="heart"
                  mode="contained"
                  loading={likingId === quote.id}
                  disabled={isLiked(quote.id) || likingId === quote.id}
                  onPress={() =>
                    like(quote).catch((err: Error) => setSnackbar(err.message))
                  }
                >
                  {isLiked(quote.id) ? 'Liked' : 'Like'}
                </Button>
              </>
            }
          />
        </View>
      ) : null}
      <Snackbar visible={snackbar !== null} onDismiss={() => setSnackbar(null)} duration={4000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center' },
});
