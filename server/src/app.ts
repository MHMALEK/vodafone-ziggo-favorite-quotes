import express from 'express';
import type { Logger } from 'pino';
import { pino } from 'pino';

import { dislikesController } from './dislikes/dislikes.controller';
import type { DislikesStore } from './dislikes/dislikes.store';
import { favoritesController } from './favorites/favorites.controller';
import { createFavoritesService } from './favorites/favorites.service';
import type { FavoritesStore } from './favorites/favorites.store';
import { correlationId } from './http/correlation-id';
import { createErrorHandler, notFoundHandler } from './http/error-handler';
import type { Metrics } from './http/metrics';
import { createMetrics, httpMetrics, metricsRouter } from './http/metrics';
import { docsRouter } from './http/openapi';
import { requestLogger } from './http/request-logger';
import type { FavqsClient } from './quotes/favqs.client';
import { quotesController } from './quotes/quotes.controller';
import { createQuotesService } from './quotes/quotes.service';

export interface AppDependencies {
  favqsClient: FavqsClient;
  favoritesStore: FavoritesStore;
  dislikesStore: DislikesStore;
  logger?: Logger;
  metrics?: Metrics;
}

export function createApp(deps: AppDependencies): express.Express {
  const logger = deps.logger ?? pino({ level: 'silent' });
  const metrics = deps.metrics ?? createMetrics();

  const quotesService = createQuotesService(deps.favqsClient, deps.dislikesStore);
  const favoritesService = createFavoritesService(deps.favoritesStore);

  const app = express();
  app.use(correlationId);
  app.use(requestLogger(logger));
  app.use(httpMetrics(metrics.httpRequestDuration));
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      service: 'favorites-quotes-api',
      docs: '/docs',
      openapi: '/openapi.json',
      health: '/health',
      metrics: '/metrics',
    });
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(metricsRouter(metrics.registry));
  app.use(docsRouter());

  app.use(quotesController(quotesService));
  app.use(favoritesController(favoritesService));
  app.use(dislikesController(deps.dislikesStore, favoritesService));

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
}
