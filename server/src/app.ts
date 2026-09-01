import express from 'express';

import type { FavoritesStore } from './favorites/store';
import type { FavqsClient } from './favqs/client';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { favoritesRouter } from './routes/favorites';
import { quoteRouter } from './routes/quote';

export interface AppDependencies {
  favqsClient: FavqsClient;
  favoritesStore: FavoritesStore;
}

export function createApp(deps: AppDependencies): express.Express {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(quoteRouter(deps.favqsClient));
  app.use(favoritesRouter(deps.favoritesStore));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
