import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import { TEACHERS } from '@fluencialab/shared';
import { Sidebar } from '../components/layout/Sidebar';

describe('Sidebar Component', () => {
  it('deve renderizar o link para Dashboard e todos os 8 professores', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Verifica Dashboard
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Verifica se há exatamente 8 professores no catálogo
    expect(TEACHERS).toHaveLength(8);

    // Verifica que cada um dos 8 professores está renderizado na Sidebar pelo seu shortName
    for (const teacher of TEACHERS) {
      expect(screen.getByText(teacher.shortName)).toBeInTheDocument();
    }
  });

  it('deve renderizar o progresso customizado quando informado via props', () => {
    render(
      <MemoryRouter>
        <Sidebar progress={{ architect: 45, vocabulary: 80 }} />
      </MemoryRouter>
    );

    expect(screen.getByTitle('Progresso: 45%')).toBeInTheDocument();
    expect(screen.getByTitle('Progresso: 80%')).toBeInTheDocument();
    expect(screen.getAllByTitle('Progresso: 0%')).toHaveLength(6);
  });
});
