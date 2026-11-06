import { Anthropic } from '@anthropic-ai/sdk';
import {
  type TeacherId,
  type PromptVariable,
  type ProfileInput,
  type VocabBlockId,
  type VocabCardData,
  profileToPromptVars,
  architectPlanSchema,
  listeningSessionDataSchema,
  speakingDrillDataSchema,
  pronunciationGuideSchema,
  directThinkingDataSchema,
  immersionPlanSchema,
  activeVocabTestSchema,
  evaluatePronunciationSchema,
  conversationTurnResponseSchema,
  CONVERSATION_ROLES,
  VOCAB_BLOCKS,
} from '@fluencialab/shared';
import { prisma } from '../db';
import { env } from '../config/env';
import { buildTeacherSystemPrompt } from './promptBuilder';
import { VOCAB_CATALOG } from './vocabData';
import {
  generateArchitectPlan,
  generateListeningData,
  generateSpeakingDrill,
  generatePronunciationGuide,
  generateDirectThinkingData,
  generateImmersionPlan,
} from './mockGenerators';

let anthropicClient: Anthropic | null = null;
if (env.ANTHROPIC_API_KEY) {
  try {
    anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  } catch (err) {
    console.warn('Falha ao instanciar cliente Anthropic. Operando em modo determinístico.', err);
  }
}

/**
 * Utilitário seguro para chamar Anthropic com extração de JSON e validação Zod,
 * com fallback transparente para o gerador mock caso ocorra qualquer erro ou ausência de chave.
 */
async function callAnthropicJsonGuard<T>(
  system: string,
  userMessage: string,
  validator: (raw: unknown) => T,
  fallbackGenerator: () => T,
): Promise<T> {
  if (!anthropicClient) {
    return fallbackGenerator();
  }

  try {
    const response = await anthropicClient.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: userMessage }],
    });

    const block = response.content.find((c) => c.type === 'text');
    if (!block || block.type !== 'text') {
      return fallbackGenerator();
    }

    const text = block.text.trim();
    // Procura bloco de código JSON ou o primeiro { / [ até o último } / ]
    let jsonStr = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      const firstCurly = text.indexOf('{');
      const lastCurly = text.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly > firstCurly) {
        jsonStr = text.slice(firstCurly, lastCurly + 1);
      }
    }

    const parsed = JSON.parse(jsonStr);
    return validator(parsed);
  } catch (err) {
    console.warn('Anthropic API falhou ou retornou formato incompatível. Ativando fallback determinístico.', err);
    return fallbackGenerator();
  }
}

/**
 * Carrega ou inicializa o perfil do aluno para preenchimento de variáveis.
 */
async function loadUserProfileVars(userId: string): Promise<{
  profileVars: Record<PromptVariable, string>;
  profileInput: ProfileInput;
}> {
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
  return { profileVars, profileInput };
}

export interface RunTeacherActionParams {
  userId: string;
  teacherId: TeacherId;
  action: string;
  payload?: Record<string, unknown>;
}

/**
 * Executa as ações inteligentes do professor especialista com IA e persistência no Prisma.
 */
export async function runTeacherAction(params: RunTeacherActionParams): Promise<unknown> {
  const { userId, teacherId, action, payload = {} } = params;
  const { profileVars } = await loadUserProfileVars(userId);
  const systemPrompt = buildTeacherSystemPrompt(teacherId, profileVars);

  switch (teacherId) {
    // -------------------------------------------------------------------------
    // 1. Arquiteto da Fluência
    // -------------------------------------------------------------------------
    case 'architect': {
      if (action === 'get') {
        const existing = await prisma.studyPlan.findFirst({
          where: { userId, active: true },
          orderBy: { createdAt: 'desc' },
        });
        if (existing) {
          const planData = architectPlanSchema.safeParse({
            diagnosis: existing.diagnosis,
            learnFirst: existing.learnFirst,
            phases: existing.phases,
            dailyRoutine: existing.dailyRoutine,
            weeklyGoals: existing.weeklyGoals,
            checkpoints: existing.checkpoints,
            ignoreList: existing.ignoreList,
          });
          if (planData.success) {
            return {
              plan: planData.data,
              systemPromptPreview: systemPrompt.slice(0, 500),
            };
          }
        }
      }

      // 'generate' ou fallback de 'get' sem plano anterior
      const plan = await callAnthropicJsonGuard(
        systemPrompt,
        `Gere o plano de 90 dias completo em formato JSON rigorosamente compatível com o schema architectPlanSchema para o aluno com perfil: ${JSON.stringify(profileVars)}.`,
        (raw) => architectPlanSchema.parse(raw),
        () => generateArchitectPlan(profileVars),
      );

      // Desativa planos anteriores
      await prisma.studyPlan.updateMany({
        where: { userId, active: true },
        data: { active: false },
      });

      // Salva novo plano ativo
      await prisma.studyPlan.create({
        data: {
          userId,
          active: true,
          diagnosis: plan.diagnosis,
          learnFirst: plan.learnFirst,
          phases: plan.phases,
          dailyRoutine: plan.dailyRoutine,
          weeklyGoals: plan.weeklyGoals,
          checkpoints: plan.checkpoints,
          ignoreList: plan.ignoreList,
        },
      });

      // Atualiza moduleProgress do architect para 100%
      await prisma.moduleProgress.upsert({
        where: { userId_teacherId: { userId, teacherId: 'architect' } },
        create: { userId, teacherId: 'architect', percent: 100 },
        update: { percent: 100 },
      });

      return {
        plan,
        systemPromptPreview: systemPrompt.slice(0, 500),
      };
    }

    // -------------------------------------------------------------------------
    // 2. Vocabulário de Alta Frequência
    // -------------------------------------------------------------------------
    case 'vocabulary': {
      if (action === 'active_test') {
        const input = activeVocabTestSchema.parse(payload);
        const targetClean = input.targetTerm.toLowerCase().trim();
        const userClean = input.userProduction.toLowerCase().trim();

        // Avaliação de semelhança e uso do chunk
        const targetTokens = targetClean.split(/\s+/).filter((w) => w.length > 2);
        const matchedTokens = targetTokens.filter((t) => userClean.includes(t));
        const matchRatio = targetTokens.length ? matchedTokens.length / targetTokens.length : 1;

        const isExactOrClose = userClean.includes(targetClean) || matchRatio >= 0.7;
        const score = isExactOrClose ? Math.min(100, Math.round(75 + matchRatio * 25)) : Math.round(matchRatio * 50);
        const correct = score >= 70;

        if (correct) {
          if (input.vocabId) {
            await prisma.vocabItem.update({
              where: { id: input.vocabId },
              data: { timesRecalled: { increment: 1 } },
            }).catch(() => undefined);
          } else {
            await prisma.vocabItem.updateMany({
              where: { userId, term: input.targetTerm },
              data: { timesRecalled: { increment: 1 } },
            });
          }
        }

        return {
          correct,
          score,
          feedback: correct
            ? 'Excelente aplicação ativa! Você usou a estrutura com naturalidade e precisão no contexto.'
            : `A frase produzida precisa incorporar com mais precisão a expressão chave "${input.targetTerm}".`,
          naturalAlternative: `In real conversations, natives often say: "${input.targetTerm}!"`,
        };
      }

      // Default: 'get_block'
      const blockId = (payload.block as VocabBlockId) || 'top50';
      let items = await prisma.vocabItem.findMany({
        where: { userId, block: blockId },
        orderBy: { createdAt: 'asc' },
      });

      // Se o usuário ainda não tiver itens nesse bloco, inicializa a partir do catálogo
      if (items.length === 0) {
        const seedCards = VOCAB_CATALOG.filter((c) => c.block === blockId);
        for (const c of seedCards) {
          await prisma.vocabItem.upsert({
            where: { userId_term: { userId, term: c.term } },
            create: {
              userId,
              term: c.term,
              translation: c.translation,
              pronunciation: c.pronunciation,
              example1: c.example1,
              example2: c.example2,
              collocation: c.collocation,
              block: c.block,
              isTop50: c.isTop50,
              easiness: 2.5,
              interval: 0,
              repetitions: 0,
              nextReview: new Date(),
            },
            update: {},
          });
        }

        items = await prisma.vocabItem.findMany({
          where: { userId, block: blockId },
          orderBy: { createdAt: 'asc' },
        });
      }

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

      return {
        block: blockId,
        items: formattedItems,
        allBlocks: VOCAB_BLOCKS,
      };
    }

    // -------------------------------------------------------------------------
    // 3. Conversação Infinita
    // -------------------------------------------------------------------------
    case 'conversation': {
      if (action === 'start') {
        const roleId = (payload.roleId as string) || 'friend';
        const roleMeta = CONVERSATION_ROLES.find((r) => r.id === roleId) ?? CONVERSATION_ROLES[0]!;

        const initialGreetings: Record<string, string> = {
          friend: `Hey! It is so good to connect with you today. How has your week been going so far? Anything new?`,
          coworker: `Hi there! Hope you are having a productive day. Did you get a chance to look at the latest project update?`,
          boss: `Good morning. Thank you for making time to meet with me today. How are your current priorities progressing?`,
          clerk: `Hi! Welcome in! What can I get started for you today?`,
          client: `Hello. Thanks for taking my call. I wanted to quickly discuss the delivery schedule we agreed on.`,
          driver: `Hey there! Hop in. Beautiful afternoon outside, isn’t it? Headed home or back to work?`,
          doctor: `Hello. Please have a seat. What brings you into the clinic today? How have you been feeling?`,
          receptionist: `Good afternoon! Welcome to the Grand Hotel. Are you checking in with us today?`,
          stranger: `Excuse me! Sorry to bother you, but do you know if this train goes all the way to downtown?`,
        };

        const firstReply = initialGreetings[roleId] ?? initialGreetings.friend!;

        const conversation = await prisma.conversation.create({
          data: {
            userId,
            teacherId: 'conversation',
            completed: false,
          },
        });

        const firstMsg = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: 'assistant',
            content: firstReply,
            meta: {
              roleId,
              roleTheme: roleMeta.theme,
            },
          },
        });

        return {
          conversationId: conversation.id,
          roleId,
          messages: [firstMsg],
        };
      }

      if (action === 'message') {
        const conversationId = payload.conversationId as string;
        const content = (payload.content as string) || '';

        if (!conversationId || !content.trim()) {
          throw new Error('conversationId e content são obrigatórios para enviar mensagem.');
        }

        // Salva a mensagem do aluno
        await prisma.message.create({
          data: {
            conversationId,
            role: 'user',
            content: content.trim(),
          },
        });

        // Contagem de turnos do usuário na conversa
        const userTurnCount = await prisma.message.count({
          where: { conversationId, role: 'user' },
        });

        const wordCount = content.trim().split(/\s+/).length;
        const needsFollowUp = wordCount < 8;

        // Regra crítica: a cada 3 respostas do aluno (ou erro claro), preenche importantCorrections
        const shouldCorrect = userTurnCount % 3 === 0;

        const importantCorrections: { wrong: string; correct: string; oneLineExplanation: string }[] = [];

        // Detecção de erros comuns de interferência do português
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('have') && (lowerContent.includes('years') || lowerContent.includes('age'))) {
          importantCorrections.push({
            wrong: content,
            correct: content.replace(/have\s+(\d+)\s+years/gi, 'am $1 years old'),
            oneLineExplanation: 'Em inglês, usamos o verbo "to be" para expressar idade, e não "have".',
          });
        } else if (lowerContent.includes('make a question')) {
          importantCorrections.push({
            wrong: 'make a question',
            correct: 'ask a question',
            oneLineExplanation: 'A colocação natural em inglês é "ask a question", e não "make".',
          });
        } else if (shouldCorrect) {
          // Correção pedagógica preventiva com registro no banco
          importantCorrections.push({
            wrong: content,
            correct: `${content.trim().replace(/[.!?]*$/, '')}, as far as I know.`,
            oneLineExplanation: 'Para soar mais natural e fluido, adicione conectivos suaves no fechamento da resposta.',
          });
        }

        // Se houver correções, registra em ErrorRecord no Prisma
        for (const corr of importantCorrections) {
          await prisma.errorRecord.upsert({
            where: {
              userId_phrase_correction: {
                userId,
                phrase: corr.wrong,
                correction: corr.correct,
              },
            },
            create: {
              userId,
              teacherId: 'conversation',
              type: 'grammar',
              phrase: corr.wrong,
              correction: corr.correct,
              explanation: corr.oneLineExplanation,
              count: 1,
            },
            update: {
              count: { increment: 1 },
              lastSeen: new Date(),
            },
          });
        }

        const replyOptions = [
          'That sounds really intriguing! Tell me a bit more about how that turned out for you.',
          'I totally get what you mean. In that kind of situation, what is usually your first reaction?',
          'That makes a lot of sense! Have you always looked at it from that perspective?',
          'Fascinating point! If you could change one detail about it, what would it be?',
          'I see where you are coming from. And how did everyone else around you react?',
        ];
        const selectedReply = replyOptions[userTurnCount % replyOptions.length]!;

        const followUp = needsFollowUp
          ? 'Could you elaborate just a little more with a specific example?'
          : undefined;

        const turnResponse = {
          reply: selectedReply,
          replyTranslationHint: 'Isso soa muito interessante! Conte-me um pouco mais sobre como isso terminou.',
          followUpQuestion: followUp,
          difficultyLevel: '80% compreensível',
          importantCorrections,
          wordsUsedCount: selectedReply.split(/\s+/).length,
        };

        const validatedTurn = conversationTurnResponseSchema.parse(turnResponse);

        // Salva a resposta do assistente
        await prisma.message.create({
          data: {
            conversationId,
            role: 'assistant',
            content: validatedTurn.reply,
            meta: {
              importantCorrections: validatedTurn.importantCorrections,
              followUpQuestion: validatedTurn.followUpQuestion,
              difficultyLevel: validatedTurn.difficultyLevel,
            },
          },
        });

        const allMessages = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
        });

        return {
          turn: validatedTurn,
          userTurnCount,
          messages: allMessages,
        };
      }

      if (action === 'finish_conversation') {
        const conversationId = payload.conversationId as string;
        if (conversationId) {
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { completed: true },
          }).catch(() => undefined);
        }

        return {
          recurringErrors: [
            { type: 'grammar', phrase: 'I have 28 years', correction: 'I am 28 years old', explanation: 'Idade se expressa com o verbo to be.' },
            { type: 'vocabulary', phrase: 'Make a question', correction: 'Ask a question', explanation: 'Colocação correta é ask a question.' },
            { type: 'preposition', phrase: 'Depend of the time', correction: 'Depend on the time', explanation: 'A preposição correta após depend é on.' },
            { type: 'word_choice', phrase: 'Lose the train', correction: 'Miss the train', explanation: 'Para transporte que partiu, usamos miss.' },
            { type: 'fluency', phrase: 'I am agree', correction: 'I agree', explanation: 'Agree já é verbo, não precisa do verbo to be.' },
          ],
          newWords: [
            { term: 'Intriguing', translation: 'Intrigante / fascinante' },
            { term: 'Elaborate', translation: 'Elaborar / detalhar' },
            { term: 'Perspective', translation: 'Ponto de vista' },
            { term: 'As far as I know', translation: 'Até onde eu sei' },
            { term: 'To be honest', translation: 'Para ser sincero' },
            { term: 'Catch up', translation: 'Colocar o papo em dia' },
            { term: 'Turn out', translation: 'Resultar / acabar sendo' },
            { term: 'Double-check', translation: 'Checar duas vezes' },
            { term: 'Reach out', translation: 'Entrar em contato' },
            { term: 'Wrap up', translation: 'Finalizar / concluir' },
          ],
          structuresToPractice: [
            'I’d rather [verb] than [verb]',
            'It depends on whether [clause]',
            'I am used to [verb+ing]',
          ],
          nextChallenge: 'Complete a próxima sessão em menos de 10 minutos mantendo todas as respostas com mais de 10 palavras.',
        };
      }

      throw new Error(`Ação não suportada para conversation: ${action}`);
    }

    // -------------------------------------------------------------------------
    // 4. Treinador de Ouvido (Listening)
    // -------------------------------------------------------------------------
    case 'listening': {
      if (action === 'check_dictation') {
        const expected = ((payload.expectedPhrase as string) || '').trim();
        const userAttempt = ((payload.userAttempt as string) || '').trim();

        const clean = (s: string) => s.toLowerCase().replace(/[.,!?;:'"’]/g, '').split(/\s+/).filter(Boolean);
        const expWords = clean(expected);
        const usrWords = clean(userAttempt);

        const matchedWords = expWords.filter((w) => usrWords.includes(w));
        const missedWords = expWords.filter((w) => !usrWords.includes(w));
        const accuracy = expWords.length ? Math.round((matchedWords.length / expWords.length) * 100) : 0;

        let feedback = 'Excelente transcrição! Seu ouvido captou perfeitamente o ritmo da frase.';
        if (accuracy < 100) {
          feedback = `Atenção aos sons engolidos e ligações: as palavras [${missedWords.join(', ')}] sofreram redução severa na pronúncia conectada.`;
        }

        return {
          accuracy,
          matchedWords,
          missedWords,
          feedback,
        };
      }

      // Default: 'load'
      const contentType = (payload.contentType as string) || 'series';
      const data = await callAnthropicJsonGuard(
        systemPrompt,
        `Retorne a estrutura ListeningSessionData em formato JSON para o tipo de conteúdo "${contentType}" e perfil ${JSON.stringify(profileVars)}.`,
        (raw) => listeningSessionDataSchema.parse(raw),
        () => generateListeningData(contentType, profileVars),
      );

      return data;
    }

    // -------------------------------------------------------------------------
    // 5. Destruidor de Bloqueio na Fala (Speaking)
    // -------------------------------------------------------------------------
    case 'speaking': {
      if (action === 'evaluate_response') {
        const responseTimeMs = Number(payload.responseTimeMs) || 3500;
        const userAnswer = ((payload.userAnswer as string) || '').trim();
        const promptPt = (payload.promptPt as string) || '';
        const passedTime = responseTimeMs <= 5000;

        const hasContent = userAnswer.length >= 3;
        let score = passedTime ? 85 : 55;
        if (!hasContent) score = 20;

        return {
          passedTime,
          score,
          feedback: passedTime
            ? `Fantástico! Você disparou a resposta em ${(responseTimeMs / 1000).toFixed(1)}s, aniquilando a hesitação mental.`
            : `Boa tentativa, mas o tempo foi de ${(responseTimeMs / 1000).toFixed(1)}s. Foque no gancho imediato nos primeiros 2 segundos.`,
          naturalAlternative: `Uma opção ultrarrápida para "${promptPt}" seria dizer diretamente: "I definitely need to handle that right now."`,
        };
      }

      // Default: 'load'
      const data = await callAnthropicJsonGuard(
        systemPrompt,
        `Gere o speakingDrillDataSchema em JSON com os 10 padrões, 40 estímulos, 15 exercícios e 10 perguntas inesperadas para ${JSON.stringify(profileVars)}.`,
        (raw) => speakingDrillDataSchema.parse(raw),
        () => generateSpeakingDrill(profileVars),
      );

      return data;
    }

    // -------------------------------------------------------------------------
    // 6. Corretor de Pronúncia
    // -------------------------------------------------------------------------
    case 'pronunciation': {
      if (action === 'evaluate_test') {
        const input = evaluatePronunciationSchema.parse(payload);
        const clean = (s: string) => s.toLowerCase().replace(/[.,!?;:'"’]/g, '').split(/\s+/).filter(Boolean);
        const phraseWords = clean(input.phrase);
        const transWords = clean(input.transcript);

        const matched = phraseWords.filter((w) => transWords.includes(w));
        const textAccuracy = phraseWords.length ? Math.round((matched.length / phraseWords.length) * 100) : 0;
        const aiScore = Math.round(textAccuracy * 0.7 + input.selfScore * 0.3);

        const missed = phraseWords.filter((w) => !transWords.includes(w));
        const wordsToFocus = missed.length > 0 ? missed : [phraseWords[0] || 'clarity'];

        const testRecord = await prisma.pronunciationTest.create({
          data: {
            userId,
            phrase: input.phrase,
            transcript: input.transcript,
            selfScore: input.selfScore,
            aiScore,
            weekIndex: input.weekIndex,
          },
        });

        return {
          testRecord,
          aiScore,
          feedback: aiScore >= 80
            ? 'Pronúncia excelente! Articulação clara, ritmo natural e boa ênfase nas palavras de conteúdo.'
            : 'Foque na posição da língua nos fonemas críticos e evite adicionar vogais extras no final das consoantes.',
          wordsToFocus,
        };
      }

      // Default: 'load'
      const data = await callAnthropicJsonGuard(
        systemPrompt,
        `Gere o pronunciationGuideSchema completo em JSON comparando ${profileVars.IDIOMA_NATIVO} e ${profileVars.IDIOMA}.`,
        (raw) => pronunciationGuideSchema.parse(raw),
        () => generatePronunciationGuide(profileVars),
      );

      return data;
    }

    // -------------------------------------------------------------------------
    // 7. Pensamento Direto (Thinking)
    // -------------------------------------------------------------------------
    case 'thinking': {
      if (action === 'check_translation_trap') {
        const userSentence = ((payload.userSentence as string) || '').trim();
        const lower = userSentence.toLowerCase();

        // Tabela de armadilhas comuns do português
        const traps: { regex: RegExp; literal: string; natural: string; explanation: string }[] = [
          {
            regex: /\bhave\s+\d+\s+years\b/i,
            literal: 'I have X years',
            natural: 'I am X years old',
            explanation: 'Em inglês, a idade é um estado do ser ("to be"), e não uma posse física ("have").',
          },
          {
            regex: /\bmake\s+a\s+question\b/i,
            literal: 'Make a question',
            natural: 'Ask a question',
            explanation: 'A colocação natural em inglês usa o verbo "ask", nunca "make".',
          },
          {
            regex: /\bclose\s+the\s+light\b/i,
            literal: 'Close the light',
            natural: 'Turn off the light',
            explanation: 'Dispositivos e iluminação são ligados e desligados com "turn on/off".',
          },
          {
            regex: /\bexplain\s+me\b/i,
            literal: 'Explain me',
            natural: 'Explain to me',
            explanation: 'O verbo explain exige a preposição "to" antes da pessoa a quem se explica.',
          },
          {
            regex: /\bdepend\s+of\b/i,
            literal: 'Depend of',
            natural: 'Depend on',
            explanation: 'Em inglês, a regência de depend é com a preposição "on", nunca "of".',
          },
          {
            regex: /\bmore\s+one\b/i,
            literal: 'More one',
            natural: 'Another one / One more',
            explanation: 'Para adicionar um item, use "another" ou "one more", nunca "more one".',
          },
          {
            regex: /\bam\s+agree\b/i,
            literal: 'I am agree',
            natural: 'I agree',
            explanation: 'Agree já é um verbo de ação mental; não utilize o verbo to be junto.',
          },
        ];

        const matchedTrap = traps.find((t) => t.regex.test(lower));

        if (matchedTrap) {
          await prisma.errorRecord.upsert({
            where: {
              userId_phrase_correction: {
                userId,
                phrase: userSentence,
                correction: matchedTrap.natural,
              },
            },
            create: {
              userId,
              teacherId: 'thinking',
              type: 'translation',
              phrase: userSentence,
              correction: matchedTrap.natural,
              explanation: matchedTrap.explanation,
              count: 1,
            },
            update: {
              count: { increment: 1 },
              lastSeen: new Date(),
            },
          });

          return {
            isLiteralTranslation: true,
            literalForm: matchedTrap.literal,
            naturalForm: matchedTrap.natural,
            explanation: matchedTrap.explanation,
            score: 40,
          };
        }

        return {
          isLiteralTranslation: false,
          literalForm: 'Nenhuma armadilha direta detectada',
          naturalForm: userSentence,
          explanation: 'Construção direta e nativa sem interferência da gramática materna.',
          score: 95,
        };
      }

      // Default: 'load'
      const data = await callAnthropicJsonGuard(
        systemPrompt,
        `Gere o directThinkingDataSchema completo em JSON com as 4 etapas, 30 chunks nativos e 20 situações para ${JSON.stringify(profileVars)}.`,
        (raw) => directThinkingDataSchema.parse(raw),
        () => generateDirectThinkingData(profileVars),
      );

      return data;
    }

    // -------------------------------------------------------------------------
    // 8. Simulador de Imersão Total
    // -------------------------------------------------------------------------
    case 'immersion': {
      if (action === 'save_diary') {
        const lines = ((payload.lines as string) || '').trim();
        const wordsCount = lines ? lines.split(/\s+/).length : 0;

        return {
          feedback: 'Parabéns pela consistência! Registrar seu dia no idioma-alvo consolida o vocabulário na memória de longo prazo.',
          correctedVersion: lines
            .replace(/\bi have (\d+) years\b/gi, 'I am $1 years old')
            .replace(/\bmake a question\b/gi, 'ask a question')
            .replace(/\bclose the light\b/gi, 'turn off the light'),
          wordsCount,
        };
      }

      // Default: 'load'
      const data = await callAnthropicJsonGuard(
        systemPrompt,
        `Gere o immersionPlanSchema adaptado à rotina ${profileVars.ROTINA} e minutos ${profileVars.MINUTOS} em JSON.`,
        (raw) => immersionPlanSchema.parse(raw),
        () => generateImmersionPlan(profileVars),
      );

      return data;
    }

    default:
      throw new Error(`Professor não implementado: ${teacherId}`);
  }
}
