import { existsSync } from 'node:fs';
import { z } from 'zod';

if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch {
    // Se o arquivo não puder ser lido ou já estiver carregado pelo runtime, ignora
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória').default('file:./dev.db'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  WEB_ORIGIN: z.string().url('WEB_ORIGIN deve ser uma URL válida').default('http://localhost:5173'),
  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-5'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues
    .map((issue) => ` - ${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  console.error(`❌ Falha na configuração do ambiente:\n${issues}`);
  throw new Error(`Configuração inválida de variáveis de ambiente:\n${issues}`);
}

export const env = result.data;
export type Env = typeof env;
