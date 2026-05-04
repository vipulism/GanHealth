import { ROLE, STATUS } from '@ganhealth/types';
import z from "zod";



export const CreateUserSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(72),
    name: z.string().trim().min(2).max(100),
});

export const UserResponseSchema = z.object({
    email: z.email().trim().toLowerCase(),
    name: z.string().trim().min(2).max(100),
    id: z.string().length(36),
    role: z.nativeEnum(ROLE),
    status: z.nativeEnum(STATUS),
    isEmailVerified: z.boolean(),
    lastLoginAt: z.date().optional(),
    profileImage: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});


export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UserResponseDto = z.infer<typeof UserResponseSchema>;
