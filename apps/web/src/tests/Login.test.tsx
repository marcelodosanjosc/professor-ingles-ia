import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Login } from '../pages/auth/Login';

const mockLogin = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
    refetchMe: vi.fn(),
    error: null,
  }),
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de login com campos e botão', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /entrar na conta/i })
    ).toBeInTheDocument();
  });

  it('deve alternar visibilidade da senha ao clicar no toggle', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/senha/i, { selector: 'input' });
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /^mostrar senha$/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /^ocultar senha$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^ocultar senha$/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /^mostrar senha$/i })).toBeInTheDocument();
  });

  it('deve exibir mensagem de validação ao submeter e-mail inválido', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /entrar na conta/i });

    // Digita e-mail inválido e senha qualquer
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });
});
