import { Prisma } from "@prisma/client";

export enum ROLE {
    USER = "USER",
    ADMIN = "ADMIN",
}

export enum STATUS {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
}

export interface JwtUser {
    sub: string;
    email: string;
    role: ROLE;
}


export const PublicUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    status: true,
    isEmailVerified: true,
    lastLoginAt: true,
    profileImage: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;
  
  export type PublicUser = Prisma.UserGetPayload<{
    select: typeof PublicUserSelect;
  }>;