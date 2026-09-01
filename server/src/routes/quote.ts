import { Router } from 'express';

import type { FavqsClient } from '../favqs/client';

export function quoteRouter(favqsClient: FavqsClient): Router {
  const router = Router();

  router.get('/api/quote', async (_req, res) => {
    const quote = await favqsClient.getQotd();
    res.json({ quote });
  });

  return router;
}
