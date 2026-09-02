import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/Error' } },
  },
});

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Favorites Quotes API',
    version: '1.0.0',
    description:
      'Express REST API wrapping the FavQs API and managing liked quotes for a single user. ' +
      'The FavQs API key lives server-side only; clients never talk to FavQs directly.',
  },
  servers: [{ url: 'http://localhost:4000', description: 'Local development' }],
  tags: [
    { name: 'quotes', description: 'Quotes proxied from FavQs' },
    { name: 'favorites', description: 'Liked quotes (in-memory, single user)' },
    { name: 'ops', description: 'Health and monitoring' },
  ],
  paths: {
    '/api/quote': {
      get: {
        tags: ['quotes'],
        summary: 'Quote of the day',
        responses: {
          '200': {
            description: 'The FavQs quote of the day',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { quote: { $ref: '#/components/schemas/Quote' } },
                  required: ['quote'],
                },
              },
            },
          },
          '502': errorResponse('FavQs request failed'),
          '504': errorResponse('FavQs timed out'),
        },
      },
    },
    '/api/quotes/search': {
      get: {
        tags: ['quotes'],
        summary: 'Search quotes by keyword',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Search keyword, 1-100 characters',
            schema: { type: 'string', minLength: 1, maxLength: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Matching quotes (empty array when nothing matches)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    quotes: { type: 'array', items: { $ref: '#/components/schemas/Quote' } },
                  },
                  required: ['quotes'],
                },
              },
            },
          },
          '400': errorResponse('Missing, blank, or over-length q parameter'),
          '502': errorResponse('FavQs request failed'),
          '504': errorResponse('FavQs timed out'),
        },
      },
    },
    '/api/favorites': {
      post: {
        tags: ['favorites'],
        summary: 'Save a liked quote',
        description:
          'Idempotent: liking a quote that is already saved returns 200 with the original favorite.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/NewFavorite' } },
          },
        },
        responses: {
          '201': {
            description: 'Favorite created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/FavoriteEnvelope' } },
            },
          },
          '200': {
            description: 'Quote was already saved; the original favorite is returned',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/FavoriteEnvelope' } },
            },
          },
          '400': errorResponse('Invalid body (field details in the message)'),
        },
      },
      get: {
        tags: ['favorites'],
        summary: 'List saved favorites, newest first',
        responses: {
          '200': {
            description: 'All saved favorites',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    favorites: { type: 'array', items: { $ref: '#/components/schemas/Favorite' } },
                  },
                  required: ['favorites'],
                },
              },
            },
          },
        },
      },
    },
    '/api/favorites/{id}': {
      delete: {
        tags: ['favorites'],
        summary: 'Remove a favorite',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'FavQs quote id',
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '204': { description: 'Favorite removed' },
          '400': errorResponse('Non-numeric or non-positive id'),
          '404': errorResponse('No favorite with that id'),
        },
      },
    },
    '/health': {
      get: {
        tags: ['ops'],
        summary: 'Liveness check (never calls FavQs)',
        responses: {
          '200': {
            description: 'Service is up',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/metrics': {
      get: {
        tags: ['ops'],
        summary: 'Prometheus metrics',
        responses: {
          '200': { description: 'Prometheus text format', content: { 'text/plain': {} } },
        },
      },
    },
  },
  components: {
    schemas: {
      Quote: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          body: { type: 'string', example: 'That brain of mine is something more than merely mortal.' },
          author: { type: 'string', example: 'Ada Lovelace' },
          tags: { type: 'array', items: { type: 'string' }, example: ['wisdom'] },
        },
        required: ['id', 'body', 'author', 'tags'],
      },
      NewFavorite: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1 },
          body: { type: 'string', minLength: 1 },
          author: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' }, default: [] },
        },
        required: ['id', 'body', 'author'],
      },
      Favorite: {
        allOf: [
          { $ref: '#/components/schemas/Quote' },
          {
            type: 'object',
            properties: { savedAt: { type: 'string', format: 'date-time' } },
            required: ['savedAt'],
          },
        ],
      },
      FavoriteEnvelope: {
        type: 'object',
        properties: { favorite: { $ref: '#/components/schemas/Favorite' } },
        required: ['favorite'],
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string' },
              correlationId: { type: 'string', format: 'uuid' },
            },
            required: ['code', 'message', 'correlationId'],
          },
        },
        required: ['error'],
      },
    },
  },
} satisfies Record<string, unknown>;

export function docsRouter(): Router {
  const router = Router();

  router.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });
  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, { customSiteTitle: 'Favorites Quotes API' }),
  );

  return router;
}
