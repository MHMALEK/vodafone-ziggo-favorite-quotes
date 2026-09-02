import { Router } from 'express';
import { z } from 'zod';

import type { FavoritesService } from '../favorites/favorites.service';
import { HttpError } from '../http/errors';
import { describeIssues } from '../utils/zod';
import type { DislikesStore } from './dislikes.store';

const dislikeBodySchema = z.object({
  id: z.number().int().positive(),
});

export function dislikesController(
  dislikesStore: DislikesStore,
  favoritesService: FavoritesService,
): Router {
  const router = Router();

  router.post('/api/dislikes', (req, res) => {
    const parsed = dislikeBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', describeIssues(parsed.error));
    }

    const { id } = parsed.data;
    const created = dislikesStore.add(id);
    // Hiding a quote and keeping it as a favorite contradict each other.
    favoritesService.remove(id);
    res.status(created ? 201 : 200).json({ dislike: { id } });
  });

  router.get('/api/dislikes', (_req, res) => {
    res.json({ dislikes: dislikesStore.list() });
  });

  router.delete('/api/dislikes/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'id must be a positive integer');
    }
    if (!dislikesStore.remove(id)) {
      throw new HttpError(404, 'NOT_FOUND', `No dislike with id ${id}`);
    }
    res.status(204).end();
  });

  return router;
}
