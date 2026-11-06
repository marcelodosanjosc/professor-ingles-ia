import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, User, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { registerSchema } from '@fluencialab/shared';
import { useAuth } from '../../hooks/useAuth';
import { ApiRequestError } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setErrors({});

    const validation = registerSchema.safeParse({ name, email, password });
    if (!validation.success) {
      const fieldErrors: { name?: string; email?: string; password?: string } = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as 'name' | 'email' | 'password';
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await registerUser(validation.data);
      // Novos usuários ainda não possuem perfil, redireciona para onboarding
      navigate('/onboarding', { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setApiError(err.message);
      } else {
        setApiError('Não foi possível realizar o cadastro. Tente novamente mais tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-400 mb-4 shadow-lg shadow-violet-950/60">
            <GraduationCap className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            FluênciaLab
            <Sparkles className="w-5 h-5 text-violet-400" aria-hidden="true" />
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Comece hoje sua trilha guiada com 8 professores de IA
          </p>
        </div>

        <Card className="border-slate-800/90 shadow-2xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="text-left">
              <h2 className="text-xl font-bold text-slate-100">Criar nova conta</h2>
              <p className="text-xs text-slate-400 mt-1">
                Preencha os dados abaixo para iniciar sua jornada
              </p>
            </div>

            {apiError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Seu nome completo"
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Como prefere ser chamado?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="E-mail"
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Senha"
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                hint="Use pelo menos 8 caracteres para sua segurança"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full mt-2"
              >
                Criar minha conta
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/70">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-sm"
              >
                Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
