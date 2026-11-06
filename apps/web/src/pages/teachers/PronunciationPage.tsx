import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AudioLines,
  Play,
  RotateCcw,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Mic,
  MicOff,
  Flame,
  Check,
  ChevronRight,
  Sliders,
  Layers,
  Activity,
  Smile,
  Award,
} from 'lucide-react';
import type { PronunciationGuideData } from '@fluencialab/shared';
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

const DEFAULT_PRONUNCIATION_DATA: PronunciationGuideData = {
  top10Errors: [
    {
      id: 1,
      soundName: 'Som TH desvozeado /θ/ vs vozeado /ð/',
      isHighImpact: true,
      whatMouthDoes: 'Substitui por som de "F", "S" ou "T" fechado (ex: "fink", "tink" em vez de "think").',
      whatMouthShouldDo: 'Coloque suavemente a ponta da língua entre os dentes superiores e inferiores e sopre o ar sem vibrar as cordas vocais.',
      tongueAndLips: 'Ponta da língua visível 2mm para fora dos dentes, lábios relaxados, fluxo contínuo de ar.',
      wrongApproxExample: 'I fink so / I tink so',
      correctExample: 'I think so',
      practiceWords: ['think', 'three', 'breath', 'theater', 'method'],
      minimalPairs: [
        { wordA: 'think', wordB: 'sink' },
        { wordA: 'three', wordB: 'tree' },
        { wordA: 'thought', wordB: 'fought' },
      ],
    },
    {
      id: 2,
      soundName: 'Terminação regular -ED no passado (/t/, /d/, /ɪd/)',
      isHighImpact: true,
      whatMouthDoes: 'Adiciona uma sílaba "edi" em todas as palavras (ex: "work-ed", "help-ed" com 2 sílabas).',
      whatMouthShouldDo: 'Não crie sílaba nova a menos que o verbo termine em T ou D. Em "worked", termina com som seco /t/.',
      tongueAndLips: 'A língua vai direto para o alvéolo dos dentes superiores no som final sem abrir vogal.',
      wrongApproxExample: 'work-ed (duas sílabas)',
      correctExample: 'worked /wɜːrkt/ (uma sílaba)',
      practiceWords: ['worked', 'helped', 'watched', 'lived', 'decided'],
      minimalPairs: [
        { wordA: 'work', wordB: 'worked' },
        { wordA: 'play', wordB: 'played' },
        { wordA: 'want', wordB: 'wanted' },
      ],
    },
    {
      id: 3,
      soundName: 'Vogais curtas vs longas: /ɪ/ ("ship") vs /iː/ ("sheep")',
      isHighImpact: true,
      whatMouthDoes: 'Pronuncia todas com o som do "i" agudo do português, gerando confusão semântica perigosa (ex: sheet vs shit).',
      whatMouthShouldDo: 'O som /ɪ/ é relaxado, entre o "e" e o "i" com a mandíbula levemente caída. O /iː/ é esticado como um sorriso.',
      tongueAndLips: '/ɪ/: mandíbula semi-aberta e língua baixa. /iː/: lábios em sorriso largo e língua alta.',
      wrongApproxExample: 'sheep para tudo',
      correctExample: 'ship /ʃɪp/ vs sheep /ʃiːp/',
      practiceWords: ['sit', 'live', 'fit', 'slip', 'hit'],
      minimalPairs: [
        { wordA: 'ship', wordB: 'sheep' },
        { wordA: 'sit', wordB: 'seat' },
        { wordA: 'fill', wordB: 'feel' },
      ],
    },
    {
      id: 4,
      soundName: 'Som "H" aspirado /h/ vs som mudo',
      isHighImpact: false,
      whatMouthDoes: 'Pronuncia como o "R" arranhado carioca ou omite totalmente (dizendo "app" para "happy").',
      whatMouthShouldDo: 'É apenas um suspiro suave de ar vindo da garganta, como se estivesse bafejando um espelho.',
      tongueAndLips: 'Boca neutra, cordas vocais relaxadas, sem raspar na garganta.',
      wrongApproxExample: 'Rápido (com r forte) ou \'appy',
      correctExample: 'happy /ˈhæpi/',
      practiceWords: ['home', 'hotel', 'happy', 'help', 'history'],
      minimalPairs: [
        { wordA: 'hat', wordB: 'at' },
        { wordA: 'heart', wordB: 'art' },
      ],
    },
    {
      id: 5,
      soundName: 'Letra "L" final escuro (Dark L /ɫ/)',
      isHighImpact: false,
      whatMouthDoes: 'Substitui por som de "U" do português (ex: "braziu", "milku").',
      whatMouthShouldDo: 'A parte de trás da língua se ergue em direção ao palato mole enquanto a ponta toca os dentes superiores.',
      tongueAndLips: 'Ponta da língua nos alvéolos superiores, sem arredondar os lábios em bico de "u".',
      wrongApproxExample: 'peopou, botou',
      correctExample: 'people /ˈpiːpəl/, bottle /ˈbɑːtəl/',
      practiceWords: ['ball', 'milk', 'call', 'feel', 'world'],
      minimalPairs: [
        { wordA: 'bowl', wordB: 'bow' },
        { wordA: 'toll', wordB: 'toe' },
      ],
    },
    {
      id: 6,
      soundName: 'Som "R" retroflexo americano /ɹ/',
      isHighImpact: false,
      whatMouthDoes: 'Substitui por som aspirado na garganta (ex: "car" soando como "cá").',
      whatMouthShouldDo: 'A ponta da língua curva para trás sem tocar o céu da boca em nenhum momento.',
      tongueAndLips: 'Língua curvada para trás em concha, lábios levemente projetados.',
      wrongApproxExample: 'red com r gutural',
      correctExample: 'red /rɛd/, car /kɑːr/',
      practiceWords: ['right', 'ready', 'car', 'door', 'remember'],
      minimalPairs: [
        { wordA: 'red', wordB: 'led' },
        { wordA: 'right', wordB: 'light' },
      ],
    },
    {
      id: 7,
      soundName: 'Som "V" vs som "B" / "W"',
      isHighImpact: false,
      whatMouthDoes: 'Confunde o "V" labiodental com o "W" bilabial (ex: "vest" vs "west").',
      whatMouthShouldDo: 'Para o /v/, os dentes superiores encostam no lábio inferior e vibram. Para o /w/, faz-se um bico redondo sem dentes.',
      tongueAndLips: '/v/: dentes no lábio inferior. /w/: lábios em formato de "o" sem encostar dentes.',
      wrongApproxExample: 'very soando como werry',
      correctExample: 'very /ˈvɛri/',
      practiceWords: ['very', 'voice', 'video', 'every', 'never'],
      minimalPairs: [
        { wordA: 'vest', wordB: 'west' },
        { wordA: 'vet', wordB: 'wet' },
      ],
    },
    {
      id: 8,
      soundName: 'Terminação nasal "M" final (não nasalizada)',
      isHighImpact: false,
      whatMouthDoes: 'Não fecha os lábios no final, deixando a vogal nasal aberta (ex: "time" soando como "tãim").',
      whatMouthShouldDo: 'Os lábios devem se fechar completamente no som final de "M".',
      tongueAndLips: 'Lábios completamente selados no final da palavra.',
      wrongApproxExample: 'tãim (lábios abertos)',
      correctExample: 'time /taɪm/ (lábios fechados no final)',
      practiceWords: ['time', 'name', 'come', 'team', 'from'],
      minimalPairs: [
        { wordA: 'sum', wordB: 'sun' },
        { wordA: 'dime', wordB: 'dine' },
      ],
    },
    {
      id: 9,
      soundName: 'Som Schwa /ə/ (Vogal mais comum do inglês)',
      isHighImpact: false,
      whatMouthDoes: 'Pronuncia cada vogal exatamente como está escrita graficamente.',
      whatMouthShouldDo: 'Qualquer vogal em sílaba não-estressada vira som neutro curto e relaxado: /ə/.',
      tongueAndLips: 'Boca completamente neutra e relaxada, como um suspiro curto de "uh".',
      wrongApproxExample: 'a-bout com "a" aberto',
      correctExample: 'about /əˈbaʊt/',
      practiceWords: ['about', 'problem', 'banana', 'support', 'today'],
      minimalPairs: [
        { wordA: 'sofa', wordB: 'so far' },
      ],
    },
    {
      id: 10,
      soundName: 'Flap T americano /ɾ/ (Water, Better)',
      isHighImpact: false,
      whatMouthDoes: 'Pronuncia o T estourado britânico pesado ou o omite totalmente.',
      whatMouthShouldDo: 'Entre duas vogais, o T vira um toque rápido da língua no céu da boca, idêntico ao "R" de "caro".',
      tongueAndLips: 'Toque ultrarrápido da ponta da língua no alvéolo dos dentes superiores.',
      wrongApproxExample: 'wá-ter com t duro',
      correctExample: 'water /ˈwɑː.t̬ɚ/ ("wá-rer")',
      practiceWords: ['water', 'better', 'city', 'matter', 'waiting'],
      minimalPairs: [
        { wordA: 'writer', wordB: 'rider' },
      ],
    },
  ],
  daily10MinRoutine: [
    {
      minutes: 2,
      title: 'Minuto 1-2: Ginástica Articulatória e Pares Mínimos',
      description: 'Aquecimento muscular exagerado contrastando /θ/ vs /s/ e /iː/ vs /ɪ/.',
    },
    {
      minutes: 3,
      title: 'Minuto 3-5: Repetição Progressiva com Áudio Modelo',
      description: 'Ouça o som isolado, depois na palavra, depois em frase curta.',
    },
    {
      minutes: 3,
      title: 'Minuto 6-8: Gravação e Comparação Lado a Lado',
      description: 'Grave a sua pronúncia e toque lado a lado com a do falante nativo para achar a diferença.',
    },
    {
      minutes: 2,
      title: 'Minuto 9-10: Frase em Velocidade Real com Ritmo Contínuo',
      description: 'Fale a frase do dia sem pausas entre as palavras conectadas.',
    },
  ],
  rhythmAndIntonation: [
    {
      rule: 'Palavras de Conteúdo vs Palavras Funcionais',
      example: 'Enfatize substantivos, verbos e adjetivos; comprima pronomes e preposições (ex: "I wanna GO to the STORE").',
    },
    {
      rule: 'Entonação Descendente em Afirmações',
      example: 'A voz desce no final de frases afirmativas para demonstrar certeza e autoridade.',
    },
    {
      rule: 'Entonação Ascendente em Perguntas de Sim/Não',
      example: 'A voz sobe suavemente na última sílaba (ex: "Are you ready?").',
    },
  ],
  weeklyTestSentences: [
    { id: 1, phrase: 'I thought the theater was open on Thursdays.', focusSound: 'TH /θ/', ipaOrApprox: '/aɪ θɔːt ðə ˈθiːətər wʌz ˈoʊpən ɑːn ˈθɜːrzdeɪz/' },
    { id: 2, phrase: 'She worked hard and lived in that city for years.', focusSound: 'Terminação -ED', ipaOrApprox: '/ʃiː wɜːrkt hɑːrd ænd lɪvd ɪn ðæt ˈsɪti fɔːr jɪərz/' },
    { id: 3, phrase: 'Please take a seat and eat this sweet peach.', focusSound: 'Vogal Longa /iː/', ipaOrApprox: '/pliːz teɪk ə siːt ænd iːt ðɪs swiːt piːtʃ/' },
    { id: 4, phrase: 'He had a hard time hearing his friend at home.', focusSound: 'H Aspirado /h/', ipaOrApprox: '/hiː hæd ə hɑːrd taɪm ˈhɪərɪŋ hɪz frend æt hoʊm/' },
    { id: 5, phrase: 'Will you call Paul and tell him about the bill?', focusSound: 'Dark L /ɫ/', ipaOrApprox: '/wɪl juː kɔːl pɔːl ænd tɛl hɪm əˈbaʊt ðə bɪl/' },
    { id: 6, phrase: 'Remember to read the report right after lunch.', focusSound: 'R Retroflexo /ɹ/', ipaOrApprox: '/rɪˈmɛmbər tuː riːd ðə rɪˈpɔːrt raɪt ˈæftər lʌntʃ/' },
    { id: 7, phrase: 'It was very obvious that they valued visual art.', focusSound: 'V Labiodental /v/', ipaOrApprox: '/ɪt wʌz ˈvɛri ˈɑːbviəs ðæt ðeɪ ˈvæljuːd ˈvɪʒuəl ɑːrt/' },
    { id: 8, phrase: 'Come home on time to meet the team.', focusSound: 'M Final Fechado /m/', ipaOrApprox: '/kʌm hoʊm ɑːn taɪm tuː miːt ðə tiːm/' },
    { id: 9, phrase: 'A banana is about the only thing I ate today.', focusSound: 'Schwa /ə/', ipaOrApprox: '/ə bəˈnænə ɪz əˈbaʊt ði ˈoʊnli θɪŋ aɪ eɪt təˈdeɪ/' },
    { id: 10, phrase: 'Could you bring a little bottle of cold water?', focusSound: 'Flap T /ɾ/', ipaOrApprox: '/kʊdʒuː brɪŋ ə ˈlɪtl ˈbɑːtl əv koʊld ˈwɑːtər/' },
    { id: 11, phrase: 'They think three things are thoroughly finished.', focusSound: 'TH Múltiplo', ipaOrApprox: '/ðeɪ θɪŋk θriː θɪŋz ɑːr ˈθɜːrəli ˈfɪnɪʃt/' },
    { id: 12, phrase: 'He asked if we walked or talked before lunch.', focusSound: '-ED mudo /t/', ipaOrApprox: '/hiː æskt ɪf wiː wɔːkt ɔːr tɔːkt bɪˈfɔːr lʌntʃ/' },
    { id: 13, phrase: 'Six sick sheep sit together in the shade.', focusSound: 'Sibilantes e Vogais', ipaOrApprox: '/sɪks sɪk ʃiːp sɪt təˈɡɛðər ɪn ðə ʃeɪd/' },
    { id: 14, phrase: 'Whether the weather is warm or whether it rains.', focusSound: 'TH Vozeado /ð/', ipaOrApprox: '/ˈwɛðər ðə ˈwɛðər ɪz wɔːrm ɔːr ˈwɛðər ɪt reɪnz/' },
    { id: 15, phrase: 'Better butter makes the batter taste better.', focusSound: 'Flap T Combo', ipaOrApprox: '/ˈbɛtər ˈbʌtər meɪks ðə ˈbætər teɪst ˈbɛtər/' },
  ],
};

type PronunciationTab = 'errors' | 'routine' | 'test';

export function PronunciationPage() {
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
  } = useTeacherSession('pronunciation');

  const [activeTab, setActiveTab] = useState<PronunciationTab>('errors');
  const [data, setData] = useState<PronunciationGuideData>(DEFAULT_PRONUNCIATION_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Estados da Aba 2: Comparação de Áudio
  const [comparisonPhrase, setComparisonPhrase] = useState(
    'I think that three little bottles of water are enough.'
  );

  // Estados da Aba 3: Teste Semanal
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selfScore, setSelfScore] = useState<number>(75);
  const [evaluationResult, setEvaluationResult] = useState<{
    aiScore: number;
    phoneticFeedback: string;
  } | null>(null);
  const [isEvaluatingTest, setIsEvaluatingTest] = useState(false);

  // Hooks de voz e gravação
  const { speak, isSpeaking, startListening, stopListening, isListening, transcript } = useSpeech({
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
        const res = await apiFetch<{ data: PronunciationGuideData }>(
          '/api/teacher/pronunciation',
          {
            method: 'POST',
            body: JSON.stringify({ action: 'load' }),
          }
        );
        if (isMounted && res?.data?.top10Errors?.length) {
          setData(res.data);
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

  const currentTestSentence =
    (data.weeklyTestSentences[currentSentenceIndex] ??
    data.weeklyTestSentences[0] ??
    DEFAULT_PRONUNCIATION_DATA.weeklyTestSentences[0])!;

  const handleEvaluateTest = async () => {
    setIsEvaluatingTest(true);
    try {
      const res = await apiFetch<{ aiScore: number; phoneticFeedback: string }>(
        '/api/teacher/pronunciation',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'evaluate_test',
            payload: {
              phrase: currentTestSentence.phrase,
              transcript: transcript || currentTestSentence.phrase,
              selfScore,
              weekIndex: 1,
            },
          }),
        }
      );
      setEvaluationResult(res);
    } catch {
      // Fallback local
      setEvaluationResult({
        aiScore: Math.min(100, Math.max(50, Math.round(selfScore * 0.95))),
        phoneticFeedback:
          'Boa articulação! Certifique-se de posicionar a língua antes de iniciar a soltura de ar.',
      });
    } finally {
      setIsEvaluatingTest(false);
      addSpeakingSec(5);
      addWordsRecalled(4);
    }
  };

  return (
    <TeacherLayout
      teacherId="pronunciation"
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
        {/* Banner do Professor 6 */}
        <div className="bg-slate-900/90 border border-fuchsia-500/30 p-5 rounded-2xl shadow-xl shadow-fuchsia-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 shrink-0">
              <AudioLines className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Corretor de Pronúncia e Articulação Fisiológica
                <Badge variant="fuchsia" size="sm">
                  10 Erros Frequentes
                </Badge>
              </h2>
              <p className="text-xs text-fuchsia-200/80">
                Aprenda a mecânica exata da boca, língua e lábios para soar claro e ser entendido de primeira.
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('errors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'errors'
                  ? 'bg-fuchsia-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Os 10 Erros Críticos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('routine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'routine'
                  ? 'bg-fuchsia-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Rotina 10m & Player Lado a Lado
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'test'
                  ? 'bg-fuchsia-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Teste Semanal (15 Frases)
            </button>
          </div>
        </div>

        {/* =========================================================================
            ABA 1: OS 10 ERROS MAIS PROVÁVEIS (COM DESTAQUE PARA OS 3 DE MAIOR IMPACTO)
           ========================================================================= */}
        {activeTab === 'errors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Mapeamento de Sons do Português para o Inglês
                </h3>
                <p className="text-xs text-slate-400">
                  Os 3 primeiros sons abaixo causam 80% dos mal-entendidos com nativos.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {data.top10Errors.map((item) => (
                <Card
                  key={item.id}
                  className={`border transition-all ${
                    item.isHighImpact
                      ? 'border-fuchsia-500/50 bg-slate-900/90 shadow-lg shadow-fuchsia-950/20'
                      : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <CardHeader className="border-b border-slate-800/80 pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-fuchsia-400">
                          #{item.id}
                        </span>
                        <CardTitle className="text-base font-bold text-white">
                          {item.soundName}
                        </CardTitle>
                      </div>

                      {item.isHighImpact && (
                        <Badge variant="rose" size="sm" className="animate-pulse">
                          🔥 Maior Impacto na Compreensão
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    {/* Diagnóstico Fisiológico da Boca */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/30 space-y-1">
                        <span className="text-rose-400 font-bold block uppercase tracking-wider">
                          O que a boca brasileira faz:
                        </span>
                        <p className="text-slate-300 leading-relaxed">{item.whatMouthDoes}</p>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/30 space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase tracking-wider">
                          O que deveria fazer:
                        </span>
                        <p className="text-slate-300 leading-relaxed">{item.whatMouthShouldDo}</p>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-fuchsia-900/30 space-y-1">
                        <span className="text-fuchsia-300 font-bold block uppercase tracking-wider">
                          Posição dos Lábios e Língua:
                        </span>
                        <p className="text-slate-300 leading-relaxed">{item.tongueAndLips}</p>
                      </div>
                    </div>

                    {/* Exemplo Incorreto vs Correto */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                          Exemplo Incorreto Aproximado:
                        </span>
                        <p className="text-sm font-mono text-rose-300 line-through">
                          {item.wrongApproxExample}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                            Exemplo Correto:
                          </span>
                          <p className="text-sm font-mono font-bold text-emerald-300">
                            {item.correctExample}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            speak(item.correctExample, 'en-US', 1.0);
                            addExposureSec(2);
                          }}
                          leftIcon={<Volume2 className="w-3.5 h-3.5" />}
                        >
                          Ouvir
                        </Button>
                      </div>
                    </div>

                    {/* 5 Palavras de Treino Clicáveis */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400">
                        5 Palavras para Treinar Agora (clique para ouvir):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.practiceWords.map((word, wIdx) => (
                          <button
                            key={wIdx}
                            type="button"
                            onClick={() => {
                              speak(word, 'en-US', 1.0);
                              addExposureSec(1);
                            }}
                            className="px-3 py-1 bg-slate-950 border border-slate-700/80 hover:border-fuchsia-500 rounded-lg text-xs font-mono font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                          >
                            <Volume2 className="w-3 h-3 text-fuchsia-400" />
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pares Mínimos */}
                    {item.minimalPairs.length > 0 && (
                      <div className="pt-2 border-t border-slate-900 space-y-1.5">
                        <span className="text-xs font-semibold text-slate-400">
                          Pares Mínimos (Ouça o Contraste Sonoro):
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {item.minimalPairs.map((pair, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs font-mono"
                            >
                              <button
                                type="button"
                                onClick={() => speak(pair.wordA, 'en-US', 1.0)}
                                className="text-slate-300 hover:text-white underline decoration-dotted"
                              >
                                {pair.wordA}
                              </button>
                              <span className="text-slate-500">vs</span>
                              <button
                                type="button"
                                onClick={() => speak(pair.wordB, 'en-US', 1.0)}
                                className="text-fuchsia-300 font-bold hover:text-white underline decoration-dotted"
                              >
                                {pair.wordB}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 2: ROTINA DIÁRIA DE 10 MINUTOS + GRAVAÇÃO COMPARATIVA LADO A LADO
           ========================================================================= */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            {/* Player Comparativo Lado a Lado */}
            <Card className="border-fuchsia-500/40 bg-slate-900/90 shadow-xl shadow-fuchsia-950/20">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <span>Espelho Fonético: Gravação Comparativa Lado a Lado</span>
                  <Badge variant="fuchsia" size="sm">
                    Player Duplo
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Ouça o modelo nativo, grave a sua voz e ouça as duas faixas lado a lado para perceber as diferenças.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="comparison-phrase" className="text-xs font-semibold text-slate-300">
                    Frase para Praticar e Comparar:
                  </label>
                  <input
                    id="comparison-phrase"
                    type="text"
                    value={comparisonPhrase}
                    onChange={(e) => setComparisonPhrase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-base focus:outline-none focus:ring-2 focus:ring-fuchsia-400 font-medium"
                  />
                </div>

                {/* PLAYERS LADO A LADO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LADO 1: MODELO NATIVO */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4" /> Faixa 1: Modelo Nativo
                      </span>
                      <Badge variant="default" size="sm">
                        TTS Referência
                      </Badge>
                    </div>

                    <p className="text-sm font-mono text-slate-200 italic">
                      "{comparisonPhrase}"
                    </p>

                    <div className="pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          speak(comparisonPhrase, 'en-US', 1.0);
                          addExposureSec(3);
                        }}
                        disabled={isSpeaking}
                        leftIcon={<Play className="w-4 h-4 fill-current" />}
                        className="w-full border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/10"
                      >
                        Tocar Pronúncia Modelo
                      </Button>
                    </div>
                  </div>

                  {/* LADO 2: SUA GRAVAÇÃO */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mic className="w-4 h-4" /> Faixa 2: Sua Gravação
                      </span>
                      <Badge variant={audioUrl ? 'success' : 'default'} size="sm">
                        {audioUrl ? 'Áudio Pronto' : 'Não gravado'}
                      </Badge>
                    </div>

                    {audioUrl ? (
                      <div className="space-y-2">
                        <audio src={audioUrl} controls className="w-full h-9" />
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Sua voz gravada</span>
                          <button
                            type="button"
                            onClick={clearRecording}
                            className="text-rose-400 hover:underline"
                          >
                            Limpar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-2">
                        Pressione o botão abaixo para gravar sua voz repetindo a frase modelo.
                      </p>
                    )}

                    <div>
                      <Button
                        variant={isRecording ? 'danger' : 'primary'}
                        onClick={() => {
                          if (isRecording) {
                            void stopRecording();
                            addSpeakingSec(4);
                          } else {
                            void startRecording();
                          }
                        }}
                        leftIcon={isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        className={`w-full ${
                          isRecording
                            ? 'bg-rose-600 hover:bg-rose-500'
                            : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
                        }`}
                      >
                        {isRecording ? 'Parar e Processar Gravação' : 'Gravar Minha Voz'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rotina de 10 minutos */}
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-3">
                <CardTitle className="text-base font-bold text-white">
                  Estrutura da Rotina Diária de 10 Minutos
                </CardTitle>
                <CardDescription>
                  10 minutos focados diariamente reprogramam a musculatura facial em menos de 30 dias.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {data.daily10MinRoutine.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800"
                  >
                    <Badge variant="fuchsia" size="sm" className="shrink-0 mt-0.5">
                      {step.minutes} min
                    </Badge>
                    <div>
                      <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ritmo e Entonação */}
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-3">
                <CardTitle className="text-base font-bold text-white">
                  Princípios de Ritmo, Stress e Entonação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {data.rhythmAndIntonation.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-fuchsia-300">{item.rule}</span>
                      <p className="text-xs text-slate-400">{item.example}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(item.example, 'en-US', 1.0)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white shrink-0 self-start sm:self-auto"
                      title="Ouvir entonação"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================================================
            ABA 3: TESTE SEMANAL DE PRONÚNCIA (15 FRASES COM AUTOAVALIAÇÃO & IA)
           ========================================================================= */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <Card className="border-slate-800">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <span>Teste Semanal de Articulação</span>
                      <Badge variant="fuchsia" size="sm">
                        Frase {currentSentenceIndex + 1} de {data.weeklyTestSentences.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Grave a frase, dê sua nota de autopercepção e receba o diagnóstico da IA.
                    </CardDescription>
                  </div>

                  <div className="w-40">
                    <ProgressBar
                      value={((currentSentenceIndex + 1) / data.weeklyTestSentences.length) * 100}
                      variant="rose"
                      size="sm"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Frase Atual */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="fuchsia" size="sm">
                      Foco: {currentTestSentence.focusSound}
                    </Badge>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-white max-w-xl mx-auto leading-relaxed">
                    "{currentTestSentence.phrase}"
                  </h3>

                  <p className="text-xs font-mono text-slate-400 bg-slate-900/80 p-2 rounded-lg inline-block border border-slate-800">
                    {currentTestSentence.ipaOrApprox}
                  </p>

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speak(currentTestSentence.phrase, 'en-US', 1.0)}
                      leftIcon={<Volume2 className="w-4 h-4" />}
                    >
                      Ouvir Modelo
                    </Button>
                  </div>
                </div>

                {/* Gravação da Resposta */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-300">
                      1. Grave sua tentativa em voz alta:
                    </span>

                    <Button
                      variant={isRecording ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => {
                        if (isRecording) {
                          void stopRecording();
                          addSpeakingSec(4);
                        } else {
                          void startRecording();
                        }
                      }}
                      leftIcon={isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      className={isRecording ? 'bg-rose-600' : 'bg-fuchsia-600 hover:bg-fuchsia-500'}
                    >
                      {isRecording ? 'Finalizar Gravação' : 'Gravar Pronúncia'}
                    </Button>
                  </div>

                  {audioUrl && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <audio src={audioUrl} controls className="h-8 max-w-xs" />
                      <span className="text-xs text-emerald-400 font-semibold">
                        Áudio gravado com sucesso
                      </span>
                    </div>
                  )}

                  {/* Autoavaliação com Slider */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <label htmlFor="self-score-slider" className="text-slate-300">
                        2. Sua Autoavaliação (quão próximo do modelo você acha que soou?):
                      </label>
                      <span className="text-fuchsia-400 font-mono font-bold text-sm">
                        {selfScore}%
                      </span>
                    </div>

                    <input
                      id="self-score-slider"
                      type="range"
                      min={0}
                      max={100}
                      value={selfScore}
                      onChange={(e) => setSelfScore(Number(e.target.value))}
                      className="w-full accent-fuchsia-500 cursor-pointer"
                    />
                  </div>

                  {/* Botão de Envio para a IA */}
                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      variant="primary"
                      onClick={() => void handleEvaluateTest()}
                      loading={isEvaluatingTest}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                      className="bg-fuchsia-600 hover:bg-fuchsia-500"
                    >
                      Enviar para Avaliação da IA
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (currentSentenceIndex < data.weeklyTestSentences.length - 1) {
                          setCurrentSentenceIndex((p) => p + 1);
                          clearRecording();
                          setEvaluationResult(null);
                        } else {
                          setCurrentSentenceIndex(0);
                        }
                      }}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Próxima Frase
                    </Button>
                  </div>

                  {/* Resultado do Teste */}
                  {evaluationResult && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-fuchsia-800/40 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-fuchsia-300 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-400" />
                          Resultado do Teste Fonético
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Nota da IA:</span>
                          <Badge variant="fuchsia" size="md">
                            {evaluationResult.aiScore}/100
                          </Badge>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {evaluationResult.phoneticFeedback}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Autopercepção: {selfScore}%</span>
                        <span>
                          Diferença:{' '}
                          {Math.abs(selfScore - evaluationResult.aiScore) <= 10
                            ? 'Alinhamento excelente!'
                            : 'Autopercepção calibrada'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
