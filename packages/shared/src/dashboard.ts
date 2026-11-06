import { z } from 'zod';
import type { TeacherId } from './teachers.js';

export const SKILLS = ['listening', 'speaking', 'vocabulary', 'grammar', 'pronunciation', 'directThinking'] as const;
export type Skill = (typeof SKILLS)[number];
export const SKILL_LABELS: Record<Skill, string> = {
  listening: 'Escuta', speaking: 'Fala', vocabulary: 'Vocabulário',
  grammar: 'Gramática', pronunciation: 'Pronúncia', directThinking: 'Pensamento direto',
};

/** Contrato de resposta de GET /api/dashboard. Usado pelo mock (etapa 2) e pelo real (etapa 4). */
export interface DashboardData {
  header: {
    name: string;
    targetLanguage: string;
    level: string;
    streakDays: number;
    dailyGoalMinutes: number;
    todayMinutes: number;
  };
  kpis: {
    exposureMinutesToday: number;
    exposureMinutesWeek: number;
    speakingMinutesWeek: number;
    wordsRecalled: number;
    conversationsCompleted: number;
    pronunciationMastered: number;
    planDay: number; // 1..90
    planPhase: string | null;
  };
  dailyMinutes: { date: string; minutes: number }[]; // últimos 30 dias, ISO yyyy-mm-dd
  weeklyByTeacher: { teacherId: TeacherId; minutes: number }[];
  skills: { skill: Skill; score: number }[]; // 0..100
  plan: {
    hasPlan: boolean;
    day: number;
    checkpoints: { day: number; title: string; done: boolean }[];
  };
  heatmap: { date: string; minutes: number }[]; // últimos ~180 dias
  weeklyGoals: { id: string; title: string; done: boolean; kind: 'speaking_test' | 'comprehension_test' | 'other' }[];
  nextAction: { teacherId: TeacherId; reason: string };
  achievements: { code: string; title: string; unlockedAt: string }[];
  recurringErrors: { type: string; phrase: string; correction: string; count: number }[];
  moduleProgress: { teacherId: TeacherId; percent: number }[];
}

export const finishSessionSchema = z.object({
  durationSec: z.number().int().min(0).max(6 * 3600),
  speakingSec: z.number().int().min(0).max(6 * 3600).default(0),
  exposureSec: z.number().int().min(0).max(6 * 3600).default(0),
  wordsRecalled: z.number().int().min(0).max(5000).default(0),
});
export type FinishSessionInput = z.infer<typeof finishSessionSchema>;
