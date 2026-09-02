import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import type { Quote } from '../models/quote';

interface Props {
  quote: Quote;
  actions?: ReactNode;
}

export default function QuoteCard({ quote, actions }: Props) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="bodyLarge" style={styles.body}>
          “{quote.body}”
        </Text>
        <Text variant="labelLarge" style={styles.author}>
          — {quote.author}
        </Text>
        {quote.tags.length > 0 && (
          <Text variant="labelSmall" style={styles.tags}>
            {quote.tags.join(' · ')}
          </Text>
        )}
      </Card.Content>
      {actions ? <Card.Actions>{actions}</Card.Actions> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6 },
  body: { fontStyle: 'italic' },
  author: { marginTop: 12, textAlign: 'right' },
  tags: { marginTop: 4, textAlign: 'right', opacity: 0.6 },
});
