import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const requestId = req.headers['x-request-id'] || uuid();

        req.requestId = requestId;
        res.setHeader('x-request-id', requestId);

        next();
    }
}