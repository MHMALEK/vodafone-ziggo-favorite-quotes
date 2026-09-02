import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { api } from '../api/client';
import HomeScreen from './HomeScreen';

jest.mock('../api/client', () => ({
  api: { getQuote: jest.fn(), saveFavorite: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

function renderHome() {
  return render(
    <PaperProvider>
      <HomeScreen />
    </PaperProvider>,
  );
}

describe('HomeScreen', () => {
  it('renders the quote of the day with Like and New Quote actions', async () => {
    mockedApi.getQuote.mockResolvedValue({
      id: 1,
      body: 'Stay hungry, stay foolish.',
      author: 'Steve Jobs',
      tags: ['wisdom'],
    });

    renderHome();

    expect(await screen.findByText(/Stay hungry, stay foolish\./)).toBeTruthy();
    expect(screen.getByText(/Steve Jobs/)).toBeTruthy();
    expect(screen.getByText('Like')).toBeTruthy();
    expect(screen.getByText('New Quote')).toBeTruthy();
  });

  it('renders the error state with a Retry button when the API is unreachable', async () => {
    mockedApi.getQuote.mockRejectedValue(
      new Error('Cannot reach the server. Is the API running?'),
    );

    renderHome();

    expect(await screen.findByText(/Cannot reach the server/)).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });
});
