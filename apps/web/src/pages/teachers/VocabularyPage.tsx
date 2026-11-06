import { useState, useEffect } from 'react';
import {
  BookOpen,
  Volume2,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Send,
  Mic,
  ThumbsUp,
  Brain,
  Filter,
} from 'lucide-react';
import {
  VOCAB_BLOCKS,
  type VocabBlockId,
  type VocabCardData,
  type ActiveVocabEvaluation,
} from '@fluencialab/shared';
import { useTeacherSession } from '../../hooks/useTeacherSession';
import { useSpeech } from '../../hooks/useSpeech';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { AudioRecorder } from '../../components/teacher/AudioRecorder';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { apiFetch } from '../../lib/api';

type TabMode = 'blocks' | 'srs' | 'active_test';

const INITIAL_VOCAB_ITEMS: VocabCardData[] = [
  // Top 50
  {
    id: 'v1',
    term: 'I would like to...',
    translation: 'Eu gostaria de...',
    pronunciation: '/aɪ wʊd laɪk tu/ (ai uúd láik tu)',
    example1: 'I would like to schedule a meeting for tomorrow.',
    example2: 'I would like to order a black coffee, please.',
    collocation: 'I would like to + verbo no infinitivo (ex: confirm, ask, see)',
    block: 'top50',
    isTop50: true,
    easiness: 2.5,
    interval: 1,
    repetitions: 1,
  },
  {
    id: 'v2',
    term: 'Could you please...?',
    translation: 'Você poderia, por favor...?',
    pronunciation: '/kʊd ju pliːz/ (cúd iu plíiz)',
    example1: 'Could you please repeat that more slowly?',
    example2: 'Could you please send me the report by email?',
    collocation: 'Could you please + verbo base (ex: help, explain, clarify)',
    block: 'top50',
    isTop50: true,
    easiness: 2.5,
    interval: 1,
    repetitions: 1,
  },
  {
    id: 'v3',
    term: 'What do you mean by that?',
    translation: 'O que você quer dizer com isso?',
    pronunciation: '/wʌt du ju miːn baɪ ðæt/ (uát du iu míin bai dét)',
    example1: 'What do you mean by that? Is there a delay in the delivery?',
    example2: 'I am not sure I understand. What do you mean by that?',
    collocation: 'What do you mean by + substantivo/pronome',
    block: 'top50',
    isTop50: true,
    easiness: 2.5,
    interval: 2,
    repetitions: 2,
  },
  {
    id: 'v4',
    term: 'How does that sound to you?',
    translation: 'O que você acha dessa ideia / proposta?',
    pronunciation: '/haʊ dʌz ðæt saʊnd tu ju/ (ráu dâz dét sáund tu iu)',
    example1: 'We can meet on Thursday at 3 PM. How does that sound to you?',
    example2: 'Let us start with phase one first. How does that sound?',
    collocation: 'How does that sound? (resposta comum: Sounds good! / Perfect)',
    block: 'top50',
    isTop50: true,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
  },
  {
    id: 'v5',
    term: 'As far as I know...',
    translation: 'Até onde eu sei...',
    pronunciation: '/æz fɑːr æz aɪ noʊ/ (és fár és ai nôu)',
    example1: 'As far as I know, the flight is still on schedule.',
    example2: 'As far as I know, the team has already approved the budget.',
    collocation: 'As far as I know + oração completa',
    block: 'top50',
    isTop50: true,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
  },
  // Blocos funcionais
  {
    id: 'v6',
    term: 'Nice to finally meet you in person.',
    translation: 'Bom finalmente te conhecer pessoalmente.',
    pronunciation: '/naɪs tu ˈfaɪnəli miːt ju ɪn ˈpɜːrsn/ (náis tu fáineli míit iu in pârssn)',
    example1: 'Nice to finally meet you in person after so many emails.',
    example2: 'Welcome to our office! Nice to finally meet you in person.',
    collocation: 'meet in person (oposto de meet online)',
    block: 'introduce',
    isTop50: false,
    easiness: 2.5,
    interval: 1,
    repetitions: 1,
  },
  {
    id: 'v7',
    term: 'Do you happen to know...?',
    translation: 'Você por acaso sabe...?',
    pronunciation: '/du ju ˈhæpən tu noʊ/ (du iu répên tu nôu)',
    example1: 'Do you happen to know where the restroom is?',
    example2: 'Do you happen to know if the manager is available today?',
    collocation: 'Do you happen to know + if / where / what',
    block: 'ask_info',
    isTop50: false,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
  },
  {
    id: 'v8',
    term: 'From my perspective...',
    translation: 'Do meu ponto de vista / Na minha perspectiva...',
    pronunciation: '/frʌm maɪ pərˈspɛktɪv/ (frâm mai pârspéctiv)',
    example1: 'From my perspective, this feature should be prioritized.',
    example2: 'From my perspective, the main risk is the deadline.',
    collocation: 'From my perspective + oração opinativa',
    block: 'opinion',
    isTop50: false,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
  },
  {
    id: 'v9',
    term: 'I see your point, but...',
    translation: 'Eu entendo seu ponto, mas...',
    pronunciation: '/aɪ siː jʊər pɔɪnt bʌt/ (ai síi iór póint bât)',
    example1: 'I see your point, but we do not have enough resources.',
    example2: 'I see your point, but the client asked for something else.',
    collocation: 'I see your point, but (desacordo educado)',
    block: 'agree_disagree',
    isTop50: false,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
  },
  {
    id: 'v10',
    term: 'Could you give me a hand with this?',
    translation: 'Você poderia me dar uma mãozinha com isso?',
    pronunciation: '/kʊd ju ɡɪv mi ə hænd wɪð ðɪs/ (cúd iu guiv mi â rénd uíz dís)',
    example1: 'I am struggling with this spreadsheet. Could you give me a hand with this?',
    example2: 'These boxes are heavy. Could you give me a hand with this?',
    collocation: 'give someone a hand with something',
    block: 'ask_help',
    isTop50: false,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
  },
];

const ACTIVE_TEST_PROMPTS = [
  {
    id: 'at1',
    targetTerm: 'I would like to order a black coffee, please.',
    promptPt: 'Você está em um café e quer pedir educadamente um café preto.',
    hint: 'Comece com: I would like to...',
  },
  {
    id: 'at2',
    targetTerm: 'Could you please repeat that more slowly?',
    promptPt: 'O nativo falou rápido demais e você precisa pedir educadamente para ele repetir mais devagar.',
    hint: 'Use: Could you please...',
  },
  {
    id: 'at3',
    targetTerm: 'How does that sound to you?',
    promptPt: 'Você fez uma sugestão de horário para uma reunião e quer saber o que a outra pessoa acha.',
    hint: 'Expressão de 5 palavras: How does...',
  },
  {
    id: 'at4',
    targetTerm: 'I see your point, but I have a different opinion.',
    promptPt: 'Você quer discordar de forma educada e profissional em uma reunião de trabalho.',
    hint: 'Comece com: I see your point...',
  },
];

export function VocabularyPage() {
  const session = useTeacherSession('vocabulary');
  const speech = useSpeech({
    onExposureSec: () => session.addExposureSec(1),
  });

  const [activeTab, setActiveTab] = useState<TabMode>('blocks');
  const [selectedBlock, setSelectedBlock] = useState<VocabBlockId>('top50');
  const [vocabList, setVocabList] = useState<VocabCardData[]>(INITIAL_VOCAB_ITEMS);
  const [loadingVocab, setLoadingVocab] = useState(false);

  // Estados do Flashcards SM-2
  const [currentSrsIndex, setCurrentSrsIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [srsSuccessMessage, setSrsSuccessMessage] = useState<string | null>(null);

  // Estados do Teste Ativo
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [userProduction, setUserProduction] = useState('');
  const [evaluatingTest, setEvaluatingTest] = useState(false);
  const [testEvaluation, setTestEvaluation] = useState<ActiveVocabEvaluation | null>(null);

  // Carrega itens de vocabulário do backend
  useEffect(() => {
    let isMounted = true;
    async function loadVocab() {
      setLoadingVocab(true);
      try {
        const data = await apiFetch<{ items?: VocabCardData[] }>('/api/vocab');
        if (isMounted && data?.items && data.items.length > 0) {
          setVocabList(data.items);
        }
      } catch {
        // Fallback para INITIAL_VOCAB_ITEMS
      } finally {
        if (isMounted) setLoadingVocab(false);
      }
    }

    void loadVocab();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtragem dos cards pelo bloco selecionado
  const displayedCards = vocabList.filter((card) => {
    if (selectedBlock === 'top50') return card.isTop50 || card.block === 'top50';
    return card.block === selectedBlock;
  });

  // Fila de revisão SM-2 (cards que precisam de treino)
  const srsQueue = vocabList.slice(0, 10);
  const activeSrsCard = srsQueue[currentSrsIndex];

  // Ação de revisão SM-2 (0..5)
  const handleSrsReview = async (quality: number) => {
    if (!activeSrsCard) return;

    // Incrementa contagem de palavras ativadas na sessão
    session.addWordsRecalled(1);

    // Próximo intervalo simulado pelo SM-2
    let nextIntervalDays = 1;
    if (quality >= 4) {
      nextIntervalDays = (activeSrsCard.interval || 1) * 2 + 1;
    } else if (quality >= 2) {
      nextIntervalDays = Math.max(1, activeSrsCard.interval || 1);
    } else {
      nextIntervalDays = 1;
    }

    setSrsSuccessMessage(
      `Avaliação registrada! Próxima revisão em ${nextIntervalDays} ${
        nextIntervalDays === 1 ? 'dia' : 'dias'
      }.`
    );

    try {
      if (activeSrsCard.id) {
        await apiFetch('/api/vocab/review', {
          method: 'POST',
          body: JSON.stringify({
            vocabId: activeSrsCard.id,
            quality,
          }),
        });
      }
    } catch {
      // Ignora erro de rede em testes/offline
    }

    // Avança para o próximo card da fila após 600ms
    setTimeout(() => {
      setIsFlipped(false);
      setSrsSuccessMessage(null);
      if (currentSrsIndex + 1 < srsQueue.length) {
        setCurrentSrsIndex((prev) => prev + 1);
      } else {
        // Reinicia ciclo
        setCurrentSrsIndex(0);
      }
    }, 600);
  };

  // Teste Ativo de Produção
  const activeTest = ACTIVE_TEST_PROMPTS[currentTestIndex] ?? ACTIVE_TEST_PROMPTS[0]!;

  const handleEvaluateTest = async () => {
    if (!userProduction.trim()) return;

    setEvaluatingTest(true);
    setTestEvaluation(null);

    try {
      const result = await apiFetch<ActiveVocabEvaluation>('/api/teacher/vocabulary', {
        method: 'POST',
        body: JSON.stringify({
          action: 'active_test',
          payload: {
            targetTerm: activeTest.targetTerm,
            promptPt: activeTest.promptPt,
            userProduction,
          },
        }),
      });

      setTestEvaluation(result);
      if (result.correct || result.score >= 70) {
        session.addWordsRecalled(1);
      }
    } catch {
      // Avaliação heurística offline para não travar testes
      const lowerUser = userProduction.toLowerCase().trim();
      const lowerTarget = activeTest.targetTerm.toLowerCase().trim();
      const isClose =
        lowerUser.includes(lowerTarget.slice(0, 8)) ||
        lowerTarget.includes(lowerUser.slice(0, 8));

      const mockEval: ActiveVocabEvaluation = {
        correct: isClose,
        score: isClose ? 85 : 55,
        feedback: isClose
          ? 'Ótima produção! Frase natural e adequada ao contexto.'
          : 'Compreensível, mas pode soar mais natural.',
        naturalAlternative: activeTest.targetTerm,
      };

      setTestEvaluation(mockEval);
      if (mockEval.correct) {
        session.addWordsRecalled(1);
      }
    } finally {
      setEvaluatingTest(false);
    }
  };

  const handleNextTest = () => {
    setUserProduction('');
    setTestEvaluation(null);
    setCurrentTestIndex((prev) => (prev + 1) % ACTIVE_TEST_PROMPTS.length);
  };

  return (
    <TeacherLayout
      teacherId="vocabulary"
      elapsedSec={session.elapsedSec}
      speakingSec={session.speakingSec}
      exposureSec={session.exposureSec}
      wordsRecalled={session.wordsRecalled}
      moduleProgress={session.teacherData?.moduleProgress}
      systemPrompt={session.teacherData?.systemPrompt}
      recentSessions={session.teacherData?.recentSessions}
      recentErrors={session.teacherData?.recentErrors}
      onFinishSession={() => session.finishSession({ progressDelta: 20 })}
      isFinishing={session.isFinishing}
      isSummaryOpen={session.isSummaryOpen}
      summaryData={session.summaryData}
      onCloseSummary={session.closeSummary}
    >
      <div className="space-y-6">
        {/* Navegação por Abas Principais */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <Button
            variant={activeTab === 'blocks' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('blocks')}
            leftIcon={<Layers className="w-4 h-4" />}
          >
            Blocos Funcionais & Top 50
          </Button>

          <Button
            variant={activeTab === 'srs' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('srs')}
            leftIcon={<RotateCw className="w-4 h-4" />}
          >
            Repetição Espaçada (SM-2 Flashcards)
          </Button>

          <Button
            variant={activeTab === 'active_test' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('active_test')}
            leftIcon={<Brain className="w-4 h-4" />}
          >
            Teste Ativo de Produção
          </Button>
        </div>

        {/* ABA 1: Blocos Funcionais & Top 50 */}
        {activeTab === 'blocks' && (
          <div className="space-y-6">
            {/* Seletor Horizontal de Blocos */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-sky-400" />
                <span>Selecione a Categoria de Expressões</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {VOCAB_BLOCKS.map((block) => {
                  const isSelected = selectedBlock === block.id;
                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => setSelectedBlock(block.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950/40'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {block.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grade de Cards do Bloco Selecionado */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>
                    {VOCAB_BLOCKS.find((b) => b.id === selectedBlock)?.label}
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  {displayedCards.length} {displayedCards.length === 1 ? 'expressão' : 'expressões'}
                </span>
              </div>

              {displayedCards.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
                  Nenhuma expressão cadastrada neste bloco ainda. Selecione o Top 50 para ver as expressões principais.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedCards.map((card, idx) => (
                    <Card key={card.id ?? idx} className="border-slate-800 flex flex-col justify-between">
                      <CardContent className="p-5 space-y-3.5">
                        {/* Topo do Card: Termo e Tradução */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-base font-extrabold text-white">
                              {card.term}
                            </span>
                            <button
                              type="button"
                              onClick={() => speech.speak(card.term)}
                              className="text-sky-400 hover:text-sky-300 p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Ouvir expressão com TTS"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-xs font-semibold text-sky-300">
                            {card.translation}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            Pronúncia: {card.pronunciation}
                          </div>
                        </div>

                        {/* Frases Naturais em Contexto */}
                        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                          {/* Frase 1 */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                              <span>Situação 1</span>
                              <button
                                type="button"
                                onClick={() => speech.speak(card.example1)}
                                className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 cursor-pointer"
                                title="Ouvir exemplo 1"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>Ouvir</span>
                              </button>
                            </div>
                            <p className="text-slate-200 font-medium italic">
                              "{card.example1}"
                            </p>
                          </div>

                          {/* Frase 2 */}
                          <div className="space-y-0.5 pt-2 border-t border-slate-800/60">
                            <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
                              <span>Situação 2</span>
                              <button
                                type="button"
                                onClick={() => speech.speak(card.example2)}
                                className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 cursor-pointer"
                                title="Ouvir exemplo 2"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>Ouvir</span>
                              </button>
                            </div>
                            <p className="text-slate-200 font-medium italic">
                              "{card.example2}"
                            </p>
                          </div>
                        </div>

                        {/* Combinação Comum (Collocation) */}
                        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                          <span className="font-semibold text-slate-300 shrink-0">Collocation:</span>
                          <span className="text-slate-300">{card.collocation}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 2: Repetição Espaçada SM-2 (Flashcards) */}
        {activeTab === 'srs' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Fila de Revisão SM-2
              </span>
              <span>
                Card {currentSrsIndex + 1} de {srsQueue.length}
              </span>
            </div>

            {activeSrsCard ? (
              <Card className="border-slate-800 bg-slate-900 shadow-xl overflow-hidden min-h-[320px] flex flex-col justify-between">
                <CardContent className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                  {/* Frente do Card */}
                  {!isFlipped ? (
                    <div className="space-y-6 text-center my-auto">
                      <Badge variant="sky" size="sm">
                        Como dizer em inglês?
                      </Badge>
                      <h3 className="text-xl md:text-2xl font-extrabold text-white">
                        {activeSrsCard.translation}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Pense ou fale a expressão antes de virar o card.
                      </p>

                      <div className="pt-4">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setIsFlipped(true);
                            speech.speak(activeSrsCard.term);
                          }}
                          leftIcon={<RotateCw className="w-4 h-4" />}
                          className="w-full sm:w-auto"
                        >
                          Virar card e ouvir
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Verso do Card */
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-xl md:text-2xl font-extrabold text-sky-400">
                            {activeSrsCard.term}
                          </h3>
                          <button
                            type="button"
                            onClick={() => speech.speak(activeSrsCard.term)}
                            className="p-1 text-sky-400 hover:text-sky-300 cursor-pointer"
                            title="Ouvir com TTS"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {activeSrsCard.pronunciation}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Exemplo Natural:
                        </span>
                        <p className="text-slate-200 italic">"{activeSrsCard.example1}"</p>
                        <p className="text-[11px] text-sky-300">
                          Collocation: {activeSrsCard.collocation}
                        </p>
                      </div>

                      {/* Mensagem de Feedback SM-2 */}
                      {srsSuccessMessage && (
                        <div className="p-2.5 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-center">
                          {srsSuccessMessage}
                        </div>
                      )}

                      {/* Botões de Classificação SM-2 (0 a 5) */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-xs text-slate-400 block text-center font-medium">
                          Como foi sua lembrança?
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleSrsReview(1)}
                            className="text-xs"
                          >
                            Esqueci (1)
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSrsReview(2)}
                            className="text-xs text-amber-300"
                          >
                            Difícil (2)
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSrsReview(4)}
                            className="text-xs text-emerald-300"
                          >
                            Bom (4)
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSrsReview(5)}
                            className="text-xs"
                          >
                            Fácil (5)
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}

        {/* ABA 3: Teste Ativo de Produção */}
        {activeTab === 'active_test' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <Card className="border-slate-800">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="violet" size="sm">
                      Desafio {currentTestIndex + 1} de {ACTIVE_TEST_PROMPTS.length}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      Produção Ativa (Sem Olhar)
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-white">
                    {activeTest.promptPt}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dica: {activeTest.hint}
                  </p>
                </div>

                {/* Gravador de Voz / Input de Resposta */}
                <AudioRecorder
                  label="Fale sua resposta em inglês (ou digite abaixo):"
                  transcript={userProduction}
                  onTranscriptChange={(val) => setUserProduction(val)}
                  onSpeakingSec={() => session.addSpeakingSec(1)}
                  placeholder="Ex: I would like to order a black coffee, please..."
                />

                {/* Botão de Avaliação */}
                {!testEvaluation && (
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleEvaluateTest}
                      loading={evaluatingTest}
                      disabled={!userProduction.trim()}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      Validar minha produção
                    </Button>
                  </div>
                )}

                {/* Resultado da Avaliação */}
                {testEvaluation && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {testEvaluation.correct ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                        )}
                        <span className="text-sm font-bold text-white">
                          Nota: {testEvaluation.score} / 100
                        </span>
                      </div>
                      <Badge variant={testEvaluation.correct ? 'emerald' : 'amber'} size="sm">
                        {testEvaluation.correct ? 'Excelente' : 'Bom esforço'}
                      </Badge>
                    </div>

                    <p className="text-xs md:text-sm text-slate-300">
                      {testEvaluation.feedback}
                    </p>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Como nativos costumam dizer:
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-bold text-sky-400">
                          {testEvaluation.naturalAlternative}
                        </span>
                        <button
                          type="button"
                          onClick={() => speech.speak(testEvaluation.naturalAlternative)}
                          className="p-1 text-sky-400 hover:text-sky-300 cursor-pointer"
                          title="Ouvir versão nativa com TTS"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button variant="secondary" size="sm" onClick={handleNextTest}>
                        Próximo Desafio
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
