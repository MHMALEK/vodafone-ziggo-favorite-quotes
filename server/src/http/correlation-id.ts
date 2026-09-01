import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('x-request-id')?.trim();
  req.correlationId = incoming || randomUUID();
  res.setHeader('x-request-id', req.correlationId);
  next();
}
