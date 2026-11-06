import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
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
  Clock,
  Mic,
  Headphones,
  CheckCircle,
  Flag,
  ChevronDown,
  ChevronUp,
  FileCode,
  AlertTriangle,
  History,
  type LucideIcon,
} from 'lucide-react';
import { teacherById, type TeacherId, type SessionSummaryData, type SessionHistoryItem } from '@fluencialab/shared';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { SessionSummaryModal } from './SessionSummaryModal';

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

const DEFAULT_COLOR_THEME = {
  bg: 'bg-violet-600/20',
  border: 'border-violet-500/40',
  text: 'text-violet-400',
  shadow: 'shadow-violet-950/60',
};

const COLOR_CLASSES: Record<
  string,
  { bg: string; border: string; text: string; shadow: string }
> = {
  violet: DEFAULT_COLOR_THEME,
  sky: {
    bg: 'bg-sky-600/20',
    border: 'border-sky-500/40',
    text: 'text-sky-400',
    shadow: 'shadow-sky-950/60',
  },
  emerald: {
    bg: 'bg-emerald-600/20',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    shadow: 'shadow-emerald-950/60',
  },
  amber: {
    bg: 'bg-amber-600/20',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    shadow: 'shadow-amber-950/60',
  },
  rose: {
    bg: 'bg-rose-600/20',
    border: 'border-rose-500/40',
    text: 'text-rose-400',
    shadow: 'shadow-rose-950/60',
  },
  fuchsia: {
    bg: 'bg-fuchsia-600/20',
    border: 'border-fuchsia-500/40',
    text: 'text-fuchsia-400',
    shadow: 'shadow-fuchsia-950/60',
  },
  cyan: {
    bg: 'bg-cyan-600/20',
    border: 'border-cyan-500/40',
    text: 'text-cyan-400',
    shadow: 'shadow-cyan-950/60',
  },
  lime: {
    bg: 'bg-lime-600/20',
    border: 'border-lime-500/40',
    text: 'text-lime-400',
    shadow: 'shadow-lime-950/60',
  },
};

export interface TeacherLayoutProps {
  teacherId: TeacherId;
  children: ReactNode;
  elapsedSec?: number;
  speakingSec?: number;
  exposureSec?: number;
  wordsRecalled?: number;
  moduleProgress?: {
    percentage: number;
    level?: string;
  } | null;
  systemPrompt?: string;
  recentSessions?: SessionHistoryItem[];
  recentErrors?: Array<{
    type: string;
    phrase: string;
    correction: string;
    explanation?: string;
    count?: number;
  }>;
  onFinishSession?: () => void;
  isFinishing?: boolean;
  isSummaryOpen?: boolean;
  summaryData?: SessionSummaryData | null;
  onCloseSummary?: () => void;
}

export function TeacherLayout({
  teacherId,
  children,
  elapsedSec = 0,
  speakingSec = 0,
  exposureSec = 0,
  wordsRecalled = 0,
  moduleProgress,
  systemPrompt,
  recentSessions = [],
  recentErrors = [],
  onFinishSession,
  isFinishing = false,
  isSummaryOpen = false,
  summaryData = null,
  onCloseSummary = () => {},
}: TeacherLayoutProps) {
  const teacher = teacherById(teacherId);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  const IconComponent = TEACHER_ICONS[teacher.icon] ?? Compass;
  const colorTheme = COLOR_CLASSES[teacher.color] ?? DEFAULT_COLOR_THEME;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = moduleProgress?.percentage ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Barra de Retorno */}
      <div className="flex items-center justify-between">
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

      {/* Cabeçalho do Professor com Métricas ao Vivo */}
      <header className="rounded-2xl bg-slate-900 border border-slate-800 p-5 md:p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Identificação do Professor */}
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${colorTheme.bg} border ${colorTheme.border} ${colorTheme.text} ${colorTheme.shadow} flex items-center justify-center shrink-0 shadow-lg`}
            >
              <IconComponent className="w-7 h-7 md:w-8 md:h-8" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" size="sm">
                  Passo {teacher.order} de 8
                </Badge>
                <Badge variant="violet" size="sm">
                  {progressPercent}% concluído
                </Badge>
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-white">
                {teacher.name}
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                {teacher.tagline}
              </p>
            </div>
          </div>

          {/* Botão de Finalização em Destaque */}
          {onFinishSession && (
            <div className="shrink-0 self-start md:self-center">
              <Button
                variant="primary"
                size="md"
                onClick={onFinishSession}
                loading={isFinishing}
                leftIcon={<Flag className="w-4 h-4" />}
                className="w-full md:w-auto shadow-lg shadow-violet-950/60 font-semibold"
              >
                Finalizar sessão
              </Button>
            </div>
          )}
        </div>

        {/* Barra de Métricas ao Vivo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          {/* Cronômetro */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <Clock className="w-5 h-5 text-violet-400 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Tempo de Sessão</div>
              <div className="text-sm font-bold text-white font-mono">
                {formatTimer(elapsedSec)}
              </div>
            </div>
          </div>

          {/* Exposição Auditiva */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <Headphones className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Exposição Auditiva</div>
              <div className="text-sm font-bold text-white">
                {(exposureSec / 60).toFixed(1)} min
              </div>
            </div>
          </div>

          {/* Tempo Falando */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <Mic className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Tempo Falando</div>
              <div className="text-sm font-bold text-white">
                {(speakingSec / 60).toFixed(1)} min
              </div>
            </div>
          </div>

          {/* Palavras Recuperadas */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Palavras Ativadas</div>
              <div className="text-sm font-bold text-white">
                {wordsRecalled}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grade Principal: Conteúdo Central + Barra Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Central de Interação (Children) */}
        <main className="lg:col-span-8 space-y-6">
          {children}
        </main>

        {/* Barra Lateral Direita Responsiva */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Progresso do Módulo */}
          <Card className="border-slate-800">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Progresso do Módulo
                </span>
                <span className="text-xs font-bold text-violet-400">
                  {progressPercent}%
                </span>
              </div>
              <ProgressBar value={progressPercent} max={100} variant="violet" size="sm" />
              <p className="text-[11px] text-slate-400">
                Finalize sessões de prática para aumentar seu domínio neste módulo.
              </p>
            </CardContent>
          </Card>

          {/* Erros Recorrentes do Módulo */}
          {recentErrors && recentErrors.length > 0 && (
            <Card className="border-amber-900/30 bg-slate-900/90">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>Erros Recorrentes Notados</span>
                </div>

                <div className="space-y-2">
                  {recentErrors.slice(0, 4).map((err, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">{err.type}</span>
                        {err.count && (
                          <span className="text-amber-400/80">{err.count}x</span>
                        )}
                      </div>
                      <div className="text-slate-300">
                        <span className="line-through text-rose-400/90">"{err.phrase}"</span>
                        <span className="text-slate-500 mx-1.5">→</span>
                        <span className="text-emerald-400 font-medium">"{err.correction}"</span>
                      </div>
                      {err.explanation && (
                        <p className="text-[10px] text-slate-400">{err.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Sessões Recentes */}
          {recentSessions && recentSessions.length > 0 && (
            <Card className="border-slate-800">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <History className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Sessões Recentes</span>
                </div>

                <div className="space-y-2">
                  {recentSessions.slice(0, 3).map((sess) => (
                    <div
                      key={sess.id}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>{new Date(sess.startedAt).toLocaleDateString('pt-BR')}</span>
                        <span className="font-mono text-slate-300">
                          {Math.round(sess.durationSec / 60)} min
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Fala: {Math.round(sess.speakingSec / 60)}m</span>
                        <span>Ouvido: {Math.round(sess.exposureSec / 60)}m</span>
                        <span>Palavras: {sess.wordsRecalled}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Prompt Customizado (Acordeão) */}
          {systemPrompt && (
            <Card className="border-slate-800">
              <CardContent className="p-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  className="w-full flex items-center justify-between text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-violet-400" aria-hidden="true" />
                    Diretrizes da IA (System Prompt)
                  </span>
                  {showSystemPrompt ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showSystemPrompt && (
                  <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {systemPrompt}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {/* Modal de Resumo da Sessão */}
      <SessionSummaryModal
        isOpen={isSummaryOpen}
        onClose={onCloseSummary}
        summary={summaryData}
      />
    </div>
  );
}
