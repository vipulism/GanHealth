import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EdgeJwtStrategy } from './edge-jwt.strategy';
import { EdgeJwtAuthGuard } from './edge-jwt-auth.guard';

/**
 * Passport JWT validation at the gateway (shared `JWT_SECRET` with platform services).
 */
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt-edge' })],
  providers: [EdgeJwtStrategy, EdgeJwtAuthGuard],
  exports: [EdgeJwtAuthGuard, EdgeJwtStrategy, PassportModule],
})
export class EdgeAuthModule {}
