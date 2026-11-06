import { CheckSquare, Square, Mic, Headphones, Target } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface WeeklyGoalItem {
  id: string;
  title: string;
  done: boolean;
  kind: 'speaking_test' | 'comprehension_test' | 'other';
}

export interface WeeklyGoalsCardProps {
  goals: WeeklyGoalItem[];
  onToggleGoal: (id: string, done: boolean) => void;
  className?: string;
}

export function WeeklyGoalsCard({
  goals,
  onToggleGoal,
  className = '',
}: WeeklyGoalsCardProps) {
  const completedCount = goals.filter((g) => g.done).length;

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Target className="w-4 h-4 text-violet-400" aria-hidden="true" />
            Metas da Semana
          </h3>
          <p className="text-xs text-slate-400">
            {completedCount} de {goals.length} concluídas
          </p>
        </div>

        <Badge variant={completedCount === goals.length ? 'emerald' : 'violet'} size="sm">
          {Math.round((completedCount / (goals.length || 1)) * 100)}%
        </Badge>
      </div>

      <div className="space-y-2.5" role="list" aria-label="Lista de metas semanais">
        {goals.map((goal) => {
          let kindBadge = null;

          if (goal.kind === 'speaking_test') {
            kindBadge = (
              <Badge variant="rose" size="sm" className="font-semibold text-[10px]">
                <Mic className="w-2.5 h-2.5 mr-1" aria-hidden="true" />
                Teste de Fala (Obrigatório)
              </Badge>
            );
          } else if (goal.kind === 'comprehension_test') {
            kindBadge = (
              <Badge variant="sky" size="sm" className="font-semibold text-[10px]">
                <Headphones className="w-2.5 h-2.5 mr-1" aria-hidden="true" />
                Teste de Compreensão (Obrigatório)
              </Badge>
            );
          }

          return (
            <div
              key={goal.id}
              role="checkbox"
              aria-checked={goal.done}
              tabIndex={0}
              onClick={() => onToggleGoal(goal.id, !goal.done)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onToggleGoal(goal.id, !goal.done);
                }
              }}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all select-none ${
                goal.done
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                  : 'bg-slate-950/80 border-slate-800 hover:border-violet-600/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 text-violet-400 shrink-0">
                  {goal.done ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <p
                    className={`text-xs font-medium leading-relaxed ${
                      goal.done
                        ? 'line-through text-slate-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {goal.title}
                  </p>
                  {kindBadge && <div>{kindBadge}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
