import { Router } from 'express';
import { z } from 'zod';
import {
  isTeacherId,
  teacherById,
  profileToPromptVars,
  type TeacherId,
  type SessionHistoryItem,
  type SessionSummaryData,
  type ProfileInput,
} from '@fluencialab/shared';
import { prisma } from '../db';
import { HttpError } from '../lib/http';
import { requireAuth } from '../middleware/auth';
import { buildTeacherSystemPrompt } from '../services/promptBuilder';
import { runTeacherAction } from '../services/anthropic';

export const teacherRouter = Router();

teacherRouter.use(requireAuth);

const teacherActionBodySchema = z.object({
  action: z.string().min(1, 'Ação é obrigatória'),
  payload: z.record(z.string(), z.unknown()).optional(),
});

teacherRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !isTeacherId(id)) {
      throw new HttpError(404, 'TEACHER_NOT_FOUND', `Professor com id "${id}" não encontrado`);
    }

    const userId = req.userId!;
    const teacherId = id as TeacherId;

    // Busca perfil do usuário para compor variáveis do prompt
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const p = user?.profile;
    const profileInput: ProfileInput = {
      targetLanguage: p?.targetLanguage ?? 'Inglês',
      nativeLanguage: p?.nativeLanguage ?? 'Português',
      level: (p?.level as ProfileInput['level']) ?? 'A2',
      levelOther: p?.levelOther ?? undefined,
      goal: (p?.goal as ProfileInput['goal']) ?? 'conversation',
      goalOther: p?.goalOther ?? undefined,
      minutesPerDay: p?.minutesPerDay ?? 30,
      deadlineMonths: p?.deadlineMonths ?? 3,
      otherLanguages: (p?.otherLanguages as string[]) ?? [],
      mainDifficulty: (p?.mainDifficulty as ProfileInput['mainDifficulty']) ?? 'speaking',
      interests: (p?.interests as string[]) ?? ['tecnologia', 'viagens', 'dia a dia'],
      routine: (p?.routine as ProfileInput['routine']) ?? 'work',
      routineOther: p?.routineOther ?? undefined,
      hardSounds: p?.hardSounds ?? undefined,
      blockSituations: p?.blockSituations ?? undefined,
    };

    const profileVars = profileToPromptVars(profileInput);
    const systemPrompt = buildTeacherSystemPrompt(teacherId, profileVars);

    // Progresso do módulo
    const mp = await prisma.moduleProgress.findUnique({
      where: { userId_teacherId: { userId, teacherId } },
    });
    const moduleProgress = mp?.percent ?? 0;

    // Últimas sessões
    const sessions = await prisma.session.findMany({
      where: { userId, teacherId },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    const recentSessions: SessionHistoryItem[] = sessions.map((s) => ({
      id: s.id,
      teacherId: s.teacherId,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt ? s.endedAt.toISOString() : null,
      durationSec: s.durationSec,
      speakingSec: s.speakingSec,
      exposureSec: s.exposureSec,
      wordsRecalled: s.wordsRecalled,
      summary: s.summary as SessionSummaryData | null,
    }));

    // Erros recentes vinculados ao professor
    const recentErrors = await prisma.errorRecord.findMany({
      where: { userId, teacherId },
      orderBy: { count: 'desc' },
      take: 5,
    });

    res.status(200).json({
      teacher: teacherById(teacherId),
      systemPrompt,
      moduleProgress,
      recentSessions,
      recentErrors,
    });
  } catch (error) {
    next(error);
  }
});

teacherRouter.post('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !isTeacherId(id)) {
      throw new HttpError(404, 'TEACHER_NOT_FOUND', `Professor com id "${id}" não encontrado`);
    }

    const { action, payload } = teacherActionBodySchema.parse(req.body);
    const result = await runTeacherAction({
      userId: req.userId!,
      teacherId: id as TeacherId,
      action,
      payload,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
