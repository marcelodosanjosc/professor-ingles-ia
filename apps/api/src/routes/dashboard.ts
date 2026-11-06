import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import type { Prisma } from '../generated/prisma/client';
import { requireAuth } from '../middleware/auth';
import { getDashboardData, DEFAULT_WEEKLY_GOALS } from '../services/metrics';
import { generateArchitectPlan } from '../services/mockGenerators';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

const patchGoalSchema = z.object({
  done: z.boolean().optional(),
});

dashboardRouter.get('/', async (req, res, next) => {
  try {
    const dashboard = await getDashboardData(req.userId!);
    res.status(200).json(dashboard);
  } catch (error) {
    next(error);
  }
});

dashboardRouter.patch('/weekly-goals/:goalId', async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const body = patchGoalSchema.parse(req.body);
    const userId = req.userId!;

    let activePlan = await prisma.studyPlan.findFirst({
      where: {
        userId,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let newDone = body.done ?? true;

    // Se ainda não existir um plano ativo, cria um para armazenar as metas do usuário
    if (!activePlan) {
      const defaultPlan = generateArchitectPlan({
        IDIOMA: 'Inglês',
        IDIOMA_NATIVO: 'Português',
        NÍVEL: 'A2',
        OBJETIVO: 'conversation',
        MINUTOS: '30',
        PRAZO: '3',
        IDIOMAS_QUE_FALA: 'nenhum',
        DIFICULDADE: 'speaking',
        INTERESSES: 'dia a dia',
        ROTINA: 'work',
        SONS_DIFÍCEIS: 'sons conectados',
        SITUAÇÕES_TRAVA: 'conversas espontâneas',
      });

      const baseGoals = (defaultPlan.weeklyGoals as Record<string, unknown>[]).map((g) => ({ ...g }));
      if (!baseGoals.some((g) => g.kind === 'speaking_test')) {
        baseGoals.unshift({
          id: 'goal-speaking-req',
          title: 'Gravar teste de fala de 60 segundos com o Destruidor de Bloqueio',
          done: false,
          kind: 'speaking_test',
        });
      }
      if (!baseGoals.some((g) => g.kind === 'comprehension_test')) {
        baseGoals.push({
          id: 'goal-comprehension-req',
          title: 'Completar teste de compreensão auditiva no Treinador de Ouvido',
          done: false,
          kind: 'comprehension_test',
        });
      }

      const matchIdx = baseGoals.findIndex((g) => g.id === goalId);
      if (matchIdx >= 0) {
        newDone = body.done !== undefined ? body.done : !Boolean(baseGoals[matchIdx]!.done);
        baseGoals[matchIdx]!.done = newDone;
      } else {
        newDone = body.done !== undefined ? body.done : true;
        baseGoals.push({
          id: goalId,
          title: 'Meta semanal',
          done: newDone,
          kind: 'other',
        });
      }

      await prisma.studyPlan.create({
        data: {
          userId,
          active: true,
          diagnosis: defaultPlan.diagnosis,
          learnFirst: defaultPlan.learnFirst,
          phases: defaultPlan.phases,
          dailyRoutine: defaultPlan.dailyRoutine,
          weeklyGoals: baseGoals as unknown as Prisma.InputJsonValue,
          checkpoints: defaultPlan.checkpoints,
          ignoreList: defaultPlan.ignoreList,
        },
      });

      res.status(200).json({ id: goalId, done: newDone });
      return;
    }

    // Com activePlan existente:
    const goals: Record<string, unknown>[] = Array.isArray(activePlan.weeklyGoals)
      ? ([...(activePlan.weeklyGoals as Record<string, unknown>[])] as Record<string, unknown>[])
      : [];

    const goalIndex = goals.findIndex((g) => g && g.id === goalId);

    if (goalIndex >= 0) {
      const currentGoal = goals[goalIndex]!;
      newDone = body.done !== undefined ? body.done : !Boolean(currentGoal.done);
      goals[goalIndex] = {
        ...currentGoal,
        done: newDone,
      };
    } else {
      // A meta não estava salva no array weeklyGoals (ex: goal-speaking-req, goal-comprehension-req ou padrão)
      newDone = body.done !== undefined ? body.done : true;

      const foundDefault = DEFAULT_WEEKLY_GOALS.find((g) => g.id === goalId);
      let defaultMeta: Record<string, unknown>;

      if (foundDefault) {
        defaultMeta = { ...foundDefault };
      } else if (goalId === 'goal-speaking-req') {
        defaultMeta = {
          id: 'goal-speaking-req',
          title: 'Gravar teste de fala de 60 segundos com o Destruidor de Bloqueio',
          done: newDone,
          kind: 'speaking_test',
        };
      } else if (goalId === 'goal-comprehension-req') {
        defaultMeta = {
          id: 'goal-comprehension-req',
          title: 'Completar teste de compreensão auditiva no Treinador de Ouvido',
          done: newDone,
          kind: 'comprehension_test',
        };
      } else {
        defaultMeta = {
          id: goalId,
          title: 'Meta semanal',
          done: newDone,
          kind: 'other',
        };
      }

      goals.push({
        ...defaultMeta,
        done: newDone,
      });
    }

    await prisma.studyPlan.update({
      where: { id: activePlan.id },
      data: { weeklyGoals: goals as unknown as Prisma.InputJsonValue },
    });

    res.status(200).json({ id: goalId, done: newDone });
  } catch (error) {
    next(error);
  }
});
