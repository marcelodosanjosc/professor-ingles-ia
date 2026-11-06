import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'violet'
  | 'sky'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'fuchsia'
  | 'cyan'
  | 'lime';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  danger: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  info: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
  violet: 'bg-violet-950/60 text-violet-300 border-violet-800/60',
  sky: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
  emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  amber: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  rose: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  fuchsia: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/60',
  cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
  lime: 'bg-lime-950/60 text-lime-300 border-lime-800/60',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const sizeClass =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 rounded-md font-medium'
      : 'text-xs px-2.5 py-1 rounded-lg font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1 border select-none ${sizeClass} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
