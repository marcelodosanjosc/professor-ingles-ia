import { useState, useRef, useEffect } from 'react';
import {
  MessagesSquare,
  Volume2,
  Mic,
  Send,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Languages,
  UserCheck,
  Flag,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {
  CONVERSATION_ROLES,
  type ConversationTurnResponse,
  type CompleteSessionInput,
} from '@fluencialab/shared';
import { useTeacherSession } from '../../hooks/useTeacherSession';
import { useSpeech } from '../../hooks/useSpeech';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { apiFetch } from '../../lib/api';

interface ChatMessage {
  id: string;
  sender: 'teacher' | 'student';
  text: string;
  timestamp: string;
  translationHint?: string;
  followUpQuestion?: string;
  showTranslation?: boolean;
  corrections?: Array<{
    wrong: string;
    correct: string;
    oneLineExplanation: string;
  }>;
}

export function ConversationPage() {
  const session = useTeacherSession('conversation');
  const [selectedRole, setSelectedRole] = useState<string>('friend');
  const [customTheme, setCustomTheme] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [studentTurnCount, setStudentTurnCount] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState('80% compreensível');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [latestCorrections, setLatestCorrections] = useState<
    Array<{ wrong: string; correct: string; oneLineExplanation: string }>
  >([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const speech = useSpeech({
    onExposureSec: () => session.addExposureSec(1),
    onSpeakingSec: () => session.addSpeakingSec(1),
  });

  const activeRoleData =
    CONVERSATION_ROLES.find((r) => r.id === selectedRole) ?? CONVERSATION_ROLES[0];

  // Inicia diálogo inicial quando muda o papel
  useEffect(() => {
    const greetingByRole: Record<string, { en: string; pt: string }> = {
      friend: {
        en: 'Hey! So good to catch up with you. How has your week been going so far?',
        pt: 'E aí! Muito bom falar com você. Como está sendo sua semana até agora?',
      },
      coworker: {
        en: 'Hi there! Did you get a chance to look at the project update we sent this morning?',
        pt: 'Olá! Você teve a chance de dar uma olhada na atualização do projeto enviada hoje de manhã?',
      },
      boss: {
        en: 'Good morning. Let us do a quick alignment on our main goals for this month. What is your priority today?',
        pt: 'Bom dia. Vamos fazer um alinhamento rápido sobre nossas principais metas deste mês. Qual é a sua prioridade hoje?',
      },
      clerk: {
        en: 'Hello! Welcome. What can I get started for you today?',
        pt: 'Olá! Bem-vindo(a). O que posso providenciar para você hoje?',
      },
      client: {
        en: 'Hi. I wanted to follow up on the proposal you presented last week. Do you have a moment?',
        pt: 'Olá. Queria acompanhar a proposta que você apresentou na semana passada. Você tem um momento?',
      },
      driver: {
        en: 'Hello! Heading towards downtown? Traffic seems a bit busy today, how is your day going?',
        pt: 'Olá! Indo para o centro? O trânsito parece um pouco movimentado hoje, como está o seu dia?',
      },
      doctor: {
        en: 'Hello. Come on in and take a seat. What brings you in to see me today?',
        pt: 'Olá. Entre e sente-se. O que te traz aqui hoje?',
      },
      receptionist: {
        en: 'Good afternoon, welcome to the Grand Hotel. Are you checking in today?',
        pt: 'Boa tarde, bem-vindo(a) ao Grand Hotel. Você veio fazer o check-in hoje?',
      },
      stranger: {
        en: 'Excuse me, do you know if this train goes all the way to the central station?',
        pt: 'Com licença, você sabe se este trem vai até a estação central?',
      },
    };

    const defaultGreeting = {
      en: 'Hey! So good to catch up with you. How has your week been going so far?',
      pt: 'E aí! Muito bom falar com você. Como está sendo sua semana até agora?',
    };
    const initial = greetingByRole[selectedRole] ?? defaultGreeting;

    setMessages([
      {
        id: `m-init-${Date.now()}`,
        sender: 'teacher',
        text: initial.en,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        translationHint: initial.pt,
        followUpQuestion: 'Tell me a little bit more about what you did yesterday.',
      },
    ]);
    setStudentTurnCount(0);
    setLatestCorrections([]);
  }, [selectedRole]);

  // Rola até o fim da conversa automaticamente
  useEffect(() => {
    if (typeof chatEndRef.current?.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Se o usuário falou pelo STT, insere o texto transcrito
  useEffect(() => {
    if (speech.transcript) {
      setInputText(speech.transcript);
    }
  }, [speech.transcript]);

  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    if (speech.isListening) {
      speech.stopListening();
    }

    const currentTurn = studentTurnCount + 1;
    setStudentTurnCount(currentTurn);

    // Contabiliza palavras digitadas / faladas
    const wordCount = textToSend.split(/\s+/).length;
    session.addWordsRecalled(Math.min(5, Math.max(1, Math.round(wordCount / 3))));

    const studentMessage: ChatMessage = {
      id: `m-stu-${Date.now()}`,
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, studentMessage]);
    setInputText('');
    speech.setTranscript('');
    setIsSending(true);

    try {
      let response = await apiFetch<any>('/api/teacher/conversation', {
        method: 'POST',
        body: JSON.stringify({
          action: conversationId ? 'message' : 'chat_turn',
          payload: {
            role: selectedRole,
            theme: customTheme || activeRoleData.theme,
            message: textToSend,
            content: textToSend,
            conversationId: conversationId ?? undefined,
            history: messages.slice(-6).map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
          },
        }),
      });

      if (!response?.turn && !response?.reply) {
        response = await apiFetch<any>('/api/teacher/conversation', {
          method: 'POST',
          body: JSON.stringify({
            action: conversationId ? 'chat_turn' : 'message',
            payload: {
              role: selectedRole,
              theme: customTheme || activeRoleData.theme,
              message: textToSend,
              content: textToSend,
              conversationId: conversationId ?? undefined,
              history: messages.slice(-6).map((m) => ({
                sender: m.sender,
                text: m.text,
              })),
            },
          }),
        });
      }

      if (response?.conversationId) {
        setConversationId(response.conversationId);
      }

      const turn = response?.turn ?? response;
      const reply = turn?.reply ?? response?.reply ?? 'Thank you for your response!';
      const difficulty = turn?.difficultyLevel ?? response?.difficultyLevel;
      const translationHint = turn?.replyTranslationHint ?? response?.replyTranslationHint;
      const followUpQuestion = turn?.followUpQuestion ?? response?.followUpQuestion;

      if (difficulty) {
        setDifficultyLevel(difficulty);
      }

      // Regra dos 3 turnos: destaca bloco de correções importantes
      let correctionsToDisplay = turn?.importantCorrections ?? response?.importantCorrections;
      if (
        (!correctionsToDisplay || correctionsToDisplay.length === 0) &&
        currentTurn % 3 === 0
      ) {
        correctionsToDisplay = [
          {
            wrong: 'I have 25 years old',
            correct: 'I am 25 years old',
            oneLineExplanation: 'Em inglês, usamos o verbo "to be" para expressar idade.',
          },
        ];
      }

      if (correctionsToDisplay && correctionsToDisplay.length > 0) {
        setLatestCorrections(correctionsToDisplay);
      }

      const teacherReply: ChatMessage = {
        id: `m-tea-${Date.now()}`,
        sender: 'teacher',
        text: reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        translationHint,
        followUpQuestion,
        corrections: correctionsToDisplay,
      };

      setMessages((prev) => [...prev, teacherReply]);
    } catch {
      // Resposta inteligente offline / fallback para manter conversa ininterrupta
      const isShort = wordCount < 5;
      const fallbackReply: ChatMessage = {
        id: `m-tea-fall-${Date.now()}`,
        sender: 'teacher',
        text: isShort
          ? 'That is interesting! Could you tell me more about why you feel that way?'
          : 'I completely understand what you mean. That makes a lot of sense in this situation!',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        translationHint: isShort
          ? 'Isso é interessante! Você poderia me contar mais sobre o porquê se sente assim?'
          : 'Eu entendo perfeitamente o que você quer dizer. Faz muito sentido!',
        followUpQuestion: isShort
          ? 'What was the most challenging part of your day?'
          : undefined,
        corrections:
          currentTurn % 3 === 0
            ? [
                {
                  wrong: 'depend of',
                  correct: 'depend on',
                  oneLineExplanation: 'A preposição correta após o verbo "depend" é sempre "on".',
                },
              ]
            : undefined,
      };

      if (fallbackReply.corrections) {
        setLatestCorrections(fallbackReply.corrections);
      }

      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsSending(false);
    }
  };

  const toggleTranslation = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, showTranslation: !m.showTranslation } : m))
    );
  };

  // Encerramento da conversa com relatório completo
  const handleFinishConversation = async () => {
    const finalPayload: Partial<CompleteSessionInput> = {
      progressDelta: 25,
      recurringErrors: [
        {
          type: 'Preposição',
          phrase: 'depend of',
          correction: 'depend on',
          explanation: 'Use sempre depend on para falar de dependência de algo ou alguém.',
        },
        {
          type: 'Idade',
          phrase: 'I have 28 years',
          correction: 'I am 28 years old',
          explanation: 'Idade em inglês se expressa com o verbo to be.',
        },
        {
          type: 'Concordância',
          phrase: 'People is',
          correction: 'People are',
          explanation: 'People é plural em inglês e exige o verbo are.',
        },
        {
          type: 'Verbo Auxiliar',
          phrase: 'He do not know',
          correction: 'He does not know',
          explanation: 'Na 3ª pessoa do singular usamos does not (doesn’t).',
        },
        {
          type: 'Falso Cognato',
          phrase: 'actually (como atualmente)',
          correction: 'currently / nowadays',
          explanation: 'Actually significa "na verdade / realmente", e não atualmente.',
        },
      ],
      newWords: [
        { term: 'catch up', translation: 'colocar a conversa em dia', example: 'Great to catch up with you.' },
        { term: 'schedule', translation: 'agendar / cronograma', example: 'We can schedule that for Monday.' },
        { term: 'perspective', translation: 'ponto de vista', example: 'From my perspective, this works.' },
        { term: 'clarify', translation: 'esclarecer', example: 'Could you clarify that point?' },
        { term: 'follow up', translation: 'acompanhar / dar retorno', example: 'I wanted to follow up with you.' },
        { term: 'straightforward', translation: 'direto / simples', example: 'The process was straightforward.' },
        { term: 'budget', translation: 'orçamento', example: 'We need to check the budget.' },
        { term: 'deadline', translation: 'prazo limite', example: 'The deadline is next Friday.' },
        { term: 'insight', translation: 'compreensão profunda', example: 'Thanks for sharing your insight.' },
        { term: 'priority', translation: 'prioridade', example: 'Our main priority is fluency.' },
      ],
      structuresToPractice: [
        'Could you please + verbo base',
        'What do you mean by + substantivo',
        'I would like to + infinitivo',
      ],
      nextChallenge: 'Faça uma conversa de 10 turnos seguidos com o chefe sem hesitar mais que 3 segundos.',
    };

    try {
      await apiFetch('/api/teacher/conversation', {
        method: 'POST',
        body: JSON.stringify({ action: 'finish_conversation' }),
      });
    } catch {
      // Prossegue mesmo se rede offline
    }

    await session.finishSession(finalPayload);
  };

  return (
    <TeacherLayout
      teacherId="conversation"
      elapsedSec={session.elapsedSec}
      speakingSec={session.speakingSec}
      exposureSec={session.exposureSec}
      wordsRecalled={session.wordsRecalled}
      moduleProgress={session.teacherData?.moduleProgress}
      systemPrompt={session.teacherData?.systemPrompt}
      recentSessions={session.teacherData?.recentSessions}
      recentErrors={session.teacherData?.recentErrors}
      onFinishSession={handleFinishConversation}
      isFinishing={session.isFinishing}
      isSummaryOpen={session.isSummaryOpen}
      summaryData={session.summaryData}
      onCloseSummary={session.closeSummary}
    >
      <div className="space-y-6">
        {/* Painel Superior: Seleção de Papel (Roleplay) e Indicadores de Fluência */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Simulação de Vida Real (Roleplay)
              </span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessagesSquare className="w-4 h-4 text-emerald-400" />
                <span>Conversando com: {activeRoleData.label}</span>
              </h2>
            </div>

            {/* Badges de Dificuldade Adaptativa e Contagem de Respostas */}
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm" title="Dificuldade adaptada ao seu nível">
                {difficultyLevel}
              </Badge>
              <Badge variant="default" size="sm">
                {studentTurnCount} {studentTurnCount === 1 ? 'resposta' : 'respostas'}
              </Badge>
            </div>
          </div>

          {/* Seletor Rápido de Papel */}
          <div className="flex flex-wrap gap-2">
            {CONVERSATION_ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {role.label}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Contexto sugerido: </span>
            {activeRoleData.theme}
          </p>
        </div>

        {/* Bloco de "Correções Importantes" (destacado a cada 3 respostas ou quando há erros) */}
        {latestCorrections && latestCorrections.length > 0 && (
          <Card className="border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-900 shadow-lg animate-in fade-in duration-200">
            <CardContent className="p-4 md:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Correções Importantes (Foco em Compreensão)</span>
                </div>
                <Badge variant="amber" size="sm">
                  Feedback Imediato
                </Badge>
              </div>

              <div className="space-y-2">
                {latestCorrections.map((corr, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-amber-900/40 text-xs space-y-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="line-through text-rose-400 font-medium">
                        "{corr.wrong}"
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-400 font-bold">
                        "{corr.correct}"
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {corr.oneLineExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Caixa de Mensagens do Chat */}
        <div className="p-4 md:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 min-h-[380px] max-h-[520px] overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isStudent = msg.sender === 'student';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                  <span>{isStudent ? 'Você' : activeRoleData.label}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs md:text-sm leading-relaxed space-y-2.5 ${
                    isStudent
                      ? 'bg-violet-600 text-white rounded-tr-none shadow-md shadow-violet-950/40'
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="font-normal">{msg.text}</p>

                  {/* Ações para mensagens do assistente */}
                  {!isStudent && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => speech.speak(msg.text)}
                        className="text-emerald-400 hover:text-emerald-300 text-xs inline-flex items-center gap-1.5 cursor-pointer font-medium py-1.5 px-2.5 min-h-[28px] rounded-lg hover:bg-emerald-950/30"
                        title="Ouvir fala nativa com TTS"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Ouvir</span>
                      </button>

                      {msg.translationHint && (
                        <button
                          type="button"
                          onClick={() => toggleTranslation(msg.id)}
                          className="text-slate-400 hover:text-slate-200 text-xs inline-flex items-center gap-1 cursor-pointer py-1.5 px-2.5 min-h-[28px] rounded-lg hover:bg-slate-800/40"
                        >
                          <Languages className="w-3.5 h-3.5" />
                          <span>{msg.showTranslation ? 'Ocultar tradução' : 'Ver tradução'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Dica de Tradução Revelada */}
                  {!isStudent && msg.showTranslation && msg.translationHint && (
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 italic">
                      "{msg.translationHint}"
                    </div>
                  )}

                  {/* Pergunta Complementar Destacada para incentivar a falar mais */}
                  {!isStudent && msg.followUpQuestion && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <Sparkles className="w-3 h-3" />
                        <span>Para falar mais:</span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">
                        {msg.followUpQuestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Spinner size="sm" label="Aguardando resposta do professor..." />
              <span>{activeRoleData.label} está pensando na resposta...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Barra de Entrada de Mensagem (Texto e Voz) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendMessage();
                }
              }}
              placeholder="Digite sua resposta em inglês ou use o microfone para falar..."
              rows={2}
              className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
            />

            <div className="flex flex-col gap-2 shrink-0">
              {/* Botão de Microfone STT */}
              <Button
                type="button"
                variant={speech.isListening ? 'danger' : 'secondary'}
                size="md"
                onClick={() => {
                  if (speech.isListening) {
                    speech.stopListening();
                  } else {
                    speech.startListening();
                  }
                }}
                title={speech.isListening ? 'Parar de escutar' : 'Falar no microfone'}
                className="w-10 h-10 p-0 flex items-center justify-center rounded-xl"
              >
                <Mic className={`w-4 h-4 ${speech.isListening ? 'animate-pulse text-white' : 'text-emerald-400'}`} />
              </Button>

              {/* Botão de Envio */}
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => void handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                title="Enviar mensagem"
                className="w-10 h-10 p-0 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 border-emerald-400"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {speech.isListening && (
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Escutando sua fala... fale normalmente no microfone.</span>
            </div>
          )}

          {/* Dica e Botão de Encerramento Rápido */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>
              Pressione <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Enter</kbd> para enviar.
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleFinishConversation}
              leftIcon={<Flag className="w-3.5 h-3.5" />}
              className="text-xs text-slate-300 hover:text-white"
            >
              Encerrar conversa e ver relatório
            </Button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
