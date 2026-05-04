import { AuthService } from './auth.service';
import { LoginSchema, LoginDto } from '@ganhealth/validation';
import { ZodValidationPipe } from './../../../common/pipes/zod.pipe';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('login')
    login(
        @Body(new ZodValidationPipe(LoginSchema))
        body: LoginDto
    ) {
        return this.authService.login(body)
    }
}
