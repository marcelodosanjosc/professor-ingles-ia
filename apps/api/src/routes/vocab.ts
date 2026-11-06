import { Router } from 'express';
import { srsReviewSchema, type VocabCardData } from '@fluencialab/shared';
import { prisma } from '../db';
import { HttpError } from '../lib/http';
import { requireAuth } from '../middleware/auth';
import { calculateSm2 } from '../services/srs';

export const vocabRouter = Router();

vocabRouter.use(requireAuth);

vocabRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const block = req.query.block as string | undefined;
    const dueOnly = req.query.dueOnly === 'true';

    const now = new Date();

    const whereClause: {
      userId: string;
      block?: string;
      nextReview?: { lte: Date };
    } = {
      userId,
    };

    if (block) {
      whereClause.block = block;
    }

    if (dueOnly) {
      whereClause.nextReview = { lte: now };
    }

    const items = await prisma.vocabItem.findMany({
      where: whereClause,
      orderBy: { nextReview: 'asc' },
    });

    const [total, dueToday, mastered] = await Promise.all([
      prisma.vocabItem.count({ where: { userId } }),
      prisma.vocabItem.count({ where: { userId, nextReview: { lte: now } } }),
      prisma.vocabItem.count({ where: { userId, repetitions: { gte: 4 } } }),
    ]);

    const formattedItems: VocabCardData[] = items.map((item) => ({
      id: item.id,
      term: item.term,
      translation: item.translation,
      pronunciation: item.pronunciation ?? '',
      example1: item.example1 ?? '',
      example2: item.example2 ?? '',
      collocation: item.collocation ?? '',
      block: item.block,
      isTop50: item.isTop50,
      easiness: item.easiness,
      interval: item.interval,
      repetitions: item.repetitions,
      nextReview: item.nextReview.toISOString(),
    }));

    res.status(200).json({
      items: formattedItems,
      total,
      dueToday,
      mastered,
    });
  } catch (error) {
    next(error);
  }
});

vocabRouter.post('/review', async (req, res, next) => {
  try {
    const input = srsReviewSchema.parse(req.body);
    const userId = req.userId!;

    const item = await prisma.vocabItem.findFirst({
      where: { id: input.vocabId, userId },
    });

    if (!item) {
      throw new HttpError(404, 'VOCAB_NOT_FOUND', 'Item de vocabulário não encontrado');
    }

    const sm2Result = calculateSm2(
      {
        easiness: item.easiness,
        interval: item.interval,
        repetitions: item.repetitions,
      },
      input.quality,
    );

    const updated = await prisma.vocabItem.update({
      where: { id: item.id },
      data: {
        easiness: sm2Result.easiness,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        nextReview: sm2Result.nextReview,
        lastReviewed: new Date(),
        ...(input.quality >= 3 ? { timesRecalled: { increment: 1 } } : {}),
      },
    });

    const formattedItem: VocabCardData = {
      id: updated.id,
      term: updated.term,
      translation: updated.translation,
      pronunciation: updated.pronunciation ?? '',
      example1: updated.example1 ?? '',
      example2: updated.example2 ?? '',
      collocation: updated.collocation ?? '',
      block: updated.block,
      isTop50: updated.isTop50,
      easiness: updated.easiness,
      interval: updated.interval,
      repetitions: updated.repetitions,
      nextReview: updated.nextReview.toISOString(),
    };

    res.status(200).json({ item: formattedItem });
  } catch (error) {
    next(error);
  }
});
