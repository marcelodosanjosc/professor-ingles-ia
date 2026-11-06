import { Check, Flag } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface CheckpointItem {
  day: number;
  title: string;
  done: boolean;
}

export interface PlanProgressBarProps {
  day: number;
  phase?: string | null;
  checkpoints?: CheckpointItem[];
  className?: string;
}

const DEFAULT_CHECKPOINTS: CheckpointItem[] = [
  { day: 14, title: 'Check 1: Destravamento Inicial', done: false },
  { day: 28, title: 'Check 2: 100 Primeiras Palavras', done: false },
  { day: 42, title: 'Check 3: Conversação de 5 Minutos', done: false },
  { day: 56, title: 'Check 4: Compreensão sem Legendas', done: false },
  { day: 70, title: 'Check 5: Pensamento Direto Fluido', done: false },
  { day: 84, title: 'Check 6: Simulação de Imersão', done: false },
  { day: 90, title: 'Check Final: Domínio dos 8 Módulos', done: false },
];

export function PlanProgressBar({
  day,
  phase,
  checkpoints,
  className = '',
}: PlanProgressBarProps) {
  const currentDay = Math.max(1, Math.min(90, day));
  const percentage = Math.min(100, Math.round((currentDay / 90) * 100));

  const items = (checkpoints && checkpoints.length > 0)
    ? checkpoints
    : DEFAULT_CHECKPOINTS.map((cp) => ({
        ...cp,
        done: currentDay >= cp.day,
      }));

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Plano de 90 Dias
            </span>
            {phase && (
              <Badge variant="violet" size="sm">
                {phase}
              </Badge>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
            Dia {currentDay} de 90
          </h2>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-violet-400 tracking-tight">
            {percentage}%
          </span>
          <p className="text-xs text-slate-400">Progresso Geral</p>
        </div>
      </div>

      {/* Barra de Progresso com Trilha */}
      <div className="space-y-2">
        <div
          role="progressbar"
          aria-valuenow={currentDay}
          aria-valuemin={1}
          aria-valuemax={90}
          aria-label="Progresso do Plano de 90 Dias"
          className="relative w-full h-3 bg-slate-800/90 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-violet-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
          <span>Dia 1 (Início)</span>
          <span>Dia 45 (Metade)</span>
          <span>Dia 90 (Fluência)</span>
        </div>
      </div>

      {/* Marcadores dos Checkpoints a cada 14 dias */}
      <div className="pt-2 border-t border-slate-800/60">
        <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
          Checkpoints Estruturados (a cada 14 dias):
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {items.map((cp) => {
            const isDone = cp.done || currentDay >= cp.day;
            const isCurrent = !isDone && currentDay >= cp.day - 7 && currentDay < cp.day;

            return (
              <div
                key={cp.day}
                className={`p-2.5 rounded-xl border text-center flex flex-col justify-between transition-all ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : isCurrent
                    ? 'bg-violet-950/50 border-violet-600/70 text-violet-200 ring-1 ring-violet-500/50'
                    : 'bg-slate-950/50 border-slate-800/70 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>D-{cp.day}</span>
                  {isDone ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>

                <div className="text-[11px] font-medium leading-tight mt-1 line-clamp-2" title={cp.title}>
                  {cp.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
