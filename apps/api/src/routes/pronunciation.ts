import { Router } from 'express';
import { evaluatePronunciationSchema } from '@fluencialab/shared';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';

export const pronunciationRouter = Router();

pronunciationRouter.use(requireAuth);

pronunciationRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId!;

    const tests = await prisma.pronunciationTest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.status(200).json({ tests });
  } catch (error) {
    next(error);
  }
});

pronunciationRouter.post('/', async (req, res, next) => {
  try {
    const input = evaluatePronunciationSchema.parse(req.body);
    const userId = req.userId!;

    const clean = (s: string) =>
      s.toLowerCase().replace(/[.,!?;:'"’]/g, '').split(/\s+/).filter(Boolean);

    const phraseWords = clean(input.phrase);
    const transWords = clean(input.transcript);

    const matched = phraseWords.filter((w) => transWords.includes(w));
    const textAccuracy = phraseWords.length
      ? Math.round((matched.length / phraseWords.length) * 100)
      : 0;

    const aiScore = Math.min(100, Math.max(0, Math.round(textAccuracy * 0.7 + input.selfScore * 0.3)));
    const missed = phraseWords.filter((w) => !transWords.includes(w));
    const wordsToFocus = missed.length > 0 ? missed : [phraseWords[0] || 'clarity'];

    let feedback = 'Excelente precisão articulatória e ritmo fluente!';
    if (aiScore < 70) {
      feedback = `Foque na posição da língua e no ar expirado nas palavras: ${wordsToFocus.join(', ')}. Evite sons extras ao final das consoantes.`;
    } else if (aiScore < 85) {
      feedback = `Boa reprodução! Atenção às reduções naturais e conexões suaves entre as palavras ${wordsToFocus.slice(0, 2).join(' e ')}.`;
    }

    const testRecord = await prisma.pronunciationTest.create({
      data: {
        userId,
        phrase: input.phrase,
        transcript: input.transcript,
        selfScore: input.selfScore,
        aiScore,
        weekIndex: input.weekIndex,
      },
    });

    res.status(200).json({
      testRecord,
      aiScore,
      feedback,
      wordsToFocus,
    });
  } catch (error) {
    next(error);
  }
});
