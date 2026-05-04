import { UserResponseDto } from "@ganhealth/validation";
import { createParamDecorator } from "@nestjs/common";

/** Returns the authenticated request user or a selected user field. */
export const GetUser = createParamDecorator<
    keyof UserResponseDto | undefined,
    UserResponseDto | UserResponseDto[keyof UserResponseDto]>(
        (data, ctx) => {
            const request = ctx.switchToHttp().getRequest()
            const user = request.user as UserResponseDto;

            return data ? user?.[data] : user;
        }
    )