import z from "zod";

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(72),
});

export const LoginResponseScheme = z.object({
    access_token: z.jwt(),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type LoginResponseDto = z.infer<typeof LoginResponseScheme>;