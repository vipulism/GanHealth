import { AuthService } from './auth.service';
import { LoginSchema, LoginDto, RefreshSchema } from '@ganhealth/validation';
import { ZodValidationPipe } from './../../../common/pipes/zod.pipe';
import { Body, Controller, Post } from '@nestjs/common';
import { GetUser } from '../common/decorators/get.user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { Throttle } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly prisma: PrismaService
    ) { }

    @ApiTags('Auth')
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
    login(
        @Body(new ZodValidationPipe(LoginSchema))
        body: LoginDto
    ) {
        return this.authService.login(body)
    }

    @Post('refresh')
    refresh(
        @Body(new ZodValidationPipe(RefreshSchema))
        body: { refresh_token: string }
    ) {
        return this.authService.refresh(body.refresh_token)
    }

    @Post('logout')
    logout(@GetUser('id') userId: string) {
        return this.authService.logout(userId);
    }
}
