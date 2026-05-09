# Infrastructure baseline: Docker on a dedicated LAN host

This is a **project-level** assumption for GanHealth runtime and documentation. Align Docker Compose files, env examples, and service-to-service URLs with this model unless explicitly changed.

---

## Target topology

- **MariaDB** runs in **Docker** on a **dedicated machine** on the **same LAN** as developers and (eventually) other runtime components.
- **All NestJS (and other) microservices** are intended to run in **Docker on that same host** (co-located with the DB host), not on each developer’s laptop in production-like deployments.
- Developers may still run apps **locally** for debugging, but **configuration and examples** should make the “services + DB on the LAN Docker host” path the **default mental model**.

---

## Configuration rules

1. **`DATABASE_URL` (and any DB host env vars)** must use a hostname or IP that is valid **from inside the service container** on the Docker host:
   - Use the Docker host’s **LAN address** or a **stable DNS name** on that network.
   - Avoid `localhost` inside a container when MariaDB is another container or another port on the same machine — use the **published host port** mapping and the **host’s reachable address**, or the **Docker network service name** if DB and app share a user-defined bridge network on that host.

2. **Service-to-service calls** (future microservices) should use **LAN-reachable hostnames** or **Docker internal DNS names** on that host’s compose network — document the chosen pattern in each stack’s compose file.

3. **Secrets** (`JWT_SECRET`, DB passwords, IdP client secrets) stay in env / secret stores — never commit real values. `.env.example` only shows placeholders.

4. **Firewall / MariaDB**: the DB container (or host) must allow TCP from other containers on that host and, if needed, from trusted LAN clients; MariaDB user grants must allow connections from the relevant client hosts or `%` per your security policy.

---

## Local development vs deployment host

| Mode | Purpose |
|------|--------|
| Laptop + DB on LAN | Quick dev: point `DATABASE_URL` at the LAN MariaDB host (as you do today). |
| All services on LAN Docker host | **Target**: compose (or orchestrator) on that machine runs API containers + DB; env uses internal or host LAN names consistently. |

---

## Related files

- `docs/JD-PROJECT-BASELINE.md` — product and role alignment.
- `.env.example` — placeholder `db-host.example` should be replaced with your LAN DB hostname or Docker service name.

Update this document if the team later splits DB and apps across multiple machines or moves to cloud-managed databases.
