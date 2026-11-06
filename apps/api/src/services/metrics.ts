import {
  SKILLS,
  TEACHER_IDS,
  LEVEL_LABELS,
  type DashboardData,
  type Skill,
  type TeacherId,
} from '@fluencialab/shared';
import { prisma } from '../db';
import { HttpError } from '../lib/http';

const LEVEL_BASE_SCORE: Record<string, number> = {
  zero: 15,
  A1: 25,
  A2: 40,
  B1: 60,
  other: 30,
};

const DEFAULT_CHECKPOINTS = [
  { day: 14, title: 'Primeiras 50 palavras e sons críticos' },
  { day: 28, title: 'Sobrevivência em conversas curtas (Fase 1)' },
  { day: 42, title: 'Respostas sem traduzir em até 5 segundos' },
  { day: 56, title: 'Destravamento de conectivos e fluidez' },
  { day: 70, title: 'Conversas de 15 minutos sem interrupção' },
  { day: 84, title: 'Imersão total e pensamento em inglês' },
  { day: 90, title: 'Avaliação final de fluência e autonomia' },
];

const DEFAULT_WEEKLY_GOALS: DashboardData['weeklyGoals'] = [
  {
    id: 'goal-speaking-1',
    title: 'Gravar teste de fala de 60 segundos com o Destruidor de Bloqueio',
    done: false,
    kind: 'speaking_test',
  },
  {
    id: 'goal-comprehension-1',
    title: 'Completar teste de compreensão auditiva no Treinador de Ouvido',
    done: false,
    kind: 'comprehension_test',
  },
  {
    id: 'goal-vocab-1',
    title: 'Revisar 30 palavras de alta frequência no SRS',
    done: false,
    kind: 'other',
  },
  {
    id: 'goal-conversation-1',
    title: 'Realizar 2 conversas de 10 minutos',
    done: false,
    kind: 'other',
  },
];

function getNextAction(
  hasPlan: boolean,
  mainDifficulty?: string,
): { teacherId: TeacherId; reason: string } {
  if (!hasPlan) {
    return {
      teacherId: 'architect',
      reason: 'Monte seu plano de estudos de 90 dias com o Professor Arquiteto da Fluência.',
    };
  }

  switch (mainDifficulty) {
    case 'listening':
      return {
        teacherId: 'listening',
        reason: 'Treine seu ouvido para entender a fala conectada e rápida com áudios guiados.',
      };
    case 'speaking':
      return {
        teacherId: 'speaking',
        reason: 'Pratique respostas rápidas sem travar em até 5 segundos com o Destruidor de Bloqueio.',
      };
    case 'grammar':
      return {
        teacherId: 'thinking',
        reason: 'Pare de traduzir mentalmente e construa estruturas diretas com o Professor de Pensamento.',
      };
    case 'vocabulary':
      return {
        teacherId: 'vocabulary',
        reason: 'Domine as palavras e expressões de maior impacto para o seu objetivo.',
      };
    case 'pronunciation':
      return {
        teacherId: 'pronunciation',
        reason: 'Treine fonemas difíceis e ritmo de fala para falar com clareza imediata.',
      };
    default:
      return {
        teacherId: 'conversation',
        reason: 'Pratique uma conversa espontânea com feedback em tempo real.',
      };
  }
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      streak: true,
      studyPlans: {
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      sessions: {
        orderBy: { startedAt: 'desc' },
      },
      vocabItems: true,
      conversations: true,
      pronunciationTests: true,
      achievements: {
        orderBy: { unlockedAt: 'desc' },
      },
      errors: {
        orderBy: { count: 'desc' },
        take: 10,
      },
      moduleProgress: true,
    },
  });

  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'Usuário não encontrado');
  }

  const profile = user.profile;
  const streak = user.streak;
  const activePlan = user.studyPlans[0] ?? null;
  const sessions = user.sessions;
  const vocabItems = user.vocabItems;
  const conversations = user.conversations;
  const pronunciationTests = user.pronunciationTests;
  const achievements = user.achievements;
  const errors = user.errors;
  const moduleProgressList = user.moduleProgress;

  const todayStr = new Date().toISOString().slice(0, 10);

  // Mapeamento de minutos de duração e exposição por dia (YYYY-MM-DD)
  const sessionMinutesByDay = new Map<string, number>();
  for (const s of sessions) {
    const dStr = s.startedAt.toISOString().slice(0, 10);
    const current = sessionMinutesByDay.get(dStr) ?? 0;
    sessionMinutesByDay.set(dStr, current + Math.round(s.durationSec / 60));
  }

  // Sessões de hoje
  const todaySessions = sessions.filter(
    (s) => s.startedAt.toISOString().slice(0, 10) === todayStr,
  );
  const todayMinutes = todaySessions.reduce(
    (acc, s) => acc + Math.round(s.durationSec / 60),
    0,
  );
  const exposureMinutesToday = todaySessions.reduce(
    (acc, s) => acc + Math.round(s.exposureSec / 60),
    0,
  );

  // Sessões dos últimos 7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const weekSessions = sessions.filter((s) => s.startedAt >= sevenDaysAgo);
  const exposureMinutesWeek = weekSessions.reduce(
    (acc, s) => acc + Math.round(s.exposureSec / 60),
    0,
  );
  const speakingMinutesWeek = weekSessions.reduce(
    (acc, s) => acc + Math.round(s.speakingSec / 60),
    0,
  );

  // Palavras lembradas
  const sessionWordsRecalled = sessions.reduce((acc, s) => acc + s.wordsRecalled, 0);
  const vocabWordsRecalled = vocabItems.filter((v) => v.repetitions > 0).length;
  const wordsRecalled = Math.max(sessionWordsRecalled, vocabWordsRecalled);

  // Conversas e pronúncia
  const conversationsCompleted = conversations.filter((c) => c.completed).length;
  const pronunciationMastered = pronunciationTests.filter(
    (p) => (p.aiScore ?? 0) >= 80,
  ).length;

  // Dia do plano e fase
  let planDay = 1;
  let planPhase: string | null = 'Fase 1: Fundação e Sobrevivência (Dias 1–30)';

  if (activePlan) {
    const startMs = new Date(activePlan.startDate).getTime();
    const diffDays = Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24));
    planDay = Math.min(90, Math.max(1, diffDays + 1));

    if (activePlan.phases && Array.isArray(activePlan.phases) && activePlan.phases.length > 0) {
      const phaseIndex = planDay <= 30 ? 0 : planDay <= 60 ? 1 : 2;
      const currentPhaseItem = (activePlan.phases as unknown[])[phaseIndex] ??
        (activePlan.phases as unknown[])[(activePlan.phases as unknown[]).length - 1];

      if (typeof currentPhaseItem === 'string') {
        planPhase = currentPhaseItem;
      } else if (
        currentPhaseItem &&
        typeof currentPhaseItem === 'object' &&
        'title' in currentPhaseItem &&
        typeof (currentPhaseItem as { title: unknown }).title === 'string'
      ) {
        planPhase = (currentPhaseItem as { title: string }).title;
      }
    }
  }

  // 30 dias em ordem cronológica crescente
  const dailyMinutes: { date: string; minutes: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    dailyMinutes.push({
      date: dateStr,
      minutes: sessionMinutesByDay.get(dateStr) ?? 0,
    });
  }

  // 180 dias de heatmap em ordem cronológica crescente
  const heatmap: { date: string; minutes: number }[] = [];
  for (let i = 179; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    heatmap.push({
      date: dateStr,
      minutes: sessionMinutesByDay.get(dateStr) ?? 0,
    });
  }

  // Minutos semanais por professor
  const teacherMinutesMap = new Map<TeacherId, number>();
  for (const s of weekSessions) {
    const tid = s.teacherId as TeacherId;
    const current = teacherMinutesMap.get(tid) ?? 0;
    teacherMinutesMap.set(tid, current + Math.round(s.durationSec / 60));
  }

  const weeklyByTeacher: { teacherId: TeacherId; minutes: number }[] = TEACHER_IDS.map(
    (teacherId) => ({
      teacherId,
      minutes: teacherMinutesMap.get(teacherId) ?? 0,
    }),
  );

  // Pontuações das 6 habilidades
  const profileLevel = profile?.level ?? 'A1';
  const baseScore = LEVEL_BASE_SCORE[profileLevel] ?? 25;

  const skillDeltasSum: Record<Skill, number> = {
    listening: 0,
    speaking: 0,
    vocabulary: 0,
    grammar: 0,
    pronunciation: 0,
    directThinking: 0,
  };

  for (const s of sessions) {
    if (s.skillDeltas && typeof s.skillDeltas === 'object' && !Array.isArray(s.skillDeltas)) {
      const deltas = s.skillDeltas as Record<string, unknown>;
      for (const sk of SKILLS) {
        if (typeof deltas[sk] === 'number') {
          skillDeltasSum[sk] += deltas[sk] as number;
        }
      }
    }
  }

  const skills: { skill: Skill; score: number }[] = SKILLS.map((skill) => {
    const raw = baseScore + skillDeltasSum[skill];
    const score = Math.min(100, Math.max(10, Math.round(raw)));
    return { skill, score };
  });

  // Checkpoints de 14 em 14 dias
  let checkpointsData = DEFAULT_CHECKPOINTS;
  if (
    activePlan?.checkpoints &&
    Array.isArray(activePlan.checkpoints) &&
    activePlan.checkpoints.length > 0
  ) {
    checkpointsData = DEFAULT_CHECKPOINTS.map((def) => {
      const found = (activePlan.checkpoints as { day?: number; title?: string }[]).find(
        (c) => c && typeof c === 'object' && c.day === def.day,
      );
      return {
        day: def.day,
        title: found?.title ?? def.title,
      };
    });
  }

  const plan = {
    hasPlan: Boolean(activePlan),
    day: planDay,
    checkpoints: checkpointsData.map((cp) => ({
      day: cp.day,
      title: cp.title,
      done: Boolean(activePlan) && planDay >= cp.day,
    })),
  };

  // Metas semanais com garantia de speaking_test e comprehension_test
  let weeklyGoals: DashboardData['weeklyGoals'] = [];
  if (
    activePlan?.weeklyGoals &&
    Array.isArray(activePlan.weeklyGoals) &&
    activePlan.weeklyGoals.length > 0
  ) {
    weeklyGoals = (activePlan.weeklyGoals as Record<string, unknown>[]).map((g, idx) => ({
      id: typeof g.id === 'string' ? g.id : `goal-${idx + 1}`,
      title: typeof g.title === 'string' ? g.title : 'Meta da semana',
      done: Boolean(g.done),
      kind:
        g.kind === 'speaking_test' || g.kind === 'comprehension_test'
          ? g.kind
          : 'other',
    }));
  } else {
    weeklyGoals = DEFAULT_WEEKLY_GOALS.map((g) => ({ ...g }));
  }

  if (!weeklyGoals.some((g) => g.kind === 'speaking_test')) {
    weeklyGoals.unshift({
      id: 'goal-speaking-req',
      title: 'Gravar teste de fala de 60 segundos com o Destruidor de Bloqueio',
      done: false,
      kind: 'speaking_test',
    });
  }

  if (!weeklyGoals.some((g) => g.kind === 'comprehension_test')) {
    weeklyGoals.push({
      id: 'goal-comprehension-req',
      title: 'Completar teste de compreensão auditiva no Treinador de Ouvido',
      done: false,
      kind: 'comprehension_test',
    });
  }

  // Próxima ação recomendada
  const nextAction = getNextAction(Boolean(activePlan), profile?.mainDifficulty);

  // Conquistas
  const achievementsList = achievements.map((a) => ({
    code: a.code,
    title: a.title,
    unlockedAt: a.unlockedAt.toISOString(),
  }));

  // Erros recorrentes
  const recurringErrors = errors.map((e) => ({
    type: e.type,
    phrase: e.phrase,
    correction: e.correction,
    count: e.count,
  }));

  // Progresso dos 8 módulos
  const progressMap = new Map<string, number>();
  for (const mp of moduleProgressList) {
    progressMap.set(mp.teacherId, mp.percent);
  }

  const moduleProgress = TEACHER_IDS.map((teacherId) => ({
    teacherId,
    percent: progressMap.get(teacherId) ?? 0,
  }));

  // Nível formatado para o cabeçalho
  const formattedLevel = profile
    ? LEVEL_LABELS[profile.level as keyof typeof LEVEL_LABELS] ?? profile.level
    : 'Iniciante';

  return {
    header: {
      name: user.name,
      targetLanguage: profile?.targetLanguage ?? 'Inglês',
      level: formattedLevel,
      streakDays: streak?.current ?? 0,
      dailyGoalMinutes: profile?.minutesPerDay ?? 30,
      todayMinutes,
    },
    kpis: {
      exposureMinutesToday,
      exposureMinutesWeek,
      speakingMinutesWeek,
      wordsRecalled,
      conversationsCompleted,
      pronunciationMastered,
      planDay,
      planPhase,
    },
    dailyMinutes,
    weeklyByTeacher,
    skills,
    plan,
    heatmap,
    weeklyGoals,
    nextAction,
    achievements: achievementsList,
    recurringErrors,
    moduleProgress,
  };
}
