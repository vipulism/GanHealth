import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtUser, PublicUser, PublicUserSelect } from "@ganhealth/types";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Validates Bearer JWTs and loads the current user from the database.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly prisma: PrismaService,
        config: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
        });
    }

    /**
     * Resolves the authenticated user from the JWT payload subject.
     *
     * @param payload - Decoded JWT claims including `sub` (user id).
     * @returns Public user fields for `req.user`.
     * @throws UnauthorizedException when the user no longer exists.
     */
    async validate(payload: JwtUser): Promise<PublicUser> {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: PublicUserSelect
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
}