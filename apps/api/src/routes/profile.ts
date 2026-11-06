import { Router } from 'express';
import { profileSchema } from '@fluencialab/shared';
import { prisma } from '../db';
import { HttpError } from '../lib/http';
import { requireAuth } from '../middleware/auth';

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get('/', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (!profile) {
      throw new HttpError(404, 'NO_PROFILE', 'Perfil não encontrado');
    }

    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
});

profileRouter.put('/', async (req, res, next) => {
  try {
    const data = profileSchema.parse(req.body);

    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId!,
        targetLanguage: data.targetLanguage,
        nativeLanguage: data.nativeLanguage,
        level: data.level,
        levelOther: data.levelOther,
        goal: data.goal,
        goalOther: data.goalOther,
        minutesPerDay: data.minutesPerDay,
        deadlineMonths: data.deadlineMonths,
        otherLanguages: data.otherLanguages,
        mainDifficulty: data.mainDifficulty,
        interests: data.interests,
        routine: data.routine,
        routineOther: data.routineOther,
        hardSounds: data.hardSounds,
        blockSituations: data.blockSituations,
      },
      update: {
        targetLanguage: data.targetLanguage,
        nativeLanguage: data.nativeLanguage,
        level: data.level,
        levelOther: data.levelOther,
        goal: data.goal,
        goalOther: data.goalOther,
        minutesPerDay: data.minutesPerDay,
        deadlineMonths: data.deadlineMonths,
        otherLanguages: data.otherLanguages,
        mainDifficulty: data.mainDifficulty,
        interests: data.interests,
        routine: data.routine,
        routineOther: data.routineOther,
        hardSounds: data.hardSounds,
        blockSituations: data.blockSituations,
      },
    });

    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
});
