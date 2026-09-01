import express from 'express';

import { favoritesController } from './favorites/favorites.controller';
import { createFavoritesService } from './favorites/favorites.service';
import type { FavoritesStore } from './favorites/favorites.store';
import { errorHandler, notFoundHandler } from './http/error-handler';
import type { FavqsClient } from './quotes/favqs.client';
import { quotesController } from './quotes/quotes.controller';
import { createQuotesService } from './quotes/quotes.service';

export interface AppDependencies {
  favqsClient: FavqsClient;
  favoritesStore: FavoritesStore;
}

export function createApp(deps: AppDependencies): express.Express {
  const quotesService = createQuotesService(deps.favqsClient);
  const favoritesService = createFavoritesService(deps.favoritesStore);

  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(quotesController(quotesService));
  app.use(favoritesController(favoritesService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
