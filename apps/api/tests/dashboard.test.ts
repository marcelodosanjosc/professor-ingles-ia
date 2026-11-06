import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { hash } from '@node-rs/argon2';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { env } from '../src/config/env';
import { SKILLS, TEACHER_IDS, type DashboardData } from '@fluencialab/shared';

const app = createApp();

function createAuthCookie(userId: string): string {
  const token = jwt.sign({ sub: userId }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
  return `fl_session=${token}`;
}

describe('Dashboard (/api/dashboard)', () => {
  it('GET /api/dashboard sem autenticação deve retornar 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/dashboard para usuário recém-criado com perfil retorna 200 e estrutura completa', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'recem-criado@example.com',
        name: 'Ana Novata',
        passwordHash,
        profile: {
          create: {
            targetLanguage: 'Inglês',
            nativeLanguage: 'Português',
            level: 'A1',
            goal: 'conversation',
            minutesPerDay: 25,
            deadlineMonths: 6,
            otherLanguages: [],
            mainDifficulty: 'speaking',
            interests: ['música', 'viagens'],
            routine: 'home',
          },
        },
      },
    });

    const cookie = createAuthCookie(user.id);

    const res = await request(app)
      .get('/api/dashboard')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);

    const data = res.body as DashboardData;

    // Header
    expect(data.header).toBeDefined();
    expect(data.header.name).toBe('Ana Novata');
    expect(data.header.targetLanguage).toBe('Inglês');
    expect(data.header.level).toBe('A1');
    expect(data.header.streakDays).toBe(0);
    expect(data.header.dailyGoalMinutes).toBe(25);
    expect(data.header.todayMinutes).toBe(0);

    // KPIs
    expect(data.kpis).toBeDefined();
    expect(data.kpis.exposureMinutesToday).toBe(0);
    expect(data.kpis.exposureMinutesWeek).toBe(0);
    expect(data.kpis.speakingMinutesWeek).toBe(0);
    expect(data.kpis.wordsRecalled).toBe(0);
    expect(data.kpis.conversationsCompleted).toBe(0);
    expect(data.kpis.pronunciationMastered).toBe(0);
    expect(data.kpis.planDay).toBe(1);
    expect(data.kpis.planPhase).toBeDefined();

    // DailyMinutes (exatamente 30 dias ordenados)
    expect(data.dailyMinutes).toBeInstanceOf(Array);
    expect(data.dailyMinutes).toHaveLength(30);
    data.dailyMinutes.forEach((day, idx) => {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.minutes).toBe(0);
      if (idx > 0) {
        expect(day.date > data.dailyMinutes[idx - 1]!.date).toBe(true);
      }
    });

    // WeeklyByTeacher (todos os 8 professores)
    expect(data.weeklyByTeacher).toHaveLength(8);
    const teacherIdsInWeekly = data.weeklyByTeacher.map((t) => t.teacherId);
    TEACHER_IDS.forEach((id) => {
      expect(teacherIdsInWeekly).toContain(id);
    });

    // Skills (todas as 6 skills com score coerente)
    expect(data.skills).toHaveLength(6);
    const skillNames = data.skills.map((s) => s.skill);
    SKILLS.forEach((s) => {
      expect(skillNames).toContain(s);
    });
    data.skills.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(10);
      expect(s.score).toBeLessThanOrEqual(100);
    });

    // Plan
    expect(data.plan).toBeDefined();
    expect(data.plan.hasPlan).toBe(false);
    expect(data.plan.day).toBe(1);
    expect(data.plan.checkpoints).toHaveLength(7);
    const checkpointDays = data.plan.checkpoints.map((c) => c.day);
    expect(checkpointDays).toEqual([14, 28, 42, 56, 70, 84, 90]);
    data.plan.checkpoints.forEach((c) => {
      expect(c.done).toBe(false);
      expect(c.title).toBeTruthy();
    });

    // Heatmap (exatamente 180 dias ordenados)
    expect(data.heatmap).toBeInstanceOf(Array);
    expect(data.heatmap).toHaveLength(180);
    data.heatmap.forEach((day, idx) => {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.minutes).toBe(0);
      if (idx > 0) {
        expect(day.date > data.heatmap[idx - 1]!.date).toBe(true);
      }
    });

    // WeeklyGoals (obrigatoriamente speaking_test e comprehension_test)
    expect(data.weeklyGoals.length).toBeGreaterThanOrEqual(2);
    expect(data.weeklyGoals.some((g) => g.kind === 'speaking_test')).toBe(true);
    expect(data.weeklyGoals.some((g) => g.kind === 'comprehension_test')).toBe(true);

    // NextAction (sem plano ativo deve recomendar 'architect')
    expect(data.nextAction.teacherId).toBe('architect');
    expect(data.nextAction.reason).toContain('Arquiteto');

    // Achievements e RecurringErrors vazios
    expect(data.achievements).toEqual([]);
    expect(data.recurringErrors).toEqual([]);

    // ModuleProgress (todos os 8 professores com percent 0)
    expect(data.moduleProgress).toHaveLength(8);
    const teacherIdsInProgress = data.moduleProgress.map((m) => m.teacherId);
    TEACHER_IDS.forEach((id) => {
      expect(teacherIdsInProgress).toContain(id);
    });
    data.moduleProgress.forEach((m) => {
      expect(m.percent).toBe(0);
    });
  });

  it('GET /api/dashboard quando há sessões/erros/conquistas reflete KPIs gravados', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'carlos.fluente@example.com',
        name: 'Carlos Fluente',
        passwordHash,
        streak: {
          create: {
            current: 12,
            longest: 15,
            lastActiveDay: new Date().toISOString().slice(0, 10),
          },
        },
        profile: {
          create: {
            targetLanguage: 'Inglês',
            nativeLanguage: 'Português',
            level: 'A2',
            goal: 'work',
            minutesPerDay: 40,
            deadlineMonths: 3,
            otherLanguages: ['Espanhol'],
            mainDifficulty: 'listening',
            interests: ['carreira', 'tecnologia'],
            routine: 'work',
          },
        },
      },
    });

    // Plano ativo iniciado há 14 dias (hoje é o dia 15)
    const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    await prisma.studyPlan.create({
      data: {
        userId: user.id,
        active: true,
        startDate,
        diagnosis: { test: true },
        learnFirst: ['phrasal verbs'],
        phases: [
          { phase: 1, title: 'Fase 1: Fundação', days: '1-30' },
          { phase: 2, title: 'Fase 2: Conexão', days: '31-60' },
        ],
        dailyRoutine: { plan: 'rotina' },
        weeklyGoals: [
          { id: 'goal-speak', title: 'Teste de fala', done: true, kind: 'speaking_test' },
          { id: 'goal-comp', title: 'Teste de escuta', done: false, kind: 'comprehension_test' },
        ],
        checkpoints: [
          { day: 14, title: 'Primeiras 50 palavras' },
          { day: 28, title: 'Sobrevivência' },
        ],
        ignoreList: [],
      },
    });

    // Sessão hoje
    await prisma.session.create({
      data: {
        userId: user.id,
        teacherId: 'speaking',
        startedAt: new Date(),
        durationSec: 1800, // 30 min
        speakingSec: 1200, // 20 min
        exposureSec: 1500, // 25 min
        wordsRecalled: 25,
        skillDeltas: { speaking: 5, listening: 3 },
      },
    });

    // Sessão há 2 dias (dentro dos últimos 7 dias)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        userId: user.id,
        teacherId: 'listening',
        startedAt: twoDaysAgo,
        durationSec: 1200, // 20 min
        speakingSec: 300,  // 5 min
        exposureSec: 1100, // 18 min
        wordsRecalled: 10,
        skillDeltas: { listening: 6 },
      },
    });

    // Conversas: 2 completadas, 1 incompleta
    await prisma.conversation.createMany({
      data: [
        { userId: user.id, teacherId: 'conversation', completed: true },
        { userId: user.id, teacherId: 'conversation', completed: true },
        { userId: user.id, teacherId: 'conversation', completed: false },
      ],
    });

    // Pronúncia: 2 dominadas (>= 80) e 1 abaixo (< 80)
    await prisma.pronunciationTest.createMany({
      data: [
        { userId: user.id, phrase: 'Phrase 1', aiScore: 85, weekIndex: 1 },
        { userId: user.id, phrase: 'Phrase 2', aiScore: 92, weekIndex: 1 },
        { userId: user.id, phrase: 'Phrase 3', aiScore: 65, weekIndex: 1 },
      ],
    });

    // Erros recorrentes
    await prisma.errorRecord.create({
      data: {
        userId: user.id,
        teacherId: 'speaking',
        phrase: 'I have 30 years',
        correction: 'I am 30 years old',
        type: 'grammar',
        count: 7,
      },
    });

    // Achievement
    await prisma.achievement.create({
      data: {
        userId: user.id,
        code: 'STREAK_7',
        title: 'Ritmo de Ferro',
      },
    });

    // ModuleProgress
    await prisma.moduleProgress.create({
      data: {
        userId: user.id,
        teacherId: 'speaking',
        percent: 65,
      },
    });

    const cookie = createAuthCookie(user.id);

    const res = await request(app)
      .get('/api/dashboard')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    const data = res.body as DashboardData;

    // Header reflete streak e hoje
    expect(data.header.streakDays).toBe(12);
    expect(data.header.dailyGoalMinutes).toBe(40);
    expect(data.header.todayMinutes).toBe(30);

    // KPIs calculados
    expect(data.kpis.exposureMinutesToday).toBe(25);
    expect(data.kpis.exposureMinutesWeek).toBe(43); // 25 + 18
    expect(data.kpis.speakingMinutesWeek).toBe(25); // 20 + 5
    expect(data.kpis.wordsRecalled).toBe(35); // 25 + 10
    expect(data.kpis.conversationsCompleted).toBe(2);
    expect(data.kpis.pronunciationMastered).toBe(2);
    expect(data.kpis.planDay).toBe(15);
    expect(data.kpis.planPhase).toBe('Fase 1: Fundação');

    // Checkpoint do dia 14 deve estar concluído pois planDay = 15 >= 14
    const cp14 = data.plan.checkpoints.find((c) => c.day === 14);
    expect(cp14?.done).toBe(true);

    const cp28 = data.plan.checkpoints.find((c) => c.day === 28);
    expect(cp28?.done).toBe(false);

    // Next action com plano ativo e mainDifficulty = listening aponta para listening
    expect(data.nextAction.teacherId).toBe('listening');

    // Achievements
    expect(data.achievements).toHaveLength(1);
    expect(data.achievements[0]?.code).toBe('STREAK_7');

    // Recurring errors
    expect(data.recurringErrors).toHaveLength(1);
    expect(data.recurringErrors[0]?.phrase).toBe('I have 30 years');
    expect(data.recurringErrors[0]?.count).toBe(7);

    // ModuleProgress para speaking = 65%
    const speakingProgress = data.moduleProgress.find((m) => m.teacherId === 'speaking');
    expect(speakingProgress?.percent).toBe(65);
  });

  it('PATCH /api/dashboard/weekly-goals/:goalId alterna o estado da meta semanal', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'meta.test@example.com',
        name: 'Meta Tester',
        passwordHash,
      },
    });

    await prisma.studyPlan.create({
      data: {
        userId: user.id,
        active: true,
        diagnosis: {},
        learnFirst: [],
        phases: [],
        dailyRoutine: {},
        weeklyGoals: [
          { id: 'goal-1', title: 'Gravar áudio de 60s', done: false, kind: 'speaking_test' },
          { id: 'goal-2', title: 'Teste de áudio', done: false, kind: 'comprehension_test' },
        ],
        checkpoints: [],
        ignoreList: [],
      },
    });

    const cookie = createAuthCookie(user.id);

    // 1. Atualiza goal-1 explicitamente para true
    const res1 = await request(app)
      .patch('/api/dashboard/weekly-goals/goal-1')
      .set('Cookie', cookie)
      .send({ done: true });

    expect(res1.status).toBe(200);
    expect(res1.body).toEqual({ id: 'goal-1', done: true });

    // Verifica no banco
    const planAfter1 = await prisma.studyPlan.findFirst({ where: { userId: user.id } });
    const goalsAfter1 = planAfter1?.weeklyGoals as { id: string; done: boolean }[];
    expect(goalsAfter1.find((g) => g.id === 'goal-1')?.done).toBe(true);

    // 2. Toggle sem passar done no body (deve alternar para false)
    const res2 = await request(app)
      .patch('/api/dashboard/weekly-goals/goal-1')
      .set('Cookie', cookie)
      .send({});

    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ id: 'goal-1', done: false });

    // 3. Meta inexistente responde 200 graciosamente
    const res3 = await request(app)
      .patch('/api/dashboard/weekly-goals/goal-inexistente')
      .set('Cookie', cookie)
      .send({ done: true });

    expect(res3.status).toBe(200);
    expect(res3.body).toEqual({ id: 'goal-inexistente', done: true });
  });
});
