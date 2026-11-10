import { existsSync } from 'node:fs';
import { z } from 'zod';

if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch {
    // Se o arquivo não puder ser lido ou já estiver carregado pelo runtime, ignora
  }
}

const optionalTrimmed = z
  .string()
  .optional()
  .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined));

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória').default('file:./dev.db'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
    WEB_ORIGIN: z.string().url('WEB_ORIGIN deve ser uma URL válida').default('http://localhost:5173'),
    /** Provedor ativo: groq | gemini | openai | anthropic. Vazio = modo mock. */
    AI_PROVIDER: z
      .preprocess(
        (val) => (typeof val === 'string' && val.trim().length > 0 ? val.trim() : undefined),
        z.enum(['groq', 'gemini', 'openai', 'anthropic']).optional(),
      ),
    /** Chave do provedor escolhido em AI_PROVIDER. */
    AI_API_KEY: optionalTrimmed,
    /** Model id do provedor. Se vazio, usa o default do provedor. */
    AI_MODEL: optionalTrimmed,
    /** Legado: ainda funciona se AI_PROVIDER/AI_API_KEY não forem definidos. */
    ANTHROPIC_API_KEY: optionalTrimmed,
    ANTHROPIC_MODEL: optionalTrimmed,
  })
  .transform((data) => {
    const provider = data.AI_PROVIDER ?? (data.ANTHROPIC_API_KEY ? 'anthropic' : undefined);
    const apiKey =
      data.AI_API_KEY ??
      (provider === 'anthropic' || !data.AI_PROVIDER ? data.ANTHROPIC_API_KEY : undefined);
    const model = data.AI_MODEL ?? data.ANTHROPIC_MODEL;

    return {
      NODE_ENV: data.NODE_ENV,
      PORT: data.PORT,
      DATABASE_URL: data.DATABASE_URL,
      JWT_SECRET: data.JWT_SECRET,
      WEB_ORIGIN: data.WEB_ORIGIN,
      AI_PROVIDER: provider as 'groq' | 'gemini' | 'openai' | 'anthropic' | undefined,
      AI_API_KEY: apiKey,
      AI_MODEL: model,
    };
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
export type AiProvider = 'groq' | 'gemini' | 'openai' | 'anthropic';
