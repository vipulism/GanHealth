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

  use(
    req: IncomingMessageWithRequestId,
    res: ServerResponse,
    next: (error?: unknown) => void,
  ): void {
    this.httpLogger(req, res);
    next();
  }
}
