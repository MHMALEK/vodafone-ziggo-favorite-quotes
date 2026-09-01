import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { makeTestApp, sampleQuote } from '../testing/helpers';

describe('POST /api/favorites', () => {
  it('saves a quote and returns 201 with the stored favorite', async () => {
    const { app } = makeTestApp();

    const res = await request(app).post('/api/favorites').send(sampleQuote());

    expect(res.status).toBe(201);
    expect(res.body.favorite).toMatchObject(sampleQuote());
    expect(typeof res.body.favorite.savedAt).toBe('string');
  });

  it('is idempotent: liking the same quote again returns 200 with the original favorite', async () => {
    const { app } = makeTestApp();

    const first = await request(app).post('/api/favorites').send(sampleQuote());
    const second = await request(app).post('/api/favorites').send(sampleQuote());

    expect(second.status).toBe(200);
    expect(second.body.favorite).toEqual(first.body.favorite);
  });

  it('defaults missing tags to an empty array', async () => {
    const { app } = makeTestApp();
    const { tags: _tags, ...withoutTags } = sampleQuote();

    const res = await request(app).post('/api/favorites').send(withoutTags);

    expect(res.status).toBe(201);
    expect(res.body.favorite.tags).toEqual([]);
  });

  it.each([
    ['missing body', { id: 1, author: 'a' }, /body/],
    ['empty body', { id: 1, body: '', author: 'a' }, /body/],
    ['non-positive id', { id: 0, body: 'x', author: 'a' }, /id/],
    ['non-numeric id', { id: 'abc', body: 'x', author: 'a' }, /id/],
    ['missing author', { id: 1, body: 'x' }, /author/],
  ])('rejects an invalid payload (%s) with 400 and field details', async (_name, payload, detail) => {
    const { app } = makeTestApp();

    const res = await request(app).post('/api/favorites').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toMatch(detail);
  });
});

describe('DELETE /api/favorites/:id', () => {
  it('removes a favorite and returns 204', async () => {
    const { app } = makeTestApp();
    await request(app).post('/api/favorites').send(sampleQuote());

    const res = await request(app).delete('/api/favorites/1');

    expect(res.status).toBe(204);
    const list = await request(app).get('/api/favorites');
    expect(list.body.favorites).toEqual([]);
  });

  it('returns 404 for an unknown id', async () => {
    const { app } = makeTestApp();

    const res = await request(app).delete('/api/favorites/999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for a non-numeric id', async () => {
    const { app } = makeTestApp();

    const res = await request(app).delete('/api/favorites/abc');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/favorites', () => {
  it('returns an empty list when nothing is saved', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/api/favorites');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ favorites: [] });
  });

  it('lists saved favorites newest-saved first', async () => {
    const { app } = makeTestApp();
    await request(app).post('/api/favorites').send(sampleQuote(1));
    await request(app).post('/api/favorites').send(sampleQuote(2));

    const res = await request(app).get('/api/favorites');

    expect(res.body.favorites.map((favorite: { id: number }) => favorite.id)).toEqual([2, 1]);
  });
});
