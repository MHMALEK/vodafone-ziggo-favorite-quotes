import { Router } from 'express';
import { z } from 'zod';

import { HttpError } from '../http/errors';
import { describeIssues } from '../utils/zod';
import type { FavoritesService } from './favorites.service';

const favoriteBodySchema = z.object({
  id: z.number().int().positive(),
  body: z.string().min(1),
  author: z.string(),
  tags: z.array(z.string()).default([]),
});

export function favoritesController(favoritesService: FavoritesService): Router {
  const router = Router();

  router.post('/api/favorites', (req, res) => {
    const parsed = favoriteBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', describeIssues(parsed.error));
    }

    const { favorite, created } = favoritesService.save(parsed.data);
    res.status(created ? 201 : 200).json({ favorite });
  });

  router.get('/api/favorites', (_req, res) => {
    res.json({ favorites: favoritesService.list() });
  });

  router.delete('/api/favorites/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'id must be a positive integer');
    }
    if (!favoritesService.remove(id)) {
      throw new HttpError(404, 'NOT_FOUND', `No favorite with id ${id}`);
    }
    res.status(204).end();
  });

  return router;
}
