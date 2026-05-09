import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({
  level: 'info',
});

type IncomingMessageWithRequestId = IncomingMessage & {
  requestId?: string;
};

/**
 * Structured HTTP access logging via pino-http; correlates logs with `requestId` from {@link RequestIdMiddleware}.
 */
@Injectable()
export class LoggerMiddleware
  implements NestMiddleware<IncomingMessageWithRequestId, ServerResponse>
{
  private readonly httpLogger = pinoHttp<
    IncomingMessageWithRequestId,
    ServerResponse
  >({
    logger,
    genReqId: (req) => req.requestId ?? randomUUID(),
  });

  /** @param next - Connect next callback. */
  use(
    req: IncomingMessageWithRequestId,
    res: ServerResponse,
    next: (error?: unknown) => void,
  ): void {
    this.httpLogger(req, res);
    next();
  }
}
