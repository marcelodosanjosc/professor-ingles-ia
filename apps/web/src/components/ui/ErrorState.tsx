import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Não foi possível carregar as informações',
  message = 'Ocorreu um erro ao comunicar com o servidor. Verifique sua conexão e tente novamente.',
  onRetry,
  retryLabel = 'Tentar novamente',
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-rose-900/50 rounded-2xl bg-rose-950/20 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-950/40">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-rose-200">{title}</h3>
      {message && (
        <p className="text-sm text-rose-300/80 max-w-md mt-1.5 leading-relaxed">
          {message}
        </p>
      )}
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="secondary"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
