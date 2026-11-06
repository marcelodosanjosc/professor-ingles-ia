import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export interface TopbarProps {
  onOpenMobileNav: () => void;
  mobileNavOpen: boolean;
}

export function Topbar({ onOpenMobileNav, mobileNavOpen }: TopbarProps) {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (_err) {
      setIsLoggingOut(false);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between">
      {/* Botão de menu mobile */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-sidebar-drawer"
          aria-label="Abrir menu de navegação"
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            FluênciaLab
          </span>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-3 md:gap-4">
        {user && (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-400/40 text-violet-200 font-semibold text-xs flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {userInitial}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight">
                {user.email}
              </span>
            </div>
          </div>
        )}

        <Link
          to="/onboarding"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
          title="Editar Meu Perfil"
        >
          <UserIcon className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
          <span>Meu Perfil</span>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          loading={isLoggingOut}
          leftIcon={<LogOut className="w-4 h-4 text-slate-400" />}
          className="text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-900/40"
          aria-label="Sair da conta"
        >
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
