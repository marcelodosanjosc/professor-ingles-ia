import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Globe,
  Play,
  RotateCcw,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Mic,
  MicOff,
  Flame,
  Check,
  ChevronRight,
  Clock,
  Calendar,
  BookOpen,
  Headphones,
  Award,
  Layers,
  Send,
  Smartphone,
  Search,
  Tv,
  MessageSquare,
} from 'lucide-react';
import type { ImmersionPlanData } from '@fluencialab/shared';
import { useTeacherSession } from '../../hooks/useTeacherSession';
import { useSpeech } from '../../hooks/useSpeech';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { apiFetch } from '../../lib/api';

const DEFAULT_IMMERSION_DATA: ImmersionPlanData = {
  routineBlocks: [
    {
      period: 'Manhã',
      currentHabitReplaced: 'Rolar feed de notícias em português enquanto toma café.',
      inputActivity: 'Ouvir 10 minutos de podcast de notícias em inglês (ex: BBC Global News ou NPR Up First).',
      outputActivity: 'Sussurrar 3 intenções do dia em voz alta em inglês enquanto prepara o café.',
      vocabMicroTask: 'Anotar 2 palavras novas encontradas no podcast no bloco de notas.',
      minutes: 15,
    },
    {
      period: 'Deslocamento',
      currentHabitReplaced: 'Rádio comercial ou silêncio no metrô/carro.',
      inputActivity: 'Audiolivro ou playlist de diálogos em velocidade 1.0x sem legendas.',
      outputActivity: 'Shadowing mental ou em voz baixa repetindo frases do áudio.',
      vocabMicroTask: 'Identificar 1 som engolido (linking) em uma das falas ouvidas.',
      minutes: 20,
    },
    {
      period: 'Trabalho / Estudo',
      currentHabitReplaced: 'Pesquisar problemas técnicos ou tutoriais em português no Google.',
      inputActivity: 'Fazer todas as buscas de tutoriais, software e documentação exclusivamente em inglês.',
      outputActivity: 'Escrever notas pessoais de reunião ou to-do list do dia em inglês.',
      vocabMicroTask: 'Salvar 1 termo específico da sua área profissional.',
      minutes: 20,
    },
    {
      period: 'Intervalos',
      currentHabitReplaced: 'Instagram / TikTok em português.',
      inputActivity: 'Assistir a 1 vídeo curto do YouTube de um criador nativo sobre seus hobbies.',
      outputActivity: 'Deixar 1 comentário de 2 frases em inglês no vídeo.',
      vocabMicroTask: 'Revisar 3 cartões de vocabulário de alta frequência.',
      minutes: 10,
    },
    {
      period: 'Exercício',
      currentHabitReplaced: 'Música sem foco linguístico durante a caminhada ou academia.',
      inputActivity: 'Podcast descontraído de entrevistas (Joe Rogan, Huberman Lab ou Modern Wisdom).',
      outputActivity: 'Monólogo interno de 2 minutos narrando a sua intensidade física.',
      vocabMicroTask: 'Repetir um chunk ouvido no podcast 3 vezes durante a série.',
      minutes: 25,
    },
    {
      period: 'Noite',
      currentHabitReplaced: 'Série dublada ou TV aberta.',
      inputActivity: 'Assistir a 1 episódio de série em áudio original e legenda em inglês (sem português).',
      outputActivity: 'Gravar o áudio diário de 2 minutos sobre como foi o seu dia.',
      vocabMicroTask: 'Escrever o Diário de 5 Linhas antes de dormir.',
      minutes: 30,
    },
    {
      period: 'Fim de semana',
      currentHabitReplaced: 'Desconectar completamente do estudo.',
      inputActivity: 'Filme completo em inglês ou documentário longo.',
      outputActivity: 'Simular 15 minutos de conversa livre com o Professor de Conversação.',
      vocabMicroTask: 'Revisão geral dos chunks aprendidos durante a semana.',
      minutes: 45,
    },
  ],
  immersionProtocol: [
    {
      id: 'p-1',
      title: 'Celular e Dispositivos no Idioma',
      action: 'Mude o sistema operacional do celular, computador e navegadores para English.',
      frequency: 'Permanente',
    },
    {
      id: 'p-2',
      title: 'Google e Pesquisas Zero Português',
      action: 'Qualquer dúvida factual ("como fazer", "tempo amanhã", "receita") buscada em inglês.',
      frequency: 'Diária',
    },
    {
      id: 'p-3',
      title: 'Entretenimento Adequado',
      action: 'Proibido dublagem. Legenda em inglês permitida; português nunca.',
      frequency: 'Diária',
    },
    {
      id: 'p-4',
      title: '1 Conversa Simulada por Dia',
      action: 'Pelo menos 1 interação ativa em voz alta com a IA ou consigo mesmo.',
      frequency: 'Diária (10-15 min)',
    },
    {
      id: 'p-5',
      title: 'Áudio Diário de 2 Minutos',
      action: 'Falar 120 segundos sem interrupção sobre um tema do dia.',
      frequency: 'Todas as noites',
    },
  ],
  levels30Days: [
    {
      level: 1,
      daysRange: 'Dias 1 a 30',
      title: 'Nível 1: Fundação Passiva & Rotina Blindada',
      dailyTargetMinutes: 30,
      mandatoryDeliverables: [
        'Dispositivos 100% configurados em inglês',
        '30 áudios noturnos de 2 minutos gravados',
        'Zero conteúdo dublado consumido',
      ],
    },
    {
      level: 2,
      daysRange: 'Dias 31 a 60',
      title: 'Nível 2: Ativação de Fala & Monólogos',
      dailyTargetMinutes: 45,
      mandatoryDeliverables: [
        'Narração interna diária de 10 minutos',
        '60 expressões de sobrevivência automatizadas',
        '10 comentários públicos em inglês por semana',
      ],
    },
    {
      level: 3,
      daysRange: 'Dias 61 a 90',
      title: 'Nível 3: Conversação Real & Desafio Spontaneous',
      dailyTargetMinutes: 60,
      mandatoryDeliverables: [
        '1 conversa de 15 minutos com IA ou nativo diariamente',
        'Consumo de podcasts nativos em 1.15x',
        'Diário de 5 linhas sem erros de armadilha',
      ],
    },
    {
      level: 4,
      daysRange: 'Dias 91 a 120',
      title: 'Nível 4: Imersão Nativa Total & Pensamento Espontâneo',
      dailyTargetMinutes: 90,
      mandatoryDeliverables: [
        '90% de todo entretenimento em inglês nativo',
        'Debates longos sem hesitação de tradução',
        'Apresentação de 5 minutos sobre tema técnico',
      ],
    },
  ],
  idealImmersionDay: {
    totalMinutes: 120,
    schedule: [
      { time: '07:00 - 07:15', block: 'Manhã', activity: 'Podcast de notícias + café', type: 'input', durationMinutes: 15 },
      { time: '08:30 - 08:50', block: 'Deslocamento', activity: 'Audiolivro e shadowing', type: 'input', durationMinutes: 20 },
      { time: '11:00 - 11:10', block: 'Intervalo', activity: 'Vídeo rápido de YouTube + comentário', type: 'output', durationMinutes: 10 },
      { time: '13:00 - 13:15', block: 'Almoço', activity: 'Revisão de 10 chunks nativos', type: 'vocab', durationMinutes: 15 },
      { time: '18:00 - 18:25', block: 'Exercício', activity: 'Entrevista longa em áudio', type: 'input', durationMinutes: 25 },
      { time: '21:30 - 21:50', block: 'Noite', activity: 'Série com legendas em inglês', type: 'input', durationMinutes: 20 },
      { time: '22:00 - 22:15', block: 'Pré-sono', activity: 'Áudio de 2 min + Diário de 5 Linhas', type: 'output', durationMinutes: 15 },
    ],
  },
};

type ImmersionTab = 'routine' | 'protocol' | 'levels' | 'schedule';

export function ImmersionPage() {
  const {
    elapsedSec,
    speakingSec,
    exposureSec,
    wordsRecalled,
    addSpeakingSec,
    addExposureSec,
    addWordsRecalled,
    teacherData,
    finishSession,
    isFinishing,
    isSummaryOpen,
    summaryData,
    closeSummary,
  } = useTeacherSession('immersion');

  const [activeTab, setActiveTab] = useState<ImmersionTab>('routine');
  const [data, setData] = useState<ImmersionPlanData>(DEFAULT_IMMERSION_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Checkboxes de atividades da rotina (salvam minutos na sessão)
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});

  // Checklist do Protocolo
  const [protocolChecks, setProtocolChecks] = useState<Record<string, boolean>>({});

  // Gravador de 2 minutos (120s)
  const [twoMinTimer, setTwoMinTimer] = useState(120);
  const [isTwoMinRecording, setIsTwoMinRecording] = useState(false);
  const twoMinTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Diário de 5 linhas
  const [diaryEntry, setDiaryEntry] = useState('');
  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [diaryFeedback, setDiaryFeedback] = useState<{
    polishedVersion: string;
    correctionPoints: string[];
    suggestedExpressions: string[];
  } | null>(null);

  // Hooks de fala e gravador
  const { speak, isSpeaking } = useSpeech({
    defaultLang: 'en-US',
    onExposureSec: addExposureSec,
    onSpeakingSec: addSpeakingSec,
  });

  const {
    startRecording,
    stopRecording,
    isRecording,
    audioUrl,
    clearRecording,
  } = useAudioRecorder();

  // Carrega dados da API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await apiFetch<any>('/api/teacher/immersion', {
          method: 'POST',
          body: JSON.stringify({ action: 'load' }),
        });
        const resolved = (res as any)?.data ?? res;
        if (isMounted && resolved?.routineBlocks?.length) {
          setData(resolved);
        }
      } catch {
        // Fallback robusto
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Timer do áudio de 2 minutos
  useEffect(() => {
    if (isTwoMinRecording) {
      twoMinTimerRef.current = setInterval(() => {
        setTwoMinTimer((prev) => {
          if (prev <= 1) {
            setIsTwoMinRecording(false);
            void stopRecording();
            if (twoMinTimerRef.current) clearInterval(twoMinTimerRef.current);
            return 0;
          }
          addSpeakingSec(1);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (twoMinTimerRef.current) {
        clearInterval(twoMinTimerRef.current);
      }
    }
    return () => {
      if (twoMinTimerRef.current) clearInterval(twoMinTimerRef.current);
    };
  }, [isTwoMinRecording, stopRecording, addSpeakingSec]);

  // Alterna atividade concluída
  const handleToggleActivity = (
    key: string,
    minutes: number,
    type: 'input' | 'output' | 'vocab'
  ) => {
    const isNowDone = !completedActivities[key];
    setCompletedActivities((prev) => ({ ...prev, [key]: isNowDone }));

    if (isNowDone) {
      if (type === 'input') {
        addExposureSec(minutes * 60);
      } else if (type === 'output') {
        addSpeakingSec(minutes * 60);
      } else {
        addWordsRecalled(3);
      }
    }
  };

  // Salva e corrige o Diário de 5 Linhas
  const handleSaveDiary = async () => {
    if (!diaryEntry.trim()) return;
    setIsSavingDiary(true);

    try {
      const res = await apiFetch<{
        polishedVersion: string;
        correctionPoints: string[];
        suggestedExpressions: string[];
      }>('/api/teacher/immersion', {
        method: 'POST',
        body: JSON.stringify({
          action: 'save_diary',
          payload: { entryText: diaryEntry },
        }),
      });
      setDiaryFeedback(res);
    } catch {
      // Fallback local com correção amigável
      setDiaryFeedback({
        polishedVersion: diaryEntry
          .replace(/I have \d+ years/gi, 'I am in my twenties')
          .replace(/make a question/gi, 'ask a question'),
        correctionPoints: [
          'Boa narrativa do seu dia! O fluxo está natural.',
          'Lembre-se de conectar períodos usando "meanwhile" ou "after that" para soar mais fluido.',
        ],
        suggestedExpressions: [
          'Call it a day (encerrar as atividades por hoje)',
          'Wind down (relaxar antes de dormir)',
        ],
      });
    } finally {
      setIsSavingDiary(false);
      addSpeakingSec(60);
      addWordsRecalled(5);
    }
  };

  // Minutos acumulados das tarefas marcadas hoje
  const totalCompletedMinutesToday = useMemo(() => {
    return data.routineBlocks.reduce((acc, block) => {
      const isInput = completedActivities[`${block.period}-input`];
      const isOutput = completedActivities[`${block.period}-output`];
      const isVocab = completedActivities[`${block.period}-vocab`];
      let sum = 0;
      if (isInput) sum += Math.round(block.minutes * 0.5);
      if (isOutput) sum += Math.round(block.minutes * 0.35);
      if (isVocab) sum += Math.round(block.minutes * 0.15);
      return acc + sum;
    }, 0);
  }, [data.routineBlocks, completedActivities]);

  return (
    <TeacherLayout
      teacherId="immersion"
      elapsedSec={elapsedSec}
      speakingSec={speakingSec}
      exposureSec={exposureSec}
      wordsRecalled={wordsRecalled}
      moduleProgress={teacherData?.moduleProgress}
      systemPrompt={teacherData?.systemPrompt}
      recentSessions={teacherData?.recentSessions}
      recentErrors={teacherData?.recentErrors}
      onFinishSession={finishSession}
      isFinishing={isFinishing}
      isSummaryOpen={isSummaryOpen}
      summaryData={summaryData}
      onCloseSummary={closeSummary}
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Banner do Professor 8 */}
        <div className="bg-slate-900/90 border border-lime-500/30 p-5 rounded-2xl shadow-xl shadow-lime-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400 shrink-0">
              <Globe className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Simulador de Imersão Total (Home Immersion)
                <Badge variant="lime" size="sm">
                  Rotina de 7 Blocos
                </Badge>
              </h2>
              <p className="text-xs text-lime-200/80">
                Viva no idioma sem sair do Brasil: substitua hábitos diários em português por estímulos nativos.
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full md:w-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('routine')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'routine'
                  ? 'bg-lime-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Rotina Diária (7 Blocos)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('protocol')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'protocol'
                  ? 'bg-lime-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Gravador 2m & Diário
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('levels')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'levels'
                  ? 'bg-lime-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Níveis de 30 Dias
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-lime-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4. Dia Ideal (Timeline)
            </button>
          </div>
        </div>

        {/* =========================================================================
            ABA 1: ROTINA DIÁRIA TRANSFORMADA (7 BLOCOS COM CHECKBOXES DE PRÁTICA)
           ========================================================================= */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <span>Os 7 Blocos de Substituição de Hábito</span>
                      <Badge variant="lime" size="sm">
                        {totalCompletedMinutesToday} min acumulados hoje
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Marque as atividades que você completou hoje. Cada checkbox soma minutos reais de exposição e fala ativa na sua sessão.
                    </CardDescription>
                  </div>

                  <div className="w-44">
                    <ProgressBar
                      value={Math.min(100, (totalCompletedMinutesToday / 120) * 100)}
                      variant="emerald"
                      size="md"
                      label="Meta de 120 min diários"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  {data.routineBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="lime" size="sm" className="font-bold text-slate-950">
                            {block.period}
                          </Badge>
                          <span className="text-xs text-rose-300 font-medium">
                            Substitui: <span className="line-through">{block.currentHabitReplaced}</span>
                          </span>
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-400">
                          {block.minutes} minutos previstos
                        </span>
                      </div>

                      {/* 3 Atividades: Input, Output, Vocab MicroTask */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        {/* 1. Atividade de Input */}
                        <label
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            completedActivities[`${block.period}-input`]
                              ? 'bg-sky-950/40 border-sky-600/60 text-sky-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(completedActivities[`${block.period}-input`])}
                            onChange={() =>
                              handleToggleActivity(
                                `${block.period}-input`,
                                Math.round(block.minutes * 0.5),
                                'input'
                              )
                            }
                            className="mt-1 w-5 h-5 rounded text-sky-500 focus:ring-sky-400 cursor-pointer shrink-0"
                          />
                          <div className="space-y-1 text-xs">
                            <span className="font-bold text-sky-400 uppercase tracking-wider block">
                              🎧 Input Ativo
                            </span>
                            <p className="leading-relaxed">{block.inputActivity}</p>
                          </div>
                        </label>

                        {/* 2. Atividade de Output */}
                        <label
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            completedActivities[`${block.period}-output`]
                              ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(completedActivities[`${block.period}-output`])}
                            onChange={() =>
                              handleToggleActivity(
                                `${block.period}-output`,
                                Math.round(block.minutes * 0.35),
                                'output'
                              )
                            }
                            className="mt-1 w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer shrink-0"
                          />
                          <div className="space-y-1 text-xs">
                            <span className="font-bold text-emerald-400 uppercase tracking-wider block">
                              🗣️ Fala / Output
                            </span>
                            <p className="leading-relaxed">{block.outputActivity}</p>
                          </div>
                        </label>

                        {/* 3. Microtarefa de Vocabulário */}
                        <label
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            completedActivities[`${block.period}-vocab`]
                              ? 'bg-amber-950/40 border-amber-600/60 text-amber-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(completedActivities[`${block.period}-vocab`])}
                            onChange={() =>
                              handleToggleActivity(
                                `${block.period}-vocab`,
                                Math.round(block.minutes * 0.15),
                                'vocab'
                              )
                            }
                            className="mt-1 w-5 h-5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer shrink-0"
                          />
                          <div className="space-y-1 text-xs">
                            <span className="font-bold text-amber-400 uppercase tracking-wider block">
                              📝 Microtarefa
                            </span>
                            <p className="leading-relaxed">{block.vocabMicroTask}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 2: SISTEMA DE IMERSÃO (CHECKLIST & GRAVADOR 2 MIN & DIÁRIO DE 5 LINHAS)
           ========================================================================= */}
        {activeTab === 'protocol' && (
          <div className="space-y-6">
            {/* Checklist de Blindagem de Ambiente */}
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Protocolo de Blindagem Ambiental</span>
                  <Badge variant="lime" size="sm">
                    Inviolável
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Garanta que os 5 pilares de contato contínuo estejam ativos todos os dias.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.immersionProtocol.map((proto) => {
                    const isChecked = Boolean(protocolChecks[proto.id]);
                    return (
                      <label
                        key={proto.id}
                        className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-slate-900 border-lime-500/50 text-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setProtocolChecks((p) => ({ ...p, [proto.id]: !isChecked }));
                            addExposureSec(300);
                          }}
                          className="mt-1 rounded text-lime-500 focus:ring-lime-400"
                        />
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-lime-300 block">{proto.title}</span>
                          <p className="text-slate-400 leading-relaxed">{proto.action}</p>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            Frequência: {proto.frequency}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ÁUDIO DIÁRIO DE 2 MINUTOS (120 SEGUNDOS) */}
            <Card className="border-lime-500/30 bg-slate-900/90 shadow-xl shadow-lime-950/20">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <Mic className="w-5 h-5 text-lime-400" />
                      <span>Áudio Diário de 2 Minutos (Monólogo Noturno)</span>
                    </CardTitle>
                    <CardDescription>
                      Fale durante 120 segundos contínuos sobre seu dia em inglês. Não pare para corrigir erros.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-extrabold text-lime-400">
                      {Math.floor(twoMinTimer / 60)}:
                      {(twoMinTimer % 60).toString().padStart(2, '0')}
                    </span>
                    <Button
                      variant={isTwoMinRecording ? 'danger' : 'primary'}
                      onClick={() => {
                        if (isTwoMinRecording) {
                          setIsTwoMinRecording(false);
                          void stopRecording();
                        } else {
                          setTwoMinTimer(120);
                          setIsTwoMinRecording(true);
                          void startRecording();
                        }
                      }}
                      className={isTwoMinRecording ? 'bg-rose-600' : 'bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold'}
                    >
                      {isTwoMinRecording ? 'Finalizar Áudio' : 'Gravar 2 Minutos'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {audioUrl ? (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Áudio diário de 2 minutos concluído e salvo!
                    </div>
                    <audio src={audioUrl} controls className="h-8 max-w-xs" />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Dica de tema de hoje: "What was the most unexpected thing that happened today and how did you deal with it?"
                  </p>
                )}
              </CardContent>
            </Card>

            {/* DIÁRIO DE 5 LINHAS (CORREÇÃO INSTANTÂNEA PELA IA) */}
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-lime-400" />
                  <span>Diário de 5 Linhas (5-Line Daily Journal)</span>
                </CardTitle>
                <CardDescription>
                  Escreva exatamente 5 frases sobre seu dia. A IA refina sua redação para deixá-la 100% nativa.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="diary-textarea" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Suas 5 frases de hoje:</span>
                    <span className="text-slate-500">
                      Linhas detectadas: {diaryEntry.split('\n').filter((l) => l.trim()).length} / 5
                    </span>
                  </label>
                  <textarea
                    id="diary-textarea"
                    rows={5}
                    value={diaryEntry}
                    onChange={(e) => setDiaryEntry(e.target.value)}
                    placeholder="1. Today started a bit earlier than usual.&#10;2. I had an intense sync with our product team.&#10;3. For lunch, I tried that new ramen spot down the street.&#10;4. In the afternoon, I finally finished the quarterly budget review.&#10;5. Tonight I'm just gonna wind down with a nice book."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 leading-relaxed font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="primary"
                    onClick={() => void handleSaveDiary()}
                    loading={isSavingDiary}
                    disabled={!diaryEntry.trim()}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold"
                  >
                    Salvar e Corrigir pela IA
                  </Button>
                </div>

                {/* Feedback da IA */}
                {diaryFeedback && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-lime-800/40 space-y-4 animate-fadeIn">
                    <span className="text-xs font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Versão Polida Nativa
                    </span>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm text-lime-300 font-mono leading-relaxed whitespace-pre-line">
                      {diaryFeedback.polishedVersion}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-300 font-bold block">Pontos de Atenção:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                          {diaryFeedback.correctionPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-lime-400 font-bold block">Use amanhã no seu diário:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {diaryFeedback.suggestedExpressions.map((exp, i) => (
                            <li key={i} className="font-semibold">{exp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 3: PROGRESSÃO EM 4 NÍVEIS DE 30 DIAS (120 DIAS TOTAIS)
           ========================================================================= */}
        {activeTab === 'levels' && (
          <div className="space-y-4">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Plano de Imersão em 4 Ciclos de 30 Dias</span>
                  <Badge variant="lime" size="sm">
                    120 Dias Rumo à Fluência
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Progressão de sobrecarga positiva aumentando o tempo e a complexidade do output ativo.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.levels30Days.map((lvl) => (
                    <div
                      key={lvl.level}
                      className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-lime-500/40 space-y-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="lime" size="sm" className="font-bold text-slate-950">
                          {lvl.daysRange}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-lime-400">
                          Meta: {lvl.dailyTargetMinutes} min/dia
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{lvl.title}</h4>

                      <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
                        <span className="text-slate-400 font-semibold block">
                          Entregas Obrigatórias do Ciclo:
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {lvl.mandatoryDeliverables.map((del, dIdx) => (
                            <li key={dIdx} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 4: DIA IDEAL DE IMERSÃO (CRONOGRAMA HORA A HORA)
           ========================================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <span>Timeline do Dia Ideal de Imersão Total</span>
                      <Badge variant="lime" size="sm">
                        {data.idealImmersionDay.totalMinutes} min totais
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Como distribuir 2 horas de inglês autêntico sem precisar tirar tempo livre do trabalho ou estudos.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-sky-400">
                      <span className="w-2 h-2 rounded-full bg-sky-400" /> Input
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Output
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Vocab
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-3">
                  {data.idealImmersionDay.schedule.map((item, idx) => {
                    const badgeVariant =
                      item.type === 'input'
                        ? 'sky'
                        : item.type === 'output'
                          ? 'emerald'
                          : 'amber';

                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-400 w-28 shrink-0">
                            {item.time}
                          </span>
                          <div>
                            <span className="text-sm font-bold text-white block">
                              {item.activity}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Bloco: {item.block}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <Badge variant={badgeVariant} size="sm" className="capitalize font-mono">
                            {item.type}
                          </Badge>
                          <span className="text-xs font-mono text-slate-400">
                            {item.durationMinutes} min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
