# Project baseline: role JD + GanHealth alignment

This document is the **reference baseline** for the GanHealth monorepo: product scope, required stack, and responsibilities from the hiring brief. Use it for roadmap prioritization, architecture decisions, and **interview preparation**.

---

## Maintainer context

**Interview readiness:** The primary maintainer is preparing for an oncoming interview (**Monday**). When choosing what to build or document next, prioritize items that strengthen credible talking points: Angular 18+ / Material, NestJS + Prisma + MariaDB, secure auth (Okta / Auth0 / OIDC), Jest, Docker, Swagger, healthcare-aware design (PHI, integrations), and AI/voice at a high level (safety, boundaries).

---

## Infrastructure baseline (deployment target)

**MariaDB and all microservices** are planned to run in **Docker on a dedicated host on the same LAN** (not laptop-local production-like stacks). Connection strings and inter-service URLs must use **LAN- or Docker-network-appropriate hostnames**, not assumptions that everything is on `localhost`. Full rules: **`docs/INFRA-BASELINE.md`**.

---

## Role summary (source brief)

**Title:** Tech Lead–Full Stack Developer (Angular & NestJS) – Healthcare | Generative AI & Voice Agents  
**Location:** Remote – India  

**Mission:** Build a next-generation **clinical research and healthcare operations** platform for a **US-based healthcare** client: patient outcomes, clinical workflows, research analytics, and healthcare data integrations. Strong **Angular** front end + **NestJS** backend; contribute to **technical leadership** (best practices, mentoring, architecture, quality). Contribute to **AI-enabled** features (Generative AI, **voice agents**) for engagement and clinical automation. Work remote Agile with US healthcare, product, and engineering.

---

## What you’ll work on (platform capabilities)

- Patient registration and profile management  
- Clinical appointment scheduling  
- Digital forms and structured clinical data capture  
- Longitudinal patient outcome visualization  
- Automated patient communication workflows  
- Healthcare data integrations (**HL7 / EMR**)  
- Research compliance and reporting dashboards  
- **AI-powered workflows** and **voice-based** patient interaction tools  

---

## Key responsibilities

- Design and develop scalable **full-stack** apps (**Angular** + **NestJS**)  
- **Responsive UI** with **Angular 18+** and **Angular Material**  
- Backend **APIs** with **Node.js** and **NestJS**  
- **Database** design/optimization with **Prisma ORM** and **MariaDB**  
- Integrate **Generative AI** and **voice-based** healthcare assistants  
- **Architecture** and solution design discussions  
- **Technical leadership** and **mentorship** for junior engineers  
- **Code review**, standards, and best practices  
- **Secure authentication and authorization** using **Okta**, **Auth0**, or **similar** providers  
- **Automated tests** with **Jest**  
- **Docker**, **Git**, **Swagger**, **Postman** in the dev workflow  
- **Agile** collaboration with cross-functional teams  

---

## Required skills

- Strong **Angular (v18+)**  
- **Angular Material**  
- **Node.js** and **NestJS**  
- **Prisma ORM**  
- Strong **SQL** / **MariaDB** (or similar)  
- **Docker** and containerized development  
- Technical design, **code reviews**, **mentoring**  
- **REST APIs**, authentication, modern web architecture  
- **Git**, **Postman**, **Swagger**, **JIRA**, **Confluence**  

## Nice to have

- **Generative AI** / LLM applications  
- **Voice agents** / conversational AI  
- **HL7 / FHIR**  
- **CASA AI** or AI-assisted healthcare workflows  
- **Healthcare** / clinical research / digital health background  

## Qualifications

- CS or related degree  
- Strong full-stack experience  
- Ability to **lead** or **guide** technical initiatives  
- Strong communication; **distributed** team  

---

## GanHealth repo alignment (living map)

| JD area | Repo / direction |
|--------|-------------------|
| NestJS + Prisma + MariaDB | `apps/user-service`, Prisma schema, `ConfigModule` |
| Swagger | `user-service` OpenAPI setup |
| Jest | Unit tests; strengthen coverage and CI |
| Docker | Per-service images on **LAN Docker host** with MariaDB; see `docs/INFRA-BASELINE.md` |
| Auth (Okta / Auth0 / similar) | **Gap:** add OIDC/JWKS + IdP user linking alongside or replacing local JWT where required |
| Angular 18+ / Material | Frontend apps/libs per Nx layout |
| HL7 / FHIR / EMR | Future integration layer; design APIs and bounded contexts early |
| Gen AI / voice | Future services; plan PHI boundaries, logging, and consent |

Update this table as new apps and integrations land.

---

## Monday interview: focused prep checklist

Use the JD as the outline for stories and depth.

1. **Full-stack narrative:** One end-to-end example (e.g. patient profile or auth flow): Angular → API → Prisma → MariaDB; mention versioning, validation, errors.  
2. **Tech lead:** 1–2 examples of **standards**, **reviews**, or **mentoring** (concrete, not generic).  
3. **Auth:** Be ready to discuss **Okta vs Auth0** at a high level (OIDC, JWT, JWKS, audience/issuer, RBAC, refresh/session patterns) and **why** IdP matters in healthcare (central identity, audit, MFA). Relate to current repo: local JWT today → IdP path.  
4. **Healthcare:** **PHI** awareness: no secrets in logs, least privilege, encryption in transit, future audit trails; **FHIR/HL7** as “integration standards I’d interface with, not store carelessly.”  
5. **AI / voice:** Safe defaults: human-in-the-loop for clinical decisions, data minimization, opt-in; voice as **channel** with same backend contracts.  
6. **Tooling:** Comfort with **Docker**, **Swagger**, **Postman**, **Jest**, **Git** branching/review.  
7. **This codebase:** Skim `user-service` auth, Prisma models, and any Angular app entrypoints so you can point to **real files** if screen-shared.

---

## Document ownership

- Treat this file as the **single JD-aligned baseline** for the project unless the hiring brief changes.  
- **Deployment topology** is defined in **`docs/INFRA-BASELINE.md`**; keep it in sync when infra assumptions change.  
- **Implementation tiers** (A/B/C scope for the monorepo): **`docs/TIER-ROADMAP.md`**.  
- On scope changes from the client, update **GanHealth repo alignment** and responsibilities sections accordingly.
