import { JwtUser } from '@ganhealth/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, LoginResponseDto, UserResponseDto } from '@ganhealth/validation';
import { toUserResponse } from '@ganhealth/common';


@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

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
        return toUserResponse(responseUser);

    }
}
