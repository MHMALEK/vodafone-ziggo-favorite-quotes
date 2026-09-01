import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors';
import { UpstreamError } from '../favqs/client';

function respond(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message } });
}

export function notFoundHandler(req: Request, res: Response): void {
  respond(res, 404, 'NOT_FOUND', `No route for ${req.method} ${req.path}`);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    respond(res, err.status, err.code, err.message);
    return;
  }

  if (err instanceof UpstreamError) {
    if (err.kind === 'timeout') {
      respond(res, 504, 'UPSTREAM_TIMEOUT', 'FavQs took too long to respond');
      return;
    }
    respond(res, 502, 'UPSTREAM_ERROR', 'FavQs request failed');
    return;
  }

  respond(res, 500, 'INTERNAL', 'Unexpected server error');
}
