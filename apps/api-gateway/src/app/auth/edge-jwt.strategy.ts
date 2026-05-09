import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/** Minimal JWT claims validated at the gateway edge (no database lookup). */
export interface EdgeJwtPayload {
  sub: string;
  email?: string;
  role?: string;
}

/**
 * Validates Bearer JWTs using the shared platform secret (signature + expiry only).
 */
@Injectable()
export class EdgeJwtStrategy extends PassportStrategy(Strategy, 'jwt-edge') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Returns payload attached to `req.user` after successful verification.
   *
   * @param payload - Decoded JWT body
   */
  validate(payload: EdgeJwtPayload): EdgeJwtPayload {
    return payload;
  }
}
