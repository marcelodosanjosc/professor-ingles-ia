import { useMemo } from 'react';
import { Flame } from 'lucide-react';

export interface ConsistencyHeatmapProps {
  data: { date: string; minutes: number }[];
  title?: string;
  className?: string;
}

function getIntensityClass(minutes: number): string {
  if (minutes === 0) return 'bg-slate-800/60 border-slate-700/30';
  if (minutes <= 15) return 'bg-violet-950/80 border-violet-800/60';
  if (minutes <= 30) return 'bg-violet-700 border-violet-600';
  if (minutes <= 45) return 'bg-violet-600 border-violet-500';
  return 'bg-violet-400 border-violet-300';
}

function formatDateBr(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split('-');
    if (y && m && d) return `${d}/${m}/${y}`;
    return isoDate;
  } catch {
    return isoDate;
  }
}

export function ConsistencyHeatmap({
  data,
  title = 'Consistência Diária',
  className = '',
}: ConsistencyHeatmapProps) {
  // Agrupa os itens em colunas semanais de 7 dias
  const { weeks, totalMinutes, activeDays } = useMemo(() => {
    let active = 0;
    let sum = 0;

    for (const item of data) {
      if (item.minutes > 0) {
        active++;
        sum += item.minutes;
      }
    }

    // Dividimos a lista em semanas de até 7 dias
    const cols: { date: string; minutes: number }[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      cols.push(data.slice(i, i + 7));
    }

    return { weeks: cols, totalMinutes: sum, activeDays: active };
  }, [data]);

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-violet-400" aria-hidden="true" />
            {title}
          </h3>
          <p className="text-xs text-slate-400">
            {activeDays} dias de estudo ativo &bull; {totalMinutes} minutos acumulados
          </p>
        </div>

        {/* Legenda de intensidades */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 self-end sm:self-auto">
          <span>Menos</span>
          <span className="w-3 h-3 rounded-xs bg-slate-800/60 border border-slate-700/30" />
          <span className="w-3 h-3 rounded-xs bg-violet-950/80 border border-violet-800/60" />
          <span className="w-3 h-3 rounded-xs bg-violet-700 border border-violet-600" />
          <span className="w-3 h-3 rounded-xs bg-violet-600 border border-violet-500" />
          <span className="w-3 h-3 rounded-xs bg-violet-400 border border-violet-300" />
          <span>Mais</span>
        </div>
      </div>

      {/* Grid do Heatmap com scroll horizontal suave */}
      <div className="overflow-x-auto pb-2 pt-1 focus:outline-none" tabIndex={0} aria-label="Mapa de calor de dias estudados">
        <div className="inline-flex gap-1.5">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1.5">
              {week.map((day) => {
                const formatted = formatDateBr(day.date);
                const tooltipText = `${formatted}: ${day.minutes} min estudados`;
                const intensity = getIntensityClass(day.minutes);

                return (
                  <div
                    key={day.date}
                    title={tooltipText}
                    aria-label={tooltipText}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${intensity}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
