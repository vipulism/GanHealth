import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { UserResponseDto } from "@ganhealth/validation";
import { JwtUser, ROLE, STATUS } from "@ganhealth/types";

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

    private toUserResponse(user: {
        id: string;
        email: string;
        name: string;
        role: string;
        status: string;
        isEmailVerified: boolean;
        lastLoginAt: Date | null;
        profileImage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as ROLE,
            status: user.status as STATUS,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt } : {}),
            ...(user.profileImage ? { profileImage: user.profileImage } : {}),
        };
    }

    async validate(payload: JwtUser): Promise<UserResponseDto> {
        const rowUser = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        });

        const { passwordHash, ...user } = rowUser;
        void passwordHash;
        return this.toUserResponse(user)
    }
}