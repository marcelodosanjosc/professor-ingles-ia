import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { registerFormSchema } from '@fluencialab/shared';
import { useAuth } from '../../hooks/useAuth';
import { ApiRequestError } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

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

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const confirmMismatchError =
    confirmPassword.length > 0 && !passwordsMatch
      ? 'As senhas não coincidem'
      : undefined;
  const confirmPasswordError = confirmMismatchError ?? errors.confirmPassword;
  const isSubmitDisabled = !passwordsMatch || isSubmitting;

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setErrors({});

    const validation = registerFormSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!validation.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const { name: validName, email: validEmail, password: validPassword } =
        validation.data;
      await registerUser({
        name: validName,
        email: validEmail,
        password: validPassword,
      });
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
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={errors.password}
                hint="Use pelo menos 8 caracteres para sua segurança"
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

              <Input
                label="Confirmar senha"
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                error={confirmPasswordError}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <PasswordVisibilityToggle
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((v) => !v)}
                    labelShow="Mostrar confirmação de senha"
                    labelHide="Ocultar confirmação de senha"
                  />
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitDisabled}
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
