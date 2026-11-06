import { Router } from 'express';
import {
  startSessionSchema,
  completeSessionSchema,
  teacherById,
  type TeacherId,
  type SessionSummaryData,
  type Skill,
} from '@fluencialab/shared';
import { prisma } from '../db';
import { HttpError } from '../lib/http';
import { requireAuth } from '../middleware/auth';

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

const TEACHER_SKILL_DELTAS: Record<TeacherId, Partial<Record<Skill, number>>> = {
  architect: { grammar: 2, directThinking: 2 },
  vocabulary: { vocabulary: 5 },
  conversation: { speaking: 4, listening: 3 },
  listening: { listening: 5 },
  speaking: { speaking: 5 },
  pronunciation: { pronunciation: 5 },
  thinking: { directThinking: 5 },
  immersion: { listening: 2, speaking: 2, vocabulary: 2 },
};

sessionsRouter.post('/start', async (req, res, next) => {
  try {
    const input = startSessionSchema.parse(req.body);
    const userId = req.userId!;

    const session = await prisma.session.create({
      data: {
        userId,
        teacherId: input.teacherId,
        startedAt: new Date(),
      },
    });

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

sessionsRouter.post('/:id/finish', async (req, res, next) => {
  try {
    const { id } = req.params;
    const input = completeSessionSchema.parse(req.body);
    const userId = req.userId!;

    const session = await prisma.session.findFirst({
      where: { id, userId },
    });

    if (!session) {
      throw new HttpError(404, 'SESSION_NOT_FOUND', 'Sessão não encontrada');
    }

    const tid = session.teacherId as TeacherId;
    const teacherMeta = teacherById(tid);
    const defaultDeltas = TEACHER_SKILL_DELTAS[tid] ?? { speaking: 2 };

    const durationMin = Math.round(input.durationSec / 60);
    const speakingMin = Math.round(input.speakingSec / 60);

    const summaryData: SessionSummaryData = {
      title: `Sessão concluída com ${teacherMeta.name}`,
      highlights: [
        `Duração total: ${durationMin} min`,
        `Tempo de fala ativa: ${speakingMin} min`,
        `Palavras praticadas: ${input.wordsRecalled}`,
      ],
      recurringErrors: input.recurringErrors ?? [],
      newWords: input.newWords ?? [],
      structuresToPractice: input.structuresToPractice ?? [],
      nextChallenge: input.nextChallenge ?? 'Continue sua jornada no próximo módulo com consistência!',
      skillDeltas: defaultDeltas,
    };

    // 1. Atualiza a sessão
    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        endedAt: new Date(),
        durationSec: input.durationSec,
        speakingSec: input.speakingSec,
        exposureSec: input.exposureSec,
        wordsRecalled: input.wordsRecalled,
        summary: summaryData,
        skillDeltas: summaryData.skillDeltas,
      },
    });

    // 2. Grava recurringErrors em ErrorRecord (upsert com incremento)
    for (const err of summaryData.recurringErrors) {
      await prisma.errorRecord.upsert({
        where: {
          userId_phrase_correction: {
            userId,
            phrase: err.phrase,
            correction: err.correction,
          },
        },
        create: {
          userId,
          teacherId: session.teacherId,
          type: err.type,
          phrase: err.phrase,
          correction: err.correction,
          explanation: err.explanation,
          count: 1,
        },
        update: {
          count: { increment: 1 },
          lastSeen: new Date(),
        },
      });
    }

    // 3. Grava newWords em VocabItem (upsert)
    for (const word of summaryData.newWords) {
      await prisma.vocabItem.upsert({
        where: {
          userId_term: {
            userId,
            term: word.term,
          },
        },
        create: {
          userId,
          term: word.term,
          translation: word.translation,
          example1: word.example,
          block: 'session',
          easiness: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: new Date(),
        },
        update: {
          translation: word.translation,
        },
      });
    }

    // 4. Atualiza ModuleProgress (limitado a 100%)
    const currentMp = await prisma.moduleProgress.findUnique({
      where: { userId_teacherId: { userId, teacherId: session.teacherId } },
    });
    const newPercent = Math.min(100, (currentMp?.percent ?? 0) + input.progressDelta);
    const updatedMp = await prisma.moduleProgress.upsert({
      where: { userId_teacherId: { userId, teacherId: session.teacherId } },
      create: {
        userId,
        teacherId: session.teacherId,
        percent: newPercent,
      },
      update: {
        percent: newPercent,
      },
    });

    // 5. Atualiza Streak
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const existingStreak = await prisma.streak.findUnique({
      where: { userId },
    });

    let currentStreakCount = 1;
    let longestStreakCount = 1;

    if (!existingStreak) {
      await prisma.streak.create({
        data: {
          userId,
          current: 1,
          longest: 1,
          lastActiveDay: todayStr,
        },
      });
    } else {
      if (existingStreak.lastActiveDay === todayStr) {
        currentStreakCount = existingStreak.current;
        longestStreakCount = existingStreak.longest;
      } else if (existingStreak.lastActiveDay === yesterdayStr) {
        currentStreakCount = existingStreak.current + 1;
        longestStreakCount = Math.max(existingStreak.longest, currentStreakCount);
        await prisma.streak.update({
          where: { userId },
          data: {
            current: currentStreakCount,
            longest: longestStreakCount,
            lastActiveDay: todayStr,
          },
        });
      } else {
        currentStreakCount = 1;
        longestStreakCount = Math.max(existingStreak.longest, 1);
        await prisma.streak.update({
          where: { userId },
          data: {
            current: currentStreakCount,
            longest: longestStreakCount,
            lastActiveDay: todayStr,
          },
        });
      }
    }

    // 6. Desbloqueia Conquista "FIRST_SESSION"
    await prisma.achievement.upsert({
      where: {
        userId_code: {
          userId,
          code: 'FIRST_SESSION',
        },
      },
      create: {
        userId,
        code: 'FIRST_SESSION',
        title: 'Primeira Sessão Concluída',
      },
      update: {},
    });

    res.status(200).json({
      session: updatedSession,
      summary: summaryData,
      moduleProgress: updatedMp.percent,
      streak: currentStreakCount,
    });
  } catch (error) {
    next(error);
  }
});

sessionsRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const teacherId = req.query.teacherId as string | undefined;

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        ...(teacherId ? { teacherId } : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

    res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
});
