import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      id,
      className = '',
      leftIcon,
      rightIcon,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedByIds: string[] = [];
    if (error) describedByIds.push(errorId);
    if (hint) describedByIds.push(hintId);
    const ariaDescribedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-200 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-violet-400 ml-1" aria-hidden="true">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            className={`w-full bg-slate-900 text-slate-100 placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-sm border transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-800 hover:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 z-10 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-rose-400 font-medium">
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={hintId} className="text-xs text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
