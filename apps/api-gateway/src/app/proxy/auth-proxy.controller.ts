import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { EdgeJwtAuthGuard } from '../auth/edge-jwt-auth.guard';
import { UpstreamProxyService } from './upstream-proxy.service';

/**
 * Reverse proxy for `user-service` routes under `/api/v1/auth/**`.
 */
@Controller({ version: '1', path: 'auth' })
@UseGuards(EdgeJwtAuthGuard)
export class AuthProxyController {
  constructor(
    private readonly upstream: UpstreamProxyService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Forwards any HTTP method and sub-path to the configured user service.
   *
   * @param req - Incoming request
   * @param res - Outgoing response
   */
  @All('*')
  async proxy(
    @Req() req: Request & { requestId?: string },
    @Res() res: Response,
  ): Promise<void> {
    const base = this.config.getOrThrow<string>('USER_SERVICE_URL');
    await this.upstream.forward(req, res, base);
  }
}
