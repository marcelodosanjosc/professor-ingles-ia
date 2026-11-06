import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ear,
  Play,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Mic,
  MicOff,
  Flame,
  Check,
  FastForward,
  Headphones,
  RefreshCw,
} from 'lucide-react';
import {
  LISTENING_CONTENTS,
  type ListeningSessionData,
} from '@fluencialab/shared';
import { useTeacherSession } from '../../hooks/useTeacherSession';
import { useSpeech } from '../../hooks/useSpeech';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { apiFetch } from '../../lib/api';

const DEFAULT_LISTENING_DATA: ListeningSessionData = {
  contentType: 'series',
  levels: [
    {
      level: 1,
      title: 'Nível 1: Frase curta com contração básica',
      phrase: "I'm gonna grab a cup of coffee.",
      translation: 'Vou pegar uma xícara de café.',
      phoneticBreakdown: '/aɪm ˈɡənə ɡræb ə kʌp əv ˈkɔfi/',
      reductionsAndLinks: [
        {
          written: 'going to',
          spokenAs: 'gonna',
          explanation: 'Redução informal comum onde "going to" vira som único /ˈɡənə/.',
        },
        {
          written: 'cup of',
          spokenAs: 'cup-a',
          explanation: 'Ligação de consoante final com vogal; o "of" é reduzido a schwa /ə/.',
        },
      ],
    },
    {
      level: 2,
      title: 'Nível 2: Pergunta casual com elisão de pronome',
      phrase: 'What do you wanna do tonight?',
      translation: 'O que você quer fazer hoje à noite?',
      phoneticBreakdown: '/ˈwʌdəjə ˈwɑnə du təˈnaɪt/',
      reductionsAndLinks: [
        {
          written: 'What do you',
          spokenAs: 'Whaddya / Whatcha',
          explanation: 'O "t" de what vira flap e funde com "do you", soando /ˈwʌdəjə/.',
        },
        {
          written: 'want to',
          spokenAs: 'wanna',
          explanation: 'Redução padrão em fala rápida quando seguido de verbo na base.',
        },
        {
          written: 'tonight',
          spokenAs: 'tuh-night',
          explanation: 'A primeira sílaba é átona reduzida para schwa /tə/.',
        },
      ],
    },
    {
      level: 3,
      title: 'Nível 3: Ligação de consoante com vogal e flap T',
      phrase: 'Could you pick it up a little bit later?',
      translation: 'Você poderia pegar isso um pouco mais tarde?',
      phoneticBreakdown: '/kʊdʒu pɪk ɪt ʌp ə ˈlɪtl bɪt ˈleɪtər/',
      reductionsAndLinks: [
        {
          written: 'Could you',
          spokenAs: 'Couldja',
          explanation: 'Fusão palatal entre o som /d/ e /j/, gerando som de "dj" /dʒ/.',
        },
        {
          written: 'pick it up',
          spokenAs: 'pikitup',
          explanation: 'Conexão tripla contínua sem pausas entre as palavras.',
        },
        {
          written: 'little bit later',
          spokenAs: 'liddle bit lay-der',
          explanation: 'Dois flaps T intervocálicos soando como o "r" suave do português ("caro").',
        },
      ],
    },
    {
      level: 4,
      title: 'Nível 4: Verbos modais no passado (Have swallowed)',
      phrase: 'I should have told him about that earlier.',
      translation: 'Eu deveria ter contado a ele sobre isso mais cedo.',
      phoneticBreakdown: '/aɪ ˈʃʊdəv toʊld ɪm əˈbaʊt ðæt ˈɜrliər/',
      reductionsAndLinks: [
        {
          written: 'should have',
          spokenAs: "should've / shoulda",
          explanation: 'O "have" perde o som /h/ e a vogal vira schwa: /ˈʃʊdə/.',
        },
        {
          written: 'told him',
          spokenAs: 'told-im',
          explanation: 'O "h" do pronome him desaparece completamente na fala rápida.',
        },
      ],
    },
    {
      level: 5,
      title: 'Nível 5: Diálogo rápido com elisão dupla e ritmo natural nativo',
      phrase: "He wouldn't have let them know if he didn't have to.",
      translation: 'Ele não teria deixado eles saberem se não precisasse.',
      phoneticBreakdown: '/hi ˈwʊdənt əv lɛt əm noʊ ɪf hi ˈdɪdənt hæv tu/',
      reductionsAndLinks: [
        {
          written: "wouldn't have",
          spokenAs: "wouldn't-av",
          explanation: 'Negação modal rápida com queda do /h/.',
        },
        {
          written: 'let them',
          spokenAs: 'let-em',
          explanation: 'O som "th" de them desaparece após o stop T, ficando apenas /əm/.',
        },
        {
          written: "didn't have",
          spokenAs: "didn-have",
          explanation: 'O segundo "d/t" de didn\'t é glotralizado antes do /h/.',
        },
      ],
    },
  ],
  shadowingSentences: [
    {
      id: 'sh-1',
      phrase: "I don't know what you're talking about.",
      rhythmTip: 'Enfatize "know" e "talk-", deixe o resto correr em ritmo contínuo.',
      swallowedSound: 'O "t" de "don\'t" e de "what" não é estourado (stop T mudo).',
    },
    {
      id: 'sh-2',
      phrase: 'Give it to me when you get a chance.',
      rhythmTip: '"Giv-it-tuh-me" soa como uma única palavra de 4 sílabas.',
      swallowedSound: '"to" vira "tuh" e "get a" vira "gedda".',
    },
    {
      id: 'sh-3',
      phrase: "Let's see what happens next.",
      rhythmTip: 'Mantenha o tom ascendente em "see" e descendente firme em "next".',
      swallowedSound: 'O "t" de "what" emenda direto no som "h" de "happens".',
    },
    {
      id: 'sh-4',
      phrase: 'Are you gonna come with us or not?',
      rhythmTip: 'Suba o tom no final na pergunta de escolha.',
      swallowedSound: '"with us" vira "with-us" com som de "th" conectado ao "u".',
    },
    {
      id: 'sh-5',
      phrase: 'We might as well leave right now.',
      rhythmTip: 'Bloco rítmico: "We-migh-taz-well" em pulso único.',
      swallowedSound: 'Queda do "t" em "right now" para facilitar a transição nasal.',
    },
    {
      id: 'sh-6',
      phrase: "I can't believe how fast time flies.",
      rhythmTip: 'Contraste longo em "can\'t" e explosão rápida em "fast".',
      swallowedSound: 'O "t" final de "fast" é omitido antes do "t" de "time".',
    },
    {
      id: 'sh-7',
      phrase: 'Take your time and think it over.',
      rhythmTip: 'Pausa mínima entre "time" e "and", mas conexão total em "think-it-over".',
      swallowedSound: '"think it over" vira "thin-ki-to-ver".',
    },
    {
      id: 'sh-8',
      phrase: 'How long has this been going on?',
      rhythmTip: 'Foco na pergunta: "How long" com acento no "on" ao final.',
      swallowedSound: 'O "has" vira apenas som /z/ conectado ao "this".',
    },
    {
      id: 'sh-9',
      phrase: "It doesn't make any sense at all.",
      rhythmTip: 'Cadência descendente: "make-any-sen-sat-all".',
      swallowedSound: 'Três conexões: "make-any", "sense-at", "at-all".',
    },
    {
      id: 'sh-10',
      phrase: "She's been waiting for you all morning.",
      rhythmTip: 'Pulso rítmico em "wait-" e "morn-".',
      swallowedSound: '"for you" vira "fer-ya" em fala ultra rápida.',
    },
  ],
  dailyRoutine15Min: [
    {
      minutes: 3,
      step: 'Bloco 1: Aquecimento com Áudio Puro (Sem Texto)',
      instruction: 'Ouça o trecho 3 vezes sem olhar nenhuma legenda para forçar o ouvido.',
    },
    {
      minutes: 4,
      step: 'Bloco 2: Ditado Ativo',
      instruction: 'Escreva exatamente o que escutou. Não deduza: anote apenas os sons que captou.',
    },
    {
      minutes: 4,
      step: 'Bloco 3: Mapeamento de Sons Conectados',
      instruction: 'Compare o que você escreveu com o original. Identifique onde as palavras se uniram.',
    },
    {
      minutes: 4,
      step: 'Bloco 4: Shadowing em 3 Velocidades',
      instruction: 'Fale junto com o áudio nativo em 0.85x, 1.0x e 1.15x até igualar o ritmo.',
    },
  ],
};

export function ListeningPage() {
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
  } = useTeacherSession('listening');

  // Controle de conteúdo e dados
  const [selectedContent, setSelectedContent] = useState<string>('series');
  const [sessionData, setSessionData] = useState<ListeningSessionData>(DEFAULT_LISTENING_DATA);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Nível atual (1 a 5)
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  // Ditado do aluno
  const [userTranscript, setUserTranscript] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [checkScore, setCheckScore] = useState<number | null>(null);
  const [isCheckingDictation, setIsCheckingDictation] = useState(false);

  // Velocidade do player de nível
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Checklist da rotina de 15 min
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Shadowing ativo
  const [activeShadowingId, setActiveShadowingId] = useState<string>('sh-1');
  const [shadowingSpeeds, setShadowingSpeeds] = useState<Record<string, number>>({
    'sh-1': 1.0,
  });

  // Hooks de fala e áudio
  const { speak, stopSpeaking, isSpeaking, startListening, stopListening, isListening, transcript } =
    useSpeech({
      defaultLang: 'en-US',
      onExposureSec: addExposureSec,
      onSpeakingSec: addSpeakingSec,
    });

  const {
    startRecording,
    stopRecording,
    isRecording,
    audioUrl,
  } = useAudioRecorder();

  // Carrega conteúdo da API quando o tipo mudar
  const loadContent = useCallback(
    async (contentType: string) => {
      setIsLoadingContent(true);
      setContentError(null);
      try {
        const response = await apiFetch<{ data: ListeningSessionData }>('/api/teacher/listening', {
          method: 'POST',
          body: JSON.stringify({
            action: 'load',
            payload: { contentType },
          }),
        });
        if (response?.data?.levels?.length) {
          setSessionData(response.data);
          setCurrentLevelIndex(0);
          setUserTranscript('');
          setHasChecked(false);
        }
      } catch {
        // Fallback robusto para os dados padrões
        setSessionData((prev) => ({
          ...prev,
          contentType,
        }));
      } finally {
        setIsLoadingContent(false);
      }
    },
    []
  );

  // Atualiza transcrição se vier de reconhecimento de voz
  useEffect(() => {
    if (transcript && isListening) {
      setUserTranscript(transcript);
    }
  }, [transcript, isListening]);

  const currentLevel =
    (sessionData.levels[currentLevelIndex] ??
    sessionData.levels[0] ??
    DEFAULT_LISTENING_DATA.levels[0])!;

  // Cálculo de acerto de ditado (palavra por palavra)
  const dictationDiff = useMemo(() => {
    if (!currentLevel) return { score: 0, words: [] };

    const clean = (str: string) =>
      str
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '')
        .trim();

    const targetWords = currentLevel.phrase.split(/\s+/);
    const userWords = userTranscript.split(/\s+/).map(clean);

    let matchedCount = 0;
    const wordsWithStatus = targetWords.map((origWord) => {
      const cleaned = clean(origWord);
      const isMatched = userWords.includes(cleaned);
      if (isMatched) matchedCount++;
      return {
        word: origWord,
        matched: isMatched,
      };
    });

    const score = Math.round((matchedCount / Math.max(1, targetWords.length)) * 100);
    return { score, words: wordsWithStatus };
  }, [currentLevel, userTranscript]);

  const handlePlayLevelPhrase = (speed = playbackSpeed) => {
    if (!currentLevel) return;
    setPlaybackSpeed(speed);
    speak(currentLevel.phrase, 'en-US', speed);
    addExposureSec(3);
  };

  const handleCheckDictation = async () => {
    if (!userTranscript.trim()) return;
    setIsCheckingDictation(true);

    try {
      const res = await apiFetch<{ score: number }>('/api/teacher/listening', {
        method: 'POST',
        body: JSON.stringify({
          action: 'check_dictation',
          payload: {
            level: currentLevel.level,
            userTranscript,
            targetPhrase: currentLevel.phrase,
          },
        }),
      });
      setCheckScore(res.score ?? dictationDiff.score);
    } catch {
      // Local score fallback
      setCheckScore(dictationDiff.score);
    } finally {
      setHasChecked(true);
      setIsCheckingDictation(false);
      addWordsRecalled(dictationDiff.words.filter((w) => w.matched).length);
    }
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < sessionData.levels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setUserTranscript('');
      setHasChecked(false);
      setCheckScore(null);
      stopSpeaking();
    }
  };

  const handleToggleRoutineStep = (index: number, minutes: number) => {
    const nextState = !completedSteps[index];
    setCompletedSteps((prev) => ({ ...prev, [index]: nextState }));
    if (nextState) {
      addExposureSec(minutes * 60);
    }
  };

  const totalRoutineMinutesDone = useMemo(() => {
    return sessionData.dailyRoutine15Min.reduce((acc, step, idx) => {
      return acc + (completedSteps[idx] ? step.minutes : 0);
    }, 0);
  }, [sessionData.dailyRoutine15Min, completedSteps]);

  const selectOptions = LISTENING_CONTENTS.map((c) => ({
    value: c.id,
    label: c.label,
  }));

  return (
    <TeacherLayout
      teacherId="listening"
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
        {/* Banner de Contexto e Seletor de Mídia */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-amber-500/30 p-5 rounded-2xl shadow-xl shadow-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Ear className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Treinador de Ouvido (Fast Speech Decoder)
                <Badge variant="amber" size="sm">
                  5 Níveis Progressivos
                </Badge>
              </h2>
              <p className="text-xs text-amber-200/80">
                Aprenda a decodificar o inglês falado na velocidade real, com reduções e sons engolidos.
              </p>
            </div>
          </div>

          <div className="w-full md:w-64">
            <label htmlFor="content-type-select" className="sr-only">
              Tipo de Conteúdo Auditivo
            </label>
            <Select
              id="content-type-select"
              options={selectOptions}
              value={selectedContent}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedContent(val);
                void loadContent(val);
              }}
              disabled={isLoadingContent}
              leftIcon={<Headphones className="w-4 h-4 text-amber-400" />}
            />
          </div>
        </div>

        {contentError && (
          <ErrorState
            title="Não foi possível carregar os exercícios"
            message={contentError}
            onRetry={() => void loadContent(selectedContent)}
          />
        )}

        {/* NAVEGAÇÃO DOS 5 NÍVEIS PROGRESSIVOS */}
        <Card className="border-slate-800">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Sessão de Decodificação Progressiva</span>
                  <Badge variant="amber" size="sm">
                    Nível {currentLevel.level} de 5
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Sem artificialidade: ouça em velocidade natural, digite o que entendeu e veja as conexões de som.
                </CardDescription>
              </div>

              {/* Indicadores de Nível */}
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Níveis de dificuldade">
                {sessionData.levels.map((lvl, idx) => {
                  const isActive = idx === currentLevelIndex;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setCurrentLevelIndex(idx);
                        setUserTranscript('');
                        setHasChecked(false);
                        setCheckScore(null);
                        stopSpeaking();
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60 scale-105'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60'
                      }`}
                    >
                      {lvl.level}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* ETAPA 1: CONTROLES DE ÁUDIO */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Passo 1: Escuta Ativa
                </span>
                <span className="text-xs text-slate-400">
                  {currentLevel.title}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => handlePlayLevelPhrase(1.0)}
                  disabled={isSpeaking}
                  leftIcon={<Play className="w-4 h-4 fill-current" />}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-amber-400/40 shadow-amber-950/40"
                >
                  Ouvir em 1.0x (Natural)
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => handlePlayLevelPhrase(1.15)}
                  disabled={isSpeaking}
                  leftIcon={<FastForward className="w-4 h-4" />}
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  Ouvir em 1.15x (Nativo Rápido)
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handlePlayLevelPhrase(playbackSpeed)}
                  disabled={isSpeaking}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  size="sm"
                >
                  Repetir
                </Button>

                {isSpeaking && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-medium animate-pulse ml-auto">
                    <Volume2 className="w-4 h-4" />
                    Tocando áudio...
                  </div>
                )}
              </div>
            </div>

            {/* ETAPA 2: CAMPO DE DITADO (DIGITAÇÃO OU VOZ) */}
            <div className="space-y-3">
              <label
                htmlFor="dictation-input"
                className="text-sm font-semibold text-slate-200 flex items-center justify-between"
              >
                <span>Passo 2: O que você ouviu? (Digite ou use a voz)</span>
                <span className="text-xs text-slate-400 font-normal">
                  Não deduza pela gramática; registre apenas os sons que seu cérebro captou.
                </span>
              </label>

              <div className="relative">
                <textarea
                  id="dictation-input"
                  rows={3}
                  value={userTranscript}
                  onChange={(e) => setUserTranscript(e.target.value)}
                  placeholder="Ex: I'm gonna grab a cup of coffee..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening('en-US');
                      }
                    }}
                    title={isListening ? 'Parar gravação de voz' : 'Ditar por voz'}
                    aria-label={isListening ? 'Parar gravação de voz' : 'Ditar por voz'}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Ouvindo...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Ditar por voz</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de Verificação */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="primary"
                  onClick={() => void handleCheckDictation()}
                  loading={isCheckingDictation}
                  disabled={!userTranscript.trim()}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                >
                  Verificar e Revelar
                </Button>

                {hasChecked && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Precisão da Decodificação:</span>
                    <Badge
                      variant={
                        (checkScore ?? dictationDiff.score) >= 80
                          ? 'success'
                          : (checkScore ?? dictationDiff.score) >= 50
                            ? 'warning'
                            : 'danger'
                      }
                      size="md"
                    >
                      {checkScore ?? dictationDiff.score}% de acerto
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* ETAPA 3: REVELAÇÃO DA FRASE E DIFERENCIAÇÃO DE PALAVRAS */}
            {hasChecked && (
              <div className="space-y-6 pt-4 border-t border-slate-800 animate-fadeIn">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Frase Original Revelada
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(currentLevel.phrase, 'en-US', 1.0)}
                      className="text-xs text-amber-300 hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Ouvir novamente
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-lg md:text-xl font-bold text-white flex flex-wrap gap-2 items-center">
                      {dictationDiff.words.map((item, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-lg transition-colors ${
                            item.matched
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800/80 line-through'
                          }`}
                          title={item.matched ? 'Palavra captada com sucesso' : 'Palavra não detectada no seu ditado'}
                        >
                          {item.word}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-slate-300 font-medium">
                      Tradução: <span className="text-white">{currentLevel.translation}</span>
                    </p>

                    <p className="text-xs text-amber-200/90 font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800 inline-block">
                      Fonética aproximada: {currentLevel.phoneticBreakdown}
                    </p>
                  </div>
                </div>

                {/* ETAPA 4: REDUÇÕES, CONTRAÇÕES E LIGAÇÕES (LINKING) */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Por que você não entendeu de primeira? (Anatomia do Som Conectado)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentLevel.reductionsAndLinks.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/40 rounded-xl p-4 space-y-2 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {item.written}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-sm font-bold text-amber-300 font-mono">
                              {item.spokenAs}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => speak(item.spokenAs, 'en-US', 1.0)}
                            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Ouvir som reduzido"
                            aria-label={`Ouvir como soa ${item.spokenAs}`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ETAPA 5: BOTÃO PARA AVANÇAR DE NÍVEL */}
                <div className="flex items-center justify-end pt-2">
                  {currentLevelIndex < sessionData.levels.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={handleNextLevel}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                    >
                      Avançar para o Nível {currentLevelIndex + 2}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Todos os 5 níveis concluídos!
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => setCurrentLevelIndex(0)}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                        size="sm"
                      >
                        Reiniciar do Nível 1
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* EXERCÍCIO DE SHADOWING COM 10 FRASES */}
        <Card className="border-slate-800">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Laboratório de Shadowing em 3 Velocidades</span>
                  <Badge variant="amber" size="sm">
                    10 Frases de Treino
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Fale por cima do nativo (shadowing) ajustando o ritmo até colar sua fala com a dele.
                </CardDescription>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Velocidades progressivas: 0.85x → 1.0x → 1.15x
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {sessionData.shadowingSentences.map((item, index) => {
                const isActive = activeShadowingId === item.id;
                const speed = shadowingSpeeds[item.id] ?? 1.0;

                return (
                  <div
                    key={item.id}
                    className={`border rounded-2xl p-4 transition-all ${
                      isActive
                        ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-950/20'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            #{index + 1}
                          </span>
                          <p className="text-base font-bold text-white tracking-wide">
                            "{item.phrase}"
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-amber-200/90 bg-amber-950/40 border border-amber-800/50 px-2.5 py-0.5 rounded-lg">
                            Ritmo: {item.rhythmTip}
                          </span>
                          <span className="text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-lg">
                            Som engolido: {item.swallowedSound}
                          </span>
                        </div>
                      </div>

                      {/* Controles de velocidade e prática */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
                          {[0.85, 1.0, 1.15].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setShadowingSpeeds((prev) => ({ ...prev, [item.id]: s }));
                                setActiveShadowingId(item.id);
                                speak(item.phrase, 'en-US', s);
                                addExposureSec(3);
                              }}
                              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                speed === s && isActive
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {s === 0.85 ? '0.85x' : s === 1.0 ? '1.0x' : '1.15x'}
                            </button>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setActiveShadowingId(item.id);
                            speak(item.phrase, 'en-US', speed);
                            addExposureSec(3);
                          }}
                          leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                        >
                          Tocar
                        </Button>

                        <Button
                          size="sm"
                          variant={isRecording && isActive ? 'danger' : 'ghost'}
                          onClick={() => {
                            setActiveShadowingId(item.id);
                            if (isRecording) {
                              void stopRecording();
                              addSpeakingSec(4);
                            } else {
                              void startRecording();
                              speak(item.phrase, 'en-US', speed);
                            }
                          }}
                          leftIcon={<Mic className="w-3.5 h-3.5" />}
                        >
                          {isRecording && isActive ? 'Gravando...' : 'Falar Junto'}
                        </Button>
                      </div>
                    </div>

                    {audioUrl && isActive && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-400">Sua gravação de Shadowing:</span>
                        <audio src={audioUrl} controls className="h-8 max-w-xs" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* TREINO DIÁRIO DE 15 MINUTOS (CHECKLIST COM BLOCOS DE TEMPO) */}
        <Card className="border-slate-800">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Protocolo Diário de 15 Minutos de Ouvido</span>
                  <Badge variant="amber" size="sm">
                    {totalRoutineMinutesDone} / 15 min concluídos
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Rotina rápida para fazer todos os dias e treinar seu ouvido para o inglês da vida real.
                </CardDescription>
              </div>

              <div className="w-40">
                <ProgressBar
                  value={(totalRoutineMinutesDone / 15) * 100}
                  variant="amber"
                  size="md"
                  label="Progresso da rotina"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-3">
              {sessionData.dailyRoutine15Min.map((step, idx) => {
                const isDone = Boolean(completedSteps[idx]);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                      isDone
                        ? 'bg-slate-900/60 border-amber-500/40 text-slate-300'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleRoutineStep(idx, step.minutes)}
                      className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-700 bg-slate-900"
                    />

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                          {step.step}
                        </span>
                        <Badge variant="default" size="sm">
                          {step.minutes} min
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.instruction}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}
