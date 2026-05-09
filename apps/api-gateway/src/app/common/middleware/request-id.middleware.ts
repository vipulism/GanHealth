import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

type RequestWithId = Request & { requestId?: string };

/**
 * Ensures every request has an `x-request-id` (reuses incoming header when present).
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /** @param req - Express request; extended with `requestId`. */
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const headerId = req.headers['x-request-id'];
    const requestId =
      typeof headerId === 'string' && headerId !== ''
        ? headerId
        : Array.isArray(headerId) && headerId[0]
          ? headerId[0]
          : uuid();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  }
}
