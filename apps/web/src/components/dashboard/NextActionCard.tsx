import { Link } from 'react-router';
import { ArrowRight, Compass, Sparkles, BookOpen, MessagesSquare, Ear, Zap, AudioLines, Brain, Globe, type LucideIcon } from 'lucide-react';
import { teacherById, type TeacherId } from '@fluencialab/shared';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

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

export interface NextActionCardProps {
  nextAction: {
    teacherId: TeacherId;
    reason: string;
  };
  className?: string;
}

export function NextActionCard({ nextAction, className = '' }: NextActionCardProps) {
  const teacher = teacherById(nextAction.teacherId);
  const Icon = TEACHER_ICONS[teacher?.icon ?? 'Compass'] ?? Compass;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950/70 via-slate-900 to-slate-900 border border-violet-800/50 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl ${className}`}
    >
      <div
        className="absolute -right-8 -bottom-8 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="violet" size="sm">
            <Sparkles className="w-3 h-3 text-violet-400 mr-1" aria-hidden="true" />
            Próxima Ação Recomendada
          </Badge>
          <span className="text-[11px] font-semibold text-slate-400">
            Passo {teacher?.order ?? 1} de 8
          </span>
        </div>

        <div className="flex items-start gap-3 pt-1">
          <div
            className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 flex items-center justify-center shrink-0 shadow-md shadow-violet-950/50"
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              {teacher?.name ?? 'Professor'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {nextAction.reason}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-2 flex items-center justify-end">
        <Link to={`/professor/${teacher?.slug ?? 'arquiteto'}`}>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="shadow-md shadow-violet-950/50"
          >
            Praticar com {teacher?.shortName ?? 'Professor'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
