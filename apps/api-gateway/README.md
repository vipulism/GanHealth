# API Gateway

NestJS edge service: CORS, rate limits (`@nestjs/throttler`), shared-secret JWT validation (no business rules), structured logging with `x-request-id`, and reverse proxy routes to upstream services.

## Path map

| Gateway path | Upstream |
| --- | --- |
| `/api/v1/auth/**` | `USER_SERVICE_URL` (`user-service`) |
| `/api/v1/user/**` | `USER_SERVICE_URL` (`user-service`) |
| `/api/v1/patients/**` | `SECOND_SERVICE_URL` (e.g. future `patient-service`) |

Unauthenticated (proxied) entrypoints match `user-service`: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/user/create`.

Health (not proxied): `GET /api/health` (version-neutral).

## Environment

See repo root `.env.local.example`. Required:

- `JWT_SECRET` (min 32 chars; same as `user-service` for Tier B)
- `USER_SERVICE_URL` — origin only, e.g. `http://user-service:3000` on Docker LAN
- `SECOND_SERVICE_URL` — origin for the second service (may point at a stub until `patient-service` exists)

**Local dev (gateway on the host, user-service on the host):** Docker-style hostnames such as `user-service` will not resolve. Override in `.env.local`, for example `USER_SERVICE_URL=http://127.0.0.1:3000`, while keeping Docker DNS names in compose-only env files.

Optional:

- `GATEWAY_PORT` (default `3100`; avoids clashing with `user-service` `USER_SERVICE_PORT=3000` in a shared root `.env`)
- `PORT` — optional fallback for the gateway listen port if `GATEWAY_PORT` is unset
- `UPSTREAM_TIMEOUT_MS` (default `30000`)
- `CORS_ORIGIN` — comma-separated allowed origins; omit for permissive `origin: true` (development only)

## Tracing a request

```bash
curl -sS -H 'x-request-id: demo-trace-1' http://localhost:3100/api/health
```

The same `x-request-id` is forwarded to upstreams when calling proxied routes.

## Tier C note

Shared `JWT_SECRET` is intentional for Tier B; plan migration to JWKS / enterprise IdP at the gateway in a later tier.
