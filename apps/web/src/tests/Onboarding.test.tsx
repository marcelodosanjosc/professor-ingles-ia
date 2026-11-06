import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Onboarding } from '../pages/Onboarding';

const mockNavigate = vi.fn();
const mockSaveProfile = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Maria Silva', email: 'maria@test.com', hasProfile: false },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

vi.mock('../hooks/useProfile', () => ({
  useProfile: () => ({
    profile: null,
    isLoading: false,
    error: null,
    saveProfile: mockSaveProfile,
    isSaving: false,
  }),
}));

describe('Onboarding Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o passo 1 do wizard com campos de idioma, nível e objetivo', () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    // Cabeçalho e título do passo
    expect(screen.getByText(/personalize sua jornada/i)).toBeInTheDocument();
    expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();

    // Inputs e seleções
    expect(screen.getByLabelText(/idioma alvo/i)).toHaveValue('Inglês');
    expect(screen.getByLabelText(/seu idioma nativo/i)).toHaveValue('Português');
    expect(screen.getByRole('radio', { name: 'A1' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Conversar' })).toBeInTheDocument();

    // Botão de avançar
    expect(screen.getByRole('button', { name: /avançar/i })).toBeInTheDocument();
  });

  it('deve validar campos do passo 1 e não permitir avançar se idioma estiver inválido', async () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    const targetLangInput = screen.getByLabelText(/idioma alvo/i);
    fireEvent.change(targetLangInput, { target: { value: ' ' } });

    const nextButton = screen.getByRole('button', { name: /avançar/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/informe o idioma que quer aprender/i)).toBeInTheDocument();
    });

    // Garante que não avançou para o passo 2
    expect(screen.queryByText(/passo 2 de 3/i)).not.toBeInTheDocument();
  });

  it('deve navegar pelos 3 passos do wizard e submeter o formulário com sucesso', async () => {
    mockSaveProfile.mockResolvedValueOnce({
      targetLanguage: 'Inglês',
      nativeLanguage: 'Português',
    });

    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    // Passo 1 -> Clica em Avançar
    const nextBtn1 = screen.getByRole('button', { name: /avançar/i });
    fireEvent.click(nextBtn1);

    // Passo 2: Dedicação e Dificuldades
    await waitFor(() => {
      expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
      expect(screen.getByText(/sua dedicação e metas/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/tempo disponível por dia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prazo desejado/i)).toBeInTheDocument();

    const nextBtn2 = screen.getByRole('button', { name: /avançar/i });
    fireEvent.click(nextBtn2);

    // Passo 3: Rotina e Interesses
    await waitFor(() => {
      expect(screen.getByText(/passo 3 de 3/i)).toBeInTheDocument();
      expect(screen.getByText(/rotina e interesses pessoais/i)).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /concluir e ir ao dashboard/i });
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSaveProfile).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('deve exibir o preview em tempo real das variáveis injetadas nos prompts dos professores', async () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    const togglePreviewBtn = screen.getByRole('button', {
      name: /preview: como suas respostas alimentarão os 8 professores ia/i,
    });
    expect(togglePreviewBtn).toBeInTheDocument();

    fireEvent.click(togglePreviewBtn);

    await waitFor(() => {
      expect(screen.getByText(/injeção dinâmica de variáveis de contexto/i)).toBeInTheDocument();
      expect(screen.getByText(/\[IDIOMA\]:/i)).toBeInTheDocument();
      expect(screen.getByText(/\[NÍVEL\]:/i)).toBeInTheDocument();
      expect(screen.getByText(/\[OBJETIVO\]:/i)).toBeInTheDocument();
    });
  });
});
