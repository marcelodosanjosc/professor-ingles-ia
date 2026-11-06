import { z } from 'zod';
import { SKILLS } from './dashboard.js';
import { TEACHER_IDS } from './teachers.js';

// ============================================================================
// Sessões & Resumo Final (Comum a todos os 8 professores)
// ============================================================================

export const sessionSummarySchema = z.object({
  title: z.string(),
  highlights: z.array(z.string()),
  recurringErrors: z
    .array(
      z.object({
        type: z.string(),
        phrase: z.string(),
        correction: z.string(),
        explanation: z.string().optional(),
      }),
    )
    .default([]),
  newWords: z
    .array(
      z.object({
        term: z.string(),
        translation: z.string(),
        example: z.string().optional(),
      }),
    )
    .default([]),
  structuresToPractice: z.array(z.string()).default([]),
  nextChallenge: z.string(),
  skillDeltas: z
    .object({
      listening: z.number().optional(),
      speaking: z.number().optional(),
      vocabulary: z.number().optional(),
      grammar: z.number().optional(),
      pronunciation: z.number().optional(),
      directThinking: z.number().optional(),
    })
    .default({}),
});
export type SessionSummaryData = z.infer<typeof sessionSummarySchema>;

export const startSessionSchema = z.object({
  teacherId: z.enum(TEACHER_IDS),
});
export type StartSessionInput = z.infer<typeof startSessionSchema>;

export const completeSessionSchema = z.object({
  durationSec: z.number().int().min(0).max(6 * 3600),
  speakingSec: z.number().int().min(0).max(6 * 3600).default(0),
  exposureSec: z.number().int().min(0).max(6 * 3600).default(0),
  wordsRecalled: z.number().int().min(0).max(5000).default(0),
  progressDelta: z.number().int().min(0).max(100).default(15),
  notes: z.string().max(1000).optional(),
  recurringErrors: sessionSummarySchema.shape.recurringErrors.optional(),
  newWords: sessionSummarySchema.shape.newWords.optional(),
  structuresToPractice: z.array(z.string()).optional(),
  nextChallenge: z.string().optional(),
});
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;

export interface SessionHistoryItem {
  id: string;
  teacherId: string;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  speakingSec: number;
  exposureSec: number;
  wordsRecalled: number;
  summary: SessionSummaryData | null;
}

// ============================================================================
// 1. Professor Arquiteto da Fluência (Plano de 90 dias)
// ============================================================================

export const architectPlanSchema = z.object({
  diagnosis: z.object({
    currentStage: z.string(),
    strengths: z.array(z.string()),
    bottlenecks: z.array(z.string()),
    paretoFocus: z.string(),
  }),
  learnFirst: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
      whyItMatters: z.string(),
    }),
  ),
  phases: z.array(
    z.object({
      number: z.number().int(),
      title: z.string(),
      daysRange: z.string(),
      priorityVocab: z.array(z.string()),
      essentialGrammar: z.array(z.string()),
      listeningDrill: z.string(),
      speakingDrill: z.string(),
      readingWritingDrill: z.string(),
      reviewProtocol: z.string(),
    }),
  ),
  dailyRoutine: z.array(
    z.object({
      blockName: z.string(),
      minutes: z.number().int(),
      activity: z.string(),
      teacherSlug: z.string(),
    }),
  ),
  weeklyGoals: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      done: z.boolean().default(false),
      kind: z.enum(['speaking_test', 'comprehension_test', 'other']),
    }),
  ),
  checkpoints: z.array(
    z.object({
      day: z.number().int(),
      title: z.string(),
      criteria: z.string().optional(),
      done: z.boolean().default(false),
    }),
  ),
  ignoreList: z.array(
    z.object({
      topic: z.string(),
      reason: z.string(),
    }),
  ),
});
export type ArchitectPlanData = z.infer<typeof architectPlanSchema>;

// ============================================================================
// 2. Professor de Vocabulário de Alta Frequência
// ============================================================================

export const VOCAB_BLOCKS = [
  { id: 'top50', label: 'Top 50 Expressões de Sobrevivência' },
  { id: 'introduce', label: 'Apresentar-se e Socializar' },
  { id: 'ask_info', label: 'Pedir Informação' },
  { id: 'opinion', label: 'Dar Opinião' },
  { id: 'agree_disagree', label: 'Concordar e Discordar' },
  { id: 'ask_help', label: 'Pedir Ajuda' },
  { id: 'time', label: 'Tempo e Rotina' },
  { id: 'money', label: 'Dinheiro e Negócios' },
  { id: 'work', label: 'Trabalho e Reuniões' },
  { id: 'feelings', label: 'Sentimentos e Reações' },
  { id: 'travel', label: 'Deslocamento e Viagem' },
  { id: 'shopping', label: 'Compras e Serviços' },
  { id: 'problems', label: 'Resolver Problemas e Imprevistos' },
] as const;

export type VocabBlockId = (typeof VOCAB_BLOCKS)[number]['id'];

export const vocabCardSchema = z.object({
  id: z.string().optional(),
  term: z.string(),
  translation: z.string(),
  pronunciation: z.string(),
  example1: z.string(),
  example2: z.string(),
  collocation: z.string(),
  block: z.string(),
  isTop50: z.boolean().default(false),
  easiness: z.number().default(2.5),
  interval: z.number().int().default(0),
  repetitions: z.number().int().default(0),
  nextReview: z.string().optional(),
});
export type VocabCardData = z.infer<typeof vocabCardSchema>;

export const srsReviewSchema = z.object({
  vocabId: z.string(),
  quality: z.number().int().min(0).max(5), // 0..5 algoritmo SM-2
});
export type SrsReviewInput = z.infer<typeof srsReviewSchema>;

export const activeVocabTestSchema = z.object({
  vocabId: z.string().optional(),
  targetTerm: z.string(),
  promptPt: z.string(),
  userProduction: z.string().min(1),
});
export type ActiveVocabTestInput = z.infer<typeof activeVocabTestSchema>;

export const activeVocabEvaluationSchema = z.object({
  correct: z.boolean(),
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
  naturalAlternative: z.string(),
});
export type ActiveVocabEvaluation = z.infer<typeof activeVocabEvaluationSchema>;

// ============================================================================
// 3. Professor de Conversação Infinita
// ============================================================================

export const CONVERSATION_ROLES = [
  { id: 'friend', label: 'Amigo(a) próximo(a)', theme: 'Vida cotidiana e histórias' },
  { id: 'coworker', label: 'Colega de trabalho', theme: 'Trabalho e projetos' },
  { id: 'boss', label: 'Chefe / Gestor', theme: 'Decisões, alinhamentos e carreira' },
  { id: 'clerk', label: 'Atendente de loja/café', theme: 'Compras e pedidos rápidos' },
  { id: 'client', label: 'Cliente exigente', theme: 'Problemas e negociação' },
  { id: 'driver', label: 'Motorista de aplicativo', theme: 'Viagens e conversa casual' },
  { id: 'doctor', label: 'Médico(a)', theme: 'Saúde e sintomas' },
  { id: 'receptionist', label: 'Recepcionista de hotel', theme: 'Check-in e imprevistos' },
  { id: 'stranger', label: 'Desconhecido simpático', theme: 'Situações inesperadas' },
] as const;

export const conversationTurnResponseSchema = z.object({
  reply: z.string(),
  replyTranslationHint: z.string().optional(),
  followUpQuestion: z.string().optional(),
  difficultyLevel: z.string().default('80% compreensível'),
  importantCorrections: z
    .array(
      z.object({
        wrong: z.string(),
        correct: z.string(),
        oneLineExplanation: z.string(),
      }),
    )
    .default([]),
  wordsUsedCount: z.number().int().default(0),
});
export type ConversationTurnResponse = z.infer<typeof conversationTurnResponseSchema>;

// ============================================================================
// 4. Treinador de Ouvido (Listening)
// ============================================================================

export const LISTENING_CONTENTS = [
  { id: 'movies', label: 'Filmes e Cinema' },
  { id: 'series', label: 'Séries de TV' },
  { id: 'youtube', label: 'YouTube e Vlogs' },
  { id: 'meetings', label: 'Reuniões de Trabalho' },
  { id: 'conversations', label: 'Conversas de Rua' },
  { id: 'podcasts', label: 'Podcasts' },
] as const;

export const listeningSessionDataSchema = z.object({
  contentType: z.string(),
  levels: z.array(
    z.object({
      level: z.number().int().min(1).max(5),
      title: z.string(),
      phrase: z.string(),
      translation: z.string(),
      phoneticBreakdown: z.string(),
      reductionsAndLinks: z.array(
        z.object({
          written: z.string(),
          spokenAs: z.string(),
          explanation: z.string(),
        }),
      ),
    }),
  ),
  shadowingSentences: z.array(
    z.object({
      id: z.string(),
      phrase: z.string(),
      rhythmTip: z.string(),
      swallowedSound: z.string(),
    }),
  ),
  dailyRoutine15Min: z.array(
    z.object({
      minutes: z.number().int(),
      step: z.string(),
      instruction: z.string(),
    }),
  ),
});
export type ListeningSessionData = z.infer<typeof listeningSessionDataSchema>;

// ============================================================================
// 5. Destruidor de Bloqueio na Fala (Speaking Speed)
// ============================================================================

export const speakingDrillDataSchema = z.object({
  corePatterns: z.array(
    z.object({
      id: z.string(),
      ptTrigger: z.string(),
      targetPattern: z.string(),
      examples: z.array(z.string()),
    }),
  ),
  rapidStimuli: z.array(
    z.object({
      id: z.number().int(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      promptPt: z.string(),
      expectedAnchor: z.string(),
      sampleAnswer: z.string(),
      rephrasePrompt: z.string(),
      sampleRephrase: z.string(),
    }),
  ),
  substitutionExercises: z.array(
    z.object({
      id: z.number().int(),
      template: z.string(),
      baseSentence: z.string(),
      variations: z.array(
        z.object({
          cue: z.string(),
          expected: z.string(),
        }),
      ),
    }),
  ),
  unexpectedQuestions: z.array(
    z.object({
      id: z.number().int(),
      question: z.string(),
      translation: z.string(),
      quickStarter: z.string(),
    }),
  ),
});
export type SpeakingDrillData = z.infer<typeof speakingDrillDataSchema>;

// ============================================================================
// 6. Corretor de Pronúncia
// ============================================================================

export const pronunciationGuideSchema = z.object({
  top10Errors: z.array(
    z.object({
      id: z.number().int(),
      soundName: z.string(),
      isHighImpact: z.boolean(),
      whatMouthDoes: z.string(),
      whatMouthShouldDo: z.string(),
      tongueAndLips: z.string(),
      wrongApproxExample: z.string(),
      correctExample: z.string(),
      practiceWords: z.array(z.string()),
      minimalPairs: z.array(z.object({ wordA: z.string(), wordB: z.string() })).default([]),
    }),
  ),
  daily10MinRoutine: z.array(
    z.object({
      minutes: z.number().int(),
      title: z.string(),
      description: z.string(),
    }),
  ),
  rhythmAndIntonation: z.array(
    z.object({
      rule: z.string(),
      example: z.string(),
    }),
  ),
  weeklyTestSentences: z.array(
    z.object({
      id: z.number().int(),
      phrase: z.string(),
      focusSound: z.string(),
      ipaOrApprox: z.string(),
    }),
  ),
});
export type PronunciationGuideData = z.infer<typeof pronunciationGuideSchema>;

export const evaluatePronunciationSchema = z.object({
  phrase: z.string().min(1),
  transcript: z.string().min(1),
  selfScore: z.number().int().min(0).max(100).default(75),
  weekIndex: z.number().int().min(1).max(52).default(1),
});
export type EvaluatePronunciationInput = z.infer<typeof evaluatePronunciationSchema>;

// ============================================================================
// 7. Tradutor que Impede de Traduzir (Pensamento Direto)
// ============================================================================

export const directThinkingDataSchema = z.object({
  stage1Objects: z.array(
    z.object({
      id: z.number().int(),
      visualCue: z.string(),
      contextHintInTarget: z.string(),
      expectedTerms: z.array(z.string()),
    }),
  ),
  stage2Actions: z.array(
    z.object({
      id: z.number().int(),
      scenarioCue: z.string(),
      targetVerbHint: z.string(),
      sampleShortSentence: z.string(),
    }),
  ),
  stage3Thoughts: z.array(
    z.object({
      id: z.number().int(),
      questionInTarget: z.string(),
      starterTemplate: z.string(),
      sampleAnswer: z.string(),
    }),
  ),
  stage4NarrationGuide: z.object({
    durationMinutes: z.number().int(),
    promptsByMoment: z.array(
      z.object({
        moment: z.string(),
        narrationStarter: z.string(),
        exampleFlow: z.string(),
      }),
    ),
  }),
  nativeChunks30: z.array(
    z.object({
      id: z.number().int(),
      chunk: z.string(),
      literalPtTrap: z.string(),
      whenToUse: z.string(),
      example: z.string(),
    }),
  ),
  rapidTest20: z.array(
    z.object({
      id: z.number().int(),
      situationInTarget: z.string(),
      literalPtTrap: z.string(),
      naturalTargetForm: z.string(),
    }),
  ),
});
export type DirectThinkingData = z.infer<typeof directThinkingDataSchema>;

// ============================================================================
// 8. Simulador de Imersão Total
// ============================================================================

export const immersionPlanSchema = z.object({
  routineBlocks: z.array(
    z.object({
      period: z.string(), // Manhã, Deslocamento, Trabalho/Estudo, Intervalos, Exercício, Noite, Fim de semana
      currentHabitReplaced: z.string(),
      inputActivity: z.string(),
      outputActivity: z.string(),
      vocabMicroTask: z.string(),
      minutes: z.number().int(),
    }),
  ),
  immersionProtocol: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      action: z.string(),
      frequency: z.string(),
    }),
  ),
  levels30Days: z.array(
    z.object({
      level: z.number().int().min(1).max(4),
      daysRange: z.string(),
      title: z.string(),
      dailyTargetMinutes: z.number().int(),
      mandatoryDeliverables: z.array(z.string()),
    }),
  ),
  idealImmersionDay: z.object({
    totalMinutes: z.number().int(),
    schedule: z.array(
      z.object({
        time: z.string(),
        block: z.string(),
        activity: z.string(),
        type: z.enum(['input', 'output', 'vocab']),
        durationMinutes: z.number().int(),
      }),
    ),
  }),
});
export type ImmersionPlanData = z.infer<typeof immersionPlanSchema>;

export { SKILLS };
