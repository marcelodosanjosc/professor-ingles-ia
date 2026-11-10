import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  GraduationCap,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { loginSchema } from '@fluencialab/shared';
import { useAuth } from '../../hooks/useAuth';
import { ApiRequestError } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

function PasswordVisibilityToggle({
  visible,
  onToggle,
  labelShow,
  labelHide,
}: {
  visible: boolean;
  onToggle: () => void;
  labelShow: string;
  labelHide: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? labelHide : labelShow}
      className="p-0.5 rounded-md text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      {visible ? (
        <EyeOff className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Eye className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as 'email' | 'password';
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(validation.data);
      if (!user.hasProfile) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(fromLocation, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setApiError(err.message);
      } else {
        setApiError('Não foi possível entrar. Tente novamente mais tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-400 mb-4 shadow-lg shadow-violet-950/60">
            <GraduationCap className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            FluênciaLab
            <Sparkles className="w-5 h-5 text-violet-400" aria-hidden="true" />
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Aprenda inglês acelerado com 8 professores IA especialistas
          </p>
        </div>

        <Card className="border-slate-800/90 shadow-2xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="text-left">
              <h2 className="text-xl font-bold text-slate-100">Bem-vindo de volta</h2>
              <p className="text-xs text-slate-400 mt-1">
                Insira suas credenciais para acessar sua jornada
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
                label="E-mail"
                id="login-email"
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
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <PasswordVisibilityToggle
                    visible={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                    labelShow="Mostrar senha"
                    labelHide="Ocultar senha"
                  />
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full mt-2"
              >
                Entrar na conta
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/70">
              Não tem uma conta?{' '}
              <Link
                to="/cadastro"
                className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-sm"
              >
                Cadastre-se gratuitamente
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
