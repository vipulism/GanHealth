import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import pino from 'pino';

/**
 * Maps exceptions to a consistent JSON error body including `requestId` when present.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /** @param host - Nest execution context host. */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string) || message;
        errors = res.errors ?? null;
      }
    }

    const log = pino();

    log.error(
      {
        requestId: request.requestId,
        path: request.url,
      },
      exception instanceof Error ? exception.message : 'Unknown error',
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
