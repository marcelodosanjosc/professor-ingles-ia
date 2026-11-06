import { Link } from 'react-router';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  AlertCircle,
  Trophy,
  Target,
} from 'lucide-react';
import type { SessionSummaryData } from '@fluencialab/shared';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

export interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SessionSummaryData | null;
}

export function SessionSummaryModal({ isOpen, onClose, summary }: SessionSummaryModalProps) {
  if (!isOpen || !summary) return null;

  const hasSkillDeltas =
    summary.skillDeltas &&
    Object.values(summary.skillDeltas).some((v) => typeof v === 'number' && v > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
        {/* Cabeçalho do Modal */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/50">
            <Trophy className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm">
                Sessão Concluída
              </Badge>
            </div>
            <h2 id="summary-title" className="text-xl md:text-2xl font-extrabold text-white">
              {summary.title || 'Resumo da Sessão'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Excelente dedicação! Veja os resultados e pontos de evolução da sua prática.
            </p>
          </div>
        </div>

        {/* Destaques (Highlights) */}
        {summary.highlights && summary.highlights.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Destaques da Sessão</span>
            </h3>
            <ul className="space-y-2">
              {summary.highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evolução de Habilidades (Skill Deltas) */}
        {hasSkillDeltas && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" aria-hidden="true" />
              <span>Pontos de Habilidade Ganhos</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {summary.skillDeltas.speaking !== undefined && summary.skillDeltas.speaking > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Fala</span>
                  <span className="text-xs font-bold text-rose-400">
                    +{summary.skillDeltas.speaking} pts
                  </span>
                </div>
              )}
              {summary.skillDeltas.listening !== undefined && summary.skillDeltas.listening > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Escuta</span>
                  <span className="text-xs font-bold text-amber-400">
                    +{summary.skillDeltas.listening} pts
                  </span>
                </div>
              )}
              {summary.skillDeltas.vocabulary !== undefined && summary.skillDeltas.vocabulary > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Vocabulário</span>
                  <span className="text-xs font-bold text-sky-400">
                    +{summary.skillDeltas.vocabulary} pts
                  </span>
                </div>
              )}
              {summary.skillDeltas.grammar !== undefined && summary.skillDeltas.grammar > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Gramática</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{summary.skillDeltas.grammar} pts
                  </span>
                </div>
              )}
              {summary.skillDeltas.pronunciation !== undefined &&
                summary.skillDeltas.pronunciation > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Pronúncia</span>
                    <span className="text-xs font-bold text-fuchsia-400">
                      +{summary.skillDeltas.pronunciation} pts
                    </span>
                  </div>
                )}
              {summary.skillDeltas.directThinking !== undefined &&
                summary.skillDeltas.directThinking > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Pensamento Direto</span>
                    <span className="text-xs font-bold text-cyan-400">
                      +{summary.skillDeltas.directThinking} pts
                    </span>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Novas Palavras */}
        {summary.newWords && summary.newWords.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" aria-hidden="true" />
              <span>Novas Palavras Ativadas</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {summary.newWords.map((word, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-300">{word.term}</span>
                    <span className="text-slate-400">{word.translation}</span>
                  </div>
                  {word.example && (
                    <p className="text-[11px] text-slate-400 italic">"{word.example}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Erros Recorrentes Notados */}
        {summary.recurringErrors && summary.recurringErrors.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Pontos de Atenção</span>
            </h3>
            <div className="space-y-2">
              {summary.recurringErrors.map((err, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-1"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Badge variant="amber" size="sm">
                      {err.type}
                    </Badge>
                    <span className="line-through text-rose-400">"{err.phrase}"</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-emerald-400 font-semibold">"{err.correction}"</span>
                  </div>
                  {err.explanation && (
                    <p className="text-[11px] text-slate-400">{err.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estruturas para Praticar */}
        {summary.structuresToPractice && summary.structuresToPractice.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">Estruturas para Praticar</h3>
            <div className="flex flex-wrap gap-2">
              {summary.structuresToPractice.map((struct, index) => (
                <Badge key={index} variant="violet" size="sm">
                  {struct}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Próximo Mini Desafio */}
        {summary.nextChallenge && (
          <Card className="border-violet-500/30 bg-violet-950/20">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold">
                <Target className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
                <span>Próximo Mini Desafio</span>
              </div>
              <p className="text-xs md:text-sm text-slate-200">{summary.nextChallenge}</p>
            </CardContent>
          </Card>
        )}

        {/* Ações / Botões */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={onClose}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Continuar praticando
          </Button>

          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Ir para o Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
