import { Router } from 'express';
import { z } from 'zod';

import { HttpError } from '../errors';
import type { FavoritesStore } from '../favorites/store';

const favoriteBodySchema = z.object({
  id: z.number().int().positive(),
  body: z.string().min(1),
  author: z.string(),
  tags: z.array(z.string()).default([]),
});

function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
    .join('; ');
}

export function favoritesRouter(store: FavoritesStore): Router {
  const router = Router();

  router.post('/api/favorites', (req, res) => {
    const parsed = favoriteBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', describeIssues(parsed.error));
    }

    const { favorite, created } = store.add(parsed.data);
    res.status(created ? 201 : 200).json({ favorite });
  });

  router.get('/api/favorites', (_req, res) => {
    res.json({ favorites: store.list() });
  });

  return router;
}
