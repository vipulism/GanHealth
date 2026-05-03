Write-Host "🚀 Setting up GanHealth structure + documentation..."

# -------------------------
# Create folders
# -------------------------
$folders = @(
"apps/web",
"apps/user-service/src",
"apps/user-service/prisma",
"libs/shared/types",
"libs/shared/constants",
"libs/validation",
"libs/backend/common/guards",
"libs/backend/common/interceptors",
"libs/backend/common/filters",
"libs/backend/common/decorators",
"libs/ui/components",
"libs/data-access/api-client",
"libs/data-access/state",
"docs",
"docker",
"tools"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# -------------------------
# Add .gitkeep to empty dirs
# -------------------------
Get-ChildItem -Recurse -Directory | ForEach-Object {
    if ((Get-ChildItem $_.FullName | Measure-Object).Count -eq 0) {
        New-Item -ItemType File -Path "$($_.FullName)\.gitkeep" -Force | Out-Null
    }
}

# -------------------------
# README.md
# -------------------------
@"
# GanHealth

## 🧠 Stack
- Angular
- NestJS
- Prisma
- MariaDB
- Nx Monorepo
- Zod Validation
- JWT (future)

## 📁 Structure
- apps/ → applications & services
- libs/ → shared code
- docs/ → documentation
"@ | Set-Content README.md

# -------------------------
# architecture.md
# -------------------------
@"
# 🧱 Architecture Overview

## Data Flow
Frontend → Zod → Backend → Prisma → DB

## Shared
- Types
- Zod schemas
- Constants

## Not Shared
- Prisma models
- Services
- Controllers
- DB logic
"@ | Set-Content docs/architecture.md

# -------------------------
# backend.md
# -------------------------
@"
# 🧩 Backend (NestJS + Prisma)

## Structure
apps/user-service/
- src/
- prisma/

## Flow
Controller → Service → Prisma → DB
"@ | Set-Content docs/backend.md

# -------------------------
# validation.md
# -------------------------
@"
# 🔥 Validation (Zod)

## Example
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
});
"@ | Set-Content docs/validation.md

# -------------------------
# auth.md
# -------------------------
@"
# 🔐 Auth (Future)

JWT based authentication
"@ | Set-Content docs/auth.md

# -------------------------
# setup.md
# -------------------------
@"
# ⚙️ Setup

nx serve user-service
docker compose up -d
"@ | Set-Content docs/setup.md

Write-Host "✅ Structure + documentation setup complete!"