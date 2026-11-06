import { useParams, Link } from 'react-router';
import {
  Compass,
  BookOpen,
  MessagesSquare,
  Ear,
  Zap,
  AudioLines,
  Brain,
  Globe,
  ArrowLeft,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { teacherBySlug } from '@fluencialab/shared';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';

const TEACHER_ICONS: Record<string, LucideIcon> = {
  Compass,
  BookOpen,
  MessagesSquare,
  Ear,
  Zap,
  AudioLines,
  Brain,
  Globe,
};

export function TeacherPlaceholder() {
  const { slug } = useParams<{ slug: string }>();
  const teacher = slug ? teacherBySlug(slug) : undefined;

  if (!teacher) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <ErrorState
          title="Professor não encontrado"
          message={`Não encontramos nenhum professor cadastrado com o endereço "/professor/${slug}".`}
        />
        <div className="mt-6 text-center">
          <Link to="/">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = TEACHER_ICONS[teacher.icon] ?? Compass;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Botão de retorno */}
      <div>
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>

      {/* Header do Professor */}
      <Card className="border-slate-800">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0 shadow-lg shadow-violet-950/60">
              <IconComponent className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="violet" size="sm">
                  Passo {teacher.order} de 8
                </Badge>
                <Badge variant="default" size="sm">
                  {teacher.shortName}
                </Badge>
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-white">
                {teacher.name}
              </h1>

              <p className="text-sm text-violet-300 font-medium">
                {teacher.tagline}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-violet-400" aria-hidden="true" />
              <span>Etapa 1 — Estrutura base concluída</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O fluxo interativo de prática diária com este professor (chat, gravação de voz,
              exercícios de fixação e histórico) será ativado nas próximas etapas do projeto.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
