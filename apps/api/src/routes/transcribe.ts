import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { HttpError } from '../lib/http';

export const transcribeRouter = Router();

transcribeRouter.use(requireAuth);

const transcribeSchema = z.object({
  audioBase64: z.string().min(1, 'audioBase64 é obrigatório'),
  mimeType: z.string().optional().default('audio/webm'),
  lang: z.string().optional().default('en'),
});

transcribeRouter.post('/', async (req, res, next) => {
  try {
    const parseResult = transcribeSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new HttpError(
        400,
        'INVALID_PAYLOAD',
        parseResult.error.issues[0]?.message ?? 'Payload inválido',
      );
    }

    const { audioBase64, mimeType, lang } = parseResult.data;

    // Se temos provedor Groq ou OpenAI com chave de API:
    if ((env.AI_PROVIDER === 'groq' || env.AI_PROVIDER === 'openai') && env.AI_API_KEY) {
      const buffer = Buffer.from(audioBase64, 'base64');
      const blob = new Blob([buffer], { type: mimeType });
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-large-v3-turbo');
      if (lang) {
        const shortLang = lang.split('-')[0];
        if (shortLang) {
          formData.append('language', shortLang);
        }
      }

      const endpoint =
        env.AI_PROVIDER === 'groq'
          ? 'https://api.groq.com/openai/v1/audio/transcriptions'
          : 'https://api.openai.com/v1/audio/transcriptions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.AI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(
          `[Whisper ${env.AI_PROVIDER}] Erro na transcrição (${response.status}):`,
          errText,
        );
        return res.json({ text: '' });
      }

      const data = (await response.json()) as { text?: string };
      const rawText = data.text?.trim() ?? '';
      // Whisper em áudio silencioso ou ruído costuma alucinar apenas pontuação (ex: "." ou "...")
      const isOnlyPunctuation = /^[.\s,!?…]+$/.test(rawText);
      const text = isOnlyPunctuation ? '' : rawText;
      return res.json({ text });
    }

    // Modo mock / sem provedor de áudio configurado
    return res.json({ text: '' });
  } catch (err) {
    next(err);
  }
});
