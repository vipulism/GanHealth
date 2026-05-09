# Tier A — `user-service` checklist (Jest last)

**Done?** Line ke start par `- [ ]` ko `- [x]` kar do (space brackets ke beech mein zaroori hai).

**Last verified:** repo scan — Tier A **partially complete** (see summary below).

Order: **1 → 5**, then **6 (Jest) last**.

---

## Summary (quick)

| Section | Status |
|--------|--------|
| **1. Config** | Mostly done — **Zod `validate` on `ConfigModule` missing** |
| **2. Prisma** | **Logout fixed** (`refreshToken: ''`); **`createdAt` index still not in migrations** |
| **3. User list** | **Done** (pagination + `orderBy`) |
| **4. Cleanup / Swagger** | **Partial** — `@ApiTags('Users')`, `validateUser` types, Zod pipe `unknown` pending |
| **5. Remote DB note** | **Done** (`.env.example` + INFRA pointer) |
| **6. Jest** | **Not done** — `nx test user-service` **fails** (4 suites: missing mocks) |

---

## 1. Config & startup

- [x] Add `@nestjs/config`
- [ ] `ConfigModule.forRoot({ isGlobal: true, validate: … })` with Zod for `DATABASE_URL`, `JWT_SECRET`, `PORT`, optional `NODE_ENV`  
  - *Current:* `forRoot` has `expandVariables` only — no `validate` / Zod env schema.
- [x] Use `ConfigService` in `main.ts`, `auth.module.ts` (JWT), `jwt.strategy.ts` instead of raw `process.env` where applicable
- [x] `app.enableShutdownHooks()` in `main.ts`

---

## 2. Prisma / DB consistency

- [ ] Align `@@index([createdAt])` with DB: add migration **or** remove index from schema (pick one)  
  - *Current:* index in `schema.prisma`; **no** migration SQL adds `User_createdAt_idx`.
- [x] Fix `AuthService.logout`: `refreshToken: null` vs schema — use `""` **or** `String?` + migration  
  - *Current:* `data: { refreshToken: '' }` in `auth.service.ts`.

---

## 3. User list API

- [x] `findAll`: `orderBy: { createdAt: 'desc' }`
- [x] Pagination (`page`/`limit` or cursor) instead of only fixed `take: 10`  
  - *Current:* `GET user/all?page&limit`, `UserService.findAll` + `meta`.

---

## 4. Small cleanup & optional Swagger polish

- [ ] `UserController`: `@ApiTags('Users')`  
  - *Current:* `ApiQuery` present; **no** class-level `@ApiTags('Users')`.
- [x] Remove unused imports (`Param`, `Req`, … if unused)
- [x] `AuthController`: remove unused `PrismaService` import (if still present)
- [ ] `AuthService.validateUser`: explicit `string` types for `email`, `password`  
  - *Current:* still `validateUser(email, password)` (implicit `any`).
- [ ] (Optional) `ZodValidationPipe`: `unknown` instead of `any`

---

## 5. Remote DB + Docker note

- [x] `.env.example` or short comment: if app runs in Docker, `DATABASE_URL` host must be reachable from the container (LAN IP / hostname; not wrong `localhost` for a DB on another machine)

---

## 6. Jest (last)

- [ ] `apps/user-service/jest.config.cts`: `setupFiles` with test env (`DATABASE_URL`, `JWT_SECRET` dummies)
- [ ] `UserService` / `AuthService` specs: mock `PrismaService` (+ `JwtService` for auth), add 2–3 behavior tests  
  - *Current:* specs still omit mocks → **Nest DI errors**.
- [ ] `nx test user-service` passes  
  - *Current:* **fails** (4 failed suites).

---

## Reference

- JD / baseline: [docs/JD-PROJECT-BASELINE.md](./JD-PROJECT-BASELINE.md)
- Infra: [docs/INFRA-BASELINE.md](./INFRA-BASELINE.md)
