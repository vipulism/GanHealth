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