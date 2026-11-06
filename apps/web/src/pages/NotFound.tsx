import { Link } from 'react-router';
import { HelpCircle, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-6 shadow-xl">
        <HelpCircle className="w-8 h-8" aria-hidden="true" />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
        404
      </h1>

      <h2 className="text-lg md:text-xl font-bold text-slate-200 mt-2">
        Página não encontrada
      </h2>

      <p className="text-sm text-slate-400 max-w-md mt-2">
        O endereço que você tentou acessar não existe ou foi movido para outro local.
      </p>

      <div className="mt-8">
        <Link to="/">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
