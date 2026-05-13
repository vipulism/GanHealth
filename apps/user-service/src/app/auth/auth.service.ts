import { JwtUser } from '@ganhealth/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, LoginResponseDto, UserResponseDto } from '@ganhealth/validation';
import { toUserResponse } from '@ganhealth/common';

/** Result of a successful login: access token for the JSON body and refresh token for an HttpOnly cookie. */
type LoginWithRefreshCookie = LoginResponseDto & { refreshToken: string };

/**
 * Authentication: credential validation, JWT access/refresh issuance, refresh rotation checks, and logout.
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates credentials, persists a hashed refresh token, and returns tokens for the HTTP layer.
   *
   * @param cred - Login email and password
   * @returns Access token (response body) and plain refresh token (set as HttpOnly cookie by the controller)
   * @throws UnauthorizedException when credentials are invalid
   */
  async login(cred: LoginDto): Promise<LoginWithRefreshCookie> {
    const user = await this.validateUser(cred.email, cred.password);

    const payload: JwtUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const access_token = this.jwtService.sign(payload, { expiresIn: '5m' });

    const hashedRt = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRt, lastLoginAt: new Date() },
    });

    return {
      access_token,
      refreshToken,
    };
  }

  /**
   * Verifies the refresh JWT and DB hash, then issues a new access token.
   *
   * @param refreshToken - Raw refresh JWT from the HttpOnly cookie
   * @returns New access token payload
   * @throws UnauthorizedException when the token is missing, invalid, or revoked
   */
  async refresh(refreshToken: string | undefined): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isMatch) throw new UnauthorizedException();

      const access_token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return { access_token };
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validates an email/password pair and returns a safe user projection.
   *
   * @param email - User email
   * @param password - Plain password
   * @returns User fields suitable for API responses (no password hash)
   * @throws UnauthorizedException when the user is unknown or the password does not match
   */
  async validateUser(email: string, password: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const { passwordHash, ...responseUser } = user;
    void passwordHash;
    return toUserResponse(responseUser);
  }

  /**
   * Clears the stored refresh token hash for the user (cookie cleared in the controller).
   *
   * @param userId - Authenticated user id
   * @returns Success message
   */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: '' },
    });

    return { message: 'Logged out successfully' };
  }
}
