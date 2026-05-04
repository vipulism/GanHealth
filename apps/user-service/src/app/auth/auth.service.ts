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
        const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
        const access_token = this.jwtService.sign(payload, { expiresIn: '5m' });

        const hashedRt = await bcrypt.hash(refresh_token, 10);



        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRt },
        });


        return {
            access_token,
            refresh_token
        };
    }


    async refresh(refreshToken: string) {

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

            const newAccessToken = this.jwtService.sign({
                sub: user.id,
                email: user.email,
                role: user.role,
            });

            return { access_token: newAccessToken };

        } catch {
            throw new UnauthorizedException('Invalid refresh token');
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

    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        return { message: 'Logged out successfully' };
    }
}
