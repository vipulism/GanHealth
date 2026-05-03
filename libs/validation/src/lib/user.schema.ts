import z from "zod";



export const CreateUserSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(72),
    name: z.string().trim().min(2).max(100),
});


export type CreateUserDto = z.infer<typeof CreateUserSchema>;
