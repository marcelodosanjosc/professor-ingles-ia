#!/usr/bin/env node
import { execSync } from 'node:child_process';
import pg from 'pg';

async function ensurePostgresDatabase(databaseUrl) {
  const url = new URL(databaseUrl);
  const targetDb = url.pathname.replace(/^\//, '');
  if (!targetDb) return;

  // Conecta ao banco administrativo 'postgres' para garantir que o banco da aplicação exista
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';

  const client = new pg.Client({ connectionString: adminUrl.toString() });
  try {
    await client.connect();
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDb],
    );
    if (res.rowCount === 0) {
      console.log(`📦 Criando banco de dados PostgreSQL "${targetDb}"...`);
      const safeDbName = targetDb.replace(/"/g, '""');
      await client.query(`CREATE DATABASE "${safeDbName}"`);
      console.log(`✅ Banco de dados "${targetDb}" criado com sucesso!`);
    } else {
      console.log(`✅ Banco de dados "${targetDb}" já existe.`);
    }
  } catch (err) {
    console.warn(
      `⚠️ Aviso ao verificar/criar banco "${targetDb}":`,
      err instanceof Error ? err.message : err,
    );
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres =
    dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

  if (isPostgres) {
    await ensurePostgresDatabase(dbUrl);
    console.log('🔄 Sincronizando schema Prisma com PostgreSQL...');
    execSync('./node_modules/.bin/prisma db push --schema=prisma/schema.postgres.prisma', {
      stdio: 'inherit',
    });
  } else {
    console.log('🔄 Sincronizando schema Prisma com SQLite...');
    execSync('./node_modules/.bin/prisma migrate deploy', {
      stdio: 'inherit',
    });
  }

  if (process.env.SEED_ON_START === 'true') {
    console.log('🌱 Executando seed inicial...');
    execSync('./node_modules/.bin/tsx prisma/seed.ts', { stdio: 'inherit' });
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erro no entrypoint do container:', err);
    process.exit(1);
  });
