# Tier A — `user-service` checklist (Jest last)

**Done?** Line ke start par `- [ ]` ko `- [x]` kar do (space brackets ke beech mein zaroori hai).

Order: **1 → 5**, then **6 (Jest) last**.

---

## 1. Config & startup

- [x] Add `@nestjs/config`
- [ ] `ConfigModule.forRoot({ isGlobal: true, validate: … })` with Zod for `DATABASE_URL`, `JWT_SECRET`, `PORT`, optional `NODE_ENV`
- [ ] Use `ConfigService` in `main.ts`, `auth.module.ts` (JWT), `jwt.strategy.ts` instead of raw `process.env` where applicable
- [ ] `app.enableShutdownHooks()` in `main.ts`

---

## 2. Prisma / DB consistency

- [ ] Align `@@index([createdAt])` with DB: add migration **or** remove index from schema (pick one)
- [ ] Fix `AuthService.logout`: `refreshToken: null` vs schema — use `""` **or** `String?` + migration

---

## 3. User list API

- [ ] `findAll`: `orderBy: { createdAt: 'desc' }`
- [ ] Pagination (`page`/`limit` or cursor) instead of only fixed `take: 10`

---

## 4. Small cleanup & optional Swagger polish

- [ ] `UserController`: `@ApiTags('Users')`
- [ ] Remove unused imports (`Param`, `Req`, … if unused)
- [ ] `AuthController`: remove unused `PrismaService` import (if still present)
- [ ] `AuthService.validateUser`: explicit `string` types for `email`, `password`
- [ ] (Optional) `ZodValidationPipe`: `unknown` instead of `any`

---

## 5. Remote DB + Docker note

- [ ] `.env.example` or short comment: if app runs in Docker, `DATABASE_URL` host must be reachable from the container (LAN IP / hostname; not wrong `localhost` for a DB on another machine)

---

## 6. Jest (last)

- [ ] `apps/user-service/jest.config.cts`: `setupFiles` with test env (`DATABASE_URL`, `JWT_SECRET` dummies)
- [ ] `UserService` / `AuthService` specs: mock `PrismaService` (+ `JwtService` for auth), add 2–3 behavior tests
- [ ] `nx test user-service` passes

---

## Reference

- JD / baseline: [docs/JD-PROJECT-BASELINE.md](./JD-PROJECT-BASELINE.md)
- Infra: [docs/INFRA-BASELINE.md](./INFRA-BASELINE.md)
