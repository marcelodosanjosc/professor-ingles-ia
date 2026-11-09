import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import { env } from './config/env';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createAdapter() {
  if (
    env.DATABASE_URL.startsWith('postgres://') ||
    env.DATABASE_URL.startsWith('postgresql://')
  ) {
    return new PrismaPg({ connectionString: env.DATABASE_URL });
  }
  return new PrismaBetterSqlite3({ url: env.DATABASE_URL });
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(),
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
