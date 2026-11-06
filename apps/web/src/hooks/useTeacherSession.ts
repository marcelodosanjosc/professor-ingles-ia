import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  teacherById,
  type TeacherId,
  type TeacherMeta,
  type CompleteSessionInput,
  type SessionSummaryData,
  type SessionHistoryItem,
} from '@fluencialab/shared';
import { apiFetch } from '../lib/api';

export interface TeacherInitialData {
  teacher: TeacherMeta;
  systemPrompt: string;
  moduleProgress: {
    percentage: number;
    level?: string;
    completedLessons?: number;
    totalLessons?: number;
  } | null;
  recentSessions: SessionHistoryItem[];
  recentErrors: Array<{
    type: string;
    phrase: string;
    correction: string;
    explanation?: string;
    count?: number;
  }>;
}

export interface UseTeacherSessionReturn {
  // Cronômetros e acumuladores
  elapsedSec: number;
  speakingSec: number;
  exposureSec: number;
  wordsRecalled: number;
  addSpeakingSec: (s: number) => void;
  addExposureSec: (s: number) => void;
  addWordsRecalled: (n: number) => void;

  // Dados do professor
  teacherData: TeacherInitialData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;

  // Sessão atual
  sessionId: string | null;
  finishSession: (extra?: Partial<CompleteSessionInput>) => Promise<SessionSummaryData | void>;
  isFinishing: boolean;

  // Resumo
  isSummaryOpen: boolean;
  summaryData: SessionSummaryData | null;
  closeSummary: () => void;
}

export function useTeacherSession(teacherId: TeacherId): UseTeacherSessionReturn {
  const queryClient = useQueryClient();

  // Cronômetro da sessão e acumuladores de prática
  const [elapsedSec, setElapsedSec] = useState(0);
  const [speakingSec, setSpeakingSec] = useState(0);
  const [exposureSec, setExposureSec] = useState(0);
  const [wordsRecalled, setWordsRecalled] = useState(0);

  // Identificador da sessão ativa
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Resumo da sessão
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);

  // Flag para evitar múltiplos starts automáticos em React 19 / StrictMode
  const hasStartedRef = useRef(false);

  // Timer geral da sessão (1 tick por segundo)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helpers para somar métricas
  const addSpeakingSec = useCallback((s: number) => {
    if (s > 0) setSpeakingSec((prev) => prev + s);
  }, []);

  const addExposureSec = useCallback((s: number) => {
    if (s > 0) setExposureSec((prev) => prev + s);
  }, []);

  const addWordsRecalled = useCallback((n: number) => {
    if (n > 0) setWordsRecalled((prev) => prev + n);
  }, []);

  // Busca dados iniciais do professor
  const teacherQuery = useQuery<TeacherInitialData>({
    queryKey: ['teacher', teacherId],
    queryFn: async () => {
      try {
        const data = await apiFetch<TeacherInitialData>(`/api/teacher/${teacherId}`);
        if (data && typeof data === 'object') return data;
      } catch {
        // Fallback para manter a tela funcional
      }
      return {
        teacher: teacherById(teacherId),
        systemPrompt: '',
        moduleProgress: { percentage: 0 },
        recentSessions: [],
        recentErrors: [],
      };
    },
    staleTime: 60 * 1000,
  });

  // Iniciar sessão
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiFetch<{ session: { id: string } }>('/api/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ teacherId }),
      });
    },
    onSuccess: (data) => {
      if (data?.session?.id) {
        setSessionId(data.session.id);
      }
    },
  });

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startSessionMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  // Finalizar sessão
  const finishSessionMutation = useMutation({
    mutationFn: async (extra?: Partial<CompleteSessionInput>) => {
      let activeSessionId = sessionId;

      // Se ainda não tiver ID iniciado, inicia agora
      if (!activeSessionId) {
        try {
          const started = await apiFetch<{ session: { id: string } }>('/api/sessions/start', {
            method: 'POST',
            body: JSON.stringify({ teacherId }),
          });
          activeSessionId = started.session.id;
          setSessionId(activeSessionId);
        } catch {
          // Usa id fallback se a API não retornar
          activeSessionId = `fallback-${Date.now()}`;
        }
      }

      const payload: CompleteSessionInput = {
        durationSec: Math.max(1, elapsedSec),
        speakingSec,
        exposureSec,
        wordsRecalled,
        progressDelta: extra?.progressDelta ?? 15,
        notes: extra?.notes,
        recurringErrors: extra?.recurringErrors ?? [],
        newWords: extra?.newWords ?? [],
        structuresToPractice: extra?.structuresToPractice ?? [],
        nextChallenge: extra?.nextChallenge ?? 'Continue praticando amanhã para manter sua sequência!',
      };

      const result = await apiFetch<{
        session: SessionHistoryItem;
        summary: SessionSummaryData;
      }>(`/api/sessions/${activeSessionId}/finish`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return result;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] });

      const resolvedSummary: SessionSummaryData = data?.summary ?? {
        title: 'Sessão Finalizada com Sucesso!',
        highlights: [
          `Prática ativa: ${Math.round(elapsedSec / 60)} minutos totais`,
          `Exposição auditiva: ${Math.round(exposureSec / 60)} minutos`,
          `Produção de fala: ${Math.round(speakingSec / 60)} minutos`,
          `Vocabulário ativado: ${wordsRecalled} palavras recuperadas`,
        ],
        recurringErrors: [],
        newWords: [],
        structuresToPractice: [],
        nextChallenge: 'Mantenha a constância diária!',
        skillDeltas: {
          listening: Math.max(1, Math.round(exposureSec / 60)),
          speaking: Math.max(1, Math.round(speakingSec / 60)),
          vocabulary: Math.max(1, wordsRecalled),
        },
      };

      setSummaryData(resolvedSummary);
      setIsSummaryOpen(true);
    },
    onError: () => {
      // Cria resumo local amigável caso a rede falhe
      const fallbackSummary: SessionSummaryData = {
        title: 'Sessão Concluída!',
        highlights: [
          `Duração: ${Math.round(elapsedSec / 60)} minutos`,
          `Exposição ao idioma: ${exposureSec}s`,
          `Fala ativa: ${speakingSec}s`,
          `Palavras recuperadas: ${wordsRecalled}`,
        ],
        recurringErrors: [],
        newWords: [],
        structuresToPractice: [],
        nextChallenge: 'Continue o treino diário!',
        skillDeltas: {
          speaking: Math.max(1, Math.round(speakingSec / 60)),
          vocabulary: Math.max(1, wordsRecalled),
        },
      };
      setSummaryData(fallbackSummary);
      setIsSummaryOpen(true);
    },
  });

  const finishSession = useCallback(
    async (extra?: Partial<CompleteSessionInput>) => {
      const res = await finishSessionMutation.mutateAsync(extra);
      return res?.summary;
    },
    [finishSessionMutation]
  );

  const closeSummary = useCallback(() => {
    setIsSummaryOpen(false);
  }, []);

  return {
    elapsedSec,
    speakingSec,
    exposureSec,
    wordsRecalled,
    addSpeakingSec,
    addExposureSec,
    addWordsRecalled,

    teacherData: teacherQuery.data,
    isLoading: teacherQuery.isLoading,
    isError: teacherQuery.isError,
    error: teacherQuery.error,
    refetch: () => void teacherQuery.refetch(),

    sessionId,
    finishSession,
    isFinishing: finishSessionMutation.isPending,

    isSummaryOpen,
    summaryData,
    closeSummary,
  };
}
