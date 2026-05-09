# Tier A — `user-service` checklist

Part of the project tier roadmap: **[`TIER-ROADMAP.md`](./TIER-ROADMAP.md)**.

**Tier A (sections 1–5): complete** — last verified against repo.

**Section 6 (Jest): intentionally skipped for now** — revisit when you want `nx test user-service` green.

---

## Summary

| Section | Status |
|--------|--------|
| **1. Config** | Done — `validateEnv` + Zod in `apps/user-service/src/app/config/env.validation.ts`, wired in `AppModule` |
| **2. Prisma** | Done — `refreshToken: ''` on logout; migration `20260510120000_add_user_created_at_index` |
| **3. User list** | Done — pagination + `orderBy: { createdAt: 'desc' }` |
| **4. Cleanup / Swagger** | Done — `@ApiTags('Users')`, `validateUser(email: string, password: string)`, generic `ZodValidationPipe<unknown, …>` |
| **5. Remote DB note** | Done — `.env.local.example` + layered `envFilePath` in `AppModule` |
| **6. Jest** | **Skipped (deferred)** |

---

## 1. Config & startup

- [x] Add `@nestjs/config`
- [x] `ConfigModule.forRoot({ isGlobal: true, validate: … })` with Zod for `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`
- [x] Use `ConfigService` in `main.ts`, `auth.module.ts` (JWT), `jwt.strategy.ts` instead of raw `process.env` where applicable
- [x] `app.enableShutdownHooks()` in `main.ts`

---

## 2. Prisma / DB consistency

- [x] Align `@@index([createdAt])` with DB — migration `User_createdAt_idx`
- [x] Fix `AuthService.logout` — `refreshToken: ''` (matches non-null `String` field)

---

## 3. User list API

- [x] `findAll`: `orderBy: { createdAt: 'desc' }`
- [x] Pagination (`page` / `limit`)

---

## 4. Small cleanup & Swagger polish

- [x] `UserController`: `@ApiTags('Users')` (+ extra decorators as needed)
- [x] Remove unused imports
- [x] `AuthController`: no stray `PrismaService` import
- [x] `AuthService.validateUser`: explicit `string` types
- [x] `ZodValidationPipe`: `unknown` + generic schema typing

---

## 5. Remote DB + Docker note

- [x] `.env.example` / `.env.local.example` + comments; Nest `envFilePath` stack documented in `AppModule`

---

## 6. Jest (deferred — skip for now)

- [ ] ~~`jest.config.cts` `setupFiles`~~ — *when you pick this up*
- [ ] ~~Mock `PrismaService` / `JwtService`; behavior tests~~
- [ ] ~~`nx test user-service` passes~~

---

## Reference

- JD / baseline: [docs/JD-PROJECT-BASELINE.md](./JD-PROJECT-BASELINE.md)
- Infra: [docs/INFRA-BASELINE.md](./INFRA-BASELINE.md)
