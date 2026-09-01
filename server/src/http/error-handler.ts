import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';

import { UpstreamError } from '../quotes/favqs.client';
import { HttpError } from './errors';

function respond(req: Request, res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message, correlationId: req.correlationId } });
}

// express.json() rejects unparseable bodies with a SyntaxError carrying status 400.
function isBodyParseError(err: unknown): boolean {
  return err instanceof SyntaxError && 'status' in err && err.status === 400;
}

export function notFoundHandler(req: Request, res: Response): void {
  respond(req, res, 404, 'NOT_FOUND', `No route for ${req.method} ${req.path}`);
}

export function createErrorHandler(logger: Logger) {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof HttpError) {
      respond(req, res, err.status, err.code, err.message);
      return;
    }

    if (err instanceof UpstreamError) {
      logger.warn(
        { kind: err.kind, status: err.status, correlationId: req.correlationId },
        'favqs request failed',
      );
      if (err.kind === 'timeout') {
        respond(req, res, 504, 'UPSTREAM_TIMEOUT', 'FavQs took too long to respond');
        return;
      }
      respond(req, res, 502, 'UPSTREAM_ERROR', 'FavQs request failed');
      return;
    }

    if (isBodyParseError(err)) {
      respond(req, res, 400, 'INVALID_JSON', 'Request body is not valid JSON');
      return;
    }

    logger.error({ err, correlationId: req.correlationId }, 'unhandled error');
    respond(req, res, 500, 'INTERNAL', 'Unexpected server error');
  };
}
