import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Mic,
  MicOff,
  Flame,
  Check,
  ChevronRight,
  Clock,
  Eye,
  ShieldAlert,
  HelpCircle,
  Zap,
} from 'lucide-react';
import type { DirectThinkingData } from '@fluencialab/shared';
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

const DEFAULT_DIRECT_THINKING_DATA: DirectThinkingData = {
  stage1Objects: [
    { id: 1, visualCue: '☕', contextHintInTarget: 'Hot, dark liquid made from roasted beans that gives morning energy.', expectedTerms: ['coffee', 'a cup of coffee', 'mug of coffee'] },
    { id: 2, visualCue: '🪟', contextHintInTarget: 'Opening in a wall covered in glass that lets sunlight and fresh air into the room.', expectedTerms: ['window', 'the window'] },
    { id: 3, visualCue: '🔑', contextHintInTarget: 'Small metal object with unique teeth used to lock or unlock your front door.', expectedTerms: ['key', 'keys', 'house key'] },
    { id: 4, visualCue: '💻', contextHintInTarget: 'Portable computer with a screen and keyboard used for daily work and meetings.', expectedTerms: ['laptop', 'computer', 'notebook'] },
    { id: 5, visualCue: '🎧', contextHintInTarget: 'Device placed over or inside your ears to listen to podcasts or music privately.', expectedTerms: ['headphones', 'earphones', 'earbuds', 'headset'] },
    { id: 6, visualCue: '📱', contextHintInTarget: 'Pocket device used to text, make calls, check notifications and browse the web.', expectedTerms: ['smartphone', 'cell phone', 'phone'] },
    { id: 7, visualCue: '🚗', contextHintInTarget: 'Four-wheeled motor vehicle you drive on streets and highways.', expectedTerms: ['car', 'vehicle', 'automobile'] },
    { id: 8, visualCue: '👟', contextHintInTarget: 'Footwear designed for sports, running, or casual comfortable walking.', expectedTerms: ['sneakers', 'running shoes', 'shoes'] },
    { id: 9, visualCue: '🎒', contextHintInTarget: 'Bag with shoulder straps that you carry on your back while commuting or traveling.', expectedTerms: ['backpack', 'bag', 'rucksack'] },
    { id: 10, visualCue: '⏰', contextHintInTarget: 'Clock that rings loudly at a preset time to wake you up in the morning.', expectedTerms: ['alarm clock', 'alarm', 'clock'] },
  ],
  stage2Actions: [
    { id: 1, scenarioCue: 'You are thirsty in a restaurant and need liquid.', targetVerbHint: 'order / ask for water', sampleShortSentence: 'Could I get a glass of tap water, please?' },
    { id: 2, scenarioCue: 'Your computer screen froze while working.', targetVerbHint: 'restart / reboot', sampleShortSentence: 'I need to force restart my laptop.' },
    { id: 3, scenarioCue: 'You are running late for an important appointment.', targetVerbHint: 'hurry up / rush', sampleShortSentence: "I've gotta hurry up or I'll miss my train." },
    { id: 4, scenarioCue: 'You have two options on a menu and must pick one.', targetVerbHint: 'go with / choose', sampleShortSentence: "I think I'll go with the grilled salmon." },
    { id: 5, scenarioCue: 'A stranger drops their wallet on the sidewalk in front of you.', targetVerbHint: 'pick up / hand back', sampleShortSentence: 'Excuse me, you dropped your wallet right here!' },
  ],
  stage3Thoughts: [
    { id: 1, questionInTarget: 'What is the first thing you need to accomplish tomorrow morning?', starterTemplate: 'First thing tomorrow, I need to...', sampleAnswer: 'First thing tomorrow, I need to review the slide deck for the client presentation.' },
    { id: 2, questionInTarget: 'How are you feeling about your English progress so far this week?', starterTemplate: 'Honestly, I feel like...', sampleAnswer: 'Honestly, I feel like my ears are getting much faster at catching linked words.' },
    { id: 3, questionInTarget: 'What would make today a genuinely productive day for you?', starterTemplate: 'Today would be a win if...', sampleAnswer: 'Today would be a win if I finish the quarterly report and hit the gym.' },
    { id: 4, questionInTarget: 'Why did you decide to learn English in the first place?', starterTemplate: 'I decided to learn because...', sampleAnswer: 'I decided to learn because I want international career freedom and to travel without friction.' },
  ],
  stage4NarrationGuide: {
    durationMinutes: 10,
    promptsByMoment: [
      {
        moment: 'Ao Acordar (Manhã)',
        narrationStarter: "Alright, it's 6:30. Time to get out of bed. My feet are touching the cold floor...",
        exampleFlow: "I'm heading to the kitchen. Turning on the kettle. Smells like coffee already. Looking outside, looks a bit cloudy today.",
      },
      {
        moment: 'Preparando Refeição ou Café',
        narrationStarter: "Opening the fridge. Let's see what we have here. Two eggs, half a carton of milk...",
        exampleFlow: "Grabbing a pan. Turning the burner on medium heat. Pouring a splash of olive oil. Slicing some bread.",
      },
      {
        moment: 'No Deslocamento ou Trânsito',
        narrationStarter: "Stepping outside into the street. The air feels crisp. Crossing at the green light...",
        exampleFlow: "Walking toward the subway station. Swiping my card. Looking at the crowd. Everyone is focused on their screens.",
      },
      {
        moment: 'Sentando para Trabalhar',
        narrationStarter: "Sitting down at my desk. Booting up the monitor. Let's check the inbox first...",
        exampleFlow: "Three urgent emails. Let me knock out the easiest one right now so I can clear my head.",
      },
      {
        moment: 'Ao Deitar (Noite)',
        narrationStarter: "Wrapping up the day. Turning off the main lights. Setting the phone to silent...",
        exampleFlow: "Today was intense, but I got the main presentation done. Tomorrow is another day. Time to rest.",
      },
    ],
  },
  nativeChunks30: [
    { id: 1, chunk: "I'm looking forward to...", literalPtTrap: 'Estou olhando para frente para...', whenToUse: 'Dizer que está muito animado com um evento futuro.', example: "I'm really looking forward to our weekend trip." },
    { id: 2, chunk: "It's up to you.", literalPtTrap: 'É em cima de você.', whenToUse: 'Passar a decisão para outra pessoa ("Você quem decide").', example: "Italian or Mexican tonight? It's completely up to you." },
    { id: 3, chunk: "Never mind.", literalPtTrap: 'Nunca mente.', whenToUse: 'Deixar para lá / Não tem importância.', example: "I was gonna ask for the salt, but never mind, I found it." },
    { id: 4, chunk: "I see what you mean.", literalPtTrap: 'Eu vejo o que você significa.', whenToUse: 'Dizer que entendeu o raciocínio da pessoa.', example: "Ah, looking at the graph now, I see what you mean." },
    { id: 5, chunk: "Make up your mind.", literalPtTrap: 'Faça sua mente.', whenToUse: 'Tomar uma decisão ("Decida-se").', example: "We need to order soon, so please make up your mind." },
    { id: 6, chunk: "As far as I'm concerned...", literalPtTrap: 'Tão longe quanto sou preocupado...', whenToUse: 'Expressar sua opinião pessoal ("Pelo que me diz respeito...").', example: "As far as I'm concerned, the decision is already finalized." },
    { id: 7, chunk: "Hold on a second.", literalPtTrap: 'Segure em um segundo.', whenToUse: 'Pedir para a pessoa esperar um instante.', example: "Hold on a second, my microphone was muted." },
    { id: 8, chunk: "Out of the blue.", literalPtTrap: 'Fora do azul.', whenToUse: 'Algo inesperado ("Do nada / De repente").', example: "She called me yesterday completely out of the blue." },
    { id: 9, chunk: "Take your time.", literalPtTrap: 'Tome seu tempo.', whenToUse: 'Dizer para a pessoa não ter pressa.', example: "No rush at all, take your time reading through it." },
    { id: 10, chunk: "Fair enough.", literalPtTrap: 'Justo bastante.', whenToUse: 'Aceitar um argumento razoável ("Justo / Combinado").', example: "If you need an extra day to finish, fair enough." },
  ],
  rapidTest20: [
    { id: 1, situationInTarget: 'Idade pessoal', literalPtTrap: 'I have 28 years old.', naturalTargetForm: 'I am 28 years old.' },
    { id: 2, situationInTarget: 'Fazer uma pergunta', literalPtTrap: 'Can I make a question?', naturalTargetForm: 'Can I ask a question?' },
    { id: 3, situationInTarget: 'Desligar a luz', literalPtTrap: 'Please close the light.', naturalTargetForm: 'Please turn off the light.' },
    { id: 4, situationInTarget: 'Ganhar dinheiro / salário', literalPtTrap: 'I won good money this month.', naturalTargetForm: 'I earned / made good money this month.' },
    { id: 5, situationInTarget: 'Tomar café ou remédio', literalPtTrap: 'I will drink a coffee / drink medicine.', naturalTargetForm: 'I will have a coffee / take medicine.' },
    { id: 6, situationInTarget: 'Perder o ônibus', literalPtTrap: 'I lost the bus this morning.', naturalTargetForm: 'I missed the bus this morning.' },
    { id: 7, situationInTarget: 'Concordar com alguém', literalPtTrap: 'I am agree with you.', naturalTargetForm: 'I agree with you.' },
    { id: 8, situationInTarget: 'Explicar o motivo', literalPtTrap: 'The reason because I called...', naturalTargetForm: 'The reason why I called...' },
    { id: 9, situationInTarget: 'Pedir desculpas por atraso', literalPtTrap: 'Sorry for I am late.', naturalTargetForm: 'Sorry for being late / Sorry I am late.' },
    { id: 10, situationInTarget: 'Estar com sono', literalPtTrap: 'I am with sleep.', naturalTargetForm: 'I am sleepy / exhausted.' },
  ],
};

type ThinkingTab = 'stages' | 'narration' | 'detector' | 'chunks' | 'test';

export function DirectThinkingPage() {
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
  } = useTeacherSession('thinking');

  const [activeTab, setActiveTab] = useState<ThinkingTab>('stages');
  const [data, setData] = useState<DirectThinkingData>(DEFAULT_DIRECT_THINKING_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Treino em 4 Etapas
  const [activeStageNumber, setActiveStageNumber] = useState<1 | 2 | 3>(1);
  const [stage1Index, setStage1Index] = useState(0);
  const [stage1Input, setStage1Input] = useState('');
  const [stage1Feedback, setStage1Feedback] = useState<boolean | null>(null);

  const [stage2Index, setStage2Index] = useState(0);
  const [stage2Input, setStage2Input] = useState('');
  const [stage2Revealed, setStage2Revealed] = useState(false);

  const [stage3Index, setStage3Index] = useState(0);
  const [stage3Input, setStage3Input] = useState('');
  const [stage3Revealed, setStage3Revealed] = useState(false);

  // Estados da Narração Interna (Timer de 10 min = 600s)
  const [narrationSec, setNarrationSec] = useState(600);
  const [isNarrationRunning, setIsNarrationRunning] = useState(false);
  const [currentPromptMomentIndex, setCurrentPromptMomentIndex] = useState(0);
  const narrationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Estados do Detector de Armadilhas
  const [customTrapText, setCustomTrapText] = useState('');
  const [isCheckingTrap, setIsCheckingTrap] = useState(false);
  const [trapResult, setTrapResult] = useState<{
    isTrap: boolean;
    ptTrap: string;
    naturalForm: string;
    explanation: string;
  } | null>(null);

  // Estados do Teste de 20 Perguntas
  const [testQuestionIndex, setTestQuestionIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, 'literal' | 'natural'>>({});
  const [testFinished, setTestFinished] = useState(false);

  // Hooks de fala
  const { speak, isSpeaking, startListening, stopListening, isListening, transcript } = useSpeech({
    defaultLang: 'en-US',
    onExposureSec: addExposureSec,
    onSpeakingSec: addSpeakingSec,
  });

  // Carrega dados da API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await apiFetch<any>('/api/teacher/thinking', {
          method: 'POST',
          body: JSON.stringify({ action: 'load' }),
        });
        const resolved = (res as any)?.data ?? res;
        if (isMounted && resolved?.stage1Objects?.length) {
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

  // Timer de Narração Interna
  useEffect(() => {
    if (isNarrationRunning) {
      narrationIntervalRef.current = setInterval(() => {
        setNarrationSec((prev) => {
          if (prev <= 1) {
            setIsNarrationRunning(false);
            if (narrationIntervalRef.current) clearInterval(narrationIntervalRef.current);
            return 0;
          }
          addSpeakingSec(1);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (narrationIntervalRef.current) {
        clearInterval(narrationIntervalRef.current);
      }
    }
    return () => {
      if (narrationIntervalRef.current) clearInterval(narrationIntervalRef.current);
    };
  }, [isNarrationRunning, addSpeakingSec]);

  // Handler de verificação da Etapa 1
  const handleCheckStage1 = () => {
    const obj = data.stage1Objects[stage1Index];
    if (!obj) return;
    const cleanUser = stage1Input.toLowerCase().trim();
    const isOk = obj.expectedTerms.some((t) => cleanUser.includes(t.toLowerCase()));
    setStage1Feedback(isOk);
    if (isOk) {
      addWordsRecalled(1);
    }
  };

  // Detector de armadilhas interativo
  const handleDetectTrap = async (textToTest?: string) => {
    const text = textToTest ?? customTrapText;
    if (!text.trim()) return;
    setIsCheckingTrap(true);

    try {
      const res = await apiFetch<{
        isTrap: boolean;
        ptTrap: string;
        naturalForm: string;
        explanation: string;
      }>('/api/teacher/thinking', {
        method: 'POST',
        body: JSON.stringify({
          action: 'check_translation_trap',
          payload: { text },
        }),
      });
      setTrapResult(res);
    } catch {
      // Fallback inteligente
      const lower = text.toLowerCase();
      if (lower.includes('have') && (lower.includes('years') || lower.includes('age'))) {
        setTrapResult({
          isTrap: true,
          ptTrap: text,
          naturalForm: 'I am 25 years old (use the verb to BE for state/age).',
          explanation: 'No português você "tem" idade como posse; no inglês você "é" aquela idade como estado de ser.',
        });
      } else if (lower.includes('make a question')) {
        setTrapResult({
          isTrap: true,
          ptTrap: text,
          naturalForm: 'Can I ask a question?',
          explanation: 'No inglês nunca se "faz" (make) uma pergunta; você sempre "pergunta" (ask).',
        });
      } else if (lower.includes('close the light') || lower.includes('close the tv')) {
        setTrapResult({
          isTrap: true,
          ptTrap: text,
          naturalForm: 'Turn off the light / Turn off the TV.',
          explanation: 'Você só "fecha" (close) portas ou janelas físicas. Dispositivos elétricos são "turned off".',
        });
      } else {
        setTrapResult({
          isTrap: false,
          ptTrap: text,
          naturalForm: text,
          explanation: 'Estrutura natural e direta sem contaminação pelo padrão do português.',
        });
      }
    } finally {
      setIsCheckingTrap(false);
      addExposureSec(3);
    }
  };

  // Formata timer mm:ss
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Cálculo da pontuação do teste
  const testScorePercent = useMemo(() => {
    const answered = Object.values(testAnswers);
    if (!answered.length) return 0;
    const naturals = answered.filter((a) => a === 'natural').length;
    return Math.round((naturals / data.rapidTest20.length) * 100);
  }, [testAnswers, data.rapidTest20]);

  return (
    <TeacherLayout
      teacherId="thinking"
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
        {/* Banner do Professor 7 */}
        <div className="bg-slate-900/90 border border-cyan-500/30 p-5 rounded-2xl shadow-xl shadow-cyan-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Brain className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Tradutor que Impede de Traduzir (Direct Thinking)
                <Badge variant="cyan" size="sm">
                  Neuroassociação Direta
                </Badge>
              </h2>
              <p className="text-xs text-cyan-200/80">
                Ligue a imagem/conceito direto à palavra em inglês, eliminando a ponte lenta pelo português.
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full md:w-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('stages')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'stages'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Treino Progressivo (3 Etapas)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('narration')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'narration'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Narração Interna (10m)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('detector')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'detector'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Detector de Armadilhas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chunks')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chunks'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4. 30 Chunks Nativos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold transition-all ${
                activeTab === 'test'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5. Teste de Neuroassociação
            </button>
          </div>
        </div>

        {/* =========================================================================
            ABA 1: TREINO PROGRESSIVO (OBJETOS -> AÇÕES -> PENSAMENTOS)
           ========================================================================= */}
        {activeTab === 'stages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setActiveStageNumber(1)}
                className={`flex-1 py-2 px-2.5 min-h-[36px] rounded-xl text-xs font-bold transition-all ${
                  activeStageNumber === 1
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Etapa 1: Objetos (Sem Português)
              </button>
              <button
                type="button"
                onClick={() => setActiveStageNumber(2)}
                className={`flex-1 py-2 px-2.5 min-h-[36px] rounded-xl text-xs font-bold transition-all ${
                  activeStageNumber === 2
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Etapa 2: Ações Curtas
              </button>
              <button
                type="button"
                onClick={() => setActiveStageNumber(3)}
                className={`flex-1 py-2 px-2.5 min-h-[36px] rounded-xl text-xs font-bold transition-all ${
                  activeStageNumber === 3
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Etapa 3: Pensamentos
              </button>
            </div>

            {/* ETAPA 1: OBJETOS (SEM TRADUÇÃO PARA O PORTUGUÊS) */}
            {activeStageNumber === 1 && (
              <Card className="border-slate-800">
                <CardHeader className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base md:text-lg flex items-center gap-2">
                        <span>Etapa 1: Nomeação Direta por Contexto em Inglês</span>
                        <Badge variant="cyan" size="sm">
                          Item {stage1Index + 1} de {data.stage1Objects.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Regra de ouro: não há tradução em português aqui. Conecte o conceito visual direto à palavra em inglês.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {(() => {
                    const item = data.stage1Objects[stage1Index];
                    if (!item) return null;

                    return (
                      <div className="space-y-6">
                        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                          <div className="text-6xl select-none animate-bounce">{item.visualCue}</div>

                          <div className="max-w-md mx-auto space-y-1">
                            <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                              Context Hint (In Target Language):
                            </span>
                            <p className="text-base text-slate-200 font-medium">
                              "{item.contextHintInTarget}"
                            </p>
                          </div>
                        </div>

                        {/* Input do Aluno */}
                        <div className="space-y-3 max-w-md mx-auto">
                          <label htmlFor="stage1-term-input" className="text-xs font-semibold text-slate-300">
                            Qual é o nome em inglês?
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <input
                              id="stage1-term-input"
                              type="text"
                              value={stage1Input}
                              onChange={(e) => {
                                setStage1Input(e.target.value);
                                setStage1Feedback(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCheckStage1();
                              }}
                              placeholder="Type in English..."
                              className="min-w-0 flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            />
                            <Button
                              variant="primary"
                              onClick={handleCheckStage1}
                              className="bg-cyan-600 hover:bg-cyan-500 shrink-0 w-full sm:w-auto"
                            >
                              Verificar
                            </Button>
                          </div>

                          {stage1Feedback !== null && (
                            <div
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-fadeIn ${
                                stage1Feedback
                                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
                              }`}
                            >
                              <span>
                                {stage1Feedback
                                  ? 'Exato! Neuroassociação direta sem passar pelo português.'
                                  : `Tente novamente ou use: ${item.expectedTerms.join(' / ')}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => speak(item.expectedTerms[0] ?? '', 'en-US', 1.0)}
                                className="text-white hover:underline py-1.5 px-2.5 min-h-[28px] inline-flex items-center gap-1 cursor-pointer rounded-lg hover:bg-slate-800/40 self-start sm:self-auto shrink-0"
                              >
                                <Volume2 className="w-3.5 h-3.5" /> Ouvir
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Navegação */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                          <Button
                            variant="ghost"
                            disabled={stage1Index === 0}
                            onClick={() => {
                              setStage1Index((p) => p - 1);
                              setStage1Input('');
                              setStage1Feedback(null);
                            }}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={stage1Index === data.stage1Objects.length - 1}
                            onClick={() => {
                              setStage1Index((p) => p + 1);
                              setStage1Input('');
                              setStage1Feedback(null);
                            }}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                          >
                            Próximo Objeto
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* ETAPA 2: AÇÕES CURTAS */}
            {activeStageNumber === 2 && (
              <Card className="border-slate-800">
                <CardHeader className="border-b border-slate-800 pb-4">
                  <CardTitle className="text-base md:text-lg">
                    Etapa 2: Descrição de Ações Imediatas
                  </CardTitle>
                  <CardDescription>
                    Descreva o que fazer em situações cotidianas sem planejar regras gramaticais.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {(() => {
                    const act = data.stage2Actions[stage2Index];
                    if (!act) return null;

                    return (
                      <div className="space-y-6">
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                          <Badge variant="cyan" size="sm">
                            Situação #{act.id}
                          </Badge>
                          <h3 className="text-lg font-bold text-white max-w-lg mx-auto">
                            "{act.scenarioCue}"
                          </h3>
                          <p className="text-xs text-cyan-300 font-mono">
                            Verbo-alvo sugerido: {act.targetVerbHint}
                          </p>
                        </div>

                        <div className="max-w-md mx-auto space-y-3">
                          <input
                            type="text"
                            value={stage2Input}
                            onChange={(e) => setStage2Input(e.target.value)}
                            placeholder="Frase curta em inglês..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
                          />

                          <div className="flex items-center justify-between">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setStage2Revealed(true)}
                            >
                              Revelar Frase Modelo Nativa
                            </Button>

                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                if (stage2Index < data.stage2Actions.length - 1) {
                                  setStage2Index((p) => p + 1);
                                  setStage2Input('');
                                  setStage2Revealed(false);
                                }
                              }}
                              className="bg-cyan-600 hover:bg-cyan-500"
                            >
                              Próxima Ação
                            </Button>
                          </div>

                          {stage2Revealed && (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs animate-fadeIn">
                              <span className="text-slate-400 font-bold block">
                                Frase modelo nativa:
                              </span>
                              <p className="text-cyan-300 font-bold text-sm">
                                "{act.sampleShortSentence}"
                              </p>
                              <button
                                type="button"
                                onClick={() => speak(act.sampleShortSentence, 'en-US', 1.0)}
                                className="text-xs text-white hover:underline flex items-center gap-1"
                              >
                                <Volume2 className="w-3.5 h-3.5" /> Ouvir pronúncia
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* ETAPA 3: PENSAMENTOS */}
            {activeStageNumber === 3 && (
              <Card className="border-slate-800">
                <CardHeader className="border-b border-slate-800 pb-4">
                  <CardTitle className="text-base md:text-lg">
                    Etapa 3: Respostas Diretas sem Monólogo Interno em Português
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {(() => {
                    const th = data.stage3Thoughts[stage3Index];
                    if (!th) return null;

                    return (
                      <div className="space-y-6">
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                          <h3 className="text-lg font-bold text-white">"{th.questionInTarget}"</h3>
                          <p className="text-xs text-slate-400 font-mono">
                            Gatilho de largada: {th.starterTemplate}
                          </p>
                        </div>

                        <div className="max-w-md mx-auto space-y-3">
                          <textarea
                            rows={3}
                            value={stage3Input}
                            onChange={(e) => setStage3Input(e.target.value)}
                            placeholder="Complete com sua mente direto no idioma..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm"
                          />

                          <div className="flex items-center justify-between">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setStage3Revealed(true)}
                            >
                              Ver Resposta de Exemplo
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                if (stage3Index < data.stage3Thoughts.length - 1) {
                                  setStage3Index((p) => p + 1);
                                  setStage3Input('');
                                  setStage3Revealed(false);
                                }
                              }}
                              className="bg-cyan-600 hover:bg-cyan-500"
                            >
                              Próxima Pergunta
                            </Button>
                          </div>

                          {stage3Revealed && (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1 animate-fadeIn">
                              <span className="text-slate-400">Exemplo nativo:</span>
                              <p className="text-emerald-300 font-bold">"{th.sampleAnswer}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* =========================================================================
            ABA 2: NARRAÇÃO INTERNA (ROTINA DE 10 MINUTOS COM TIMER)
           ========================================================================= */}
        {activeTab === 'narration' && (
          <div className="space-y-6">
            <Card className="border-cyan-500/30 bg-slate-900/90 shadow-xl shadow-cyan-950/20">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <span>Protocolo de Narração Interna de 10 Minutos</span>
                      <Badge variant="cyan" size="sm">
                        Exercício de Mente Ativa
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Narre tudo o que você está fazendo agora em inglês na sua mente (ou sussurrado). Sem pausas para traduzir.
                    </CardDescription>
                  </div>

                  {/* Cronômetro */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-extrabold text-cyan-400">
                      {formatTimer(narrationSec)}
                    </span>
                    <Button
                      size="sm"
                      variant={isNarrationRunning ? 'danger' : 'primary'}
                      onClick={() => setIsNarrationRunning((p) => !p)}
                      leftIcon={isNarrationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      className={isNarrationRunning ? 'bg-rose-600' : 'bg-cyan-600 hover:bg-cyan-500'}
                    >
                      {isNarrationRunning ? 'Pausar' : 'Iniciar 10 min'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Escolha um Momento do Dia para Modelar a Narração:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {data.stage4NarrationGuide.promptsByMoment.map((p, idx) => {
                      const isSel = currentPromptMomentIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentPromptMomentIndex(idx)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSel
                              ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-950/30'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold text-cyan-300 block mb-1">
                            {p.moment}
                          </span>
                          <p className="text-xs text-slate-400 line-clamp-2">{p.narrationStarter}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bloco Modelo Aberto */}
                {(() => {
                  const curr =
                    data.stage4NarrationGuide.promptsByMoment[currentPromptMomentIndex];
                  if (!curr) return null;

                  return (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                          Fluxo Modelo: {curr.moment}
                        </span>
                        <button
                          type="button"
                          onClick={() => speak(curr.narrationStarter + ' ' + curr.exampleFlow, 'en-US', 1.0)}
                          className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Ouvir Fluxo Completo
                        </button>
                      </div>

                      <div className="space-y-2 text-sm text-slate-200 font-mono leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        <p className="text-cyan-300 font-semibold">{curr.narrationStarter}</p>
                        <p className="text-slate-300">{curr.exampleFlow}</p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 3: DETECTOR DE ESTRUTURA TRADUZIDA (INTERATIVE TOOL)
           ========================================================================= */}
        {activeTab === 'detector' && (
          <div className="space-y-6">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <span>Detector de Estrutura Traduzida do Português</span>
                </CardTitle>
                <CardDescription>
                  Descubra na hora se uma frase que você pensou é inglês autêntico ou português traduzido com palavras em inglês.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Exemplos Rápidos */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Testar armadilhas clássicas de brasileiros:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'I have 25 years',
                      'Can I make a question?',
                      'Please close the TV',
                      'I won good money',
                      'I will drink medicine',
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCustomTrapText(sample);
                          void handleDetectTrap(sample);
                        }}
                        className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-700/80 hover:border-amber-400 rounded-lg text-slate-300 hover:text-white transition-all font-mono"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Interativo */}
                <div className="space-y-3">
                  <label htmlFor="trap-text-input" className="text-xs font-semibold text-slate-300">
                    Digite qualquer frase em inglês para analisar:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      id="trap-text-input"
                      type="text"
                      value={customTrapText}
                      onChange={(e) => setCustomTrapText(e.target.value)}
                      placeholder="Ex: I am agree with your opinion..."
                      className="min-w-0 flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <Button
                      variant="primary"
                      onClick={() => void handleDetectTrap()}
                      loading={isCheckingTrap}
                      disabled={!customTrapText.trim()}
                      className="bg-cyan-600 hover:bg-cyan-500 shrink-0 w-full sm:w-auto"
                    >
                      Analisar Frase
                    </Button>
                  </div>
                </div>

                {/* Diagnóstico Lado a Lado */}
                {trapResult && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <Badge variant={trapResult.isTrap ? 'danger' : 'success'} size="md">
                        {trapResult.isTrap ? '⚠️ Armadilha de Tradução Detectada!' : '✅ Inglês Direto e Natural'}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => speak(trapResult.naturalForm, 'en-US', 1.0)}
                        className="text-xs text-cyan-300 hover:underline py-1.5 px-2.5 min-h-[28px] inline-flex items-center gap-1 cursor-pointer rounded-lg hover:bg-slate-800/40"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Ouvir forma natural
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-rose-900/40 space-y-1">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                          ❌ Forma Traduzida (Mentalidade PT):
                        </span>
                        <p className="text-base font-mono text-rose-200">{trapResult.ptTrap}</p>
                      </div>

                      <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-900/40 space-y-1">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          ✅ Forma Natural Nativa (Inglês Puro):
                        </span>
                        <p className="text-base font-mono font-bold text-emerald-300">
                          {trapResult.naturalForm}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white block mb-0.5">
                        Por que isso acontece (Neuroassociação):
                      </span>
                      {trapResult.explanation}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 4: 30 BLOCOS PRONTOS (CHUNKS NATIVOS)
           ========================================================================= */}
        {activeTab === 'chunks' && (
          <div className="space-y-4">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Os 30 Blocos de Fala Nativa (Chunks)</span>
                  <Badge variant="cyan" size="sm">
                    Imunes a Tradução
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Nativos não constroem frases palavra por palavra; eles usam blocos prontos memorizados como som único.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.nativeChunks30.map((ch) => (
                    <div
                      key={ch.id}
                      className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 space-y-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-cyan-300 font-mono">"{ch.chunk}"</h4>
                        <button
                          type="button"
                          onClick={() => {
                            speak(ch.chunk, 'en-US', 1.0);
                            addExposureSec(1);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                          title="Ouvir chunk"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs space-y-1 text-slate-400">
                        <p>
                          <span className="text-slate-500">Quando usar:</span> {ch.whenToUse}
                        </p>
                        <p className="text-rose-400/80">
                          <span className="text-slate-500">Armadilha literal:</span> {ch.literalPtTrap}
                        </p>
                        <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                          Exemplo: "{ch.example}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 5: TESTE RÁPIDO DE 20 PERGUNTAS (DIRETO VS TRADUZIDO)
           ========================================================================= */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <span>Teste de Reflexo de Pensamento Direto</span>
                      <Badge variant="cyan" size="sm">
                        Questão {testQuestionIndex + 1} de {data.rapidTest20.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Qual das duas opções é a forma autêntica em inglês? Escolha sem hesitar.
                    </CardDescription>
                  </div>

                  <div className="w-40">
                    <ProgressBar
                      value={((testQuestionIndex + 1) / data.rapidTest20.length) * 100}
                      variant="sky"
                      size="sm"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {(() => {
                  const q = data.rapidTest20[testQuestionIndex];
                  if (!q) return null;

                  const isAnswered = testAnswers[q.id] !== undefined;

                  return (
                    <div className="space-y-6">
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Situação de Comunicação:
                        </span>
                        <h3 className="text-xl font-bold text-white">{q.situationInTarget}</h3>
                      </div>

                      {/* Opções de Escolha */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setTestAnswers((p) => ({ ...p, [q.id]: 'literal' }));
                          }}
                          className={`p-5 rounded-2xl border text-left font-mono text-sm transition-all ${
                            isAnswered
                              ? testAnswers[q.id] === 'literal'
                                ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                              : 'bg-slate-950 border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-sans font-bold text-slate-400 block mb-2">
                            Opção A
                          </span>
                          "{q.literalPtTrap}"
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTestAnswers((p) => ({ ...p, [q.id]: 'natural' }));
                            addWordsRecalled(2);
                          }}
                          className={`p-5 rounded-2xl border text-left font-mono text-sm transition-all ${
                            isAnswered
                              ? testAnswers[q.id] === 'natural'
                                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-bold'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                              : 'bg-slate-950 border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-sans font-bold text-slate-400 block mb-2">
                            Opção B
                          </span>
                          "{q.naturalTargetForm}"
                        </button>
                      </div>

                      {/* Feedback após escolha */}
                      {isAnswered && (
                        <div className="text-center space-y-3 animate-fadeIn">
                          <p
                            className={`text-sm font-bold ${
                              testAnswers[q.id] === 'natural'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {testAnswers[q.id] === 'natural'
                              ? 'Correto! Forma direta nativa sem contaminação do português.'
                              : 'Armadilha! A Opção A é a tradução literal palavra-por-palavra do português.'}
                          </p>

                          <div className="flex items-center justify-center gap-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                if (testQuestionIndex < data.rapidTest20.length - 1) {
                                  setTestQuestionIndex((p) => p + 1);
                                } else {
                                  setTestFinished(true);
                                }
                              }}
                              className="bg-cyan-600 hover:bg-cyan-500"
                            >
                              {testQuestionIndex < data.rapidTest20.length - 1
                                ? 'Próxima Questão'
                                : 'Ver Resultado Final'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Resumo ao terminar */}
                      {testFinished && (
                        <div className="bg-slate-950 p-6 rounded-2xl border border-cyan-500/40 text-center space-y-3 animate-fadeIn">
                          <h4 className="text-lg font-bold text-white">
                            Índice de Pensamento Direto:{' '}
                            <span className="text-cyan-400">{testScorePercent}% Nativo</span>
                          </h4>
                          <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Quanto mais alto o percentual, menos o seu cérebro busca atalhos pelo português na hora de se expressar.
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setTestAnswers({});
                              setTestQuestionIndex(0);
                              setTestFinished(false);
                            }}
                          >
                            Refazer Teste
                          </Button>
                        </div>
                      )}
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
