import { AuthService } from './auth.service';
import { LoginSchema, LoginDto } from '@ganhealth/validation';
import { ZodValidationPipe } from './../../../common/pipes/zod.pipe';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetUser } from '../common/decorators/get.user.decorator';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { JWTAuthGuard } from './jwt.auth.gaurd';
import {
  REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from './auth.constants';

/**
 * HTTP auth endpoints: login (sets refresh cookie), refresh (reads cookie), logout (clears cookie).
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBody({
    schema: {
      example: {
        email: 'vipul@test.com',
        password: '123456',
      },
    },
  })
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...json } = await this.authService.login(body);
    this.setRefreshTokenCookie(res, refreshToken);
    return json;
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Reads the refresh token from the HttpOnly `refresh_token` cookie (set on login). Returns a new access token in the JSON body.',
  })
  async refresh(@Req() req: Request) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
    return this.authService.refresh(token);
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Post('logout')
  async logout(
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const out = await this.authService.logout(userId);
    this.clearRefreshTokenCookie(res);
    return out;
  }

  /**
   * Sets the HttpOnly refresh-token cookie with path-limited scope to `/api/v1/auth`.
   *
   * @param res - Express response
   * @param token - Signed refresh JWT
   */
  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, this.refreshCookieOptions());
  }

  /**
   * Removes the refresh-token cookie using the same attributes as {@link setRefreshTokenCookie}.
   *
   * @param res - Express response
   */
  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      path: REFRESH_TOKEN_COOKIE_PATH,
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'lax',
    });
  }

  /**
   * Shared cookie flags for the refresh token (7-day sliding window in the browser).
   */
  private refreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'lax',
      path: REFRESH_TOKEN_COOKIE_PATH,
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
    };
  }

  private isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }
}
