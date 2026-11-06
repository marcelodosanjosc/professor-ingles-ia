import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/Card';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  variant?: 'violet' | 'emerald' | 'sky' | 'amber' | 'rose' | 'fuchsia' | 'cyan' | 'default';
  badge?: ReactNode;
  className?: string;
}

const variantStyles: Record<
  NonNullable<MetricCardProps['variant']>,
  { iconBg: string; iconColor: string; borderHover: string }
> = {
  violet: {
    iconBg: 'bg-violet-600/20 border-violet-500/30',
    iconColor: 'text-violet-400',
    borderHover: 'hover:border-violet-500/40',
  },
  emerald: {
    iconBg: 'bg-emerald-600/20 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/40',
  },
  sky: {
    iconBg: 'bg-sky-600/20 border-sky-500/30',
    iconColor: 'text-sky-400',
    borderHover: 'hover:border-sky-500/40',
  },
  amber: {
    iconBg: 'bg-amber-600/20 border-amber-500/30',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-500/40',
  },
  rose: {
    iconBg: 'bg-rose-600/20 border-rose-500/30',
    iconColor: 'text-rose-400',
    borderHover: 'hover:border-rose-500/40',
  },
  fuchsia: {
    iconBg: 'bg-fuchsia-600/20 border-fuchsia-500/30',
    iconColor: 'text-fuchsia-400',
    borderHover: 'hover:border-fuchsia-500/40',
  },
  cyan: {
    iconBg: 'bg-cyan-600/20 border-cyan-500/30',
    iconColor: 'text-cyan-400',
    borderHover: 'hover:border-cyan-500/40',
  },
  default: {
    iconBg: 'bg-slate-800 border-slate-700',
    iconColor: 'text-slate-300',
    borderHover: 'hover:border-slate-700',
  },
};

export function MetricCard({
  label,
  value,
  subtext,
  icon,
  variant = 'violet',
  badge,
  className = '',
}: MetricCardProps) {
  const styles = variantStyles[variant] ?? variantStyles.default;

  return (
    <Card
      className={`border-slate-800/80 bg-slate-900/90 transition-all duration-200 ${styles.borderHover} ${className}`}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconBg} ${styles.iconColor}`}
                aria-hidden="true"
              >
                {icon}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-400 truncate uppercase tracking-wider">
              {label}
            </span>
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </div>
          {subtext && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {subtext}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
