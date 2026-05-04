import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { UserResponseDto } from "@ganhealth/validation";
import { JwtUser } from "@ganhealth/types";
import { toUserResponse } from "@ganhealth/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly prisma: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        })
    }

    async validate(payload: JwtUser): Promise<UserResponseDto> {
        const rowUser = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        });

        const { passwordHash, ...user } = rowUser;
        void passwordHash;
        return toUserResponse(user);
    }
}