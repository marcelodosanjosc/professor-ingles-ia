import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      id,
      className = '',
      options,
      children,
      leftIcon,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    const describedByIds: string[] = [];
    if (error) describedByIds.push(errorId);
    if (hint) describedByIds.push(hintId);
    const ariaDescribedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
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

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            className={`w-full bg-slate-900 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm border transition-colors outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } pr-10 ${
              error
                ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-800 hover:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-slate-900 text-slate-100"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Seta indicadora customizada */}
          <div className="absolute right-3.5 pointer-events-none text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = 'Select';
