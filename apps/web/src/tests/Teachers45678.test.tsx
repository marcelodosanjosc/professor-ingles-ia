import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ListeningPage } from '../pages/teachers/ListeningPage';
import { SpeakingPage } from '../pages/teachers/SpeakingPage';
import { PronunciationPage } from '../pages/teachers/PronunciationPage';
import { DirectThinkingPage } from '../pages/teachers/DirectThinkingPage';
import { ImmersionPage } from '../pages/teachers/ImmersionPage';

// Mocks globais de APIs de áudio / browser para jsdom
class MockSpeechSynthesisUtterance {
  text = '';
  lang = '';
  rate = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text = '') {
    this.text = text;
  }
}

// Configura mocks no ambiente de teste
if (typeof window !== 'undefined') {
  globalThis.SpeechSynthesisUtterance =
    MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;

  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    },
    writable: true,
  });

  if (typeof navigator !== 'undefined') {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      writable: true,
    });
  }

  class MockMediaRecorder {
    state = 'inactive';
    onstop: (() => void) | null = null;
    start() {
      this.state = 'recording';
    }
    stop() {
      this.state = 'inactive';
      this.onstop?.();
    }
  }
  globalThis.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

  URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
  URL.revokeObjectURL = vi.fn();
}

// Mock da apiFetch
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn().mockImplementation((path: string, options?: RequestInit) => {
    // Rotas de sessões
    if (path.includes('/api/sessions/start')) {
      return Promise.resolve({ session: { id: 'test-session-123' } });
    }
    if (path.includes('/api/sessions/') && path.includes('/finish')) {
      return Promise.resolve({
        session: { id: 'test-session-123', durationSec: 120 },
        summary: {
          title: 'Sessão Teste Finalizada',
          highlights: ['Prática excelente'],
          recurringErrors: [],
          newWords: [],
          structuresToPractice: [],
          nextChallenge: 'Continuar amanhã',
          skillDeltas: { listening: 5 },
        },
      });
    }

    // Rotas iniciais de dados do professor
    if (path.startsWith('/api/teacher/')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      if (body.action === 'check_dictation') {
        return Promise.resolve({ score: 90 });
      }
      if (body.action === 'evaluate_response') {
        return Promise.resolve({ ok: true });
      }
      if (body.action === 'evaluate_test') {
        return Promise.resolve({
          aiScore: 88,
          phoneticFeedback: 'Excelente articulação do som-alvo.',
        });
      }
      if (body.action === 'check_translation_trap') {
        return Promise.resolve({
          isTrap: true,
          ptTrap: body.payload?.text,
          naturalForm: 'Forma natural em inglês',
          explanation: 'Explicação detalhada da armadilha de tradução.',
        });
      }
      if (body.action === 'save_diary') {
        return Promise.resolve({
          polishedVersion: 'Polished journal entry here.',
          correctionPoints: ['Fluxo muito bom'],
          suggestedExpressions: ['Call it a day'],
        });
      }
      return Promise.resolve({
        teacher: {
          id: 'listening',
          name: 'Treinador de Ouvido',
          shortName: 'Ouvido',
          slug: 'ouvido',
          icon: 'Ear',
          color: 'amber',
          tagline: 'Entenda a fala rápida',
        },
        moduleProgress: { percentage: 25 },
        recentSessions: [],
        recentErrors: [],
      });
    }

    return Promise.resolve({});
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Testes dos Professores 4, 5, 6, 7 e 8', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // PROFESSOR 4: LISTENING (TREINADOR DE OUVIDO)
  // =========================================================================
  describe('Professor 4 — ListeningPage (Treinador de Ouvido)', () => {
    it('deve renderizar o título, os 5 níveis progressivos e o seletor de mídia', () => {
      renderWithProviders(<ListeningPage />);

      expect(
        screen.getAllByText(/Treinador de Ouvido/i)[0]
      ).toBeInTheDocument();
      expect(screen.getByText(/5 Níveis Progressivos/i)).toBeInTheDocument();
      expect(screen.getByText(/Nível 1 de 5/i)).toBeInTheDocument();
      expect(screen.getByText(/Passo 1: Escuta Ativa/i)).toBeInTheDocument();
    });

    it('deve permitir ouvir a frase em velocidade natural e nativo rápido', () => {
      renderWithProviders(<ListeningPage />);

      const btnNatural = screen.getByRole('button', { name: /Ouvir em 1.0x \(Natural\)/i });
      const btnFast = screen.getByRole('button', { name: /Ouvir em 1.15x \(Nativo Rápido\)/i });

      expect(btnNatural).toBeInTheDocument();
      expect(btnFast).toBeInTheDocument();

      fireEvent.click(btnNatural);
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('deve permitir ditar ou digitar texto e verificar com cálculo de acerto e reduções', async () => {
      renderWithProviders(<ListeningPage />);

      const textarea = screen.getByPlaceholderText(/I'm gonna grab a cup of coffee.../i);
      fireEvent.change(textarea, { target: { value: "I'm gonna grab coffee" } });

      const btnCheck = screen.getByRole('button', { name: /Verificar e Revelar/i });
      fireEvent.click(btnCheck);

      await waitFor(() => {
        expect(screen.getByText(/Frase Original Revelada/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Por que você não entendeu de primeira\?/i)).toBeInTheDocument();
      expect(screen.getAllByText(/going to/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/cup of/i)[0]).toBeInTheDocument();
    });

    it('deve renderizar o laboratório de shadowing com as frases e controle de velocidade', () => {
      renderWithProviders(<ListeningPage />);

      expect(screen.getByText(/Laboratório de Shadowing em 3 Velocidades/i)).toBeInTheDocument();
      expect(screen.getByText(/10 Frases de Treino/i)).toBeInTheDocument();
      expect(screen.getByText(/"I don't know what you're talking about."/i)).toBeInTheDocument();
    });

    it('deve permitir marcar passos da rotina diária de 15 minutos', () => {
      renderWithProviders(<ListeningPage />);

      expect(screen.getByText(/Protocolo Diário de 15 Minutos de Ouvido/i)).toBeInTheDocument();
      const step1 = screen.getByText(/Bloco 1: Aquecimento com Áudio Puro/i);
      expect(step1).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      const checkbox = checkboxes[0]!;
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  // =========================================================================
  // PROFESSOR 5: SPEAKING (DESTRUIDOR DE BLOQUEIO NA FALA)
  // =========================================================================
  describe('Professor 5 — SpeakingPage (Destruidor de Bloqueio)', () => {
    it('deve renderizar o título, abas e o cronômetro regressivo de 5 segundos', () => {
      renderWithProviders(<SpeakingPage />);

      expect(screen.getAllByText(/Destruidor de Bloqueio na Fala/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Limite: 5 Segundos/i)).toBeInTheDocument();
      expect(screen.getByText(/1\. Resposta Rápida \(5s\)/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. 10 Padrões-Chave/i)).toBeInTheDocument();
    });

    it('deve disparar o desafio de 5 segundos ao clicar no botão de início', () => {
      renderWithProviders(<SpeakingPage />);

      const btnStart = screen.getByRole('button', { name: /Iniciar Desafio de 5 Segundos/i });
      fireEvent.click(btnStart);

      expect(screen.getByText(/Tempo de Reação:/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Fale no microfone ou digite imediatamente\.\.\./i)
      ).toBeInTheDocument();
    });

    it('deve navegar para a aba de 10 Padrões-Chave e exibir exemplos', () => {
      renderWithProviders(<SpeakingPage />);

      const tabPatterns = screen.getByRole('button', { name: /2\. 10 Padrões-Chave/i });
      fireEvent.click(tabPatterns);

      expect(screen.getByText(/Os 10 Gatilhos Essenciais da Fluência Reflexa/i)).toBeInTheDocument();
      expect(screen.getByText('Eu quero...')).toBeInTheDocument();
      expect(screen.getByText('Eu preciso...')).toBeInTheDocument();
      expect(screen.getByText('Depende de...')).toBeInTheDocument();
    });

    it('deve navegar para a aba de Substituição e exibir estruturas', () => {
      renderWithProviders(<SpeakingPage />);

      const tabSubst = screen.getByRole('button', { name: /3\. Substituição/i });
      fireEvent.click(tabSubst);

      expect(screen.getByText(/Brocas de Substituição \(Substitution Drills\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Estrutura Base/i)).toBeInTheDocument();
    });

    it('deve navegar para a aba de Teste Inesperado e exibir pergunta surpresa', () => {
      renderWithProviders(<SpeakingPage />);

      const tabTest = screen.getByRole('button', { name: /4\. Teste Inesperado/i });
      fireEvent.click(tabTest);

      expect(screen.getByText(/Teste de Perguntas Inesperadas/i)).toBeInTheDocument();
      expect(screen.getByText(/Gatilho rápido para começar a falar:/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // PROFESSOR 6: PRONUNCIATION (CORRETOR DE PRONÚNCIA)
  // =========================================================================
  describe('Professor 6 — PronunciationPage (Corretor de Pronúncia)', () => {
    it('deve renderizar a lista dos 10 erros fonéticos destacando os de maior impacto', () => {
      renderWithProviders(<PronunciationPage />);

      expect(screen.getAllByText(/Corretor de Pronúncia/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Mapeamento de Sons do Português para o Inglês/i)).toBeInTheDocument();
      expect(screen.getByText(/Som TH desvozeado \/θ\/ vs vozeado \/ð\//i)).toBeInTheDocument();
      expect(screen.getByText(/Terminação regular -ED no passado/i)).toBeInTheDocument();

      const impactBadges = screen.getAllByText(/Maior Impacto na Compreensão/i);
      expect(impactBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('deve renderizar palavras de treino clicáveis e pares mínimos', () => {
      renderWithProviders(<PronunciationPage />);

      const wordButtons = screen.getAllByRole('button', { name: /think/i });
      expect(wordButtons.length).toBeGreaterThan(0);
      fireEvent.click(wordButtons[0]!);
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('deve navegar para a aba de Rotina 10m & Player Lado a Lado', () => {
      renderWithProviders(<PronunciationPage />);

      const tabRoutine = screen.getByRole('button', { name: /2\. Rotina 10m & Player Lado a Lado/i });
      fireEvent.click(tabRoutine);

      expect(screen.getByText(/Espelho Fonético: Gravação Comparativa Lado a Lado/i)).toBeInTheDocument();
      expect(screen.getByText(/Faixa 1: Modelo Nativo/i)).toBeInTheDocument();
      expect(screen.getByText(/Faixa 2: Sua Gravação/i)).toBeInTheDocument();
    });

    it('deve navegar para o Teste Semanal de Pronúncia com slider de autoavaliação', async () => {
      renderWithProviders(<PronunciationPage />);

      const tabTest = screen.getByRole('button', { name: /3\. Teste Semanal \(15 Frases\)/i });
      fireEvent.click(tabTest);

      expect(screen.getByText(/Teste Semanal de Articulação/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/2\. Sua Autoavaliação/i)).toBeInTheDocument();

      const btnEvaluate = screen.getByRole('button', { name: /Enviar para Avaliação da IA/i });
      fireEvent.click(btnEvaluate);

      await waitFor(() => {
        expect(screen.getByText(/Resultado do Teste Fonético/i)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // PROFESSOR 7: DIRECT THINKING (PENSAMENTO DIRETO)
  // =========================================================================
  describe('Professor 7 — DirectThinkingPage (Pensamento Direto)', () => {
    it('deve renderizar a Etapa 1 com objetos sem português e suporte a dicas contextuais em inglês', () => {
      renderWithProviders(<DirectThinkingPage />);

      expect(screen.getAllByText(/Tradutor que Impede de Traduzir/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Etapa 1: Nomeação Direta por Contexto em Inglês/i)).toBeInTheDocument();
      expect(screen.getByText(/Context Hint \(In Target Language\):/i)).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/Type in English\.\.\./i);
      fireEvent.change(input, { target: { value: 'coffee' } });

      const btnCheck = screen.getByRole('button', { name: /Verificar/i });
      fireEvent.click(btnCheck);

      expect(screen.getByText(/Exato! Neuroassociação direta/i)).toBeInTheDocument();
    });

    it('deve navegar para a aba de Narração Interna com cronômetro de 10 minutos', () => {
      renderWithProviders(<DirectThinkingPage />);

      const tabNarration = screen.getByRole('button', { name: /2\. Narração Interna \(10m\)/i });
      fireEvent.click(tabNarration);

      expect(screen.getByText(/Protocolo de Narração Interna de 10 Minutos/i)).toBeInTheDocument();
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Iniciar 10 min/i })).toBeInTheDocument();
    });

    it('deve detectar armadilhas no Detector de Estrutura Traduzida', async () => {
      renderWithProviders(<DirectThinkingPage />);

      const tabDetector = screen.getByRole('button', { name: /3\. Detector de Armadilhas/i });
      fireEvent.click(tabDetector);

      expect(screen.getByText(/Detector de Estrutura Traduzida do Português/i)).toBeInTheDocument();

      const sampleBtn = screen.getByRole('button', { name: /I have 25 years/i });
      fireEvent.click(sampleBtn);

      await waitFor(() => {
        expect(screen.getByText(/Forma Traduzida \(Mentalidade PT\):/i)).toBeInTheDocument();
        expect(screen.getByText(/Forma Natural Nativa \(Inglês Puro\):/i)).toBeInTheDocument();
      });
    });

    it('deve renderizar a lista dos 30 Chunks Nativos', () => {
      renderWithProviders(<DirectThinkingPage />);

      const tabChunks = screen.getByRole('button', { name: /4\. 30 Chunks Nativos/i });
      fireEvent.click(tabChunks);

      expect(screen.getByText(/Os 30 Blocos de Fala Nativa \(Chunks\)/i)).toBeInTheDocument();
      expect(screen.getByText(/"I'm looking forward to..."/i)).toBeInTheDocument();
      expect(screen.getByText(/"It's up to you."/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // PROFESSOR 8: IMMERSION (SIMULADOR DE IMERSÃO TOTAL)
  // =========================================================================
  describe('Professor 8 — ImmersionPage (Simulador de Imersão)', () => {
    it('deve renderizar os 7 blocos de rotina diária com input, output e microtarefa', () => {
      renderWithProviders(<ImmersionPage />);

      expect(screen.getAllByText(/Simulador de Imersão Total/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Os 7 Blocos de Substituição de Hábito/i)).toBeInTheDocument();
      expect(screen.getByText('Manhã')).toBeInTheDocument();
      expect(screen.getByText('Deslocamento')).toBeInTheDocument();
      expect(screen.getByText('Trabalho / Estudo')).toBeInTheDocument();
    });

    it('deve permitir marcar checkboxes de atividades e somar minutos na sessão', () => {
      renderWithProviders(<ImmersionPage />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      const firstBox = checkboxes[0]!;
      fireEvent.click(firstBox);
      expect(firstBox).toBeChecked();
    });

    it('deve navegar para a aba de Gravador 2m & Diário de 5 Linhas', async () => {
      renderWithProviders(<ImmersionPage />);

      const tabProtocol = screen.getByRole('button', { name: /2\. Gravador 2m & Diário/i });
      fireEvent.click(tabProtocol);

      expect(screen.getByText(/Áudio Diário de 2 Minutos \(Monólogo Noturno\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Diário de 5 Linhas \(5-Line Daily Journal\)/i)).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/Today started a bit earlier than usual/i);
      fireEvent.change(textarea, { target: { value: 'Today was productive.\nI had two meetings.' } });

      const btnSave = screen.getByRole('button', { name: /Salvar e Corrigir pela IA/i });
      fireEvent.click(btnSave);

      await waitFor(() => {
        expect(screen.getByText(/Versão Polida Nativa/i)).toBeInTheDocument();
      });
    });

    it('deve renderizar a progressão de Níveis de 30 Dias e a Timeline do Dia Ideal', () => {
      renderWithProviders(<ImmersionPage />);

      const tabLevels = screen.getByRole('button', { name: /3\. Níveis de 30 Dias/i });
      fireEvent.click(tabLevels);
      expect(screen.getByText(/Plano de Imersão em 4 Ciclos de 30 Dias/i)).toBeInTheDocument();
      expect(screen.getByText(/Dias 1 a 30/i)).toBeInTheDocument();

      const tabSchedule = screen.getByRole('button', { name: /4\. Dia Ideal \(Timeline\)/i });
      fireEvent.click(tabSchedule);
      expect(screen.getByText(/Timeline do Dia Ideal de Imersão Total/i)).toBeInTheDocument();
      expect(screen.getByText('07:00 - 07:15')).toBeInTheDocument();
    });
  });
});
