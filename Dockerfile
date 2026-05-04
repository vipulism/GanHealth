# 🟢 Builder
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx nx build user-service \
    && npx prisma generate --schema=apps/user-service/prisma/schema.prisma \
    && npm prune --omit=dev


# 🟡 Runtime
FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app/dist/apps/user-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]