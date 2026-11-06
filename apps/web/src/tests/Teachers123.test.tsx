import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeacherLayout } from '../components/teacher/TeacherLayout';
import { ArchitectPage } from '../pages/teachers/ArchitectPage';
import { VocabularyPage } from '../pages/teachers/VocabularyPage';
import { ConversationPage } from '../pages/teachers/ConversationPage';

// Mock do módulo de apiFetch para controlar respostas de rede
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
  ApiRequestError: class extends Error {
    status: number;
    code: string;
    constructor(status: number, code: string, message: string) {
      super(message);
      this.status = status;
      this.code = code;
    }
  },
}));

import { apiFetch } from '../lib/api';

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

describe('Testes dos Professores 1, 2 e 3 (Etapa 3a/3b/3c)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiFetch).mockImplementation(async (path: string) => {
      if (path.includes('/sessions/start')) {
        return { session: { id: 'sess-123' } };
      }
      if (path.includes('/api/vocab')) {
        return { items: [] };
      }
      return {};
    });
  });

  // ==========================================================================
  // 1. TeacherLayout Component
  // ==========================================================================
  describe('TeacherLayout', () => {
    it('deve renderizar cabeçalho com nome do professor, métricas ao vivo e botão de finalizar', () => {
      const handleFinish = vi.fn();

      renderWithProviders(
        <TeacherLayout
          teacherId="architect"
          elapsedSec={125}
          speakingSec={60}
          exposureSec={90}
          wordsRecalled={15}
          moduleProgress={{ percentage: 45 }}
          onFinishSession={handleFinish}
          systemPrompt="Diretrizes do Arquiteto..."
          recentErrors={[
            { type: 'Preposição', phrase: 'depend of', correction: 'depend on', count: 2 },
          ]}
        >
          <div data-testid="test-content">Conteúdo central da aula</div>
        </TeacherLayout>
      );

      // Nome do Professor
      expect(screen.getByText('Professor Arquiteto da Fluência')).toBeInTheDocument();
      expect(screen.getByText('Seu plano de 90 dias')).toBeInTheDocument();

      // Badge de conclusão
      expect(screen.getByText('45% concluído')).toBeInTheDocument();

      // Métricas de sessão
      expect(screen.getByText('02:05')).toBeInTheDocument(); // 125 seg = 02:05
      expect(screen.getByText('1.5 min')).toBeInTheDocument(); // 90 seg = 1.5 min
      expect(screen.getByText('1.0 min')).toBeInTheDocument(); // 60 seg = 1.0 min
      expect(screen.getByText('15')).toBeInTheDocument(); // palavras

      // Conteúdo central
      expect(screen.getByTestId('test-content')).toBeInTheDocument();

      // Barra lateral com erros recentes
      expect(screen.getByText('Erros Recorrentes Notados')).toBeInTheDocument();
      expect(screen.getByText('"depend of"')).toBeInTheDocument();
      expect(screen.getByText('"depend on"')).toBeInTheDocument();

      // Botão "Finalizar sessão"
      const finishBtn = screen.getByRole('button', { name: /finalizar sessão/i });
      expect(finishBtn).toBeInTheDocument();

      fireEvent.click(finishBtn);
      expect(handleFinish).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // 2. Tela 1 — ArchitectPage (Plano de 90 Dias)
  // ==========================================================================
  describe('ArchitectPage', () => {
    it('deve exibir todas as 7 seções obrigatórias do plano de 90 dias', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({
        // Retorna plano padrão via mock
        diagnosis: {
          currentStage: 'Transição A2 → B1',
          strengths: ['Boa compreensão básica'],
          bottlenecks: ['Tradução mental'],
          paretoFocus: 'Dominar os 12 blocos funcionais.',
        },
      });

      renderWithProviders(<ArchitectPage />);

      // Aguarda carregar o conteúdo da tela
      await waitFor(() => {
        expect(
          screen.getByText(/seu plano estratégico de 90 dias/i)
        ).toBeInTheDocument();
      });

      // 1. Diagnóstico do ponto de partida
      expect(
        screen.getByRole('heading', { name: /diagnóstico do ponto de partida/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/foco pareto \(80\/20\)/i)).toBeInTheDocument();

      // 2. O que aprender primeiro
      expect(
        screen.getByRole('heading', { name: /o que aprender primeiro/i })
      ).toBeInTheDocument();

      // 3. Plano de 90 dias dividido em 3 fases
      expect(
        screen.getByRole('heading', { name: /plano de 90 dias dividido em 3 fases/i })
      ).toBeInTheDocument();

      // 4. Rotina diária em blocos de tempo
      expect(
        screen.getByRole('heading', { name: /rotina diária em blocos de tempo/i })
      ).toBeInTheDocument();

      // 5. Metas semanais mensuráveis
      expect(
        screen.getByRole('heading', { name: /metas semanais mensuráveis/i })
      ).toBeInTheDocument();

      // 6. Checkpoints de fluência a cada 14 dias
      expect(
        screen.getByRole('heading', { name: /checkpoints de fluência a cada 14 dias/i })
      ).toBeInTheDocument();

      // 7. O que ignorar por enquanto
      expect(
        screen.getByRole('heading', { name: /o que ignorar por enquanto/i })
      ).toBeInTheDocument();
    });

    it('deve permitir marcar e desmarcar checklist de metas semanais', async () => {
      renderWithProviders(<ArchitectPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Realizar o teste de fala de 3 minutos contínuos sem pausar')
        ).toBeInTheDocument();
      });

      const goalItem = screen.getByRole('checkbox', {
        name: /realizar o teste de fala de 3 minutos contínuos sem pausar/i,
      });

      expect(goalItem).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(goalItem);
      expect(goalItem).toHaveAttribute('aria-checked', 'true');
    });
  });

  // ==========================================================================
  // 3. Tela 2 — VocabularyPage (Vocabulário de Alta Frequência)
  // ==========================================================================
  describe('VocabularyPage', () => {
    it('deve renderizar a aba de blocos funcionais com Top 50 selecionado primeiro', async () => {
      renderWithProviders(<VocabularyPage />);

      // Abas de navegação
      expect(screen.getByText(/blocos funcionais & top 50/i)).toBeInTheDocument();
      expect(screen.getByText(/repetição espaçada/i)).toBeInTheDocument();
      expect(screen.getByText(/teste ativo de produção/i)).toBeInTheDocument();

      // Expressão do Top 50 renderizada
      await waitFor(() => {
        expect(screen.getByText('I would like to...')).toBeInTheDocument();
      });

      // Frases e collocations
      expect(screen.getByText(/eu gostaria de\.\.\./i)).toBeInTheDocument();
      expect(screen.getByText(/i would like to schedule a meeting/i)).toBeInTheDocument();
      expect(screen.getAllByText(/collocation:/i).length).toBeGreaterThanOrEqual(1);
    });

    it('deve permitir navegar para o modo SM-2 Flashcards e virar o card', async () => {
      renderWithProviders(<VocabularyPage />);

      // Clica na aba de Repetição Espaçada
      const srsTab = screen.getByRole('button', { name: /repetição espaçada/i });
      fireEvent.click(srsTab);

      // Card virável
      expect(screen.getByText(/fila de revisão sm-2/i)).toBeInTheDocument();
      expect(screen.getByText('Como dizer em inglês?')).toBeInTheDocument();

      const flipButton = screen.getByRole('button', { name: /virar card e ouvir/i });
      fireEvent.click(flipButton);

      // Agora o verso exibe os botões SM-2 de autoavaliação (Esqueci, Difícil, Bom, Fácil)
      expect(screen.getByRole('button', { name: /esqueci/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /difícil/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bom/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fácil/i })).toBeInTheDocument();
    });

    it('deve permitir navegar para o modo de Teste Ativo de Produção', async () => {
      renderWithProviders(<VocabularyPage />);

      const activeTestTab = screen.getByRole('button', { name: /teste ativo de produção/i });
      fireEvent.click(activeTestTab);

      expect(screen.getByText(/produção ativa \(sem olhar\)/i)).toBeInTheDocument();
      expect(screen.getByText(/você está em um café e quer pedir/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /validar minha produção/i })).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 4. Tela 3 — ConversationPage (Conversação Infinita)
  // ==========================================================================
  describe('ConversationPage', () => {
    it('deve renderizar o seletor de papéis de roleplay e a mensagem de saudação inicial', async () => {
      renderWithProviders(<ConversationPage />);

      // Verifica papéis
      expect(screen.getAllByText('Amigo(a) próximo(a)').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Colega de trabalho')).toBeInTheDocument();
      expect(screen.getByText('Chefe / Gestor')).toBeInTheDocument();

      // Saudação inicial
      await waitFor(() => {
        expect(screen.getByText(/so good to catch up with you/i)).toBeInTheDocument();
      });

      // Indicadores ao vivo
      expect(screen.getByText(/80% compreensível/i)).toBeInTheDocument();
      expect(screen.getByText(/0 respostas/i)).toBeInTheDocument();
    });

    it('deve enviar mensagem do aluno e destacar bloco de correções importantes', async () => {
      vi.mocked(apiFetch).mockImplementation(async (path: string) => {
        if (path.includes('/sessions/start')) {
          return { session: { id: 'sess-123' } };
        }
        if (path === '/api/teacher/conversation') {
          return {
            reply: 'That sounds amazing! I love how you explained that.',
            replyTranslationHint: 'Isso soa maravilhoso! Adorei a forma como você explicou isso.',
            difficultyLevel: '80% compreensível',
            importantCorrections: [
              {
                wrong: 'I have 25 years old',
                correct: 'I am 25 years old',
                oneLineExplanation: 'Use o verbo to be para falar sobre idade.',
              },
            ],
          };
        }
        return {};
      });

      renderWithProviders(<ConversationPage />);

      const textarea = screen.getByPlaceholderText(
        /digite sua resposta em inglês ou use o microfone/i
      );
      fireEvent.change(textarea, { target: { value: 'I have 25 years old and I am learning.' } });

      const sendButton = screen.getByTitle('Enviar mensagem');
      fireEvent.click(sendButton);

      // Resposta enviada do aluno
      expect(screen.getByText('I have 25 years old and I am learning.')).toBeInTheDocument();

      // Resposta da IA com correções
      await waitFor(() => {
        expect(screen.getByText('Correções Importantes (Foco em Compreensão)')).toBeInTheDocument();
      });

      expect(screen.getByText('"I have 25 years old"')).toBeInTheDocument();
      expect(screen.getByText('"I am 25 years old"')).toBeInTheDocument();
      expect(screen.getByText('Use o verbo to be para falar sobre idade.')).toBeInTheDocument();
    });
  });
});
