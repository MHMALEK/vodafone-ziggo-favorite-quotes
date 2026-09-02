import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { api } from '../api/client';
import FavoritesScreen from './FavoritesScreen';

jest.mock('../api/client', () => ({
  api: { listFavorites: jest.fn(), removeFavorite: jest.fn() },
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');
    useEffect(callback, [callback]);
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const favorite = {
  id: 1,
  body: 'Saved wisdom.',
  author: 'Someone',
  tags: [],
  savedAt: '2026-09-01T12:00:00.000Z',
};

function renderFavorites() {
  return render(
    <PaperProvider>
      <FavoritesScreen />
    </PaperProvider>,
  );
}

describe('FavoritesScreen', () => {
  it('lists saved favorites and unlikes on tap', async () => {
    mockedApi.listFavorites.mockResolvedValue([favorite]);
    mockedApi.removeFavorite.mockResolvedValue(undefined);

    renderFavorites();

    expect(await screen.findByText(/Saved wisdom\./)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Unlike quote 1'));
    await waitFor(() => expect(mockedApi.removeFavorite).toHaveBeenCalledWith(1));
  });

  it('shows the empty state when nothing is saved', async () => {
    mockedApi.listFavorites.mockResolvedValue([]);

    renderFavorites();

    expect(await screen.findByText(/No favorites yet/)).toBeTruthy();
  });

  it('shows an error with Retry when the API is down', async () => {
    mockedApi.listFavorites.mockRejectedValue(new Error('Cannot reach the server.'));

    renderFavorites();

    expect(await screen.findByText(/Cannot reach the server/)).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });
});
