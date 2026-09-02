import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text variant="titleLarge" style={styles.text}>
            Something went wrong
          </Text>
          <Text variant="bodyMedium" style={styles.text}>
            {this.state.error.message}
          </Text>
          <Button
            mode="contained"
            style={styles.retry}
            onPress={() => this.setState({ error: null })}
          >
            Try again
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  text: { textAlign: 'center' },
  retry: { marginTop: 16 },
});
