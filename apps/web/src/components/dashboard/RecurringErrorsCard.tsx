import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface RecurringErrorItem {
  type: string;
  phrase: string;
  correction: string;
  count: number;
}

export interface RecurringErrorsCardProps {
  errors: RecurringErrorItem[];
  className?: string;
}

export function RecurringErrorsCard({ errors, className = '' }: RecurringErrorsCardProps) {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" aria-hidden="true" />
            Erros Recorrentes
          </h3>
          <p className="text-xs text-slate-400">
            Padrões para você prestar atenção nas próximas práticas
          </p>
        </div>

        <Badge variant="rose" size="sm">
          {errors.length} detectados
        </Badge>
      </div>

      {errors.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60 flex flex-col items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <span>Nenhum erro recorrente detectado. Parabéns pela consistência!</span>
        </div>
      ) : (
        <div className="space-y-2.5" role="list" aria-label="Lista de erros recorrentes">
          {errors.map((err, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="default" size="sm" className="text-[10px] uppercase font-bold tracking-wider">
                  {err.type}
                </Badge>
                <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/40 border border-rose-900/40 px-2 py-0.5 rounded-md">
                  {err.count}x ocorrências
                </span>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2 text-rose-400">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Erro:</span>
                  <span className="line-through decoration-rose-500 font-mono">
                    "{err.phrase}"
                  </span>
                </div>

                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Correção:</span>
                  <div className="flex items-center gap-1 font-mono">
                    <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>"{err.correction}"</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
