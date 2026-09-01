import { Router } from 'express';

import type { QuotesService } from './quotes.service';

export function quotesController(quotesService: QuotesService): Router {
  const router = Router();

  router.get('/api/quote', async (_req, res) => {
    const quote = await quotesService.getQuoteOfTheDay();
    res.json({ quote });
  });

  return router;
}
