import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Outlet } from 'react-router';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useDashboard } from '../../hooks/useDashboard';
import type { TeacherId } from '@fluencialab/shared';

export interface AppShellProps {
  children?: ReactNode;
  progress?: Partial<Record<TeacherId, number>>;
}

export function AppShell({ children, progress }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: dashboardData } = useDashboard();

  const effectiveProgress = useMemo(() => {
    const map: Partial<Record<TeacherId, number>> = { ...(progress ?? {}) };
    if (dashboardData?.moduleProgress) {
      for (const item of dashboardData.moduleProgress) {
        map[item.teacherId] = item.percent;
      }
    }
    return map;
  }, [dashboardData?.moduleProgress, progress]);

  // Fecha o drawer mobile ao pressionar a tecla Escape
  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  // Previne rolagem do body quando drawer mobile estiver aberto
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      {/* Link de salto de acessibilidade para navegação por teclado */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-300 font-semibold text-sm transition-transform"
      >
        Pular para o conteúdo principal
      </a>

      {/* Drawer mobile */}
      {mobileNavOpen && (
        <div
          id="mobile-sidebar-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu lateral móvel"
          className="fixed inset-0 z-40 lg:hidden flex"
        >
          {/* Backdrop escurecido */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Painel do menu */}
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-slate-900 border-r border-slate-800 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Fechar menu de navegação"
              className="absolute top-4 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer z-20"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <Sidebar
              progress={effectiveProgress}
              onNavigate={() => setMobileNavOpen(false)}
              className="w-full border-r-0"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-screen">
        {/* Sidebar desktop fixa à esquerda (breakpoint lg) */}
        <div className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-30">
          <Sidebar progress={effectiveProgress} className="h-full" />
        </div>

        {/* Área principal do conteúdo */}
        <div className="flex-1 flex flex-col lg:pl-64 xl:pl-72 min-w-0">
          <Topbar
            onOpenMobileNav={() => setMobileNavOpen(true)}
            mobileNavOpen={mobileNavOpen}
          />

          <main
            id="conteudo"
            tabIndex={-1}
            className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 outline-none max-w-7xl w-full mx-auto min-w-0"
          >
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
