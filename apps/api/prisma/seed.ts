import { hash } from '@node-rs/argon2';
import { prisma } from '../src/db';
import { TEACHER_IDS, type TeacherId } from '@fluencialab/shared';

async function main() {
  console.log('🌱 Executando seed rico do FluênciaLab...');

  const passwordHash = await hash('demo12345');
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 1. Usuário demo
  const user = await prisma.user.upsert({
    where: { email: 'demo@fluencialab.dev' },
    update: {
      name: 'Demo FluênciaLab',
      passwordHash,
    },
    create: {
      email: 'demo@fluencialab.dev',
      name: 'Demo FluênciaLab',
      passwordHash,
    },
  });

  // 2. Streak realista (12 dias atuais, recorde de 18 dias, ativo hoje)
  await prisma.streak.upsert({
    where: { userId: user.id },
    update: {
      current: 12,
      longest: 18,
      lastActiveDay: todayStr,
    },
    create: {
      userId: user.id,
      current: 12,
      longest: 18,
      lastActiveDay: todayStr,
    },
  });

  // 3. Perfil detalhado
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      targetLanguage: 'Inglês',
      nativeLanguage: 'Português',
      level: 'A2',
      goal: 'work',
      minutesPerDay: 30,
      deadlineMonths: 6,
      otherLanguages: ['Espanhol'],
      mainDifficulty: 'speaking',
      interests: ['tecnologia', 'negócios', 'startups', 'viagens'],
      routine: 'work',
      hardSounds: 'Dificuldade com /θ/ e /ð/ (think vs sink) e o "r" americano conectado.',
      blockSituations: 'Trava quando precisa responder imediatamente em reuniões com estrangeiros.',
    },
    create: {
      userId: user.id,
      targetLanguage: 'Inglês',
      nativeLanguage: 'Português',
      level: 'A2',
      goal: 'work',
      minutesPerDay: 30,
      deadlineMonths: 6,
      otherLanguages: ['Espanhol'],
      mainDifficulty: 'speaking',
      interests: ['tecnologia', 'negócios', 'startups', 'viagens'],
      routine: 'work',
      hardSounds: 'Dificuldade com /θ/ e /ð/ (think vs sink) e o "r" americano conectado.',
      blockSituations: 'Trava quando precisa responder imediatamente em reuniões com estrangeiros.',
    },
  });

  // 4. Limpeza idempotente dos registros dependentes do usuário demo
  const userConversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  if (userConversations.length > 0) {
    await prisma.message.deleteMany({
      where: { conversationId: { in: userConversations.map((c) => c.id) } },
    });
  }

  await prisma.conversation.deleteMany({ where: { userId: user.id } });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.studyPlan.deleteMany({ where: { userId: user.id } });
  await prisma.vocabItem.deleteMany({ where: { userId: user.id } });
  await prisma.errorRecord.deleteMany({ where: { userId: user.id } });
  await prisma.pronunciationTest.deleteMany({ where: { userId: user.id } });
  await prisma.achievement.deleteMany({ where: { userId: user.id } });
  await prisma.moduleProgress.deleteMany({ where: { userId: user.id } });

  // 5. Plano de Estudos ativo (iniciado há 22 dias para que hoje seja o Dia 23/90)
  const planStartDate = new Date(Date.now() - 22 * 24 * 60 * 60 * 1000);
  await prisma.studyPlan.create({
    data: {
      userId: user.id,
      active: true,
      startDate: planStartDate,
      diagnosis: {
        summary:
          'Nível Intermediário A2 com foco profissional em tecnologia. Boa capacidade passiva de leitura, porém hesitação excessiva e tradução mental antes de responder.',
        strongPoints: [
          'Vocabulário técnico de software e produto',
          'Consistência diária de 30 minutos',
        ],
        gaps: [
          'Tempo de resposta sob pressão em reuniões (média de 9 segundos)',
          'Fonemas consonantais /θ/ e /ð/ e linking words',
        ],
      },
      learnFirst: [
        '50 phrasal verbs indispensáveis para reuniões de trabalho',
        'Conectores de resposta imediata (Actually, As far as I know, In my experience)',
        'Padrões de perguntas de esclarecimento profissional',
      ],
      phases: [
        {
          phase: 1,
          title: 'Fase 1: Fundação e Sobrevivência (Dias 1–30)',
          description:
            'Eliminar a hesitação e responder perguntas simples em até 5 segundos.',
        },
        {
          phase: 2,
          title: 'Fase 2: Conexão e Expansão (Dias 31–60)',
          description:
            'Construir respostas contínuas de 1 a 2 minutos sem traduzir mentalmente.',
        },
        {
          phase: 3,
          title: 'Fase 3: Autonomia e Fluência Real (Dias 61–90)',
          description:
            'Participar de reuniões e debates com confiança técnica e naturalidade.',
        },
      ],
      dailyRoutine: {
        morning: '10 min de vocabulário e collocations com o Professor de Vocabulário (SRS)',
        afternoon: '15 min de resposta rápida com Destruidor de Bloqueio ou Conversação Infinita',
        evening: '5 min de fonemas com o Corretor de Pronúncia antes de dormir',
      },
      weeklyGoals: [
        {
          id: 'goal-speaking',
          title: 'Gravar simulação de resposta em reunião com o Destruidor de Bloqueio',
          done: true,
          kind: 'speaking_test',
        },
        {
          id: 'goal-comp',
          title: 'Completar teste de compreensão de áudio rápido no Treinador de Ouvido',
          done: false,
          kind: 'comprehension_test',
        },
        {
          id: 'goal-srs',
          title: 'Revisar 40 cartões de vocabulário no SRS',
          done: true,
          kind: 'other',
        },
        {
          id: 'goal-convo',
          title: 'Realizar 2 conversas de 10 minutos sobre carreira e projetos',
          done: false,
          kind: 'other',
        },
      ],
      checkpoints: [
        { day: 14, title: 'Primeiras 50 palavras e sons críticos' },
        { day: 28, title: 'Sobrevivência em conversas curtas (Fase 1)' },
        { day: 42, title: 'Respostas sem traduzir em até 5 segundos' },
        { day: 56, title: 'Destravamento de conectivos e fluidez' },
        { day: 70, title: 'Conversas de 15 minutos sem interrupção' },
        { day: 84, title: 'Imersão total e pensamento em inglês' },
        { day: 90, title: 'Avaliação final de fluência e autonomia' },
      ],
      ignoreList: [
        'Future Perfect Continuous e tempos verbais ultra-raros',
        'Inversão enfática complexa de estilo literário antigo',
        'Vocabulário erudito do século XIX',
        'Gramática normativa que nativos não utilizam no dia a dia',
      ],
    },
  });

  // 6. Sessões distribuídas nos últimos 60 dias cobrindo os 8 professores
  const sessionSeedSpecs: {
    daysAgo: number;
    teacherId: TeacherId;
    durationMinutes: number;
    speakingMinutes: number;
    exposureMinutes: number;
    wordsRecalled: number;
    skillDeltas: Record<string, number>;
  }[] = [
    // Hoje
    {
      daysAgo: 0,
      teacherId: 'speaking',
      durationMinutes: 20,
      speakingMinutes: 14,
      exposureMinutes: 19,
      wordsRecalled: 18,
      skillDeltas: { speaking: 3, pronunciation: 1, directThinking: 1 },
    },
    // Últimos 7 dias (cobertura rica de professores)
    {
      daysAgo: 1,
      teacherId: 'conversation',
      durationMinutes: 25,
      speakingMinutes: 16,
      exposureMinutes: 23,
      wordsRecalled: 22,
      skillDeltas: { speaking: 3, listening: 2, directThinking: 1 },
    },
    {
      daysAgo: 2,
      teacherId: 'vocabulary',
      durationMinutes: 18,
      speakingMinutes: 4,
      exposureMinutes: 17,
      wordsRecalled: 35,
      skillDeltas: { vocabulary: 4, directThinking: 1 },
    },
    {
      daysAgo: 3,
      teacherId: 'listening',
      durationMinutes: 22,
      speakingMinutes: 5,
      exposureMinutes: 21,
      wordsRecalled: 15,
      skillDeltas: { listening: 4, directThinking: 1 },
    },
    {
      daysAgo: 4,
      teacherId: 'pronunciation',
      durationMinutes: 15,
      speakingMinutes: 11,
      exposureMinutes: 14,
      wordsRecalled: 12,
      skillDeltas: { pronunciation: 3, speaking: 1 },
    },
    {
      daysAgo: 5,
      teacherId: 'thinking',
      durationMinutes: 20,
      speakingMinutes: 10,
      exposureMinutes: 19,
      wordsRecalled: 16,
      skillDeltas: { directThinking: 4, grammar: 2 },
    },
    {
      daysAgo: 6,
      teacherId: 'immersion',
      durationMinutes: 30,
      speakingMinutes: 8,
      exposureMinutes: 29,
      wordsRecalled: 20,
      skillDeltas: { listening: 3, vocabulary: 2 },
    },
    // Dias 7 a 22 (desde o início do plano ativo)
    {
      daysAgo: 7,
      teacherId: 'architect',
      durationMinutes: 15,
      speakingMinutes: 4,
      exposureMinutes: 14,
      wordsRecalled: 10,
      skillDeltas: { directThinking: 1 },
    },
    {
      daysAgo: 8,
      teacherId: 'speaking',
      durationMinutes: 20,
      speakingMinutes: 13,
      exposureMinutes: 19,
      wordsRecalled: 14,
      skillDeltas: { speaking: 2, pronunciation: 1 },
    },
    {
      daysAgo: 9,
      teacherId: 'conversation',
      durationMinutes: 25,
      speakingMinutes: 15,
      exposureMinutes: 23,
      wordsRecalled: 18,
      skillDeltas: { speaking: 2, listening: 2 },
    },
    {
      daysAgo: 10,
      teacherId: 'vocabulary',
      durationMinutes: 15,
      speakingMinutes: 3,
      exposureMinutes: 14,
      wordsRecalled: 28,
      skillDeltas: { vocabulary: 3 },
    },
    {
      daysAgo: 11,
      teacherId: 'listening',
      durationMinutes: 20,
      speakingMinutes: 4,
      exposureMinutes: 19,
      wordsRecalled: 12,
      skillDeltas: { listening: 2 },
    },
    {
      daysAgo: 12,
      teacherId: 'pronunciation',
      durationMinutes: 15,
      speakingMinutes: 10,
      exposureMinutes: 14,
      wordsRecalled: 10,
      skillDeltas: { pronunciation: 2 },
    },
    {
      daysAgo: 13,
      teacherId: 'thinking',
      durationMinutes: 20,
      speakingMinutes: 8,
      exposureMinutes: 18,
      wordsRecalled: 14,
      skillDeltas: { directThinking: 2, grammar: 1 },
    },
    {
      daysAgo: 14,
      teacherId: 'immersion',
      durationMinutes: 30,
      speakingMinutes: 6,
      exposureMinutes: 28,
      wordsRecalled: 18,
      skillDeltas: { listening: 2, vocabulary: 1 },
    },
    {
      daysAgo: 15,
      teacherId: 'speaking',
      durationMinutes: 20,
      speakingMinutes: 14,
      exposureMinutes: 19,
      wordsRecalled: 15,
      skillDeltas: { speaking: 2 },
    },
    {
      daysAgo: 16,
      teacherId: 'conversation',
      durationMinutes: 25,
      speakingMinutes: 16,
      exposureMinutes: 24,
      wordsRecalled: 20,
      skillDeltas: { speaking: 2, listening: 1 },
    },
    {
      daysAgo: 17,
      teacherId: 'vocabulary',
      durationMinutes: 15,
      speakingMinutes: 3,
      exposureMinutes: 14,
      wordsRecalled: 25,
      skillDeltas: { vocabulary: 2 },
    },
    {
      daysAgo: 18,
      teacherId: 'listening',
      durationMinutes: 20,
      speakingMinutes: 4,
      exposureMinutes: 19,
      wordsRecalled: 11,
      skillDeltas: { listening: 2 },
    },
    {
      daysAgo: 19,
      teacherId: 'pronunciation',
      durationMinutes: 15,
      speakingMinutes: 10,
      exposureMinutes: 14,
      wordsRecalled: 9,
      skillDeltas: { pronunciation: 2 },
    },
    {
      daysAgo: 20,
      teacherId: 'thinking',
      durationMinutes: 20,
      speakingMinutes: 9,
      exposureMinutes: 19,
      wordsRecalled: 14,
      skillDeltas: { directThinking: 2, grammar: 1 },
    },
    {
      daysAgo: 21,
      teacherId: 'immersion',
      durationMinutes: 30,
      speakingMinutes: 7,
      exposureMinutes: 29,
      wordsRecalled: 19,
      skillDeltas: { listening: 2, vocabulary: 1 },
    },
    {
      daysAgo: 22,
      teacherId: 'architect',
      durationMinutes: 30,
      speakingMinutes: 10,
      exposureMinutes: 25,
      wordsRecalled: 15,
      skillDeltas: { directThinking: 2 },
    },
    // Dias 23 a 60 (para histórico de 30 dias e heatmap de 180 dias)
    {
      daysAgo: 24,
      teacherId: 'conversation',
      durationMinutes: 20,
      speakingMinutes: 12,
      exposureMinutes: 19,
      wordsRecalled: 12,
      skillDeltas: { speaking: 1 },
    },
    {
      daysAgo: 26,
      teacherId: 'vocabulary',
      durationMinutes: 15,
      speakingMinutes: 3,
      exposureMinutes: 14,
      wordsRecalled: 18,
      skillDeltas: { vocabulary: 1 },
    },
    {
      daysAgo: 28,
      teacherId: 'listening',
      durationMinutes: 20,
      speakingMinutes: 4,
      exposureMinutes: 18,
      wordsRecalled: 10,
      skillDeltas: { listening: 1 },
    },
    {
      daysAgo: 32,
      teacherId: 'speaking',
      durationMinutes: 15,
      speakingMinutes: 9,
      exposureMinutes: 14,
      wordsRecalled: 10,
      skillDeltas: { speaking: 1 },
    },
    {
      daysAgo: 35,
      teacherId: 'pronunciation',
      durationMinutes: 15,
      speakingMinutes: 10,
      exposureMinutes: 14,
      wordsRecalled: 8,
      skillDeltas: { pronunciation: 1 },
    },
    {
      daysAgo: 40,
      teacherId: 'thinking',
      durationMinutes: 20,
      speakingMinutes: 8,
      exposureMinutes: 18,
      wordsRecalled: 12,
      skillDeltas: { directThinking: 1 },
    },
    {
      daysAgo: 45,
      teacherId: 'immersion',
      durationMinutes: 25,
      speakingMinutes: 5,
      exposureMinutes: 24,
      wordsRecalled: 15,
      skillDeltas: { listening: 1 },
    },
    {
      daysAgo: 50,
      teacherId: 'conversation',
      durationMinutes: 20,
      speakingMinutes: 11,
      exposureMinutes: 19,
      wordsRecalled: 12,
      skillDeltas: { speaking: 1 },
    },
    {
      daysAgo: 55,
      teacherId: 'vocabulary',
      durationMinutes: 15,
      speakingMinutes: 2,
      exposureMinutes: 14,
      wordsRecalled: 16,
      skillDeltas: { vocabulary: 1 },
    },
    {
      daysAgo: 58,
      teacherId: 'listening',
      durationMinutes: 20,
      speakingMinutes: 4,
      exposureMinutes: 19,
      wordsRecalled: 10,
      skillDeltas: { listening: 1 },
    },
  ];

  for (const spec of sessionSeedSpecs) {
    const startedAt = new Date(Date.now() - spec.daysAgo * 24 * 60 * 60 * 1000);
    startedAt.setMinutes(startedAt.getMinutes() - spec.durationMinutes);
    const endedAt = new Date(startedAt.getTime() + spec.durationMinutes * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        teacherId: spec.teacherId,
        startedAt,
        endedAt,
        durationSec: spec.durationMinutes * 60,
        speakingSec: spec.speakingMinutes * 60,
        exposureSec: spec.exposureMinutes * 60,
        wordsRecalled: spec.wordsRecalled,
        skillDeltas: spec.skillDeltas,
        summary: {
          note: `Sessão de prática com ${spec.teacherId}`,
        },
      },
    });
  }

  // 7. VocabItem (16 expressões de alta frequência com diferentes estágios de SRS)
  const vocabSeedItems = [
    {
      term: 'figure out',
      translation: 'descobrir / entender a solução de um problema',
      example1: 'We need to figure out how to solve this bug before the release.',
      example2: 'I can’t figure out why the client didn’t reply.',
      collocation: 'figure out a solution / problem',
      block: 'phrasal_verbs',
      isTop50: true,
      repetitions: 4,
      interval: 12,
      easiness: 2.6,
      timesRecalled: 6,
    },
    {
      term: 'look forward to',
      translation: 'esperar ansiosamente por algo',
      example1: 'I look forward to hearing from you soon.',
      example2: 'She is looking forward to the conference in Chicago.',
      collocation: 'look forward to + ing / noun',
      block: 'business_idioms',
      isTop50: true,
      repetitions: 5,
      interval: 16,
      easiness: 2.7,
      timesRecalled: 8,
    },
    {
      term: 'bring up',
      translation: 'mencionar um assunto / levantar uma questão',
      example1: 'Don’t bring up the budget issue during the first call.',
      example2: 'He brought up an interesting point about scalability.',
      collocation: 'bring up a topic / point',
      block: 'phrasal_verbs',
      isTop50: true,
      repetitions: 3,
      interval: 7,
      easiness: 2.5,
      timesRecalled: 4,
    },
    {
      term: 'catch up',
      translation: 'colocar o papo em dia / atualizar-se',
      example1: 'Let’s grab a coffee next week and catch up.',
      example2: 'I need to catch up on unread emails.',
      collocation: 'catch up with someone / on work',
      block: 'social_conversations',
      isTop50: true,
      repetitions: 4,
      interval: 10,
      easiness: 2.6,
      timesRecalled: 5,
    },
    {
      term: 'run out of',
      translation: 'ficar sem algo / esgotar o estoque',
      example1: 'We are running out of time in this meeting.',
      example2: 'The team ran out of cloud credits.',
      collocation: 'run out of time / money / resources',
      block: 'phrasal_verbs',
      isTop50: true,
      repetitions: 3,
      interval: 6,
      easiness: 2.4,
      timesRecalled: 4,
    },
    {
      term: 'put off',
      translation: 'adiar / postergar',
      example1: 'We shouldn’t put off this decision any longer.',
      example2: 'The demo was put off until Friday.',
      collocation: 'put off a meeting / decision',
      block: 'business_idioms',
      isTop50: true,
      repetitions: 2,
      interval: 4,
      easiness: 2.3,
      timesRecalled: 3,
    },
    {
      term: 'give up',
      translation: 'desistir de algo ou de tentar',
      example1: 'Never give up when the syntax error looks impossible.',
      example2: 'She refused to give up on her dream job.',
      collocation: 'give up on someone / something',
      block: 'core_verbs',
      isTop50: true,
      repetitions: 4,
      interval: 14,
      easiness: 2.7,
      timesRecalled: 7,
    },
    {
      term: 'take over',
      translation: 'assumir o controle ou a responsabilidade',
      example1: 'She will take over the project while he is on vacation.',
      example2: 'Our competitor was taken over by a tech giant.',
      collocation: 'take over a role / company',
      block: 'business_idioms',
      isTop50: false,
      repetitions: 2,
      interval: 3,
      easiness: 2.4,
      timesRecalled: 2,
    },
    {
      term: 'come across',
      translation: 'deparar-se com algo por acaso / passar uma impressão',
      example1: 'I came across a great library for audio synthesis.',
      example2: 'He comes across as confident in presentations.',
      collocation: 'come across an article / come across as',
      block: 'phrasal_verbs',
      isTop50: true,
      repetitions: 3,
      interval: 8,
      easiness: 2.5,
      timesRecalled: 4,
    },
    {
      term: 'break down',
      translation: 'analisar detalhadamente / quebrar em partes menores',
      example1: 'Let’s break down the sprint goals into actionable tasks.',
      example2: 'The microservice broke down under heavy load.',
      collocation: 'break down a problem / process',
      block: 'business_idioms',
      isTop50: true,
      repetitions: 4,
      interval: 11,
      easiness: 2.6,
      timesRecalled: 5,
    },
    {
      term: 'get along with',
      translation: 'dar-se bem com alguém',
      example1: 'I get along very well with my engineering manager.',
      example2: 'It’s essential that team members get along.',
      collocation: 'get along with colleagues',
      block: 'social_conversations',
      isTop50: false,
      repetitions: 3,
      interval: 7,
      easiness: 2.5,
      timesRecalled: 3,
    },
    {
      term: 'turn down',
      translation: 'recusar uma oferta ou convite',
      example1: 'He had to turn down the job offer because of the relocation requirement.',
      example2: 'Please don’t turn down our feedback.',
      collocation: 'turn down an offer / proposal',
      block: 'business_idioms',
      isTop50: false,
      repetitions: 2,
      interval: 4,
      easiness: 2.4,
      timesRecalled: 2,
    },
    {
      term: 'set up',
      translation: 'configurar, montar ou agendar',
      example1: 'Could you please set up a call with the product team?',
      example2: 'It took two hours to set up the local environment.',
      collocation: 'set up a meeting / account / environment',
      block: 'phrasal_verbs',
      isTop50: true,
      repetitions: 5,
      interval: 18,
      easiness: 2.8,
      timesRecalled: 9,
    },
    {
      term: 'call off',
      translation: 'cancelar um compromisso ou evento',
      example1: 'They decided to call off the release due to stability issues.',
      example2: 'The meeting was called off at the last minute.',
      collocation: 'call off a meeting / event',
      block: 'business_idioms',
      isTop50: true,
      repetitions: 3,
      interval: 6,
      easiness: 2.5,
      timesRecalled: 4,
    },
    {
      term: 'hold on',
      translation: 'esperar um instante / aguentar firme',
      example1: 'Hold on a second, let me check the dashboard.',
      example2: 'Hold on, I will transfer you to the lead engineer.',
      collocation: 'hold on a second / minute',
      block: 'social_conversations',
      isTop50: true,
      repetitions: 4,
      interval: 12,
      easiness: 2.6,
      timesRecalled: 6,
    },
    {
      term: 'point out',
      translation: 'destacar / chamar a atenção para algo',
      example1: 'She pointed out that the latency was higher than expected.',
      example2: 'I’d like to point out one key risk in this architecture.',
      collocation: 'point out a risk / fact',
      block: 'business_idioms',
      isTop50: false,
      repetitions: 2,
      interval: 5,
      easiness: 2.4,
      timesRecalled: 3,
    },
  ];

  for (const v of vocabSeedItems) {
    await prisma.vocabItem.create({
      data: {
        userId: user.id,
        term: v.term,
        translation: v.translation,
        example1: v.example1,
        example2: v.example2,
        collocation: v.collocation,
        block: v.block,
        isTop50: v.isTop50,
        repetitions: v.repetitions,
        interval: v.interval,
        easiness: v.easiness,
        timesRecalled: v.timesRecalled,
        nextReview: new Date(Date.now() + v.interval * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 8. Conversas concluídas (9 conversas concluídas)
  const conversationTeachers: TeacherId[] = [
    'conversation',
    'conversation',
    'conversation',
    'speaking',
    'speaking',
    'thinking',
    'thinking',
    'immersion',
    'architect',
  ];

  for (let i = 0; i < conversationTeachers.length; i++) {
    const convoTeacher = conversationTeachers[i]!;
    await prisma.conversation.create({
      data: {
        userId: user.id,
        teacherId: convoTeacher,
        completed: true,
        createdAt: new Date(Date.now() - (i * 2 + 1) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 9. PronunciationTests (14 testes dominados com aiScore >= 85)
  const pronunciationFrases = [
    { phrase: 'I think the three thieves threw thirty thrilling theories.', score: 92 },
    { phrase: 'World wide web developers rarely worry about weather forecasts.', score: 88 },
    { phrase: 'Can you explain the project deadline to me please?', score: 95 },
    { phrase: 'I really look forward to hearing your feedback soon.', score: 94 },
    { phrase: 'Actually, that depends on our team capacity this sprint.', score: 90 },
    { phrase: 'Could we figure out a quick workaround for this bug?', score: 89 },
    { phrase: 'The third Thursday of this month is our major launch date.', score: 87 },
    { phrase: 'Let us break down the user story into smaller tasks.', score: 93 },
    { phrase: 'I am twenty-five years old and work as an engineer.', score: 96 },
    { phrase: 'We decided not to put off the product demonstration.', score: 91 },
    { phrase: 'She brought up several critical points during the retro.', score: 89 },
    { phrase: 'I missed my train this morning because of the heavy rain.', score: 94 },
    { phrase: 'Hold on a second while I pull up the analytics metrics.', score: 92 },
    { phrase: 'Our team gets along very well with foreign stakeholders.', score: 88 },
  ];

  for (let i = 0; i < pronunciationFrases.length; i++) {
    const item = pronunciationFrases[i]!;
    await prisma.pronunciationTest.create({
      data: {
        userId: user.id,
        phrase: item.phrase,
        aiScore: item.score,
        selfScore: Math.min(100, item.score + 2),
        weekIndex: Math.floor(i / 3) + 1,
        createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 10. Erros recorrentes (5 erros comuns de brasileiros com count entre 3 e 9)
  const recurringErrorsList = [
    {
      phrase: 'I have 25 years old',
      correction: 'I am 25 years old',
      type: 'grammar',
      count: 9,
      explanation: 'Em inglês, idade é expressa com o verbo to be, não com to have.',
      teacherId: 'speaking',
    },
    {
      phrase: 'make a question to the team',
      correction: 'ask the team a question',
      type: 'vocabulary',
      count: 7,
      explanation: 'Collocation natural em inglês: "ask a question" (fazer uma pergunta).',
      teacherId: 'vocabulary',
    },
    {
      phrase: 'it depends of the project scope',
      correction: 'it depends on the project scope',
      type: 'grammar',
      count: 6,
      explanation: 'A regência do verbo depend em inglês exige a preposição on (depend on).',
      teacherId: 'thinking',
    },
    {
      phrase: 'explain me how this feature works',
      correction: 'explain to me how this feature works',
      type: 'grammar',
      count: 5,
      explanation: 'O verbo explain exige a preposição to antes da pessoa receptora.',
      teacherId: 'conversation',
    },
    {
      phrase: 'I lost my bus this morning',
      correction: 'I missed my bus this morning',
      type: 'vocabulary',
      count: 4,
      explanation: 'Usa-se miss para condução/transporte (miss the bus) e lose para objetos.',
      teacherId: 'speaking',
    },
  ];

  for (const err of recurringErrorsList) {
    await prisma.errorRecord.create({
      data: {
        userId: user.id,
        teacherId: err.teacherId,
        phrase: err.phrase,
        correction: err.correction,
        type: err.type,
        count: err.count,
        explanation: err.explanation,
        lastSeen: new Date(),
      },
    });
  }

  // 11. Achievements desbloqueadas (4 conquistas)
  const achievementsList = [
    {
      code: 'STREAK_7',
      title: 'Ritmo de Ferro: 7 dias seguidos de estudo',
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'VOCAB_50',
      title: 'Caçador de Expressões: 50 palavras dominadas',
      unlockedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'FIRST_CONVERSATION',
      title: 'Voz Ativa: Primeira conversa completa sem desistir',
      unlockedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'PRONUNCIATION_PRO',
      title: 'Ouvido Fino: 10 testes de pronúncia com nota > 85',
      unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const ach of achievementsList) {
    await prisma.achievement.create({
      data: {
        userId: user.id,
        code: ach.code,
        title: ach.title,
        unlockedAt: ach.unlockedAt,
      },
    });
  }

  // 12. ModuleProgress para os 8 professores
  const moduleProgressSpecs: Record<TeacherId, number> = {
    architect: 100,
    vocabulary: 45,
    conversation: 60,
    listening: 35,
    speaking: 30,
    pronunciation: 25,
    thinking: 20,
    immersion: 40,
  };

  for (const teacherId of TEACHER_IDS) {
    await prisma.moduleProgress.create({
      data: {
        userId: user.id,
        teacherId,
        percent: moduleProgressSpecs[teacherId] ?? 0,
      },
    });
  }

  console.log(`✅ Seed rico concluído com sucesso para: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
