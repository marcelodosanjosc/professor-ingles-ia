import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Register } from '../pages/auth/Register';

const mockRegister = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: vi.fn(),
    register: mockRegister,
    logout: vi.fn(),
    refetchMe: vi.fn(),
    error: null,
  }),
}));

function getPasswordInput() {
  return screen.getByPlaceholderText('Mínimo 8 caracteres');
}

function getConfirmPasswordInput() {
  return screen.getByPlaceholderText('Repita a senha');
}

function fillValidBaseFields() {
  fireEvent.change(screen.getByLabelText(/seu nome completo/i), {
    target: { value: 'Maria Silva' },
  });
  fireEvent.change(screen.getByLabelText(/e-mail/i), {
    target: { value: 'maria@exemplo.com' },
  });
}

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário com confirmação de senha e toggles', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/seu nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(getConfirmPasswordInput()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /mostrar confirmação de senha/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /criar minha conta/i })
    ).toBeInTheDocument();
  });

  it('deve exibir erro em tempo real e desabilitar o botão quando as senhas não coincidem', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /criar minha conta/i });

    fireEvent.change(getPasswordInput(), { target: { value: 'senhaSegura123' } });
    fireEvent.change(getConfirmPasswordInput(), { target: { value: 'senhaDiferente' } });

    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('deve habilitar o botão e limpar o erro quando as senhas passam a coincidir', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /criar minha conta/i });

    fireEvent.change(getPasswordInput(), { target: { value: 'senhaSegura123' } });
    fireEvent.change(getConfirmPasswordInput(), { target: { value: 'senhaDiferente' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(getConfirmPasswordInput(), { target: { value: 'senhaSegura123' } });
    expect(screen.queryByText(/as senhas não coincidem/i)).not.toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('deve chamar register sem confirmPassword quando o formulário é válido', async () => {
    mockRegister.mockResolvedValue({
      id: '1',
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      hasProfile: false,
      createdAt: new Date().toISOString(),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fillValidBaseFields();
    fireEvent.change(getPasswordInput(), {
      target: { value: 'senhaSegura123' },
    });
    fireEvent.change(getConfirmPasswordInput(), {
      target: { value: 'senhaSegura123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar minha conta/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      password: 'senhaSegura123',
    });
  });

  it('deve alternar visibilidade da senha ao clicar no toggle', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const passwordInput = getPasswordInput();
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: /^mostrar senha$/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /^ocultar senha$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^ocultar senha$/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
