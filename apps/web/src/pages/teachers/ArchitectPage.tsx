import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Compass,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Target,
  Zap,
  BookOpen,
  Headphones,
  Mic,
  Calendar,
  XCircle,
  HelpCircle,
  ListFilter,
  Check,
} from 'lucide-react';
import type { ArchitectPlanData } from '@fluencialab/shared';
import { useTeacherSession } from '../../hooks/useTeacherSession';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { apiFetch } from '../../lib/api';

const DEFAULT_ARCHITECT_PLAN: ArchitectPlanData = {
  diagnosis: {
    currentStage: 'Transição A2 → B1 (Entende o contexto geral, mas trava na hora de falar e hesita ao formular frases)',
    strengths: [
      'Boa compreensão de vocabulário básico do cotidiano',
      'Reconhecimento de estruturas simples no presente e passado',
      'Motivação alta para aplicar no ambiente de trabalho e viagens',
    ],
    bottlenecks: [
      'Tradução mental constante do português antes de falar',
      'Medo de errar tempos verbais em tempo real',
      'Dificuldade com velocidade da fala nativa e linked sounds',
    ],
    paretoFocus:
      'Dominar os 12 blocos funcionais e automatizar respostas em menos de 5 segundos, sem pensar na regra gramatical.',
  },
  learnFirst: [
    {
      category: 'Estruturas de Conexão Rápida',
      items: ['I mean...', 'The thing is...', 'What I was saying is...', 'Actually...'],
      whyItMatters: 'Compram de 2 a 5 segundos de processamento mental para você não travar em silêncio.',
    },
    {
      category: 'Verbos Modais de Ação Imediata',
      items: ['could you...', 'I should probably...', 'I have to...', 'would you mind...'],
      whyItMatters: 'Permitem pedir, sugerir e resolver 90% dos imprevistos em inglês.',
    },
    {
      category: 'Perguntas de Esclarecimento',
      items: ['Could you say that again?', 'What do you mean by that?', 'How do you spell that?'],
      whyItMatters: 'Mantêm a conversa viva sem que o falante nativo mude para outro idioma.',
    },
  ],
  phases: [
    {
      number: 1,
      title: 'Fase 1: Fundação & Destravamento da Fala',
      daysRange: 'Dias 1 a 30',
      priorityVocab: ['Top 50 Expressões de Sobrevivência', 'Rotina e Horários', 'Opiniões e Reações'],
      essentialGrammar: ['Presente simples automático', 'Passado de verbos irregulares top 20', 'Conectivos "so, because, but"'],
      listeningDrill: '15 min de escuta com transcrição paralela de diálogos curtos (1x velocidade).',
      speakingDrill: 'Gravação diária de 60 segundos respondendo perguntas inesperadas sem pausar.',
      readingWritingDrill: 'Leitura em voz alta de textos curtos com ênfase em ritmo e conexões de som.',
      reviewProtocol: 'Repetição espaçada SM-2 de 20 cards por dia com autoavaliação.',
    },
    {
      number: 2,
      title: 'Fase 2: Expansão de Vocabulário & Conversação Fluida',
      daysRange: 'Dias 31 a 60',
      priorityVocab: ['Trabalho e Negócios', 'Expressar Desacordo Polido', 'Resolução de Problemas'],
      essentialGrammar: ['Present Perfect para experiências', 'Conditionals para cenários futuros', 'Question tags'],
      listeningDrill: 'Trecho de 2 minutos de podcast nativo sem legendas repetido 3 vezes.',
      speakingDrill: 'Simulação de Roleplay de 10 turnos com o Professor de Conversação.',
      readingWritingDrill: 'Resumo oral de 1 parágrafo lido sobre seu setor de trabalho.',
      reviewProtocol: 'Revisão ativa semanal dos erros recorrentes anotados.',
    },
    {
      number: 3,
      title: 'Fase 3: Autonomia, Fluência Rápida & Imersão',
      daysRange: 'Dias 61 a 90',
      priorityVocab: ['Expressões idiomáticas comuns', 'Collocations avançadas', 'Nuances de tom'],
      essentialGrammar: ['Passive voice em situações formais', 'Reported speech simples', 'Inversões de ênfase'],
      listeningDrill: 'Áudios rápidos de nativos com linked sounds e sons engolidos.',
      speakingDrill: 'Conversação livre de 15 minutos em velocidade natural sobre temas complexos.',
      readingWritingDrill: 'Escrita de mensagens rápidas simulando e-mails e respostas imediatas.',
      reviewProtocol: 'Checkpoint final de 90 dias avaliando minutos de fala e taxa de hesitação.',
    },
  ],
  dailyRoutine: [
    {
      blockName: 'Bloco Manhã: Vocabulário e Memória Ativa',
      minutes: 10,
      activity: 'Revisão de flashcards SM-2 e assimilação de 5 novas expressões de alta frequência.',
      teacherSlug: 'vocabulario',
    },
    {
      blockName: 'Bloco Tarde: Destravamento de Velocidade',
      minutes: 10,
      activity: 'Estímulos rápidos de fala respondendo em até 5 segundos.',
      teacherSlug: 'fala',
    },
    {
      blockName: 'Bloco Noite: Conversação Guiada & Roleplay',
      minutes: 15,
      activity: 'Diálogo interativo por voz com foco em manter a conversa sem traduzir.',
      teacherSlug: 'conversacao',
    },
  ],
  weeklyGoals: [
    {
      id: 'wg-1',
      title: 'Realizar o teste de fala de 3 minutos contínuos sem pausar',
      done: false,
      kind: 'speaking_test',
    },
    {
      id: 'wg-2',
      title: 'Compreender áudio nativo de 2 minutos com acerto > 80% das perguntas',
      done: true,
      kind: 'comprehension_test',
    },
    {
      id: 'wg-3',
      title: 'Revisar e reter os 14 primeiros flashcards com pontuação >= 4',
      done: false,
      kind: 'other',
    },
    {
      id: 'wg-4',
      title: 'Identificar e corrigir seus 3 erros recorrentes mais frequentes',
      done: false,
      kind: 'other',
    },
  ],
  checkpoints: [
    { day: 14, title: 'Destravamento Inicial', criteria: 'Fala de 60 segundos contínuos sem congelar.', done: true },
    { day: 28, title: 'Domínio das 100 Palavras de Ouro', criteria: '90% de retenção no algoritmo SM-2.', done: false },
    { day: 42, title: 'Compreensão sem Legenda', criteria: 'Entendimento do tema principal de um áudio nativo de 3 minutos.', done: false },
    { day: 56, title: 'Conversação de 5 Minutos', criteria: 'Manter diálogo fluido de 5 minutos sobre trabalho ou viagem.', done: false },
    { day: 70, title: 'Pensamento Direto', criteria: 'Formulação de 10 pensamentos diários sem traduzir do português.', done: false },
    { day: 84, title: 'Pronúncia Limpa', criteria: 'Eliminação dos 3 principais sons que geram mal-entendido.', done: false },
    { day: 90, title: 'Fluência Real Consolidada', criteria: 'Conversa de 15 minutos em velocidade natural.', done: false },
  ],
  ignoreList: [
    {
      topic: 'Regras gramaticais obscuras (ex: Future Perfect Continuous)',
      reason: 'Nativos raramente usam no dia a dia e decorá-las agora consome energia cognitiva sem gerar fala.',
    },
    {
      topic: 'Vocabulário técnico ultra-específico antes do geral',
      reason: 'Aprender termos raros antes das 300 palavras de alta frequência atrasa a autonomia comunicativa.',
    },
    {
      topic: 'Sotaque 100% nativo britânico ou americano perfeito',
      reason: 'O foco é clareza e ritmo inteligível de primeira; buscar perfeição fonética gera timidez desnecessária.',
    },
    {
      topic: 'Listas alfabéticas soltas de palavras sem contexto',
      reason: 'O cérebro esquece 80% das palavras soltas em 48 horas se não estiverem ligadas a frases reais.',
    },
  ],
};

export function ArchitectPage() {
  const session = useTeacherSession('architect');
  const [plan, setPlan] = useState<ArchitectPlanData | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [errorPlan, setErrorPlan] = useState<string | null>(null);

  // Carrega plano ao abrir
  useEffect(() => {
    let isMounted = true;

    async function fetchPlan() {
      setLoadingPlan(true);
      setErrorPlan(null);
      try {
        const response = await apiFetch<{ plan?: ArchitectPlanData } | ArchitectPlanData>(
          '/api/teacher/architect',
          {
            method: 'POST',
            body: JSON.stringify({ action: 'get' }),
          }
        );

        if (!isMounted) return;

        const resolvedPlan =
          response && typeof response === 'object' && 'plan' in response && response.plan
            ? response.plan
            : (response as ArchitectPlanData);

        if (resolvedPlan && resolvedPlan.diagnosis) {
          setPlan(resolvedPlan);
        } else {
          setPlan(DEFAULT_ARCHITECT_PLAN);
        }
      } catch {
        if (!isMounted) return;
        // Fallback robusto para manter a experiência interativa mesmo offline
        setPlan(DEFAULT_ARCHITECT_PLAN);
      } finally {
        if (isMounted) setLoadingPlan(false);
      }
    }

    void fetchPlan();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setErrorPlan(null);
    try {
      const response = await apiFetch<{ plan?: ArchitectPlanData } | ArchitectPlanData>(
        '/api/teacher/architect',
        {
          method: 'POST',
          body: JSON.stringify({ action: 'generate' }),
        }
      );

      const resolvedPlan =
        response && typeof response === 'object' && 'plan' in response && response.plan
          ? response.plan
          : (response as ArchitectPlanData);

      if (resolvedPlan && resolvedPlan.diagnosis) {
        setPlan(resolvedPlan);
      }
    } catch {
      setErrorPlan('Não foi possível gerar um novo plano no momento. Usando versão atual.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleWeeklyGoal = (goalId: string) => {
    if (!plan) return;
    setPlan({
      ...plan,
      weeklyGoals: plan.weeklyGoals.map((g) =>
        g.id === goalId ? { ...g, done: !g.done } : g
      ),
    });
    session.addWordsRecalled(1);
  };

  const handleToggleCheckpoint = (day: number) => {
    if (!plan) return;
    setPlan({
      ...plan,
      checkpoints: plan.checkpoints.map((c) =>
        c.day === day ? { ...c, done: !c.done } : c
      ),
    });
  };

  return (
    <TeacherLayout
      teacherId="architect"
      elapsedSec={session.elapsedSec}
      speakingSec={session.speakingSec}
      exposureSec={session.exposureSec}
      wordsRecalled={session.wordsRecalled}
      moduleProgress={session.teacherData?.moduleProgress}
      systemPrompt={session.teacherData?.systemPrompt}
      recentSessions={session.teacherData?.recentSessions}
      recentErrors={session.teacherData?.recentErrors}
      onFinishSession={() => session.finishSession({ progressDelta: 15 })}
      isFinishing={session.isFinishing}
      isSummaryOpen={session.isSummaryOpen}
      summaryData={session.summaryData}
      onCloseSummary={session.closeSummary}
    >
      <div className="space-y-8">
        {/* Barra de Ações do Plano */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-violet-400" aria-hidden="true" />
              <span>Seu Plano Estratégico de 90 Dias</span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalizado com base no seu objetivo, rotina e diagnóstico de fluência.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRegenerate}
            loading={regenerating}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            title="Regerar plano personalizado com IA"
          >
            Regerar com IA
          </Button>
        </div>

        {errorPlan && (
          <div className="p-3 text-xs text-amber-400 bg-amber-950/30 border border-amber-900/50 rounded-xl">
            {errorPlan}
          </div>
        )}

        {loadingPlan ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" label="Carregando plano de 90 dias..." />
            <span className="text-xs text-slate-400">
              Construindo seu roteiro de fluência personalizado...
            </span>
          </div>
        ) : !plan ? (
          <ErrorState
            title="Plano não encontrado"
            message="Não conseguimos carregar o plano de 90 dias. Tente regerar."
            onRetry={handleRegenerate}
          />
        ) : (
          <div className="space-y-8">
            {/* SEÇÃO 1: Diagnóstico do Ponto de Partida */}
            <section aria-labelledby="section-diagnosis" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 id="section-diagnosis" className="text-base md:text-lg font-bold text-white">
                  Diagnóstico do Ponto de Partida
                </h3>
              </div>

              <Card className="border-slate-800">
                <CardContent className="p-5 md:p-6 space-y-5">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Estágio Atual Identificado
                    </span>
                    <p className="text-sm font-medium text-violet-300">
                      {plan.diagnosis.currentStage}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pontos Fortes */}
                    <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-900/30 space-y-2.5">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pontos Fortes Atuais</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {plan.diagnosis.strengths.map((st, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gargalos */}
                    <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-900/30 space-y-2.5">
                      <div className="text-xs font-bold text-rose-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Gargalos a Eliminar</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {plan.diagnosis.bottlenecks.map((bn, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-400">•</span>
                            <span>{bn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Foco 80/20 */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 to-slate-900 border border-violet-500/30 space-y-1.5">
                    <div className="text-xs font-bold text-violet-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-400" />
                      <span>Foco Pareto (80/20) para o seu Perfil</span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                      {plan.diagnosis.paretoFocus}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 2: O que Aprender Primeiro */}
            <section aria-labelledby="section-learn-first" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-sky-600/20 border border-sky-500/40 text-sky-400 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 id="section-learn-first" className="text-base md:text-lg font-bold text-white">
                  O Que Aprender Primeiro (Prioridade Máxima)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plan.learnFirst.map((item, idx) => (
                  <Card key={idx} className="border-slate-800 flex flex-col justify-between">
                    <CardContent className="p-5 space-y-3.5">
                      <div className="space-y-1">
                        <Badge variant="sky" size="sm">
                          Prioridade {idx + 1}
                        </Badge>
                        <h4 className="text-sm font-bold text-white">{item.category}</h4>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {item.items.map((it, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-950 text-sky-300 border border-slate-800 px-2.5 py-1 rounded-lg font-mono font-medium"
                          >
                            {it}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Por que importa: </span>
                        {item.whyItMatters}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SEÇÃO 3: Plano de 90 Dias em 3 Fases */}
            <section aria-labelledby="section-phases" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 id="section-phases" className="text-base md:text-lg font-bold text-white">
                  Plano de 90 Dias Dividido em 3 Fases
                </h3>
              </div>

              <div className="space-y-4">
                {plan.phases.map((phase) => (
                  <Card key={phase.number} className="border-slate-800 overflow-hidden">
                    <div className="bg-slate-950/80 p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs flex items-center justify-center">
                          F{phase.number}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{phase.title}</h4>
                          <span className="text-xs text-slate-400">{phase.daysRange}</span>
                        </div>
                      </div>
                      <Badge variant="emerald" size="sm">
                        {phase.daysRange}
                      </Badge>
                    </div>

                    <CardContent className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Vocabulário e Gramática */}
                      <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-sky-400" />
                          <span>Vocabulário Prioritário</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {phase.priorityVocab.map((v, i) => (
                            <span key={i} className="bg-slate-900 text-sky-300 px-2 py-0.5 rounded border border-slate-800">
                              {v}
                            </span>
                          ))}
                        </div>

                        <div className="font-semibold text-slate-200 flex items-center gap-2 pt-2 border-t border-slate-800">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          <span>Gramática Indispensável</span>
                        </div>
                        <ul className="space-y-1 text-slate-300">
                          {phase.essentialGrammar.map((g, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="text-violet-400">•</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Treinos de Escuta, Fala e Revisão */}
                      <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                        <div>
                          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                            <Headphones className="w-3.5 h-3.5" /> Treino de Escuta:
                          </span>
                          <p className="text-slate-300 mt-0.5">{phase.listeningDrill}</p>
                        </div>

                        <div>
                          <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5" /> Treino de Fala:
                          </span>
                          <p className="text-slate-300 mt-0.5">{phase.speakingDrill}</p>
                        </div>

                        <div>
                          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" /> Protocolo de Revisão:
                          </span>
                          <p className="text-slate-300 mt-0.5">{phase.reviewProtocol}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SEÇÃO 4: Rotina Diária em Blocos de Tempo */}
            <section aria-labelledby="section-daily-routine" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 id="section-daily-routine" className="text-base md:text-lg font-bold text-white">
                  Rotina Diária em Blocos de Tempo
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plan.dailyRoutine.map((block, idx) => (
                  <Card key={idx} className="border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="amber" size="sm">
                          {block.minutes} minutos
                        </Badge>
                        <Clock className="w-4 h-4 text-slate-500" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">{block.blockName}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {block.activity}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800">
                        <Link to={`/professor/${block.teacherSlug}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            className="w-full text-xs py-1.5 px-2.5 min-h-[32px] inline-flex items-center justify-center"
                          >
                            Abrir Professor ({block.teacherSlug})
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SEÇÃO 5: Metas Semanais Mensuráveis */}
            <section aria-labelledby="section-weekly-goals" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center justify-center">
                  5
                </span>
                <h3 id="section-weekly-goals" className="text-base md:text-lg font-bold text-white">
                  Metas Semanais Mensuráveis
                </h3>
              </div>

              <Card className="border-slate-800">
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs text-slate-400">
                    Marque as metas conforme for concluindo nesta semana. Inclui testes obrigatórios de fala e compreensão.
                  </p>

                  <div className="space-y-2">
                    {plan.weeklyGoals.map((goal) => (
                      <div
                        key={goal.id}
                        onClick={() => handleToggleWeeklyGoal(goal.id)}
                        role="checkbox"
                        aria-checked={goal.done}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            handleToggleWeeklyGoal(goal.id);
                          }
                        }}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                          goal.done
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                            goal.done
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-700 bg-slate-950 hover:border-slate-600'
                          }`}
                        >
                          {goal.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-xs md:text-sm font-medium ${
                                goal.done ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            >
                              {goal.title}
                            </span>
                            {goal.kind === 'speaking_test' && (
                              <Badge variant="rose" size="sm">
                                Teste de Fala (Obrigatório)
                              </Badge>
                            )}
                            {goal.kind === 'comprehension_test' && (
                              <Badge variant="amber" size="sm">
                                Teste de Compreensão (Obrigatório)
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SEÇÃO 6: Checkpoints de Fluência a Cada 14 Dias */}
            <section aria-labelledby="section-checkpoints" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-fuchsia-600/20 border border-fuchsia-500/40 text-fuchsia-400 text-xs font-bold flex items-center justify-center">
                  6
                </span>
                <h3 id="section-checkpoints" className="text-base md:text-lg font-bold text-white">
                  Checkpoints de Fluência a Cada 14 Dias
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {plan.checkpoints.map((cp) => (
                  <Card
                    key={cp.day}
                    onClick={() => handleToggleCheckpoint(cp.day)}
                    className={`border transition-all cursor-pointer ${
                      cp.done
                        ? 'border-emerald-500/40 bg-emerald-950/15'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={cp.done ? 'emerald' : 'default'} size="sm">
                          Dia {cp.day}
                        </Badge>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            cp.done ? 'bg-emerald-600 text-white' : 'border border-slate-700'
                          }`}
                        >
                          {cp.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <h4
                        className={`text-xs font-bold ${
                          cp.done ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        {cp.title}
                      </h4>

                      {cp.criteria && (
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Critério: {cp.criteria}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SEÇÃO 7: O Que Ignorar por Enquanto */}
            <section aria-labelledby="section-ignore" className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center justify-center">
                  7
                </span>
                <h3 id="section-ignore" className="text-base md:text-lg font-bold text-white">
                  O Que Ignorar por Enquanto (Economia de Energia Cognitiva)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.ignoreList.map((ig, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>{ig.topic}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-6">
                      <span className="font-semibold text-slate-400">Por que ignorar: </span>
                      {ig.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
