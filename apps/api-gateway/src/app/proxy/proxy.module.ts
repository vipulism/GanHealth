import { Module } from '@nestjs/common';
import { EdgeAuthModule } from '../auth/edge-auth.module';
import { AuthProxyController } from './auth-proxy.controller';
import { PatientsProxyController } from './patients-proxy.controller';
import { UserProxyController } from './user-proxy.controller';
import { UpstreamProxyService } from './upstream-proxy.service';

/**
 * HTTP reverse proxy routes to platform microservices.
 */
@Module({
  imports: [EdgeAuthModule],
  controllers: [
    AuthProxyController,
    UserProxyController,
    PatientsProxyController,
  ],
  providers: [UpstreamProxyService],
})
export class ProxyModule {}
