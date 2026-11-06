import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ErrorState } from '../components/ui/ErrorState';

describe('UI Components', () => {
  it('Button deve renderizar com loading e aria-busy', () => {
    render(<Button loading>Salvar</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('ProgressBar deve possuir atributos ARIA corretos', () => {
    render(<ProgressBar value={75} label="Conclusão" showValue />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuetext', '75% concluído');
    expect(screen.getByText('Conclusão')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('ErrorState deve exibir alerta e botão de retry', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Falha ao carregar"
        message="Erro detalhado"
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument();
    expect(screen.getByText('Erro detalhado')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
