import { Router } from 'express';
import { z } from 'zod';

import { HttpError } from '../http/errors';
import { describeIssues } from '../utils/zod';
import type { QuotesService } from './quotes.service';

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
});

export function quotesController(quotesService: QuotesService): Router {
  const router = Router();

  router.get('/api/quote', async (_req, res) => {
    const quote = await quotesService.getQuoteOfTheDay();
    res.json({ quote });
  });

  router.get('/api/quotes/search', async (req, res) => {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', describeIssues(parsed.error));
    }

    const quotes = await quotesService.search(parsed.data.q);
    res.json({ quotes });
  });

  return router;
}
