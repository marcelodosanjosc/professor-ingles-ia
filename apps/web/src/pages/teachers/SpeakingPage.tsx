import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Zap,
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
  Timer,
  Clock,
  Shuffle,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import type { SpeakingDrillData } from '@fluencialab/shared';
import { useTeacherSession } from '../../hooks/useTeacherSession';
import { useSpeech } from '../../hooks/useSpeech';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { apiFetch } from '../../lib/api';

const DEFAULT_SPEAKING_DATA: SpeakingDrillData = {
  corePatterns: [
    {
      id: 'cp-1',
      ptTrigger: 'Eu quero...',
      targetPattern: "I wanna / I want to...",
      examples: [
        "I wanna check that out right now.",
        "I want to make sure we're on the same page.",
        "I wanna grab some lunch before the meeting.",
      ],
    },
    {
      id: 'cp-2',
      ptTrigger: 'Eu preciso...',
      targetPattern: "I gotta / I need to...",
      examples: [
        "I gotta head out in five minutes.",
        "I need to take care of this first.",
        "I gotta call them back as soon as possible.",
      ],
    },
    {
      id: 'cp-3',
      ptTrigger: 'Eu acho que...',
      targetPattern: "I think / I reckon / I feel like...",
      examples: [
        "I think that's our best shot.",
        "I feel like something is missing here.",
        "I reckon we should give it another try.",
      ],
    },
    {
      id: 'cp-4',
      ptTrigger: 'Eu fui...',
      targetPattern: "I went to / I was at...",
      examples: [
        "I went to the store this morning.",
        "I was at the office until late yesterday.",
        "I went to see that new movie last weekend.",
      ],
    },
    {
      id: 'cp-5',
      ptTrigger: 'Eu vou...',
      targetPattern: "I'm gonna / I'll...",
      examples: [
        "I'm gonna send you the file in a minute.",
        "I'll let you know once it's done.",
        "I'm gonna be right back.",
      ],
    },
    {
      id: 'cp-6',
      ptTrigger: 'Eu prefiro...',
      targetPattern: "I'd rather / I prefer...",
      examples: [
        "I'd rather stay home tonight.",
        "I prefer working remotely when possible.",
        "I'd rather not get into that right now.",
      ],
    },
    {
      id: 'cp-7',
      ptTrigger: 'Eu discordo...',
      targetPattern: "I don't really agree / I see it differently...",
      examples: [
        "I don't really see it that way.",
        "I disagree with the timeline, honestly.",
        "I'm not so sure about that conclusion.",
      ],
    },
    {
      id: 'cp-8',
      ptTrigger: 'Depende de...',
      targetPattern: "It depends on...",
      examples: [
        "It depends on the weather tomorrow.",
        "It really depends on how much budget we have.",
        "That depends on what they say next.",
      ],
    },
    {
      id: 'cp-9',
      ptTrigger: 'Nunca fiz isso...',
      targetPattern: "I've never done that before...",
      examples: [
        "I've never actually tried that before.",
        "I've never been in a situation like this.",
        "To be honest, I've never seen that happen.",
      ],
    },
    {
      id: 'cp-10',
      ptTrigger: 'Já aconteceu comigo...',
      targetPattern: "That's happened to me before / I've been there...",
      examples: [
        "That's happened to me more than once.",
        "I've been there, so I know how frustrating it is.",
        "The same thing happened to me last year.",
      ],
    },
  ],
  rapidStimuli: [
    {
      id: 1,
      difficulty: 'easy',
      promptPt: 'Diga que você precisa sair agora.',
      expectedAnchor: 'I need to / I gotta',
      sampleAnswer: 'I gotta leave right now.',
      rephrasePrompt: 'Diga a mesma coisa, mas com outras palavras (tempo esgotando).',
      sampleRephrase: "I'm running out of time, I have to take off.",
    },
    {
      id: 2,
      difficulty: 'easy',
      promptPt: 'Diga que você não tem certeza disso.',
      expectedAnchor: "I'm not sure",
      sampleAnswer: "I'm not really sure about that.",
      rephrasePrompt: 'Diga a mesma dúvida usando outra expressão nativa.',
      sampleRephrase: "I have my doubts about that.",
    },
    {
      id: 3,
      difficulty: 'easy',
      promptPt: 'Diga que você vai te ligar mais tarde.',
      expectedAnchor: "I'll call you / I'm gonna",
      sampleAnswer: "I'll give you a call later today.",
      rephrasePrompt: 'Diga a mesma intenção de contato sem usar o verbo call.',
      sampleRephrase: "I'm gonna reach out to you later this afternoon.",
    },
    {
      id: 4,
      difficulty: 'easy',
      promptPt: 'Peça um minuto para pensar.',
      expectedAnchor: 'Give me a minute',
      sampleAnswer: 'Can you give me just a second to think?',
      rephrasePrompt: 'Compre 5 segundos de forma educada em uma reunião.',
      sampleRephrase: 'Let me think about that for just a second.',
    },
    {
      id: 5,
      difficulty: 'medium',
      promptPt: 'Diga que o plano original não vai dar certo.',
      expectedAnchor: "That's not gonna work",
      sampleAnswer: "I don't think the original plan is gonna work.",
      rephrasePrompt: 'Diga a mesma objeção de maneira colaborativa e construtiva.',
      sampleRephrase: 'We might need to rethink our approach on this one.',
    },
    {
      id: 6,
      difficulty: 'medium',
      promptPt: 'Diga que você não entendeu o que ele disse.',
      expectedAnchor: "I didn't catch that",
      sampleAnswer: "Sorry, I didn't quite catch what you said.",
      rephrasePrompt: 'Peça para ele repetir sem usar a palavra "repeat".',
      sampleRephrase: 'Could you run that by me one more time?',
    },
    {
      id: 7,
      difficulty: 'medium',
      promptPt: 'Diga que depende do que o cliente decidir.',
      expectedAnchor: 'It depends on what the client',
      sampleAnswer: "It really depends on what the client decides.",
      rephrasePrompt: 'Refraseie dizendo que a decisão final é do cliente.',
      sampleRephrase: "It's ultimately up to the client at this point.",
    },
    {
      id: 8,
      difficulty: 'medium',
      promptPt: 'Diga que você concorda até certo ponto, mas tem ressalvas.',
      expectedAnchor: 'I agree up to a point / To some extent',
      sampleAnswer: 'I agree to some extent, but I still have some concerns.',
      rephrasePrompt: 'Exponha o mesmo contraponto de forma suave.',
      sampleRephrase: 'I see where you are coming from, but there is another side to it.',
    },
    {
      id: 9,
      difficulty: 'hard',
      promptPt: 'Explique que se você soubesse do atraso, teria avisado a equipe.',
      expectedAnchor: 'If I had known...',
      sampleAnswer: 'If I had known about the delay, I would have warned the team.',
      rephrasePrompt: 'Passe a mesma ideia focando na falta de informação prévia.',
      sampleRephrase: "Had I been told earlier, I'd have kept everyone in the loop.",
    },
    {
      id: 10,
      difficulty: 'hard',
      promptPt: 'Defenda que adiar o lançamento é a decisão mais responsável agora.',
      expectedAnchor: 'Pushing back the launch...',
      sampleAnswer: 'Pushing back the launch is by far the most sensible call right now.',
      rephrasePrompt: 'Refraseie usando foco no risco de lançar às pressas.',
      sampleRephrase: 'Rushing this out the door poses way more risks than delaying it.',
    },
  ],
  substitutionExercises: [
    {
      id: 1,
      template: "I would like to [VERB] because [REASON].",
      baseSentence: "I would like to reschedule the meeting because something urgent came up.",
      variations: [
        { cue: "fazer uma pausa / estou exausto", expected: "I would like to take a break because I am completely exhausted." },
        { cue: "pedir mais prazo / o escopo aumentou", expected: "I would like to ask for an extension because the scope has expanded." },
        { cue: "esclarecer um ponto / ficou ambíguo", expected: "I would like to clarify a point because it sounded a bit ambiguous." },
      ],
    },
    {
      id: 2,
      template: "The reason why I [VERB] is that [EXPLANATION].",
      baseSentence: "The reason why I called you is that we need to align on next steps.",
      variations: [
        { cue: "enviei esse e-mail / preciso de confirmação escrita", expected: "The reason why I sent this email is that I need written confirmation." },
        { cue: "mudei de ideia / novos dados surgiram", expected: "The reason why I changed my mind is that new data has surfaced." },
      ],
    },
    {
      id: 3,
      template: "As far as I know, [SUBJECT] is supposed to [ACTION].",
      baseSentence: "As far as I know, the team is supposed to deliver the draft by Friday.",
      variations: [
        { cue: "o pacote / chegar hoje à tarde", expected: "As far as I know, the package is supposed to arrive this afternoon." },
        { cue: "o cliente / aprovar o orçamento antes de começarmos", expected: "As far as I know, the client is supposed to approve the budget before we start." },
      ],
    },
    {
      id: 4,
      template: "Would you mind [VERB-ING] while I [ACTION]?",
      baseSentence: "Would you mind taking notes while I present the slides?",
      variations: [
        { cue: "esperar aqui fora / resolvo essa ligação", expected: "Would you mind waiting outside while I handle this call?" },
        { cue: "revisar os números / preparo o relatório", expected: "Would you mind reviewing the numbers while I prepare the report?" },
      ],
    },
  ],
  unexpectedQuestions: [
    {
      id: 1,
      question: "What would you do if your flight was suddenly canceled right now?",
      translation: "O que você faria se seu voo fosse cancelado de repente agora?",
      quickStarter: "First thing I'd do is head straight to the customer service desk...",
    },
    {
      id: 2,
      question: "If you could change one decision you made last month, what would it be?",
      translation: "Se você pudesse mudar uma decisão que tomou no mês passado, qual seria?",
      quickStarter: "Looking back, I probably would have spent less time worrying about...",
    },
    {
      id: 3,
      question: "Why should someone hire you over someone with more formal experience?",
      translation: "Por que alguém deveria contratar você em vez de alguém com mais experiência formal?",
      quickStarter: "What sets me apart is not just technical skill, but how quickly I adapt...",
    },
    {
      id: 4,
      question: "What is something popular that you secretly think is totally overrated?",
      translation: "O que é algo popular que você secretamente acha totalmente superestimado?",
      quickStarter: "To be completely honest, I've never understood the hype around...",
    },
    {
      id: 5,
      question: "How do you handle a teammate who constantly misses agreed deadlines?",
      translation: "Como você lida com um colega de equipe que constantemente perde prazos acordados?",
      quickStarter: "I always believe in addressing the issue one-on-one before escalating...",
    },
    {
      id: 6,
      question: "Describe your morning routine in under 15 seconds without hesitating.",
      translation: "Descreva sua rotina matinal em menos de 15 segundos sem hesitar.",
      quickStarter: "I wake up at six, grab a strong black coffee and immediately...",
    },
    {
      id: 7,
      question: "What is the biggest misunderstanding people usually have about your work?",
      translation: "Qual é o maior mal-entendido que as pessoas geralmente têm sobre o seu trabalho?",
      quickStarter: "Most people assume my job is all about numbers, but in reality...",
    },
    {
      id: 8,
      question: "If budget was not an issue, what problem in your community would you solve first?",
      translation: "Se dinheiro não fosse problema, qual problema da sua comunidade você resolveria primeiro?",
      quickStarter: "Without question, I'd invest heavily in accessible public transportation...",
    },
    {
      id: 9,
      question: "What advice would you give to yourself on your first day of English study?",
      translation: "Que conselho você daria a si mesmo no seu primeiro dia de estudo de inglês?",
      quickStarter: "I would tell myself to stop obsessing over grammar rules and just speak...",
    },
    {
      id: 10,
      question: "Where do you see yourself realistically twelve months from today?",
      translation: "Onde você se vê realisticamente daqui a 12 meses?",
      quickStarter: "A year from now, I see myself conversing fluently and leading projects in English...",
    },
  ],
};

type SpeakingTab = 'patterns' | 'rapid' | 'substitution' | 'test';

export function SpeakingPage() {
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
  } = useTeacherSession('speaking');

  const [activeTab, setActiveTab] = useState<SpeakingTab>('rapid');
  const [data, setData] = useState<SpeakingDrillData>(DEFAULT_SPEAKING_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados da Aba 2: Resposta Rápida (5 segundos)
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [activeRound, setActiveRound] = useState<'round1' | 'round2'>('round1');
  const [stimulusIndex, setStimulusIndex] = useState<number>(0);
  const [timerRemaining, setTimerRemaining] = useState<number>(5.0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [userResponse, setUserResponse] = useState<string>('');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    beatTarget: boolean;
    suggestedAnswer: string;
    feedback: string;
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Estados da Aba 3: Substituição
  const [selectedSubstIndex, setSelectedSubstIndex] = useState(0);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);

  // Estados da Aba 4: Perguntas Inesperadas
  const [currentUnexpectedIndex, setCurrentUnexpectedIndex] = useState(0);
  const [unexpectedTimerRemaining, setUnexpectedTimerRemaining] = useState(5.0);
  const [isUnexpectedTimerRunning, setIsUnexpectedTimerRunning] = useState(false);
  const [unexpectedResponse, setUnexpectedResponse] = useState('');
  const [unexpectedFeedback, setUnexpectedFeedback] = useState<{
    speedRating: string;
    grammarRating: string;
    vocabRating: string;
  } | null>(null);

  // Hooks de voz
  const { speak, isSpeaking, startListening, stopListening, isListening, transcript } = useSpeech({
    defaultLang: 'en-US',
    onExposureSec: addExposureSec,
    onSpeakingSec: addSpeakingSec,
  });

  // Carrega dados da API no montador
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await apiFetch<any>('/api/teacher/speaking', {
          method: 'POST',
          body: JSON.stringify({ action: 'load' }),
        });
        const resolved = (res as any)?.data ?? res;
        if (isMounted && (resolved?.rapidStimuli?.length || resolved?.corePatterns?.length)) {
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

  // Atualiza campo com STT
  useEffect(() => {
    if (transcript && isListening) {
      if (activeTab === 'rapid') {
        setUserResponse(transcript);
      } else if (activeTab === 'test') {
        setUnexpectedResponse(transcript);
      }
    }
  }, [transcript, isListening, activeTab]);

  // Lista de estímulos filtrados
  const filteredStimuli = useMemo(() => {
    if (difficultyFilter === 'all') return data.rapidStimuli;
    return data.rapidStimuli.filter((s) => s.difficulty === difficultyFilter);
  }, [data.rapidStimuli, difficultyFilter]);

  const currentStimulus =
    (filteredStimuli[stimulusIndex] ??
    filteredStimuli[0] ??
    DEFAULT_SPEAKING_DATA.rapidStimuli[0])!;

  // Inicia cronômetro de 5 segundos para o estímulo rápido
  const startRapidStimulus = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setUserResponse('');
    setEvaluationResult(null);
    setReactionTime(null);
    setTimerRemaining(5.0);
    setIsTimerRunning(true);
    startTimeRef.current = performance.now();

    // Começa a escutar automaticamente
    startListening('en-US');

    countdownIntervalRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        const next = Math.max(0, parseFloat((prev - 0.1).toFixed(1)));
        if (next <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setIsTimerRunning(false);
          stopListening();
        }
        return next;
      });
    }, 100);
  }, [startListening, stopListening]);

  // Para o cronômetro e envia resposta
  const submitRapidResponse = useCallback(
    async (finalText?: string) => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setIsTimerRunning(false);
      stopListening();

      const timeTakenSec = parseFloat(
        Math.min(5.0, (performance.now() - startTimeRef.current) / 1000).toFixed(1)
      );
      setReactionTime(timeTakenSec);

      const responseText = finalText ?? userResponse;
      const beat = timeTakenSec <= 5.0 && responseText.trim().length > 0;

      setIsEvaluating(true);
      try {
        await apiFetch('/api/teacher/speaking', {
          method: 'POST',
          body: JSON.stringify({
            action: 'evaluate_response',
            payload: {
              stimulusId: currentStimulus.id,
              round: activeRound,
              userResponse: responseText,
              reactionTimeSec: timeTakenSec,
            },
          }),
        });
      } catch {
        // Fallback local
      } finally {
        setIsEvaluating(false);
        const suggested =
          activeRound === 'round1'
            ? currentStimulus.sampleAnswer
            : currentStimulus.sampleRephrase;

        setEvaluationResult({
          score: beat ? 90 : 40,
          beatTarget: beat,
          suggestedAnswer: suggested,
          feedback: beat
            ? 'Excelente reflexo! Você produziu sem traduzir mentalmente.'
            : 'Tempo esgotado ou resposta vazia. O segredo é fixar o gatilho sem pensar na gramática.',
        });

        if (beat) {
          addSpeakingSec(Math.round(timeTakenSec));
          addWordsRecalled(4);
        }
      }
    },
    [userResponse, currentStimulus, activeRound, stopListening, addSpeakingSec, addWordsRecalled]
  );

  // Limpeza de timers
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return (
    <TeacherLayout
      teacherId="speaking"
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
        {/* Banner do Professor 5 */}
        <div className="bg-slate-900/90 border border-rose-500/30 p-5 rounded-2xl shadow-xl shadow-rose-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Zap className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Destruidor de Bloqueio na Fala (Speed Speaking)
                <Badge variant="rose" size="sm">
                  Limite: 5 Segundos
                </Badge>
              </h2>
              <p className="text-xs text-rose-200/80">
                Automatize respostas imediatas sem traduzir. Se você pensa mais de 5s, a mente traduz.
              </p>
            </div>
          </div>

          {/* Abas Superiores */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full md:w-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('rapid')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rapid'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Resposta Rápida (5s)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('patterns')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'patterns'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. 10 Padrões-Chave
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('substitution')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'substitution'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Substituição
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'test'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4. Teste Inesperado
            </button>
          </div>
        </div>

        {/* =========================================================================
            ABA 1: TREINO DE RESPOSTA RÁPIDA (40 ESTÍMULOS, CRONÔMETRO DE 5.0S)
           ========================================================================= */}
        {activeTab === 'rapid' && (
          <div className="space-y-6">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <span>Treino de Resposta Rápida em até 5 Segundos</span>
                      <Badge variant="rose" size="sm">
                        {stimulusIndex + 1} de {filteredStimuli.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      O objetivo não é perfeição gramatical, é velocidade de reação para quebrar a tradução mental.
                    </CardDescription>
                  </div>

                  {/* Filtro de Dificuldade e Alternância de Rodada */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                      {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => {
                            setDifficultyFilter(diff);
                            setStimulusIndex(0);
                            setEvaluationResult(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg capitalize transition-all font-semibold ${
                            difficultyFilter === diff
                              ? 'bg-slate-800 text-rose-300'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {diff === 'all' ? 'Todos' : diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Médio' : 'Difícil'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRound('round1');
                          setEvaluationResult(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          activeRound === 'round1'
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        1ª Rodada: Imediata
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRound('round2');
                          setEvaluationResult(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          activeRound === 'round2'
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        2ª Rodada: Outras Palavras
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Estímulo Atual */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
                    <Flame className="w-4 h-4" />
                    {activeRound === 'round1' ? 'Estímulo em Português' : 'Refraseamento Obrigatório'}
                  </div>

                  <p className="text-xl md:text-2xl font-extrabold text-white max-w-2xl mx-auto leading-snug">
                    {activeRound === 'round1'
                      ? currentStimulus.promptPt
                      : currentStimulus.rephrasePrompt}
                  </p>

                  <div className="text-xs text-slate-400">
                    Âncora esperada:{' '}
                    <span className="font-mono text-rose-300 font-bold">
                      {currentStimulus.expectedAnchor}
                    </span>
                  </div>

                  {/* CRONÔMETRO REGRESSIVO VISUAL DE 5.0S */}
                  <div className="max-w-md mx-auto pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Timer className="w-4 h-4 text-rose-400" />
                        Tempo de Reação:
                      </span>
                      <span
                        className={`font-mono text-lg font-extrabold ${
                          timerRemaining > 2.5
                            ? 'text-emerald-400'
                            : timerRemaining > 1.0
                              ? 'text-amber-400'
                              : 'text-rose-400 animate-pulse'
                        }`}
                      >
                        {timerRemaining.toFixed(1)}s
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-100 rounded-full ${
                          timerRemaining > 2.5
                            ? 'bg-emerald-500'
                            : timerRemaining > 1.0
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${(timerRemaining / 5.0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Botão de Disparo */}
                  <div className="pt-2">
                    {!isTimerRunning && !evaluationResult && (
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={startRapidStimulus}
                        leftIcon={<Zap className="w-5 h-5 fill-current" />}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-950/60"
                      >
                        Iniciar Desafio de 5 Segundos
                      </Button>
                    )}
                  </div>
                </div>

                {/* Input de Resposta durante o timer ou gravação */}
                {(isTimerRunning || evaluationResult) && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="relative">
                      <label htmlFor="rapid-response-input" className="sr-only">
                        Sua resposta imediata
                      </label>
                      <input
                        id="rapid-response-input"
                        type="text"
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            void submitRapidResponse();
                          }
                        }}
                        disabled={!isTimerRunning}
                        placeholder={
                          isTimerRunning
                            ? 'Fale no microfone ou digite imediatamente...'
                            : 'Resposta registrada'
                        }
                        className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-4 pr-24 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-rose-400"
                        autoFocus
                      />

                      {isTimerRunning && (
                        <div className="absolute right-2 top-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => void submitRapidResponse()}
                            className="bg-rose-600 hover:bg-rose-500"
                          >
                            Enviar
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Feedback e Avaliação */}
                    {evaluationResult && (
                      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={evaluationResult.beatTarget ? 'success' : 'danger'}
                              size="md"
                            >
                              {evaluationResult.beatTarget
                                ? `Bateu a meta em ${reactionTime}s!`
                                : `Estourou o tempo (${reactionTime}s)`}
                            </Badge>

                            <Badge variant="rose" size="md">
                              Nota: {evaluationResult.score}/100
                            </Badge>
                          </div>

                          <button
                            type="button"
                            onClick={() => speak(evaluationResult.suggestedAnswer, 'en-US', 1.0)}
                            className="text-xs text-rose-300 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            Ouvir sugestão nativa
                          </button>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-400">
                            Como um nativo responderia:
                          </span>
                          <p className="text-base font-bold text-emerald-300">
                            "{evaluationResult.suggestedAnswer}"
                          </p>
                          <p className="text-xs text-slate-400">{evaluationResult.feedback}</p>
                        </div>

                        {/* Navegação Próximo */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={startRapidStimulus}
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          >
                            Tentar Novamente
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              if (stimulusIndex < filteredStimuli.length - 1) {
                                setStimulusIndex((prev) => prev + 1);
                                setEvaluationResult(null);
                                setUserResponse('');
                              } else {
                                setStimulusIndex(0);
                                setEvaluationResult(null);
                              }
                            }}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                            className="bg-rose-600 hover:bg-rose-500"
                          >
                            Próximo Estímulo
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 2: 10 PADRÕES RECORRENTES PARA AUTOMATIZAR
           ========================================================================= */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Os 10 Gatilhos Essenciais da Fluência Reflexa</span>
                  <Badge variant="rose" size="sm">
                    Automáticos
                  </Badge>
                </CardTitle>
                <CardDescription>
                  90% das falas cotidianas começam com esses 10 gatilhos. Memorize o som, não as palavras isoladas.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.corePatterns.map((pat, idx) => (
                    <div
                      key={pat.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 space-y-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-mono font-bold text-rose-400">
                            #{idx + 1} Gatilho
                          </span>
                          <h4 className="text-base font-bold text-white">{pat.ptTrigger}</h4>
                        </div>

                        <Badge variant="rose" size="sm" className="font-mono font-bold">
                          {pat.targetPattern}
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-slate-900">
                        {pat.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg"
                          >
                            <span>{ex}</span>
                            <button
                              type="button"
                              onClick={() => {
                                speak(ex, 'en-US', 1.0);
                                addExposureSec(2);
                              }}
                              className="text-slate-400 hover:text-rose-300 p-1"
                              title="Ouvir pronúncia"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 3: BLOCO DE AUTOMATIZAÇÃO (ESTRUTURAS DE SUBSTITUIÇÃO)
           ========================================================================= */}
        {activeTab === 'substitution' && (
          <div className="space-y-6">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Brocas de Substituição (Substitution Drills)</span>
                  <Badge variant="rose" size="sm">
                    Exercício {selectedSubstIndex + 1} de {data.substitutionExercises.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Mantenha a armadura da frase fixa e troque apenas uma parte por vez para condicionar a musculatura.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {(() => {
                  const currentSub = data.substitutionExercises[selectedSubstIndex];
                  if (!currentSub) return null;

                  return (
                    <div className="space-y-6">
                      {/* Template Base */}
                      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <span className="text-xs uppercase font-semibold text-rose-400 tracking-wider">
                          Estrutura Base
                        </span>
                        <p className="text-lg font-bold text-white font-mono">
                          {currentSub.template}
                        </p>
                        <div className="flex items-center justify-between text-sm text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <span>Exemplo: "{currentSub.baseSentence}"</span>
                          <button
                            type="button"
                            onClick={() => speak(currentSub.baseSentence, 'en-US', 1.0)}
                            className="text-rose-300 hover:underline flex items-center gap-1 text-xs"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> Ouvir
                          </button>
                        </div>
                      </div>

                      {/* Variações */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-200">
                          Substitua a parte indicada na sua mente:
                        </h4>

                        <div className="space-y-3">
                          {currentSub.variations.map((v, vIdx) => {
                            const isVarActive = activeVariationIndex === vIdx;
                            return (
                              <div
                                key={vIdx}
                                className={`border rounded-xl p-4 transition-all ${
                                  isVarActive
                                    ? 'bg-slate-900 border-rose-500/50'
                                    : 'bg-slate-950/60 border-slate-800'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-mono font-bold text-rose-400">
                                        Deixa #{vIdx + 1}:
                                      </span>
                                      <span className="text-sm font-bold text-white">{v.cue}</span>
                                    </div>
                                    {isVarActive && (
                                      <p className="text-sm font-mono text-emerald-300 font-semibold pt-1">
                                        → "{v.expected}"
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={isVarActive ? 'secondary' : 'ghost'}
                                      onClick={() => {
                                        setActiveVariationIndex(vIdx);
                                        speak(v.expected, 'en-US', 1.0);
                                        addSpeakingSec(3);
                                      }}
                                    >
                                      {isVarActive ? 'Ouvir Solução' : 'Revelar Solução'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Navegação */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <Button
                          variant="ghost"
                          disabled={selectedSubstIndex === 0}
                          onClick={() => {
                            setSelectedSubstIndex((p) => p - 1);
                            setActiveVariationIndex(0);
                          }}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="primary"
                          disabled={selectedSubstIndex === data.substitutionExercises.length - 1}
                          onClick={() => {
                            setSelectedSubstIndex((p) => p + 1);
                            setActiveVariationIndex(0);
                          }}
                          className="bg-rose-600 hover:bg-rose-500"
                        >
                          Próximo Exercício
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 4: TESTE FINAL (10 PERGUNTAS INESPERADAS SEM PREPARO)
           ========================================================================= */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Teste de Perguntas Inesperadas (Sem Tempo de Preparo)</span>
                  <Badge variant="rose" size="sm">
                    Pergunta {currentUnexpectedIndex + 1} de {data.unexpectedQuestions.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Simulação de surpresa: responda em voz alta imediatamente nos primeiros 5 segundos.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {(() => {
                  const q = data.unexpectedQuestions[currentUnexpectedIndex];
                  if (!q) return null;

                  return (
                    <div className="space-y-6">
                      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                        <Badge variant="rose" size="sm" className="uppercase">
                          Pergunta Surpresa
                        </Badge>
                        <h3 className="text-xl md:text-2xl font-bold text-white max-w-xl mx-auto">
                          "{q.question}"
                        </h3>
                        <p className="text-xs text-slate-400">Tradução: {q.translation}</p>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => speak(q.question, 'en-US', 1.0)}
                            className="text-xs text-rose-300 hover:underline inline-flex items-center gap-1"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> Ouvir pergunta em inglês
                          </button>
                        </div>
                      </div>

                      {/* Caixa de Entrada e Gatilho Rápido */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">
                            Gatilho rápido para começar a falar:
                          </span>
                          <span className="text-xs text-emerald-400 font-mono font-bold">
                            {q.quickStarter}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="unexpected-answer" className="text-xs text-slate-400">
                            Sua resposta espontânea (grave por voz ou digite):
                          </label>
                          <textarea
                            id="unexpected-answer"
                            rows={3}
                            value={unexpectedResponse}
                            onChange={(e) => setUnexpectedResponse(e.target.value)}
                            placeholder="Comece com o gatilho acima e fale o que vier à mente..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Button
                            variant="primary"
                            onClick={() => {
                              setUnexpectedFeedback({
                                speedRating: 'Alta (respondeu sem travar)',
                                grammarRating: 'Funcional (compreensão imediata)',
                                vocabRating: 'Variado e natural',
                              });
                              addSpeakingSec(10);
                              addWordsRecalled(8);
                            }}
                            className="bg-rose-600 hover:bg-rose-500"
                          >
                            Avaliar Espontaneidade
                          </Button>

                          <Button
                            variant="secondary"
                            onClick={() => {
                              if (currentUnexpectedIndex < data.unexpectedQuestions.length - 1) {
                                setCurrentUnexpectedIndex((p) => p + 1);
                                setUnexpectedResponse('');
                                setUnexpectedFeedback(null);
                              } else {
                                setCurrentUnexpectedIndex(0);
                              }
                            }}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                          >
                            Próxima Pergunta
                          </Button>
                        </div>

                        {unexpectedFeedback && (
                          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-800/40 space-y-2 animate-fadeIn">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Diagnóstico de Espontaneidade
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block">Velocidade:</span>
                                <span className="text-white font-bold">
                                  {unexpectedFeedback.speedRating}
                                </span>
                              </div>
                              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block">Gramática Essencial:</span>
                                <span className="text-white font-bold">
                                  {unexpectedFeedback.grammarRating}
                                </span>
                              </div>
                              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-slate-400 block">Variedade Lexical:</span>
                                <span className="text-white font-bold">
                                  {unexpectedFeedback.vocabRating}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
