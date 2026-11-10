import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { env, type AiProvider } from '../config/env';

const PROVIDER_BASE_URL: Record<Exclude<AiProvider, 'anthropic' | 'openai'>, string> = {
  groq: 'https://api.groq.com/openai/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/',
};

const DEFAULT_MODELS: Record<AiProvider, string> = {
  groq: 'openai/gpt-oss-120b',
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-5',
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type LlmClient = {
  provider: AiProvider;
  model: string;
  complete: (params: {
    system: string;
    messages: ChatMessage[];
    maxTokens?: number;
  }) => Promise<string | null>;
};

function createOpenAiCompatibleClient(
  provider: 'groq' | 'gemini' | 'openai',
  apiKey: string,
): LlmClient {
  const baseURL = provider === 'openai' ? undefined : PROVIDER_BASE_URL[provider];
  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
  const model = env.AI_MODEL || DEFAULT_MODELS[provider];

  return {
    provider,
    model,
    async complete({ system, messages, maxTokens = 4096 }) {
      const response = await client.chat.completions.create(
        {
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, ...messages],
          ...(provider === 'openai' ? { response_format: { type: 'json_object' } } : {}),
        },
        { timeout: 30_000 },
      );
      return response.choices[0]?.message?.content?.trim() ?? null;
    },
  };
}

function createAnthropicClient(apiKey: string): LlmClient {
  const client = new Anthropic({ apiKey });
  const model = env.AI_MODEL || DEFAULT_MODELS.anthropic;

  return {
    provider: 'anthropic',
    model,
    async complete({ system, messages, maxTokens = 4096 }) {
      const response = await client.messages.create(
        {
          model,
          max_tokens: maxTokens,
          system,
          messages,
        },
        { timeout: 30_000 },
      );
      const block = response.content.find((c) => c.type === 'text');
      if (!block || block.type !== 'text') return null;
      return block.text.trim();
    },
  };
}

/**
 * Resolve o cliente LLM ativo. Sem provedor/chave → null (modo mock).
 */
export function createLlmClient(): LlmClient | null {
  const { AI_PROVIDER: provider, AI_API_KEY: apiKey } = env;
  if (!provider || !apiKey) return null;

  try {
    if (provider === 'anthropic') {
      return createAnthropicClient(apiKey);
    }
    return createOpenAiCompatibleClient(provider, apiKey);
  } catch (err) {
    console.warn(
      `Falha ao instanciar cliente LLM (${provider}). Operando em modo determinístico.`,
      err,
    );
    return null;
  }
}

export function extractJsonPayload(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim();
  }

  const firstCurly = text.indexOf('{');
  const lastCurly = text.lastIndexOf('}');
  if (firstCurly !== -1 && lastCurly > firstCurly) {
    return text.slice(firstCurly, lastCurly + 1);
  }

  return text.trim();
}
