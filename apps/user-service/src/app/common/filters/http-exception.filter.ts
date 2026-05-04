import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import pino from 'pino';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();

            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const res: any = exceptionResponse;
                message = res.message || message;
                errors = res.errors || null;
            }
        }

        const logger = pino();

        logger.error(
            {
                requestId: request.requestId,
                path: request.url,
            },
            exception instanceof Error ? exception.message : 'Unknown error'
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