import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

/**
 * Liveness endpoint for orchestration (no JWT; not proxied).
 */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  /**
   * Returns a static OK payload for load balancers and compose healthchecks.
   */
  @Get()
  health(): { status: string; service: string } {
    return { status: 'ok', service: 'api-gateway' };
  }
}
