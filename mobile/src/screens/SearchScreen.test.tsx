import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { api } from '../api/client';
import SearchScreen from './SearchScreen';

jest.mock('../api/client', () => ({
  api: { searchQuotes: jest.fn(), saveFavorite: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const result = { id: 7, body: 'Coffee first.', author: 'Barista', tags: ['coffee'] };

function renderSearch() {
  return render(
    <PaperProvider>
      <SearchScreen />
    </PaperProvider>,
  );
}

function submitSearch(keyword: string) {
  const input = screen.getByPlaceholderText('Search quotes');
  fireEvent.changeText(input, keyword);
  fireEvent(input, 'submitEditing');
}

describe('SearchScreen', () => {
  it('auto-searches while typing and resets when the input is cleared', async () => {
    mockedApi.searchQuotes.mockResolvedValue([result]);
    renderSearch();
    const input = screen.getByPlaceholderText('Search quotes');

    fireEvent.changeText(input, 'coffee');
    expect(await screen.findByText(/Coffee first\./)).toBeTruthy();

    fireEvent.changeText(input, '');
    expect(await screen.findByText(/Type at least 3 characters/)).toBeTruthy();
  });

  it('shows results and likes one from the list', async () => {
    mockedApi.searchQuotes.mockResolvedValue([result]);
    mockedApi.saveFavorite.mockResolvedValue({ ...result, savedAt: '2026-09-01T12:00:00.000Z' });

    renderSearch();
    submitSearch('coffee');

    expect(await screen.findByText(/Coffee first\./)).toBeTruthy();
    fireEvent.press(screen.getByText('Like'));
    await waitFor(() =>
      expect(mockedApi.saveFavorite).toHaveBeenCalledWith(expect.objectContaining({ id: 7 })),
    );
    expect(await screen.findByText('Liked')).toBeTruthy();
  });

  it('shows the empty message when nothing matches', async () => {
    mockedApi.searchQuotes.mockResolvedValue([]);

    renderSearch();
    submitSearch('zzzz');

    expect(await screen.findByText(/Nothing found for/)).toBeTruthy();
  });

  it('shows an error with Retry when the API is down', async () => {
    mockedApi.searchQuotes.mockRejectedValue(new Error('Cannot reach the server.'));

    renderSearch();
    submitSearch('coffee');

    expect(await screen.findByText(/Cannot reach the server/)).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });
});
