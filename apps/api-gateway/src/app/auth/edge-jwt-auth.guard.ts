import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { Observable } from 'rxjs';

const PUBLIC_ROUTE_MATCHERS: ReadonlyArray<{ method: string; pattern: RegExp }> =
  [
    { method: 'POST', pattern: /^\/api\/v1\/auth\/login\/?$/ },
    { method: 'POST', pattern: /^\/api\/v1\/auth\/refresh\/?$/ },
    { method: 'POST', pattern: /^\/api\/v1\/user\/create\/?$/ },
  ];

/**
 * JWT guard for edge routing: skips auth for public user-service entrypoints (login, refresh, registration).
 */
@Injectable()
export class EdgeJwtAuthGuard extends AuthGuard('jwt-edge') {
  /**
   * Allows unauthenticated access to configured public routes; otherwise delegates to Passport JWT.
   *
   * @param context - Nest execution context
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const path = req.path;
    const method = req.method.toUpperCase();
    if (
      PUBLIC_ROUTE_MATCHERS.some(
        (m) => m.method === method && m.pattern.test(path),
      )
    ) {
      return true;
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  /**
   * Normalizes Passport errors to `UnauthorizedException`.
   *
   * @param err - Passport or strategy error
   * @param user - Authenticated payload when present
   */
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    void _info;
    void _context;
    void _status;
    if (err || !user) {
      throw err instanceof UnauthorizedException
        ? err
        : new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
