import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import ErrorBoundary from './ErrorBoundary';

function Boom(): never {
  throw new Error('render exploded');
}

describe('ErrorBoundary', () => {
  it('renders the fallback instead of crashing the app', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <PaperProvider>
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      </PaperProvider>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('render exploded')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();

    consoleError.mockRestore();
  });
});
