import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';

export interface Metrics {
  registry: Registry;
  httpRequestDuration: Histogram<string>;
  favqsRequests: Counter<string>;
  favqsRequestDuration: Histogram<string>;
}

export function createMetrics(): Metrics {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  return {
    registry,
    httpRequestDuration: new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of handled HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [registry],
    }),
    favqsRequests: new Counter({
      name: 'favqs_requests_total',
      help: 'Calls to the FavQs API by endpoint and outcome',
      labelNames: ['endpoint', 'outcome'],
      registers: [registry],
    }),
    favqsRequestDuration: new Histogram({
      name: 'favqs_request_duration_seconds',
      help: 'Duration of FavQs API calls',
      labelNames: ['endpoint'],
      registers: [registry],
    }),
  };
}

export function httpMetrics(histogram: Histogram<string>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const endTimer = histogram.startTimer();
    res.on('finish', () => {
      endTimer({
        method: req.method,
        route: req.route ? req.baseUrl + String(req.route.path) : 'unmatched',
        status: String(res.statusCode),
      });
    });
    next();
  };
}

export function metricsRouter(registry: Registry): Router {
  const router = Router();

  router.get('/metrics', async (_req, res) => {
    res.setHeader('content-type', registry.contentType);
    res.send(await registry.metrics());
  });

  return router;
}
