import 'dotenv/config';

import { pino } from 'pino';

import { createApp } from './app';
import { ConfigError, loadConfig } from './config';
import { InMemoryFavoritesStore } from './favorites/favorites.store';
import { createMetrics } from './http/metrics';
import { createFavqsClient } from './quotes/favqs.client';

function main(): void {
  const config = loadConfig();
  const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
  const metrics = createMetrics();

  const favqsClient = createFavqsClient({
    apiKey: config.favqsApiKey,
    observe: (endpoint, outcome, durationMs) => {
      metrics.favqsRequests.inc({ endpoint, outcome });
      metrics.favqsRequestDuration.observe({ endpoint }, durationMs / 1000);
    },
  });

  const app = createApp({
    favqsClient,
    favoritesStore: new InMemoryFavoritesStore(),
    logger,
    metrics,
  });

  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'favorites-quotes server listening');
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'shutting down');
    server.close(() => process.exit(0));
    // Force-exit if in-flight requests keep the server from draining.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

try {
  main();
} catch (err) {
  if (err instanceof ConfigError) {
    console.error(`Configuration error: ${err.message}`);
    process.exit(1);
  }
  throw err;
}
