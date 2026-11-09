import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Carrega .env com a API nativa do Node (sem dependência dotenv)
if (existsSync('.env')) process.loadEnvFile('.env');

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const isPostgres =
  dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

export default defineConfig({
  schema: isPostgres
    ? 'prisma/schema.postgres.prisma'
    : 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx --env-file=.env prisma/seed.ts',
  },
  datasource: {
    url: dbUrl,
  },
});
