import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import type { DashboardData } from '@fluencialab/shared';
import { Dashboard } from '../pages/Dashboard';

const mockUpdateWeeklyGoal = vi.fn();
const mockRefetch = vi.fn();

const mockDashboardData: DashboardData = {
  header: {
    name: 'Carlos Santos',
    targetLanguage: 'Inglês',
    level: 'A2',
    streakDays: 14,
    dailyGoalMinutes: 30,
    todayMinutes: 20,
  },
  kpis: {
    exposureMinutesToday: 20,
    exposureMinutesWeek: 150,
    speakingMinutesWeek: 45,
    wordsRecalled: 320,
    conversationsCompleted: 12,
    pronunciationMastered: 85,
    planDay: 23,
    planPhase: 'Fase 1: Fundação',
  },
  dailyMinutes: [
    { date: '2026-11-01', minutes: 25 },
    { date: '2026-11-02', minutes: 30 },
  ],
  weeklyByTeacher: [
    { teacherId: 'architect', minutes: 30 },
    { teacherId: 'conversation', minutes: 45 },
  ],
  skills: [
    { skill: 'listening', score: 65 },
    { skill: 'speaking', score: 50 },
    { skill: 'vocabulary', score: 70 },
    { skill: 'grammar', score: 60 },
    { skill: 'pronunciation', score: 55 },
    { skill: 'directThinking', score: 40 },
  ],
  plan: {
    hasPlan: true,
    day: 23,
    checkpoints: [
      { day: 14, title: 'Check 1: Destravamento Inicial', done: true },
      { day: 28, title: 'Check 2: 100 Primeiras Palavras', done: false },
    ],
  },
  heatmap: [
    { date: '2026-11-01', minutes: 25 },
    { date: '2026-11-02', minutes: 30 },
  ],
  weeklyGoals: [
    {
      id: 'g1',
      title: 'Fazer 15 min de prática de fala contínua',
      done: false,
      kind: 'speaking_test',
    },
    {
      id: 'g2',
      title: 'Compreender áudio sem pausar',
      done: true,
      kind: 'comprehension_test',
    },
    {
      id: 'g3',
      title: 'Revisar 20 novas palavras de alta frequência',
      done: false,
      kind: 'other',
    },
  ],
  nextAction: {
    teacherId: 'speaking',
    reason: 'Você precisa praticar respostas rápidas em menos de 5 segundos.',
  },
  achievements: [
    { code: 'first_streak_14', title: 'Sequência Imbatível de 14 Dias', unlockedAt: '2026-11-03' },
  ],
  recurringErrors: [
    { type: 'Preposição', phrase: 'depend of', correction: 'depend on', count: 3 },
  ],
  moduleProgress: [
    { teacherId: 'architect', percent: 60 },
    { teacherId: 'speaking', percent: 25 },
  ],
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Carlos Santos', email: 'carlos@test.com', hasProfile: true },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

vi.mock('../hooks/useDashboard', () => ({
  useDashboard: () => ({
    data: mockDashboardData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
    updateWeeklyGoal: mockUpdateWeeklyGoal,
    isUpdatingGoal: false,
  }),
}));

describe('Dashboard Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o cabeçalho com saudação, idioma, nível, streak e meta diária', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Saudação e nome
    expect(screen.getByText(/olá, carlos santos!/i)).toBeInTheDocument();

    // Idioma e nível
    expect(screen.getByText(/inglês • nível a2/i)).toBeInTheDocument();

    // Streak de dias
    expect(screen.getByText(/14 dias de sequência/i)).toBeInTheDocument();

    // Meta diária de minutos
    expect(screen.getByText(/20 \/ 30 min/i)).toBeInTheDocument();
  });

  it('deve renderizar os 6 cards de resumo (KPIs) com os valores esperados', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // 1. Minutos de exposição
    expect(screen.getByText('20 min')).toBeInTheDocument();
    expect(screen.getByText('150 min na semana')).toBeInTheDocument();

    // 2. Produção de fala
    expect(screen.getByText('45 min')).toBeInTheDocument();

    // 3. Vocabulário ativo (palavras)
    expect(screen.getByText('320')).toBeInTheDocument();

    // 4. Conversações concluídas
    expect(screen.getByText('12')).toBeInTheDocument();

    // 5. Frases de pronúncia dominadas
    expect(screen.getByText('85')).toBeInTheDocument();

    // 6. Dia do plano de 90 dias
    expect(screen.getByText('Dia 23/90')).toBeInTheDocument();
    expect(screen.getAllByText('Fase 1: Fundação').length).toBeGreaterThanOrEqual(1);
  });

  it('deve renderizar a barra de progresso do plano de 90 dias e os checkpoints', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/dia 23 de 90/i)).toBeInTheDocument();
    expect(screen.getByText('Check 1: Destravamento Inicial')).toBeInTheDocument();
    expect(screen.getByText('Check 2: 100 Primeiras Palavras')).toBeInTheDocument();
  });

  it('deve renderizar o card de próxima ação recomendada com motivo e botão de ação', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Título e razão
    expect(screen.getByText('Destruidor de Bloqueio na Fala')).toBeInTheDocument();
    expect(
      screen.getByText(/você precisa praticar respostas rápidas em menos de 5 segundos/i)
    ).toBeInTheDocument();

    // Botão de navegação direta para o professor de fala
    const actionButton = screen.getByRole('button', { name: /praticar com fala rápida/i });
    expect(actionButton).toBeInTheDocument();
  });

  it('deve renderizar as metas da semana destacando testes obrigatórios de fala e compreensão', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Título da seção
    expect(screen.getByText('Metas da Semana')).toBeInTheDocument();

    // Itens e badges obrigatórios
    expect(screen.getByText('Fazer 15 min de prática de fala contínua')).toBeInTheDocument();
    expect(screen.getByText(/teste de fala \(obrigatório\)/i)).toBeInTheDocument();

    expect(screen.getByText('Compreender áudio sem pausar')).toBeInTheDocument();
    expect(screen.getByText(/teste de compreensão \(obrigatório\)/i)).toBeInTheDocument();
  });

  it('deve permitir marcar ou desmarcar uma meta semanal', async () => {
    mockUpdateWeeklyGoal.mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const goalCheckbox = screen.getByRole('checkbox', {
      name: /fazer 15 min de prática de fala contínua/i,
    });
    expect(goalCheckbox).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(goalCheckbox);

    await waitFor(() => {
      expect(mockUpdateWeeklyGoal).toHaveBeenCalledWith('g1', true);
    });
  });

  it('deve renderizar a lista de erros recorrentes com frase riscada e correção', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Erros Recorrentes')).toBeInTheDocument();
    expect(screen.getByText('Preposição')).toBeInTheDocument();
    expect(screen.getByText('"depend of"')).toBeInTheDocument();
    expect(screen.getByText('"depend on"')).toBeInTheDocument();
    expect(screen.getByText('3x ocorrências')).toBeInTheDocument();
  });
});
