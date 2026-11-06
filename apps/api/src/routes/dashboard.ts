import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import type { Prisma } from '../generated/prisma/client';
import { requireAuth } from '../middleware/auth';
import { getDashboardData } from '../services/metrics';

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

    const activePlan = await prisma.studyPlan.findFirst({
      where: {
        userId: req.userId,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let newDone = body.done ?? true;

    if (activePlan && Array.isArray(activePlan.weeklyGoals)) {
      const goals = activePlan.weeklyGoals as Record<string, unknown>[];
      const goalIndex = goals.findIndex((g) => g && g.id === goalId);

      if (goalIndex >= 0) {
        const currentGoal = goals[goalIndex]!;
        newDone = body.done !== undefined ? body.done : !Boolean(currentGoal.done);

        const updatedGoals = [...goals];
        updatedGoals[goalIndex] = {
          ...currentGoal,
          done: newDone,
        };

        await prisma.studyPlan.update({
          where: { id: activePlan.id },
          data: { weeklyGoals: updatedGoals as unknown as Prisma.InputJsonValue },
        });
      }
    }

    res.status(200).json({ id: goalId, done: newDone });
  } catch (error) {
    next(error);
  }
});
