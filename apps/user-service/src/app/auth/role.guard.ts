import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { ROLE } from '@ganhealth/types';
import { UserResponseDto } from '@ganhealth/validation';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(
            ROLES_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        );

        if (!requiredRoles) return true;

        const request = context.switchToHttp().getRequest<{ user: UserResponseDto }>();
        const user = request.user;

        return requiredRoles.includes(user.role);
    }
}