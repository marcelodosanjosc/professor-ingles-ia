import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-medium shadow-md shadow-violet-950/40 border border-violet-500/30',
  secondary:
    'bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-100 font-medium border border-slate-700 hover:border-slate-600',
  ghost:
    'bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-300 hover:text-white border border-transparent',
  danger:
    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium shadow-md shadow-rose-950/40 border border-rose-500/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 min-h-[32px]',
  md: 'text-sm px-4 py-2 rounded-xl gap-2 min-h-[40px]',
  lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 min-h-[48px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        className={`inline-flex items-center justify-center select-none transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size="sm" label="Carregando..." />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
