import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';

import type { Quote } from '../models/quote';

const serif = Platform.select({ ios: 'Georgia', default: 'serif' });

interface Props {
  quote: Quote;
  actions?: ReactNode;
}

export default function QuoteCard({ quote, actions }: Props) {
  const theme = useTheme();

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content>
        <Text style={[styles.quoteMark, { color: theme.colors.primary }]}>“</Text>
        <Text style={styles.body}>{quote.body}</Text>
        <Text style={[styles.author, { color: theme.colors.secondary }]}>— {quote.author}</Text>
        {quote.tags.length > 0 && (
          <View style={styles.tags}>
            {quote.tags.map((tag) => (
              <Chip key={tag} compact mode="outlined" textStyle={styles.chipText}>
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
      {actions ? <Card.Actions style={styles.actions}>{actions}</Card.Actions> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8, borderRadius: 20 },
  quoteMark: { fontFamily: serif, fontSize: 44, lineHeight: 46, marginBottom: -14 },
  body: { fontFamily: serif, fontStyle: 'italic', fontSize: 19, lineHeight: 29 },
  author: { fontFamily: serif, fontSize: 15, marginTop: 14, textAlign: 'right' },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
    justifyContent: 'flex-end',
  },
  chipText: { fontSize: 11, marginVertical: 2 },
  actions: { paddingRight: 16, paddingBottom: 12 },
});
