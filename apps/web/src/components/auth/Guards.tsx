import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../ui/Spinner';
import { GraduationCap } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-label="Carregando o FluênciaLab..."
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center shadow-xl shadow-violet-950/60 animate-pulse">
        <GraduationCap className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-3">
        <Spinner size="md" label="Carregando o FluênciaLab..." />
        <span className="text-sm font-medium text-slate-300">
          Carregando o FluênciaLab...
        </span>
      </div>
    </div>
  );
}

/**
 * Guard para rotas protegidas por autenticação.
 * Redireciona usuários não autenticados para /login.
 */
export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * Guard para rotas de convidados (/login, /cadastro).
 * Redireciona usuários autenticados para / ou /onboarding.
 */
export function GuestGuard() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (user && !user.hasProfile) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/**
 * Guard para checar se o perfil do usuário foi configurado.
 * Se user.hasProfile for false, redireciona para /onboarding.
 */
export function ProfileGuard() {
  const { user } = useAuth();

  if (user && !user.hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
