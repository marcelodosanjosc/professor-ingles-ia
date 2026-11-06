import { z } from 'zod';

export const LEVELS = ['zero', 'A1', 'A2', 'B1', 'other'] as const;
export const GOALS = ['conversation', 'travel', 'work', 'live_abroad', 'exam', 'other'] as const;
export const DIFFICULTIES = ['listening', 'speaking', 'grammar', 'vocabulary', 'pronunciation'] as const;
export const ROUTINES = ['work', 'study', 'home', 'other'] as const;

export const LEVEL_LABELS: Record<(typeof LEVELS)[number], string> = {
  zero: 'Zero', A1: 'A1', A2: 'A2', B1: 'B1', other: 'Outro',
};
export const GOAL_LABELS: Record<(typeof GOALS)[number], string> = {
  conversation: 'Conversar', travel: 'Viajar', work: 'Trabalhar',
  live_abroad: 'Morar fora', exam: 'Prova', other: 'Outro',
};
export const DIFFICULTY_LABELS: Record<(typeof DIFFICULTIES)[number], string> = {
  listening: 'Escuta', speaking: 'Fala', grammar: 'Gramática',
  vocabulary: 'Vocabulário', pronunciation: 'Pronúncia',
};
export const ROUTINE_LABELS: Record<(typeof ROUTINES)[number], string> = {
  work: 'Trabalho', study: 'Estudo', home: 'Casa', other: 'Outro',
};

const shortText = z.string().trim().max(120);
const longText = z.string().trim().max(500);

export const profileSchema = z.object({
  targetLanguage: shortText.min(2, 'Informe o idioma'),
  nativeLanguage: shortText.min(2, 'Informe o idioma nativo'),
  level: z.enum(LEVELS),
  levelOther: shortText.optional(),
  goal: z.enum(GOALS),
  goalOther: shortText.optional(),
  minutesPerDay: z.number().int().min(5).max(480),
  deadlineMonths: z.number().int().min(1).max(36),
  otherLanguages: z.array(shortText).max(10).default([]),
  mainDifficulty: z.enum(DIFFICULTIES),
  interests: z.array(shortText).max(20).default([]),
  routine: z.enum(ROUTINES),
  routineOther: shortText.optional(),
  hardSounds: longText.optional(),
  blockSituations: longText.optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Variáveis substituídas nos system prompts dos professores.
 * Ex.: "[IDIOMA]" → profile.targetLanguage
 */
export const PROMPT_VARIABLES = [
  'IDIOMA', 'IDIOMA_NATIVO', 'NÍVEL', 'OBJETIVO', 'MINUTOS', 'PRAZO',
  'IDIOMAS_QUE_FALA', 'DIFICULDADE', 'INTERESSES', 'ROTINA',
  'SONS_DIFÍCEIS', 'SITUAÇÕES_TRAVA',
] as const;
export type PromptVariable = (typeof PROMPT_VARIABLES)[number];

export function profileToPromptVars(p: ProfileInput): Record<PromptVariable, string> {
  const or = (v: string | undefined, fallback = 'não informado') => (v && v.trim()) || fallback;
  return {
    IDIOMA: p.targetLanguage,
    IDIOMA_NATIVO: p.nativeLanguage,
    'NÍVEL': p.level === 'other' ? or(p.levelOther, 'Outro') : LEVEL_LABELS[p.level],
    OBJETIVO: p.goal === 'other' ? or(p.goalOther, 'Outro') : GOAL_LABELS[p.goal],
    MINUTOS: String(p.minutesPerDay),
    PRAZO: String(p.deadlineMonths),
    IDIOMAS_QUE_FALA: p.otherLanguages.length ? p.otherLanguages.join(', ') : 'nenhum além do nativo',
    DIFICULDADE: DIFFICULTY_LABELS[p.mainDifficulty],
    INTERESSES: p.interests.length ? p.interests.join(', ') : 'não informado',
    ROTINA: p.routine === 'other' ? or(p.routineOther, 'Outro') : ROUTINE_LABELS[p.routine],
    'SONS_DIFÍCEIS': or(p.hardSounds),
    'SITUAÇÕES_TRAVA': or(p.blockSituations),
  };
}
