import { JwtUser, ROLE, STATUS } from '@ganhealth/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, LoginResponseDto, UserResponseDto } from '@ganhealth/validation';


@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

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

    async login(cred: LoginDto): Promise<LoginResponseDto> {
        const user = await this.validateUser(cred.email, cred.password);

        const payload: JwtUser = {
            sub: user.id,
            email: user.email,
            role: user.role
        }

        return {
            access_token: this.jwtService.sign(payload)
        }
    }

    async validateUser(email, password): Promise<UserResponseDto> {

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash)

        if (!isMatch) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const { passwordHash, ...responseUser } = user;
        void passwordHash;
        return this.toUserResponse(responseUser)

    }
}
