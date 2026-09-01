import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';

export function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      logger.info(
        {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Math.round(durationMs * 10) / 10,
          correlationId: req.correlationId,
        },
        'request completed',
      );
    });
    next();
  };
}
