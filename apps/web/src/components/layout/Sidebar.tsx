import { NavLink } from 'react-router';
import {
  Compass,
  BookOpen,
  MessagesSquare,
  Ear,
  Zap,
  AudioLines,
  Brain,
  Globe,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { TEACHERS, type TeacherId } from '@fluencialab/shared';

const TEACHER_ICONS: Record<string, LucideIcon> = {
  Compass,
  BookOpen,
  MessagesSquare,
  Ear,
  Zap,
  AudioLines,
  Brain,
  Globe,
};

const COLOR_MAP: Record<string, { icon: string; badge: string }> = {
  violet: { icon: 'text-violet-400', badge: 'bg-violet-950/70 text-violet-300 border-violet-800/60' },
  sky: { icon: 'text-sky-400', badge: 'bg-sky-950/70 text-sky-300 border-sky-800/60' },
  emerald: { icon: 'text-emerald-400', badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60' },
  amber: { icon: 'text-amber-400', badge: 'bg-amber-950/70 text-amber-300 border-amber-800/60' },
  rose: { icon: 'text-rose-400', badge: 'bg-rose-950/70 text-rose-300 border-rose-800/60' },
  fuchsia: { icon: 'text-fuchsia-400', badge: 'bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-800/60' },
  cyan: { icon: 'text-cyan-400', badge: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60' },
  lime: { icon: 'text-lime-400', badge: 'bg-lime-950/70 text-lime-300 border-lime-800/60' },
};

export interface SidebarProps {
  progress?: Partial<Record<TeacherId, number>>;
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ progress = {}, onNavigate, className = '' }: SidebarProps) {
  return (
    <aside
      aria-label="Menu principal"
      className={`w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full ${className}`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-md shadow-violet-950/40">
          <GraduationCap className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
            FluênciaLab
            <Sparkles className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
          </span>
          <p className="text-xs text-slate-400">8 Professores Especialistas</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Geral
          </div>
          <NavLink
            to="/"
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                <span className="truncate">Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/onboarding"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <UserCircle
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                <span className="truncate">Meu Perfil</span>
              </>
            )}
          </NavLink>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Professores IA</span>
            <span className="text-[10px] text-slate-400">8 etapas</span>
          </div>

          <ul className="space-y-1">
            {TEACHERS.map((teacher) => {
              const Icon = TEACHER_ICONS[teacher.icon] ?? Compass;
              const teacherProgress = progress[teacher.id] ?? 0;
              const colorInfo = COLOR_MAP[teacher.color] ?? {
                icon: 'text-violet-400',
                badge: 'bg-violet-950/70 text-violet-300 border-violet-800/60',
              };

              return (
                <li key={teacher.id}>
                  <NavLink
                    to={`/professor/${teacher.slug}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-violet-600/20 text-violet-100 border border-violet-500/40 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                              isActive
                                ? 'bg-violet-500/20 border-violet-400/40 text-violet-300'
                                : 'bg-slate-800/70 border-slate-700/50 ' + colorInfo.icon
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                          <span className="truncate">{teacher.shortName}</span>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${colorInfo.badge}`}
                          title={`Progresso: ${teacherProgress}%`}
                        >
                          {teacherProgress}%
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400">
        FluênciaLab SPA &bull; v0.1.0
      </div>
    </aside>
  );
}
