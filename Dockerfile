# ==============================================================================
# Stage 1: Build (Frontend React + Geração Prisma Client)
# ==============================================================================
FROM node:22-bookworm-slim AS builder

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copia manifestos do workspace para cache de dependências
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --no-frozen-lockfile

# Copia código-fonte
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Gera o Prisma Client compatível com PostgreSQL e compila o Frontend React (Vite)
RUN pnpm --filter @fluencialab/api exec prisma generate --schema=prisma/schema.postgres.prisma \
  && pnpm --filter @fluencialab/web build

# ==============================================================================
# Stage 2: Runtime enxuto (otimizado para mem_limit: 256m e porta 8080)
# ==============================================================================
FROM node:22-bookworm-slim AS runner

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
# Limita o heap do V8 para caber com folga dentro do mem_limit: 256m do container
ENV NODE_OPTIONS="--max-old-space-size=192"

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.base.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/apps/web/dist ./apps/web/dist

WORKDIR /app/apps/api

EXPOSE 8080

CMD ["sh", "-c", "node scripts/docker-entrypoint.mjs && npx tsx src/server.ts"]
