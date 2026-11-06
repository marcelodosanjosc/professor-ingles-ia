import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { hash } from '@node-rs/argon2';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { env } from '../src/config/env';
import {
  architectPlanSchema,
  listeningSessionDataSchema,
  speakingDrillDataSchema,
  pronunciationGuideSchema,
  directThinkingDataSchema,
  immersionPlanSchema,
  type DashboardData,
} from '@fluencialab/shared';

const app = createApp();

function createAuthCookie(userId: string): string {
  const token = jwt.sign({ sub: userId }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
  return `fl_session=${token}`;
}

describe('Teacher AI & Learning Core (/api/teacher, /api/sessions, /api/vocab, /api/pronunciation)', () => {
  it('GET /api/teacher/:id com id inválido deve retornar 404', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'invalid.teacher@example.com',
        name: 'Aluno Teste',
        passwordHash,
      },
    });

    const cookie = createAuthCookie(user.id);
    const res = await request(app)
      .get('/api/teacher/professor_inexistente')
      .set('Cookie', cookie);

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('TEACHER_NOT_FOUND');
  });

  it('GET /api/teacher/architect retorna system prompt com variáveis substituídas (sem [IDIOMA] sobrando)', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'architect.user@example.com',
        name: 'Pedro Estudante',
        passwordHash,
        profile: {
          create: {
            targetLanguage: 'Inglês',
            nativeLanguage: 'Português',
            level: 'A2',
            goal: 'conversation',
            minutesPerDay: 45,
            deadlineMonths: 3,
            otherLanguages: ['Espanhol'],
            mainDifficulty: 'speaking',
            interests: ['inteligência artificial', 'viagens'],
            routine: 'work',
            hardSounds: 'th sound e vogais curtas',
            blockSituations: 'reuniões com pessoas nativas',
          },
        },
      },
    });

    const cookie = createAuthCookie(user.id);
    const res = await request(app)
      .get('/api/teacher/architect')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.teacher).toBeDefined();
    expect(res.body.teacher.id).toBe('architect');
    expect(res.body.teacher.name).toContain('Arquiteto da Fluência');

    // System prompt verificado
    const prompt = res.body.systemPrompt as string;
    expect(prompt).toBeTruthy();
    expect(prompt).toContain('Inglês');
    expect(prompt).toContain('Português');
    expect(prompt).toContain('45');
    expect(prompt).toContain('inteligência artificial');

    // Nenhuma variável em colchetes literal deve ter sobrado
    expect(prompt).not.toContain('[IDIOMA]');
    expect(prompt).not.toContain('[IDIOMA_NATIVO]');
    expect(prompt).not.toContain('[NÍVEL]');
    expect(prompt).not.toContain('[OBJETIVO]');
    expect(prompt).not.toContain('[MINUTOS]');
    expect(prompt).not.toContain('[PRAZO]');
    expect(prompt).not.toContain('[DIFICULDADE]');
    expect(prompt).not.toContain('[INTERESSES]');
  });

  it('POST /api/teacher/architect (action: "generate") gera e persiste StudyPlan de 90 dias com 7 seções', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'plan.user@example.com',
        name: 'Mariana Lima',
        passwordHash,
        profile: {
          create: {
            targetLanguage: 'Inglês',
            nativeLanguage: 'Português',
            level: 'B1',
            goal: 'work',
            minutesPerDay: 30,
            deadlineMonths: 3,
            otherLanguages: [],
            mainDifficulty: 'listening',
            interests: ['carreira internacional', 'finanças'],
            routine: 'work',
          },
        },
      },
    });

    const cookie = createAuthCookie(user.id);
    const res = await request(app)
      .post('/api/teacher/architect')
      .set('Cookie', cookie)
      .send({ action: 'generate' });

    expect(res.status).toBe(200);
    expect(res.body.plan).toBeDefined();

    // Valida com o schema oficial Zod de shared
    const validated = architectPlanSchema.safeParse(res.body.plan);
    expect(validated.success).toBe(true);

    if (validated.success) {
      const plan = validated.data;
      // 1. diagnosis
      expect(plan.diagnosis.currentStage).toBeTruthy();
      expect(plan.diagnosis.strengths.length).toBeGreaterThanOrEqual(1);
      expect(plan.diagnosis.bottlenecks.length).toBeGreaterThanOrEqual(1);
      expect(plan.diagnosis.paretoFocus).toBeTruthy();

      // 2. learnFirst
      expect(plan.learnFirst.length).toBeGreaterThanOrEqual(2);

      // 3. phases (3 fases)
      expect(plan.phases).toHaveLength(3);
      expect(plan.phases[0]?.daysRange).toContain('1–30');

      // 4. dailyRoutine
      expect(plan.dailyRoutine.length).toBeGreaterThanOrEqual(2);

      // 5. weeklyGoals (speaking_test e comprehension_test)
      expect(plan.weeklyGoals.some((g) => g.kind === 'speaking_test')).toBe(true);
      expect(plan.weeklyGoals.some((g) => g.kind === 'comprehension_test')).toBe(true);

      // 6. checkpoints (7 checkpoints: 14, 28, 42, 56, 70, 84, 90)
      expect(plan.checkpoints).toHaveLength(7);
      expect(plan.checkpoints.map((c) => c.day)).toEqual([14, 28, 42, 56, 70, 84, 90]);

      // 7. ignoreList
      expect(plan.ignoreList.length).toBeGreaterThanOrEqual(2);
    }

    // Verifica persistência no Prisma
    const savedPlan = await prisma.studyPlan.findFirst({
      where: { userId: user.id, active: true },
    });
    expect(savedPlan).not.toBeNull();
    expect(savedPlan?.active).toBe(true);

    // ModuleProgress de architect deve ser 100%
    const mp = await prisma.moduleProgress.findUnique({
      where: { userId_teacherId: { userId: user.id, teacherId: 'architect' } },
    });
    expect(mp?.percent).toBe(100);
  });

  it('POST /api/teacher/vocabulary (action: "get_block") + POST /api/vocab/review (SM-2) persiste cards e atualiza repetição', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'vocab.user@example.com',
        name: 'Carlos Vocabulário',
        passwordHash,
      },
    });

    const cookie = createAuthCookie(user.id);

    // 1. get_block default (top50)
    const resGetBlock = await request(app)
      .post('/api/teacher/vocabulary')
      .set('Cookie', cookie)
      .send({ action: 'get_block', payload: { block: 'top50' } });

    expect(resGetBlock.status).toBe(200);
    expect(resGetBlock.body.block).toBe('top50');
    expect(resGetBlock.body.items.length).toBeGreaterThanOrEqual(12);

    const firstCard = resGetBlock.body.items[0];
    expect(firstCard.id).toBeTruthy();
    expect(firstCard.term).toBeTruthy();
    expect(firstCard.translation).toBeTruthy();
    expect(firstCard.isTop50).toBe(true);

    // Verifica que foi salvo no banco
    const dbItem = await prisma.vocabItem.findUnique({
      where: { id: firstCard.id },
    });
    expect(dbItem).not.toBeNull();
    expect(dbItem?.repetitions).toBe(0);
    expect(dbItem?.interval).toBe(0);
    expect(dbItem?.easiness).toBe(2.5);

    // 2. Revisão SM-2 com qualidade 5 (relembrado perfeitamente)
    const resReview = await request(app)
      .post('/api/vocab/review')
      .set('Cookie', cookie)
      .send({ vocabId: firstCard.id, quality: 5 });

    expect(resReview.status).toBe(200);
    expect(resReview.body.item).toBeDefined();

    const reviewedItem = resReview.body.item;
    expect(reviewedItem.repetitions).toBe(1);
    expect(reviewedItem.interval).toBe(1);
    expect(reviewedItem.easiness).toBeGreaterThan(2.5);
    expect(new Date(reviewedItem.nextReview).getTime()).toBeGreaterThan(Date.now());

    // 3. Listagem no /api/vocab
    const resList = await request(app)
      .get('/api/vocab')
      .set('Cookie', cookie);

    expect(resList.status).toBe(200);
    expect(resList.body.total).toBeGreaterThanOrEqual(12);
    expect(resList.body.items.length).toBeGreaterThanOrEqual(12);
  });

  it('POST /api/teacher/conversation (start + 3 chamadas message) verifica correções e ErrorRecord na 3ª mensagem', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'convo.user@example.com',
        name: 'Lucas Conversador',
        passwordHash,
      },
    });

    const cookie = createAuthCookie(user.id);

    // 1. Start da conversa
    const resStart = await request(app)
      .post('/api/teacher/conversation')
      .set('Cookie', cookie)
      .send({ action: 'start', payload: { roleId: 'friend' } });

    expect(resStart.status).toBe(200);
    expect(resStart.body.conversationId).toBeTruthy();
    expect(resStart.body.messages).toHaveLength(1);
    expect(resStart.body.messages[0].role).toBe('assistant');

    const conversationId = resStart.body.conversationId;

    // 2. Mensagem 1 do aluno
    const resMsg1 = await request(app)
      .post('/api/teacher/conversation')
      .set('Cookie', cookie)
      .send({ action: 'message', payload: { conversationId, content: 'Hello! I am feeling good today and practicing.' } });

    expect(resMsg1.status).toBe(200);
    expect(resMsg1.body.userTurnCount).toBe(1);
    expect(resMsg1.body.turn.importantCorrections).toEqual([]);

    // 3. Mensagem 2 do aluno (resposta curta < 8 palavras deve gerar followUpQuestion)
    const resMsg2 = await request(app)
      .post('/api/teacher/conversation')
      .set('Cookie', cookie)
      .send({ action: 'message', payload: { conversationId, content: 'Yes, absolutely.' } });

    expect(resMsg2.status).toBe(200);
    expect(resMsg2.body.userTurnCount).toBe(2);
    expect(resMsg2.body.turn.followUpQuestion).toBeTruthy();

    // 4. Mensagem 3 do aluno (regra crítica: múltiplo de 3 deve disparar importantCorrections e gravar ErrorRecord)
    const resMsg3 = await request(app)
      .post('/api/teacher/conversation')
      .set('Cookie', cookie)
      .send({ action: 'message', payload: { conversationId, content: 'I have 25 years and I work with programming.' } });

    expect(resMsg3.status).toBe(200);
    expect(resMsg3.body.userTurnCount).toBe(3);
    expect(resMsg3.body.turn.importantCorrections.length).toBeGreaterThanOrEqual(1);

    const correction = resMsg3.body.turn.importantCorrections[0];
    expect(correction.wrong).toBeTruthy();
    expect(correction.correct).toBeTruthy();
    expect(correction.oneLineExplanation).toBeTruthy();

    // Verifica que o ErrorRecord foi gravado no banco de dados
    const errorsInDb = await prisma.errorRecord.findMany({
      where: { userId: user.id },
    });
    expect(errorsInDb.length).toBeGreaterThanOrEqual(1);
    expect(errorsInDb[0]?.teacherId).toBe('conversation');
  });

  it('POST /api/teacher/listening, speaking, pronunciation, thinking, immersion (action: "load") todos retornam payloads válidos Zod', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'all.teachers@example.com',
        name: 'Roberto Poliglota',
        passwordHash,
      },
    });

    const cookie = createAuthCookie(user.id);

    // Listening
    const resListening = await request(app)
      .post('/api/teacher/listening')
      .set('Cookie', cookie)
      .send({ action: 'load' });
    expect(resListening.status).toBe(200);
    expect(listeningSessionDataSchema.safeParse(resListening.body).success).toBe(true);

    // Speaking
    const resSpeaking = await request(app)
      .post('/api/teacher/speaking')
      .set('Cookie', cookie)
      .send({ action: 'load' });
    expect(resSpeaking.status).toBe(200);
    expect(speakingDrillDataSchema.safeParse(resSpeaking.body).success).toBe(true);

    // Pronunciation
    const resPron = await request(app)
      .post('/api/teacher/pronunciation')
      .set('Cookie', cookie)
      .send({ action: 'load' });
    expect(resPron.status).toBe(200);
    expect(pronunciationGuideSchema.safeParse(resPron.body).success).toBe(true);

    // Thinking
    const resThinking = await request(app)
      .post('/api/teacher/thinking')
      .set('Cookie', cookie)
      .send({ action: 'load' });
    expect(resThinking.status).toBe(200);
    expect(directThinkingDataSchema.safeParse(resThinking.body).success).toBe(true);

    // Immersion
    const resImmersion = await request(app)
      .post('/api/teacher/immersion')
      .set('Cookie', cookie)
      .send({ action: 'load' });
    expect(resImmersion.status).toBe(200);
    expect(immersionPlanSchema.safeParse(resImmersion.body).success).toBe(true);
  });

  it('POST /api/sessions/start + finish finaliza sessão, atualiza ModuleProgress e reflete no Dashboard', async () => {
    const passwordHash = await hash('senha12345');
    const user = await prisma.user.create({
      data: {
        email: 'session.dashboard@example.com',
        name: 'Beatriz Fluente',
        passwordHash,
        profile: {
          create: {
            targetLanguage: 'Inglês',
            nativeLanguage: 'Português',
            level: 'A2',
            goal: 'conversation',
            minutesPerDay: 30,
            deadlineMonths: 6,
            otherLanguages: [],
            mainDifficulty: 'speaking',
            interests: ['música'],
            routine: 'home',
          },
        },
      },
    });

    const cookie = createAuthCookie(user.id);

    // 1. Inicia sessão com professor de fala
    const resStart = await request(app)
      .post('/api/sessions/start')
      .set('Cookie', cookie)
      .send({ teacherId: 'speaking' });

    expect(resStart.status).toBe(201);
    expect(resStart.body.session).toBeDefined();
    const sessionId = resStart.body.session.id;

    // 2. Finaliza a sessão com duração, fala, exposição e palavras
    const resFinish = await request(app)
      .post(`/api/sessions/${sessionId}/finish`)
      .set('Cookie', cookie)
      .send({
        durationSec: 1500, // 25 min
        speakingSec: 900,  // 15 min
        exposureSec: 1200, // 20 min
        wordsRecalled: 18,
        progressDelta: 30,
        recurringErrors: [
          { type: 'grammar', phrase: 'I have 20 years', correction: 'I am 20 years old', explanation: 'Use to be' },
        ],
        newWords: [
          { term: 'Breakthrough', translation: 'Avanço / conquista marcante' },
        ],
      });

    expect(resFinish.status).toBe(200);
    expect(resFinish.body.session.durationSec).toBe(1500);
    expect(resFinish.body.summary).toBeDefined();
    expect(resFinish.body.summary.skillDeltas.speaking).toBe(5);
    expect(resFinish.body.moduleProgress).toBe(30);
    expect(resFinish.body.streak).toBe(1);

    // 3. Conquista FIRST_SESSION desbloqueada
    const achievement = await prisma.achievement.findUnique({
      where: { userId_code: { userId: user.id, code: 'FIRST_SESSION' } },
    });
    expect(achievement).not.toBeNull();
    expect(achievement?.code).toBe('FIRST_SESSION');

    // 4. GET /api/dashboard reflete imediatamente os minutos e palavras
    const resDash = await request(app)
      .get('/api/dashboard')
      .set('Cookie', cookie);

    expect(resDash.status).toBe(200);
    const dashData = resDash.body as DashboardData;

    expect(dashData.header.todayMinutes).toBe(25);
    expect(dashData.header.streakDays).toBe(1);
    expect(dashData.kpis.wordsRecalled).toBe(18);
    expect(dashData.kpis.speakingMinutesWeek).toBe(15);
    expect(dashData.kpis.exposureMinutesToday).toBe(20);

    const speakingModule = dashData.moduleProgress.find((m) => m.teacherId === 'speaking');
    expect(speakingModule?.percent).toBe(30);

    expect(dashData.achievements.some((a) => a.code === 'FIRST_SESSION')).toBe(true);
    expect(dashData.recurringErrors.some((e) => e.phrase === 'I have 20 years')).toBe(true);
  });
});
