import { Trophy, Award } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface AchievementItem {
  code: string;
  title: string;
  unlockedAt: string;
}

export interface AchievementsCardProps {
  achievements: AchievementItem[];
  className?: string;
}

function formatDateShort(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
    const [y, m, day] = isoDate.split('-');
    if (y && m && day) return `${day}/${m}`;
    return isoDate;
  } catch {
    return isoDate;
  }
}

export function AchievementsCard({ achievements, className = '' }: AchievementsCardProps) {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" aria-hidden="true" />
            Últimas Conquistas
          </h3>
          <p className="text-xs text-slate-400">
            {achievements.length} conquistas desbloqueadas
          </p>
        </div>

        <Badge variant="amber" size="sm">
          Troféus
        </Badge>
      </div>

      {achievements.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
          Nenhuma conquista desbloqueada ainda. Complete sua primeira sessão com os professores!
        </div>
      ) : (
        <div className="space-y-2.5" role="list" aria-label="Lista de conquistas">
          {achievements.map((item) => (
            <div
              key={item.code}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <Award className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Desbloqueado em {formatDateShort(item.unlockedAt)}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0">
                +EXP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
