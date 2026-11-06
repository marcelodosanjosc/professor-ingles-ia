import type {
  ArchitectPlanData,
  ListeningSessionData,
  SpeakingDrillData,
  PronunciationGuideData,
  DirectThinkingData,
  ImmersionPlanData,
  PromptVariable,
} from '@fluencialab/shared';

export function generateArchitectPlan(
  vars: Record<PromptVariable, string>,
): ArchitectPlanData {
  const lang = vars.IDIOMA || 'Inglês';
  const minutes = parseInt(vars.MINUTOS, 10) || 30;
  const m1 = Math.max(5, Math.round(minutes * 0.35));
  const m2 = Math.max(5, Math.round(minutes * 0.35));
  const m3 = Math.max(5, minutes - m1 - m2);

  return {
    diagnosis: {
      currentStage: `Estágio ${vars.NÍVEL || 'A2'} com foco prático em ${vars.OBJETIVO || 'conversação'}`,
      strengths: [
        `Comprometimento diário de ${minutes} minutos`,
        `Interesse temático claro em ${vars.INTERESSES || 'comunicação prática'}`,
        'Capacidade de assimilação de padrões funcionais',
      ],
      bottlenecks: [
        `Travamento na área de ${vars.DIFICULDADE || 'fala rápida'}`,
        `Hesitação em situações como: ${vars.SITUAÇÕES_TRAVA || 'reuniões e conversas espontâneas'}`,
        `Insegurança com fonemas críticos: ${vars.SONS_DIFÍCEIS || 'sons conectados e vogais reduzidas'}`,
      ],
      paretoFocus: `Dominar os 10 padrões de fala imediata e as 300 expressões que compõem 80% do uso real em ${lang}`,
    },
    learnFirst: [
      {
        category: 'Expressões de Sobrevivência (Top 50)',
        items: [
          'Could you repeat that, please?',
          'What do you mean by that?',
          'Let me think about it',
          'That makes sense',
        ],
        whyItMatters: 'Permite manter qualquer diálogo vivo sem travar quando faltar vocabulário específico.',
      },
      {
        category: '10 Ganchos de Abertura Imediata',
        items: [
          'I want to / I need to',
          'I think that / I believe',
          'It depends on / To be honest',
        ],
        whyItMatters: 'Elimina o silêncio constrangedor nos primeiros 3 segundos de resposta.',
      },
      {
        category: 'Fonemas de Alto Impacto',
        items: ['Vogais curtas vs longas', 'Conexões entre palavras consonant-vowel', 'Reduções como gonna, wanna, gotta'],
        whyItMatters: 'Garante compreensão auditiva imediata de falantes nativos acelerados.',
      },
    ],
    phases: [
      {
        number: 1,
        title: 'Fase 1: Fundação e Sobrevivência',
        daysRange: 'Dias 1–30',
        priorityVocab: [
          'Top 50 Expressões de Sobrevivência',
          'Apresentar-se e Socializar',
          'Pedir Ajuda e Informação',
        ],
        essentialGrammar: [
          'Presente simples e passado imediato com ganchos fixos',
          'Perguntas diretas com do/does/did sem reflexão teórica',
        ],
        listeningDrill: 'Treino de Níveis 1 e 2 com decodificação de contrações básicas',
        speakingDrill: 'Disparo de respostas em até 5 segundos com os 10 padrões essenciais',
        readingWritingDrill: 'Diário de 5 linhas no fim do dia expressando a rotina',
        reviewProtocol: 'Revisão diária de 20 cards no SRS (SM-2)',
      },
      {
        number: 2,
        title: 'Fase 2: Conexão e Velocidade',
        daysRange: 'Dias 31–60',
        priorityVocab: [
          'Opinião, Concordância e Discordância',
          'Trabalho, Negócios e Imprevistos',
          'Tempo e Rotina',
        ],
        essentialGrammar: [
          'Conectivos de fluxo (however, therefore, as far as I know)',
          'Estruturas condicionais de uso diário (if I had to choose...)',
        ],
        listeningDrill: 'Níveis 3 e 4 com fala acelerada e linked sounds em séries/vídeos',
        speakingDrill: 'Rodada 2 com reformulação imediata e exercícios de substituição',
        readingWritingDrill: 'Resumo oral de notícias curtas e gravação de áudio de 2 minutos',
        reviewProtocol: 'Revisão de cards acumulados e testes semanais de 15 frases de pronúncia',
      },
      {
        number: 3,
        title: 'Fase 3: Autonomia e Pensamento Direto',
        daysRange: 'Dias 61–90',
        priorityVocab: [
          '30 Chunks Nativos de Pensamento Direto',
          'Expressões Idiomáticas de Alto Impacto',
          'Sentimentos e Reações Rápidas',
        ],
        essentialGrammar: [
          'Padrões de discurso espontâneo e perguntas inesperadas',
          'Eliminação definitiva das armadilhas de tradução literal',
        ],
        listeningDrill: 'Nível 5 fala ultrarrápida nativa com sons engolidos',
        speakingDrill: 'Simulação de conversas completas de 15 minutos sem interrupção',
        readingWritingDrill: 'Narração mental de 10 minutos em tempo real durante atividades diárias',
        reviewProtocol: 'Manutenção de fluência ativa e autoavaliação final',
      },
    ],
    dailyRoutine: [
      {
        blockName: 'Aquecimento Auditivo e Fonético',
        minutes: m1,
        activity: `Treino de decodificação e shadowing no Treinador de Ouvido`,
        teacherSlug: 'ouvido',
      },
      {
        blockName: 'Destravamento de Fala Rápida',
        minutes: m2,
        activity: `Respostas imediatas em até 5 segundos no Destruidor de Bloqueio`,
        teacherSlug: 'fala',
      },
      {
        blockName: 'Revisão Ativa e Fixação Espaçada',
        minutes: m3,
        activity: `Revisão SM-2 no Professor de Vocabulário e diário de imersão`,
        teacherSlug: 'vocabulario',
      },
    ],
    weeklyGoals: [
      {
        id: 'goal-speaking-1',
        title: `Gravar teste de fala de 60 segundos com o Destruidor de Bloqueio em ${lang}`,
        done: false,
        kind: 'speaking_test',
      },
      {
        id: 'goal-comprehension-1',
        title: 'Completar teste de compreensão auditiva com fala rápida no Treinador de Ouvido',
        done: false,
        kind: 'comprehension_test',
      },
      {
        id: 'goal-vocab-active',
        title: 'Dominar 25 novos cards no SRS com acurácia acima de 85%',
        done: false,
        kind: 'other',
      },
      {
        id: 'goal-conversation-sim',
        title: 'Completar 2 sessões de conversação simulada de pelo menos 10 turnos',
        done: false,
        kind: 'other',
      },
    ],
    checkpoints: [
      { day: 14, title: 'Primeiras 50 expressões essenciais e domínio dos ganchos básicos', done: false },
      { day: 28, title: 'Sobrevivência comunicativa e fim da Fase 1', done: false },
      { day: 42, title: 'Respostas em até 5 segundos sem bloqueio mental', done: false },
      { day: 56, title: 'Conectivos avançados e compreensão de fala rápida com ligações', done: false },
      { day: 70, title: 'Conversas espontâneas de 15 minutos sem auxílio de tradução', done: false },
      { day: 84, title: 'Imersão ambiental completa e pensamento direto contínuo', done: false },
      { day: 90, title: 'Avaliação final de autonomia e certificação de fluência prática', done: false },
    ],
    ignoreList: [
      {
        topic: 'Future Perfect Continuous (will have been doing)',
        reason: 'Raríssimo no diálogo cotidiano de 90 dias; aprender isso agora só gera sobrecarga inútil.',
      },
      {
        topic: 'Voz Passiva complexa com verbos modais e preposições duplas',
        reason: 'Nativos preferem construções ativas e diretas em situações reais de conversa.',
      },
      {
        topic: 'Vocabulário literário arcaico e termos jurídicos/acadêmicos raros',
        reason: 'Desvia o foco das 300 palavras que realmente resolvem 80% das interações.',
      },
      {
        topic: 'Regras pedantes de pontuação formal e gramática prescritiva extrema',
        reason: 'A prioridade absoluta é velocidade comunicativa e clareza de mensagem falada.',
      },
    ],
  };
}

export function generateListeningData(
  contentType: string,
  vars: Record<PromptVariable, string>,
): ListeningSessionData {
  const lang = vars.IDIOMA || 'Inglês';

  return {
    contentType: contentType || 'series',
    levels: [
      {
        level: 1,
        title: 'Nível 1: Fala Nítida e Articulada',
        phrase: 'I am going to have a meeting with my manager tomorrow.',
        translation: 'Eu vou ter uma reunião com meu gerente amanhã.',
        phoneticBreakdown: 'aɪ æm ˈɡoʊɪŋ tuː hæv ə ˈmiːtɪŋ wɪð maɪ ˈmænɪdʒər təˈmɒroʊ',
        reductionsAndLinks: [
          { written: 'I am', spokenAs: 'I’m', explanation: 'Contração do pronome com o verbo to be.' },
        ],
      },
      {
        level: 2,
        title: 'Nível 2: Fala Casual Padrão',
        phrase: 'I’m gonna have a meeting with my manager tomorrow.',
        translation: 'Vou ter uma reunião com meu gerente amanhã.',
        phoneticBreakdown: 'aɪm ˈɡənə hæv ə ˈmiːtɪŋ wɪð maɪ ˈmænɪdʒər təˈmɒroʊ',
        reductionsAndLinks: [
          { written: 'going to', spokenAs: 'gonna', explanation: 'Redução universal de "going to" em contexto informal.' },
        ],
      },
      {
        level: 3,
        title: 'Nível 3: Fala Rápida com Reduções Naturais',
        phrase: 'I’m gonna hav’a meeting with my manager tomorrow.',
        translation: 'Vou ter uma reunião com meu gerente amanhã.',
        phoneticBreakdown: 'aɪm ˈɡənə ˈhævə ˈmiːdɪŋ wɪð maɪ ˈmænədʒər təˈmɑːroʊ',
        reductionsAndLinks: [
          { written: 'have a', spokenAs: 'hav’a (/ˈhævə/)', explanation: 'Ligação de consoante final com vogal inicial (consonant to vowel link).' },
          { written: 'meeting', spokenAs: 'meeding (/ˈmiːdɪŋ/)', explanation: 'Flap T característico do inglês norte-americano.' },
        ],
      },
      {
        level: 4,
        title: 'Nível 4: Connected Speech e Som Engolido',
        phrase: 'Imma hava meetin’ with my manager tomorrow.',
        translation: 'Vou ter uma reunião com meu chefe amanhã.',
        phoneticBreakdown: 'ˈaɪmə ˈhævə ˈmiːtn̩ wɪ maɪ ˈmænədʒər təˈmɑːroʊ',
        reductionsAndLinks: [
          { written: 'I’m gonna', spokenAs: 'Imma (/ˈaɪmə/)', explanation: 'Redução acelerada em contexto coloquial de alta velocidade.' },
          { written: 'meeting', spokenAs: 'meetin’ (/ˈmiːtn̩/)', explanation: 'Queda do "g" final e parada glotal na sílaba tônica.' },
          { written: 'with my', spokenAs: 'wimy', explanation: 'O "th" é neutralizado diante do "m" na fala veloz.' },
        ],
      },
      {
        level: 5,
        title: 'Nível 5: Fala Ultrarrápida de Nativos',
        phrase: 'Imma’v’a meet’n’w’my manag’r t’morra.',
        translation: 'Vou ter uma reunião com meu gerente amanhã.',
        phoneticBreakdown: 'aɪm əv ə ˈmiːtn̩ w maɪ ˈmænɪdʒər təˈmɔːrə',
        reductionsAndLinks: [
          { written: 'I am going to have a', spokenAs: 'Imma’v’a', explanation: 'Compressão rítmica de 6 palavras em 2 batidas silábicas.' },
          { written: 'tomorrow', spokenAs: 't’morra', explanation: 'Vogais átonas engolidas pelo ritmo baseado em ênfase (stress-timed).' },
        ],
      },
    ],
    shadowingSentences: [
      {
        id: 'shad-1',
        phrase: 'What are you doing tonight? -> Whaddya doin’ tonight?',
        rhythmTip: 'Dê peso em DOIN’ e NIGHT; transforme "What are you" numa batida suave "Whaddya".',
        swallowedSound: 'O "t" final de "what" vira um flap suave e o "are" é reduzido a schwa.',
      },
      {
        id: 'shad-2',
        phrase: 'I should have told you earlier -> I shoulda told ya earlier.',
        rhythmTip: 'Ênfase em TOLD e EARLIER. "Should have" compacta em "shoulda".',
        swallowedSound: 'O fonema /v/ de "have" praticamente desaparece.',
      },
      {
        id: 'shad-3',
        phrase: 'Do you want to grab a cup of coffee? -> Wanna grabba cuppa coffee?',
        rhythmTip: 'Ritmo rápido 3 tempos: GRABBA - CUPPA - COFFEE.',
        swallowedSound: 'Queda completa de "Do you", e "of" vira apenas /ə/.',
      },
      {
        id: 'shad-4',
        phrase: 'Could you please check this out? -> Couldja please check thisout?',
        rhythmTip: 'Conecte "check" com "this out": o k gruda no th.',
        swallowedSound: 'Could you funde em /kʊdʒə/.',
      },
      {
        id: 'shad-5',
        phrase: 'I don’t know what happened -> I dunno what happened.',
        rhythmTip: 'Diga "dunno" sem pausar entre don’t e know.',
        swallowedSound: 'O /t/ de don’t e o /k/ mudo somem totalmente.',
      },
      {
        id: 'shad-6',
        phrase: 'Let me know if you need anything -> Lemme know ifya need anything.',
        rhythmTip: 'LEMME KNOW é um bloco único de disparo.',
        swallowedSound: 'O /t/ de "let" assimila no /m/.',
      },
      {
        id: 'shad-7',
        phrase: 'Give it to me right now -> Givit t’me right now.',
        rhythmTip: 'Conecte "give it": GIVIT com /v/ ligado ao /ɪt/.',
        swallowedSound: 'O "to" vira um "t" rápido sem vogal clara.',
      },
      {
        id: 'shad-8',
        phrase: 'He is going to be late -> He’s gonna be late.',
        rhythmTip: 'LATE recebe toda a energia da frase.',
        swallowedSound: 'Going to vira gonna.',
      },
      {
        id: 'shad-9',
        phrase: 'I have got to go -> I gotta go.',
        rhythmTip: 'Duas sílabas rítmicas: GOT-TA GO.',
        swallowedSound: 'Have got to vira o clássico "gotta".',
      },
      {
        id: 'shad-10',
        phrase: 'What did you think of the presentation? -> Whajjya think of the presentation?',
        rhythmTip: 'THINK e PRESENTATION são os picos de entonação.',
        swallowedSound: 'What did you vira /wɒdʒə/.',
      },
    ],
    dailyRoutine15Min: [
      {
        minutes: 4,
        step: 'Etapa 1: Escuta Global sem Texto',
        instruction: 'Feche os olhos e ouça o áudio real 2 vezes prestando atenção na melodia e na ideia geral.',
      },
      {
        minutes: 4,
        step: 'Etapa 2: Decodificação com Análise Fonética',
        instruction: 'Abra a transcrição e identifique exatamente as reduções, contrações e conexões de palavras.',
      },
      {
        minutes: 4,
        step: 'Etapa 3: Shadowing Ativo (Fala Simultânea)',
        instruction: 'Fale por cima do áudio original imitando milissegundo a milissegundo o ritmo, pausas e entonação.',
      },
      {
        minutes: 3,
        step: 'Etapa 4: Gravação e Validação sem Texto',
        instruction: 'Grave a sua própria voz falando as frases decoradas e compare a cadência com o original.',
      },
    ],
  };
}

export function generateSpeakingDrill(
  vars: Record<PromptVariable, string>,
): SpeakingDrillData {
  const lang = vars.IDIOMA || 'Inglês';

  // 10 padrões essenciais
  const corePatterns = [
    {
      id: 'pat-1',
      ptTrigger: 'Eu quero...',
      targetPattern: 'I want to / I’d like to...',
      examples: ['I want to explain why this happened.', 'I’d like to see the numbers before deciding.'],
    },
    {
      id: 'pat-2',
      ptTrigger: 'Eu preciso...',
      targetPattern: 'I need to / I have to...',
      examples: ['I need to double-check this information.', 'I have to leave in ten minutes.'],
    },
    {
      id: 'pat-3',
      ptTrigger: 'Eu acho que...',
      targetPattern: 'I think that / In my opinion...',
      examples: ['I think that this is our best alternative.', 'I believe we can finish this today.'],
    },
    {
      id: 'pat-4',
      ptTrigger: 'Eu fui...',
      targetPattern: 'I went to / I was at...',
      examples: ['I went to the store this morning.', 'I was at the conference last Thursday.'],
    },
    {
      id: 'pat-5',
      ptTrigger: 'Eu vou...',
      targetPattern: 'I’m going to / I will...',
      examples: ['I’m going to call them back right now.', 'I will send the file in a moment.'],
    },
    {
      id: 'pat-6',
      ptTrigger: 'Eu prefiro...',
      targetPattern: 'I prefer to / I’d rather...',
      examples: ['I prefer to work remotely.', 'I’d rather meet tomorrow morning.'],
    },
    {
      id: 'pat-7',
      ptTrigger: 'Eu discordo...',
      targetPattern: 'I disagree because / I see it differently...',
      examples: ['I disagree because the cost is too high.', 'I see it differently based on the data.'],
    },
    {
      id: 'pat-8',
      ptTrigger: 'Depende de...',
      targetPattern: 'It depends on...',
      examples: ['It depends on what the client says.', 'It depends on how much time we have left.'],
    },
    {
      id: 'pat-9',
      ptTrigger: 'Nunca fiz isso...',
      targetPattern: 'I’ve never done that / I haven’t tried that yet...',
      examples: ['I’ve never done that before, but I can learn.', 'I haven’t used this software yet.'],
    },
    {
      id: 'pat-10',
      ptTrigger: 'Já aconteceu comigo...',
      targetPattern: 'That happened to me / I’ve been through that...',
      examples: ['That happened to me a few years ago.', 'I’ve had that exact same issue before.'],
    },
  ];

  // 40 estímulos em 3 dificuldades
  const rapidStimuli: SpeakingDrillData['rapidStimuli'] = [];
  const basePrompts = [
    { pt: 'Diga que você precisa sair agora.', anchor: 'I need to', sample: 'I need to leave right now.', re: 'Diga a mesma coisa de outra forma.', sampleRe: 'I have to get going immediately.', diff: 'easy' as const },
    { pt: 'Diga que você quer um copo de água.', anchor: 'I want', sample: 'I want a glass of water, please.', re: 'Peça de forma mais educada.', sampleRe: 'Could I get some water, please?', diff: 'easy' as const },
    { pt: 'Diga que você acha uma ótima ideia.', anchor: 'I think', sample: 'I think that is a great idea.', re: 'Use outra expressão de concordância.', sampleRe: 'That sounds fantastic to me.', diff: 'easy' as const },
    { pt: 'Diga que você foi ao supermercado ontem.', anchor: 'I went', sample: 'I went to the supermarket yesterday.', re: 'Diga com outras palavras.', sampleRe: 'I bought groceries yesterday afternoon.', diff: 'easy' as const },
    { pt: 'Diga que você vai viajar no fim de semana.', anchor: 'I’m going to', sample: 'I’m going to travel this weekend.', re: 'Diga de outra forma.', sampleRe: 'I will be out of town this weekend.', diff: 'easy' as const },
    { pt: 'Diga que você prefere chá a café.', anchor: 'I prefer', sample: 'I prefer tea over coffee.', re: 'Diga usando "rather".', sampleRe: 'I’d rather drink tea than coffee.', diff: 'easy' as const },
    { pt: 'Diga que depende do clima amanhã.', anchor: 'It depends on', sample: 'It depends on the weather tomorrow.', re: 'Diga com outras palavras.', sampleRe: 'If it rains tomorrow, we won’t go.', diff: 'easy' as const },
    { pt: 'Diga que você nunca viu esse filme.', anchor: 'I’ve never', sample: 'I’ve never seen this movie before.', re: 'Diga de forma alternativa.', sampleRe: 'This is my first time watching this film.', diff: 'easy' as const },
    { pt: 'Diga que isso já aconteceu com você antes.', anchor: 'That happened', sample: 'That happened to me before.', re: 'Diga com outras palavras.', sampleRe: 'I experienced the exact same thing last year.', diff: 'easy' as const },
    { pt: 'Diga que você não concorda com o plano.', anchor: 'I disagree', sample: 'I disagree with this plan.', re: 'Suavize a discordância.', sampleRe: 'I’m not entirely sure about this direction.', diff: 'easy' as const },
    { pt: 'Diga que você não entendeu o que ele disse.', anchor: 'I didn’t catch', sample: 'I didn’t catch what you said.', re: 'Peça repetição.', sampleRe: 'Could you repeat that more slowly?', diff: 'easy' as const },
    { pt: 'Diga que você está ocupado no momento.', anchor: 'I’m busy', sample: 'I’m really busy right now.', re: 'Diga de forma mais corporativa.', sampleRe: 'My hands are a bit full at the moment.', diff: 'easy' as const },
    { pt: 'Diga que você vai resolver esse problema.', anchor: 'I will take care', sample: 'I will take care of this problem.', re: 'Diga de outra forma.', sampleRe: 'Leave it with me; I’ll handle it.', diff: 'easy' as const },
  ];

  for (let i = 1; i <= 40; i++) {
    const base = basePrompts[(i - 1) % basePrompts.length]!;
    const diff = i <= 15 ? 'easy' : i <= 30 ? 'medium' : 'hard';
    rapidStimuli.push({
      id: i,
      difficulty: diff,
      promptPt: `${base.pt} (Item ${i})`,
      expectedAnchor: base.anchor,
      sampleAnswer: base.sample,
      rephrasePrompt: base.re,
      sampleRephrase: base.sampleRe,
    });
  }

  // 15 exercícios de substituição
  const substitutionExercises: SpeakingDrillData['substitutionExercises'] = [
    {
      id: 1,
      template: 'I want to [VERB] [OBJECT]',
      baseSentence: 'I want to send an email.',
      variations: [
        { cue: 'ligar para o cliente', expected: 'I want to call the client.' },
        { cue: 'comprar uma passagem', expected: 'I want to buy a ticket.' },
        { cue: 'fazer uma pausa', expected: 'I want to take a break.' },
      ],
    },
    {
      id: 2,
      template: 'I need to [VERB] before [TIME/EVENT]',
      baseSentence: 'I need to finish this before 5 PM.',
      variations: [
        { cue: 'sair antes da reunião', expected: 'I need to leave before the meeting.' },
        { cue: 'comer antes de viajar', expected: 'I need to eat before traveling.' },
      ],
    },
    {
      id: 3,
      template: 'It depends on [FACTOR]',
      baseSentence: 'It depends on the budget.',
      variations: [
        { cue: 'o prazo final', expected: 'It depends on the deadline.' },
        { cue: 'a resposta deles', expected: 'It depends on their response.' },
      ],
    },
    {
      id: 4,
      template: 'I think we should [VERB]',
      baseSentence: 'I think we should wait a little.',
      variations: [
        { cue: 'começar agora', expected: 'I think we should start now.' },
        { cue: 'cancelar a chamada', expected: 'I think we should cancel the call.' },
      ],
    },
    {
      id: 5,
      template: 'I’ve never been to [PLACE]',
      baseSentence: 'I’ve never been to London.',
      variations: [
        { cue: 'Nova York', expected: 'I’ve never been to New York.' },
        { cue: 'essa conferência', expected: 'I’ve never been to that conference.' },
      ],
    },
  ];

  for (let i = 6; i <= 15; i++) {
    substitutionExercises.push({
      id: i,
      template: `I prefer to [VERB] instead of [VERB] (Variação ${i})`,
      baseSentence: 'I prefer to walk instead of taking the bus.',
      variations: [
        { cue: 'cozinhar em vez de pedir comida', expected: 'I prefer to cook instead of ordering food.' },
        { cue: 'ler em vez de assistir TV', expected: 'I prefer to read instead of watching TV.' },
      ],
    });
  }

  // 10 perguntas inesperadas
  const unexpectedQuestions = [
    {
      id: 1,
      question: 'What would you do if your flight was suddenly canceled right now?',
      translation: 'O que você faria se seu voo fosse cancelado de repente agora?',
      quickStarter: 'If that happened, I would immediately go to the service desk and ask for...',
    },
    {
      id: 2,
      question: 'Why should someone hire you over other qualified candidates?',
      translation: 'Por que alguém deveria te contratar em vez de outros candidatos?',
      quickStarter: 'What sets me apart is my ability to solve problems quickly and...',
    },
    {
      id: 3,
      question: 'If you had an extra hour every day, how would you spend it?',
      translation: 'Se você tivesse uma hora a mais por dia, como a usaria?',
      quickStarter: 'I would probably spend that extra hour exercising or reading because...',
    },
    {
      id: 4,
      question: 'What is the most challenging project you have worked on this year?',
      translation: 'Qual é o projeto mais desafiador em que você trabalhou este ano?',
      quickStarter: 'The most challenging project was when we had to deliver a system in...',
    },
    {
      id: 5,
      question: 'How do you handle disagreements with someone in your team?',
      translation: 'Como você lida com desentendimentos na sua equipe?',
      quickStarter: 'I usually try to listen to their point of view first, and then...',
    },
    {
      id: 6,
      question: 'What made you decide to master this language in 90 days?',
      translation: 'O que te fez decidir dominar este idioma em 90 dias?',
      quickStarter: 'I realized that speaking fluently would unlock new international opportunities like...',
    },
    {
      id: 7,
      question: 'Can you describe your ideal weekend in three sentences?',
      translation: 'Você pode descrever seu fim de semana ideal em três frases?',
      quickStarter: 'First, I would sleep in without an alarm. Then, I would...',
    },
    {
      id: 8,
      question: 'What is one habit you want to build this month?',
      translation: 'Qual é um hábito que você quer construir este mês?',
      quickStarter: 'I want to build a consistent daily routine of speaking practice because...',
    },
    {
      id: 9,
      question: 'If you could travel anywhere tomorrow, where would you go?',
      translation: 'Se você pudesse viajar para qualquer lugar amanhã, para onde iria?',
      quickStarter: 'I would book a ticket to Japan because I have always been fascinated by...',
    },
    {
      id: 10,
      question: 'How do you bounce back when a day does not go as planned?',
      translation: 'Como você se recupera quando um dia não sai como planejado?',
      quickStarter: 'I remind myself that one bad day doesn’t define my progress, and I focus on...',
    },
  ];

  return {
    corePatterns,
    rapidStimuli,
    substitutionExercises,
    unexpectedQuestions,
  };
}

export function generatePronunciationGuide(
  vars: Record<PromptVariable, string>,
): PronunciationGuideData {
  const native = vars.IDIOMA_NATIVO || 'Português';
  const lang = vars.IDIOMA || 'Inglês';

  return {
    top10Errors: [
      {
        id: 1,
        soundName: 'Som "TH" Não-Vozeado (/θ/)',
        isHighImpact: true,
        whatMouthDoes: 'Substitui o som por "f", "s" ou "t" encostando a língua nos dentes inferiores.',
        whatMouthShouldDo: 'Colocar a ponta da língua levemente entre os dentes incisivos e soprar ar contínuo.',
        tongueAndLips: 'Ponta da língua entre dentes, lábios relaxados, sem vibração nas cordas vocais.',
        wrongApproxExample: '"tink" ou "sink" em vez de "think"',
        correctExample: 'think (/θɪŋk/) com sopro suave',
        practiceWords: ['think', 'three', 'thanks', 'healthy', 'month'],
        minimalPairs: [
          { wordA: 'think', wordB: 'sink' },
          { wordA: 'three', wordB: 'tree' },
          { wordA: 'thanks', wordB: 'tanks' },
        ],
      },
      {
        id: 2,
        soundName: 'Vogal Curta /ɪ/ vs Vogal Longa /iː/',
        isHighImpact: true,
        whatMouthDoes: 'Pronuncia todas as vogais "i" como o "i" agudo e tenso do português.',
        whatMouthShouldDo: 'Relaxar a mandíbula para o /ɪ/ curto (som entre "e" e "i"), e esticar os lábios apenas no /iː/ longo.',
        tongueAndLips: 'Para /ɪ/: língua central relaxada, mandíbula caída 1 cm. Para /iː/: lábios em sorriso tenso.',
        wrongApproxExample: 'Dizer "sheep" quando queria dizer "ship"',
        correctExample: 'ship (/ʃɪp/) curto vs sheep (/ʃiːp/) longo',
        practiceWords: ['ship', 'sit', 'live', 'fit', 'bitch/beach'],
        minimalPairs: [
          { wordA: 'ship', wordB: 'sheep' },
          { wordA: 'sit', wordB: 'seat' },
          { wordA: 'live', wordB: 'leave' },
          { wordA: 'fit', wordB: 'feet' },
        ],
      },
      {
        id: 3,
        soundName: 'Acréscimo de Som "ee" no Final de Consoantes Mudos (Epêntese)',
        isHighImpact: true,
        whatMouthDoes: 'Adiciona um som de "i" após consoantes plosivas como /d/, /t/, /k/, /p/ (ex.: "like-ee", "facebook-ee").',
        whatMouthShouldDo: 'Interromper o ar imediatamente na consoante sem abrir a boca para emitir vogal extra.',
        tongueAndLips: 'A língua trava no palato e solta apenas uma leve explosão de ar seca.',
        wrongApproxExample: '"like-ee" em vez de "like"',
        correctExample: 'like (/laɪk/) com final seco e abrupto',
        practiceWords: ['like', 'stop', 'need', 'work', 'internet'],
        minimalPairs: [
          { wordA: 'work', wordB: 'workee (incorreto)' },
          { wordA: 'hot', wordB: 'hotee (incorreto)' },
        ],
      },
      {
        id: 4,
        soundName: 'Som "TH" Vozeado (/ð/)',
        isHighImpact: false,
        whatMouthDoes: 'Substitui por "d" ou "v" duro do português.',
        whatMouthShouldDo: 'Colocar a língua entre os dentes e vibrar as cordas vocais enquanto o ar passa.',
        tongueAndLips: 'Língua entre os dentes com vibração perceptível no pomo de adão.',
        wrongApproxExample: '"dis" ou "dat" em vez de "this" e "that"',
        correctExample: 'this (/ðɪs/) com zumbido entre os dentes',
        practiceWords: ['this', 'that', 'they', 'together', 'brother'],
        minimalPairs: [
          { wordA: 'they', wordB: 'day' },
          { wordA: 'then', wordB: 'den' },
        ],
      },
      {
        id: 5,
        soundName: 'O "R" Retroflexo Americano (/ɹ/)',
        isHighImpact: false,
        whatMouthDoes: 'Raspa a garganta com o "R" carioca/paulista inicial (som de "h" em "carro").',
        whatMouthShouldDo: 'Curvar a ponta da língua para trás em direção ao céu da boca sem encostar.',
        tongueAndLips: 'Lábios levemente arredondados, língua em colher retraída.',
        wrongApproxExample: 'Dizer "red" com som de "head"',
        correctExample: 'red (/ɹɛd/) com língua retraída',
        practiceWords: ['red', 'right', 'around', 'car', 'mirror'],
        minimalPairs: [
          { wordA: 'red', wordB: 'head' },
          { wordA: 'right', wordB: 'white' },
        ],
      },
      {
        id: 6,
        soundName: 'O "L" Escuro Final (Dark L - /ɫ/)',
        isHighImpact: false,
        whatMouthDoes: 'Transforma o "L" final em som de "U" (ex.: "brazil" -> "braziu", "feel" -> "fiu").',
        whatMouthShouldDo: 'Subir a parte traseira da língua em direção ao véu palatino enquanto a ponta toca os dentes.',
        tongueAndLips: 'Ponta no alvéolo superior, dorso da língua elevado criando som oco.',
        wrongApproxExample: '"piu" em vez de "pill"',
        correctExample: 'pill (/pɪɫ/) com ressonância profunda',
        practiceWords: ['feel', 'call', 'milk', 'people', 'world'],
        minimalPairs: [
          { wordA: 'feel', wordB: 'few' },
          { wordA: 'ball', wordB: 'bow' },
        ],
      },
      {
        id: 7,
        soundName: 'Pronúncia do "-ED" no Passado Regular (/t/, /d/, /ɪd/)',
        isHighImpact: false,
        whatMouthDoes: 'Pronuncia "-ed" como sílaba extra em todas as palavras (ex.: "work-ed", "help-ed").',
        whatMouthShouldDo: 'Adicionar sílaba extra SOMENTE se o verbo terminar em T ou D (ex.: wanted, needed). Nos outros, emitir apenas /t/ ou /d/.',
        tongueAndLips: 'Em "worked", passe direto do /k/ para o /t/ sem vogal.',
        wrongApproxExample: '"work-ed" (duas sílabas)',
        correctExample: 'worked (/wɜːrkt/) em uma única sílaba',
        practiceWords: ['worked', 'helped', 'called', 'started', 'decided'],
        minimalPairs: [
          { wordA: 'worked', wordB: 'work-ed (incorreto)' },
        ],
      },
      {
        id: 8,
        soundName: 'O "H" Aspirado (/h/) vs "R" Inicial',
        isHighImpact: false,
        whatMouthDoes: 'Confunde o "h" aspirado suave com a ausência de som ou com o "R" do português.',
        whatMouthShouldDo: 'Soltar um suspiro suave de ar quente, como se estivesse embaçando um espelho.',
        tongueAndLips: 'Garganta relaxada, lábios neutros, ar saindo suave sem fricção áspera.',
        wrongApproxExample: 'Confundir "hat" com "rat"',
        correctExample: 'hat (/hæt/) com suspiro suave',
        practiceWords: ['home', 'happy', 'hotel', 'hospital', 'ahead'],
        minimalPairs: [
          { wordA: 'hat', wordB: 'cat' },
          { wordA: 'heart', wordB: 'art' },
        ],
      },
      {
        id: 9,
        soundName: 'O "W" Semivogal (/w/) vs "V" Labiodental (/v/)',
        isHighImpact: false,
        whatMouthDoes: 'Morde o lábio inferior para pronunciar "w", trocando por "v".',
        whatMouthShouldDo: 'Fazer bico redondo com os lábios sem encostar nos dentes para o "w".',
        tongueAndLips: 'Bico firme projetado para frente como quem vai assobiar.',
        wrongApproxExample: 'Dizer "vest" quando queria dizer "west"',
        correctExample: 'west (/wɛst/) vs vest (/vɛst/)',
        practiceWords: ['water', 'west', 'week', 'wonder', 'always'],
        minimalPairs: [
          { wordA: 'west', wordB: 'vest' },
          { wordA: 'wet', wordB: 'vet' },
        ],
      },
      {
        id: 10,
        soundName: 'A Vogal Neutra Schwa (/ə/)',
        isHighImpact: false,
        whatMouthDoes: 'Pronuncia cada vogal átona com seu som literal e forte (ex.: "a-bout", "to-day").',
        whatMouthShouldDo: 'Emitir o som mais preguiçoso do inglês, com boca quase fechada e músculos totalmente soltos.',
        tongueAndLips: 'Mandíbula ligeiramente aberta, língua neutra no centro, som ultra-curto /ə/.',
        wrongApproxExample: '"Ah-merica" com primeiro "a" aberto',
        correctExample: 'America (/əˈmɛrɪkə/) com schwa no início e fim',
        practiceWords: ['about', 'problem', 'banana', 'support', 'camera'],
        minimalPairs: [
          { wordA: 'about', wordB: 'a-bout (tenso)' },
        ],
      },
    ],
    daily10MinRoutine: [
      {
        minutes: 3,
        title: 'Aquecimento Articulatório e Muscular',
        description: 'Alongamento de mandíbula, vibração labial (bzzz/brrr) e 10 repetições de língua entre os dentes (/θ/).',
      },
      {
        minutes: 4,
        title: 'Treino de Pares Mínimos',
        description: 'Repetição alternada de 5 pares mínimos contrastando vogais curtas e sons que você costuma confundir.',
      },
      {
        minutes: 3,
        title: 'Frases em Ritmo Real',
        description: 'Leitura em voz alta de 3 frases completas aplicando o connected speech e final seco nas consoantes.',
      },
    ],
    rhythmAndIntonation: [
      {
        rule: 'Palavras de Conteúdo vs Gramaticais',
        example: 'Dê ênfase a substantivos e verbos principais; reduza pronomes, preposições e artigos.',
      },
      {
        rule: 'Entonação Ascendente vs Descendente',
        example: 'Perguntas de Sim/Não sobem no final; perguntas com Wh- (What/Where/Why) descem no final.',
      },
      {
        rule: 'Linking de Consoante com Vogal',
        example: '"Turn on" soa como "tur-non"; "check in" soa como "che-kin".',
      },
    ],
    weeklyTestSentences: [
      { id: 1, phrase: 'I think three thousand people attended the festival.', focusSound: 'TH desvozeado /θ/', ipaOrApprox: 'aɪ θɪŋk θriː ˈθaʊzənd ˈpiːpəl əˈtɛndɪd ðə ˈfɛstəvəl' },
      { id: 2, phrase: 'Did you leave the keys on the ship or the sheep farm?', focusSound: 'Vogais /ɪ/ vs /iː/', ipaOrApprox: 'dɪd jʊ liːv ðə kiːz ɒn ðə ʃɪp ɔːr ðə ʃiːp fɑːrm' },
      { id: 3, phrase: 'She worked hard and stopped at the right moment.', focusSound: 'Terminações -ED e consoantes mudas', ipaOrApprox: 'ʃiː wɜːrkt hɑːrd ænd stɒpt æt ðə raɪt ˈmoʊmənt' },
      { id: 4, phrase: 'Could you give me a glass of cold milk, please?', focusSound: 'Dark L /ɫ/ e conexões', ipaOrApprox: 'kʊd jʊ ɡɪv miː ə ɡlæs əv koʊld mɪɫk pliːz' },
      { id: 5, phrase: 'They live together with their brother in that apartment.', focusSound: 'TH vozeado /ð/', ipaOrApprox: 'ðeɪ lɪv təˈɡɛðər wɪð ðɛər ˈbrʌðər ɪn ðæt əˈpɑːrtmənt' },
      { id: 6, phrase: 'We really want to travel around the world next year.', focusSound: 'R retroflexo e W semivogal', ipaOrApprox: 'wiː ˈrɪəli wɒnt tə ˈtrævəl əˈraʊnd ðə wɜːrld nɛkst jɪər' },
      { id: 7, phrase: 'He had a sudden heart attack and was taken to hospital.', focusSound: 'H aspirado /h/', ipaOrApprox: 'hiː hæd ə ˈsʌdən hɑːrt əˈtæk ænd wəz ˈteɪkən tə ˈhɒspɪtl̩' },
      { id: 8, phrase: 'What are you going to do about the budget problem?', focusSound: 'Schwa /ə/ e Flap T', ipaOrApprox: 'wʌt ɑːr jʊ ˈɡoʊɪŋ tə duː əˈbaʊt ðə ˈbʌdʒɪt ˈprɒbləm' },
      { id: 9, phrase: 'Can you walk me through the details once again?', focusSound: 'Dark L e ritmo', ipaOrApprox: 'kæn jʊ wɔːk miː θruː ðə ˈdiːteɪlz wʌns əˈɡɛn' },
      { id: 10, phrase: 'I appreciate your help with this challenging task.', focusSound: 'Conexões naturais', ipaOrApprox: 'aɪ əˈpriːʃieɪt jɔːr hɛlp wɪð ðɪs ˈtʃælɪndʒɪŋ tæsk' },
      { id: 11, phrase: 'There is no need to make it more complicated than it is.', focusSound: 'Final seco /d/ e /t/', ipaOrApprox: 'ðɛər ɪz noʊ niːd tə meɪk ɪt mɔːr ˈkɒmplɪkeɪtɪd ðæn ɪt ɪz' },
      { id: 12, phrase: 'Let’s meet halfway and find an acceptable solution.', focusSound: 'Entonação corporativa', ipaOrApprox: 'lɛts miːt ˌhɑːfˈweɪ ænd faɪnd ən əkˈsɛptəbəl səˈluːʃən' },
      { id: 13, phrase: 'I have never seen such a breathtaking view before.', focusSound: 'TH vozeado e TH surdo', ipaOrApprox: 'aɪ hæv ˈnɛvər siːn sʌtʃ ə ˈbrɛθˌteɪkɪŋ vjuː bɪˈfɔːr' },
      { id: 14, phrase: 'The meeting was scheduled ahead of time.', focusSound: 'Duração vocálica', ipaOrApprox: 'ðə ˈmiːtɪŋ wəz ˈskɛdʒuːld əˈhɛd əv taɪm' },
      { id: 15, phrase: 'Everything will fall into place sooner or later.', focusSound: 'Fluidez e connected speech', ipaOrApprox: 'ˈɛvriθɪŋ wɪl fɔːl ˈɪntə pleɪs ˈsuːnər ɔːr ˈleɪtər' },
    ],
  };
}

export function generateDirectThinkingData(
  vars: Record<PromptVariable, string>,
): DirectThinkingData {
  const lang = vars.IDIOMA || 'Inglês';

  // 20 objetos
  const stage1Objects = [
    { id: 1, visualCue: 'Chaves sobre a mesa', contextHintInTarget: 'Used to unlock the front door', expectedTerms: ['keys', 'car keys', 'house keys'] },
    { id: 2, visualCue: 'Garrafa térmica de café', contextHintInTarget: 'Keeps your drink hot during work', expectedTerms: ['thermos', 'coffee mug', 'cup'] },
    { id: 3, visualCue: 'Tela do notebook com abas abertas', contextHintInTarget: 'Main work tool for browsing', expectedTerms: ['laptop screen', 'tabs', 'monitor'] },
    { id: 4, visualCue: 'Fones de ouvido sem fio', contextHintInTarget: 'Wireless audio for calls and music', expectedTerms: ['earbuds', 'headphones', 'airpods'] },
    { id: 5, visualCue: 'Carteira no bolso', contextHintInTarget: 'Holds identification and cards', expectedTerms: ['wallet', 'credit card'] },
    { id: 6, visualCue: 'Carregador de celular na tomada', contextHintInTarget: 'Plugged into the wall socket', expectedTerms: ['phone charger', 'plug', 'cable'] },
    { id: 7, visualCue: 'Relógio no pulso', contextHintInTarget: 'Shows current time and notifications', expectedTerms: ['wrist watch', 'smartwatch', 'time'] },
    { id: 8, visualCue: 'Sapatos ao lado da porta', contextHintInTarget: 'Footwear waiting near the entrance', expectedTerms: ['shoes', 'sneakers', 'boots'] },
    { id: 9, visualCue: 'Janela com chuva lá fora', contextHintInTarget: 'Raindrops hitting the glass window', expectedTerms: ['window', 'rain', 'glass'] },
    { id: 10, visualCue: 'Mochila nas costas', contextHintInTarget: 'Carrying laptop and notebooks', expectedTerms: ['backpack', 'bag', 'briefcase'] },
    { id: 11, visualCue: 'Semáforo vermelho', contextHintInTarget: 'Signals drivers to stop', expectedTerms: ['traffic light', 'red light'] },
    { id: 12, visualCue: 'Espelho do banheiro', contextHintInTarget: 'Reflecting your face in the morning', expectedTerms: ['mirror', 'reflection'] },
    { id: 13, visualCue: 'Caneta esferográfica', contextHintInTarget: 'Blue ink writing instrument', expectedTerms: ['pen', 'ballpoint pen'] },
    { id: 14, visualCue: 'Interruptor de luz', contextHintInTarget: 'Mounted on the wall to toggle lights', expectedTerms: ['light switch', 'switch'] },
    { id: 15, visualCue: 'Maçaneta da porta', contextHintInTarget: 'Turn to open the door', expectedTerms: ['door handle', 'doorknob'] },
    { id: 16, visualCue: 'Travesseiro macio', contextHintInTarget: 'Under your head while sleeping', expectedTerms: ['pillow', 'cushion'] },
    { id: 17, visualCue: 'Guardanapo de papel', contextHintInTarget: 'Used to clean hands after meals', expectedTerms: ['napkin', 'paper towel'] },
    { id: 18, visualCue: 'Elevador do prédio', contextHintInTarget: 'Moving between building floors', expectedTerms: ['elevator', 'lift'] },
    { id: 19, visualCue: 'Guarda-chuva dobrável', contextHintInTarget: 'Protection against heavy rain', expectedTerms: ['umbrella'] },
    { id: 20, visualCue: 'Copo d’água gelada', contextHintInTarget: 'Refreshing drink on a hot day', expectedTerms: ['glass of water', 'cold water'] },
  ];

  // 20 ações
  const stage2Actions = [
    { id: 1, scenarioCue: 'Acordando e desligando o despertador', targetVerbHint: 'turn off', sampleShortSentence: 'I’m turning off my alarm now.' },
    { id: 2, scenarioCue: 'Escovando os dentes na pia', targetVerbHint: 'brush', sampleShortSentence: 'I’m brushing my teeth.' },
    { id: 3, scenarioCue: 'Passando café fresco', targetVerbHint: 'brew / make', sampleShortSentence: 'I’m brewing fresh coffee.' },
    { id: 4, scenarioCue: 'Abrindo o aplicativo de mensagens', targetVerbHint: 'check / open', sampleShortSentence: 'I’m checking my new messages.' },
    { id: 5, scenarioCue: 'Trancando a porta de casa', targetVerbHint: 'lock', sampleShortSentence: 'I’m locking the front door.' },
    { id: 6, scenarioCue: 'Entrando no carro ou ônibus', targetVerbHint: 'get in / get on', sampleShortSentence: 'I’m getting into the car.' },
    { id: 7, scenarioCue: 'Sentando na cadeira do escritório', targetVerbHint: 'sit down', sampleShortSentence: 'I’m sitting down at my desk.' },
    { id: 8, scenarioCue: 'Abrindo o e-mail de trabalho', targetVerbHint: 'log in / open', sampleShortSentence: 'I’m opening my inbox.' },
    { id: 9, scenarioCue: 'Digitando uma mensagem rápida', targetVerbHint: 'type', sampleShortSentence: 'I’m typing a quick reply.' },
    { id: 10, scenarioCue: 'Bebendo um gole de água', targetVerbHint: 'take a sip', sampleShortSentence: 'I’m taking a sip of water.' },
    { id: 11, scenarioCue: 'Atendendo uma chamada telefônica', targetVerbHint: 'pick up / answer', sampleShortSentence: 'I’m answering the phone.' },
    { id: 12, scenarioCue: 'Salvando um arquivo importante', targetVerbHint: 'save', sampleShortSentence: 'I’m saving this document.' },
    { id: 13, scenarioCue: 'Fechando a janela por causa do frio', targetVerbHint: 'shut / close', sampleShortSentence: 'I’m closing the window.' },
    { id: 14, scenarioCue: 'Pagando a conta pelo celular', targetVerbHint: 'pay', sampleShortSentence: 'I’m paying the bill online.' },
    { id: 15, scenarioCue: 'Lavando as mãos antes do almoço', targetVerbHint: 'wash', sampleShortSentence: 'I’m washing my hands.' },
    { id: 16, scenarioCue: 'Colocando os sapatos para sair', targetVerbHint: 'put on', sampleShortSentence: 'I’m putting on my sneakers.' },
    { id: 17, scenarioCue: 'Subindo as escadas', targetVerbHint: 'walk up / climb', sampleShortSentence: 'I’m walking up the stairs.' },
    { id: 18, scenarioCue: 'Carregando a bateria do celular', targetVerbHint: 'plug in', sampleShortSentence: 'I’m plugging in my phone.' },
    { id: 19, scenarioCue: 'Lendo uma notícia na internet', targetVerbHint: 'read', sampleShortSentence: 'I’m reading an article.' },
    { id: 20, scenarioCue: 'Apagando as luzes antes de dormir', targetVerbHint: 'turn off', sampleShortSentence: 'I’m turning off the lights.' },
  ];

  // 20 pensamentos
  const stage3Thoughts = [
    { id: 1, questionInTarget: 'What should I prioritize this morning?', starterTemplate: 'I need to focus on...', sampleAnswer: 'I need to focus on finishing the presentation first.' },
    { id: 2, questionInTarget: 'Why am I feeling slightly tired today?', starterTemplate: 'Probably because...', sampleAnswer: 'Probably because I went to bed too late last night.' },
    { id: 3, questionInTarget: 'What is the fastest route to my destination?', starterTemplate: 'Taking the subway would be...', sampleAnswer: 'Taking the subway would be much faster than driving right now.' },
    { id: 4, questionInTarget: 'Did I remember to reply to that email?', starterTemplate: 'Let me double-check...', sampleAnswer: 'Let me double-check my sent folder to be completely sure.' },
    { id: 5, questionInTarget: 'What do I feel like eating for lunch?', starterTemplate: 'I really crave...', sampleAnswer: 'I really crave something light, maybe a fresh salad.' },
    { id: 6, questionInTarget: 'How can I explain this concept more clearly?', starterTemplate: 'The best way is to...', sampleAnswer: 'The best way is to use a simple real-world analogy.' },
    { id: 7, questionInTarget: 'Is this meeting really necessary?', starterTemplate: 'To be honest, this could be...', sampleAnswer: 'To be honest, this could easily be an asynchronous update.' },
    { id: 8, questionInTarget: 'What is my main takeaway from this conversation?', starterTemplate: 'The key point is that...', sampleAnswer: 'The key point is that we must align on the budget by Friday.' },
    { id: 9, questionInTarget: 'Why did that person react that way?', starterTemplate: 'They might be under...', sampleAnswer: 'They might be under a lot of pressure today.' },
    { id: 10, questionInTarget: 'What will I do as soon as I get home?', starterTemplate: 'The first thing I’ll do is...', sampleAnswer: 'The first thing I’ll do is take a shower and relax.' },
    { id: 11, questionInTarget: 'Am I making progress towards my goal?', starterTemplate: 'Step by step, I can feel...', sampleAnswer: 'Step by step, I can feel that my speech is getting faster.' },
    { id: 12, questionInTarget: 'What is the worst that could happen?', starterTemplate: 'Even if it goes wrong...', sampleAnswer: 'Even if it goes wrong, we can always adjust the approach.' },
    { id: 13, questionInTarget: 'Do I have enough battery on my device?', starterTemplate: 'I’m at twenty percent, so...', sampleAnswer: 'I’m at twenty percent, so I better plug it in soon.' },
    { id: 14, questionInTarget: 'How can I make this task more enjoyable?', starterTemplate: 'Putting on some background music...', sampleAnswer: 'Putting on some background music will help me focus.' },
    { id: 15, questionInTarget: 'What is something I am grateful for right now?', starterTemplate: 'I’m genuinely thankful for...', sampleAnswer: 'I’m genuinely thankful for having time to study today.' },
    { id: 16, questionInTarget: 'What should I wear tomorrow?', starterTemplate: 'Looking at the forecast...', sampleAnswer: 'Looking at the forecast, I should wear a light jacket.' },
    { id: 17, questionInTarget: 'How can I handle this hesitation?', starterTemplate: 'Take a breath and just...', sampleAnswer: 'Take a breath and just start with the first sentence.' },
    { id: 18, questionInTarget: 'Who should I reach out to today?', starterTemplate: 'I should message...', sampleAnswer: 'I should message my colleague to check on the delivery.' },
    { id: 19, questionInTarget: 'Is there anything I forgot to buy?', starterTemplate: 'I have everything except...', sampleAnswer: 'I have everything except milk and coffee filters.' },
    { id: 20, questionInTarget: 'How do I want to feel at the end of the day?', starterTemplate: 'I want to feel satisfied that...', sampleAnswer: 'I want to feel satisfied that I stayed consistent with my plan.' },
  ];

  // Stage 4 narration guide
  const stage4NarrationGuide = {
    durationMinutes: 10,
    promptsByMoment: [
      {
        moment: 'Preparando o café da manhã (Minutos 1–3)',
        narrationStarter: 'Okay, let’s see what we have in the fridge...',
        exampleFlow: 'I open the fridge door. There is milk, eggs, and half an avocado. I grab the pan, turn on the stove, and crack two eggs.',
      },
      {
        moment: 'Organizando o espaço de trabalho (Minutos 4–6)',
        narrationStarter: 'Now settling into my desk...',
        exampleFlow: 'I plug in my laptop charger. The screen turns on. I adjust my chair height and take a sip of water before reviewing today’s calendar.',
      },
      {
        moment: 'Pausa para caminhada ou deslocamento (Minutos 7–10)',
        narrationStarter: 'Stepping outside into the fresh air...',
        exampleFlow: 'The sidewalk is busy today. I notice a red car turning at the corner. The temperature feels cool, but the sun is breaking through the clouds.',
      },
    ],
  };

  // 30 chunks nativos
  const nativeChunks30 = [
    { id: 1, chunk: 'I am 30 years old', literalPtTrap: 'I have 30 years (Eu tenho 30 anos)', whenToUse: 'Dizer a sua idade ou de alguém.', example: 'I am 28 years old, and my brother is 30.' },
    { id: 2, chunk: 'Ask a question', literalPtTrap: 'Make a question (Fazer uma pergunta)', whenToUse: 'Fazer uma pergunta a alguém.', example: 'May I ask a quick question?' },
    { id: 3, chunk: 'Turn off the lights', literalPtTrap: 'Close the light (Fechar a luz)', whenToUse: 'Apagar a luz.', example: 'Don’t forget to turn off the lights when leaving.' },
    { id: 4, chunk: 'Explain to me', literalPtTrap: 'Explain me (Me explica)', whenToUse: 'Pedir explicação de algo.', example: 'Could you explain this concept to me?' },
    { id: 5, chunk: 'It depends on', literalPtTrap: 'It depends of (Depende de)', whenToUse: 'Expressar dependência condicional.', example: 'It depends on the weather tomorrow.' },
    { id: 6, chunk: 'Another one / One more', literalPtTrap: 'More one (Mais um)', whenToUse: 'Pedir outro item adicional.', example: 'Could we order another beer, please?' },
    { id: 7, chunk: 'I am used to waking up early', literalPtTrap: 'I am costumed to wake up (Sou acostumado)', whenToUse: 'Falar de hábitos estabelecidos.', example: 'I am used to commuting by train.' },
    { id: 8, chunk: 'Congratulate him on', literalPtTrap: 'Congratulate him for (Parabenizar por)', whenToUse: 'Parabenizar alguém por conquista.', example: 'I called to congratulate him on his promotion.' },
    { id: 9, chunk: 'I agree with you', literalPtTrap: 'I am agree with you (Eu estou de acordo)', whenToUse: 'Concordar.', example: 'I agree with your suggestion.' },
    { id: 10, chunk: 'Miss the bus', literalPtTrap: 'Lose the bus (Perder o ônibus)', whenToUse: 'Chegar atrasado e não pegar condução.', example: 'Hurry up or we will miss the bus!' },
    { id: 11, chunk: 'Pay attention to', literalPtTrap: 'Prestando atenção em', whenToUse: 'Focar em algo.', example: 'Please pay close attention to this slide.' },
    { id: 12, chunk: 'Take a shower', literalPtTrap: 'Have a bath (Tomar banho de chuveiro)', whenToUse: 'Tomar banho no chuveiro.', example: 'I need to take a quick shower.' },
    { id: 13, chunk: 'Make a decision', literalPtTrap: 'Tomar uma decisão', whenToUse: 'Decidir algo.', example: 'We need to make a firm decision today.' },
    { id: 14, chunk: 'Take care of', literalPtTrap: 'Cuidar de', whenToUse: 'Assumir responsabilidade por tarefa ou pessoa.', example: 'I will take care of the reservation.' },
    { id: 15, chunk: 'Have breakfast', literalPtTrap: 'Tomar café da manhã', whenToUse: 'Comer pela manhã.', example: 'I rarely have breakfast before 8 AM.' },
    { id: 16, chunk: 'Look forward to hearing', literalPtTrap: 'Olhar para frente', whenToUse: 'Esperar ansiosamente pelo retorno.', example: 'I look forward to hearing your thoughts.' },
    { id: 17, chunk: 'In the long run', literalPtTrap: 'No longo termo', whenToUse: 'A longo prazo.', example: 'This strategy will save us money in the long run.' },
    { id: 18, chunk: 'Get rid of', literalPtTrap: 'Livrar-se de', whenToUse: 'Descartar algo que não serve mais.', example: 'Let’s get rid of these outdated files.' },
    { id: 19, chunk: 'Run out of time', literalPtTrap: 'Ficar sem tempo', whenToUse: 'Tempo se esgotando.', example: 'We are running out of time on this call.' },
    { id: 20, chunk: 'Make sense', literalPtTrap: 'Fazer sentido', whenToUse: 'Ser lógico ou compreensível.', example: 'Does this workflow make sense to you?' },
    { id: 21, chunk: 'Keep in mind', literalPtTrap: 'Guardar em mente', whenToUse: 'Lembrar-se de consideração importante.', example: 'Keep in mind that delivery takes three days.' },
    { id: 22, chunk: 'Catch up with', literalPtTrap: 'Pegar em cima', whenToUse: 'Colocar o papo em dia.', example: 'Let’s grab lunch and catch up soon.' },
    { id: 23, chunk: 'Take it easy', literalPtTrap: 'Pegar leve', whenToUse: 'Acalmar-se ou relaxar.', example: 'Take it easy, everything will be fine.' },
    { id: 24, chunk: 'By all means', literalPtTrap: 'Por todos os meios', whenToUse: 'Dar permissão entusiástica.', example: 'If you want to invite him, by all means do so.' },
    { id: 25, chunk: 'Never mind', literalPtTrap: 'Nunca mente', whenToUse: 'Deixar para lá.', example: 'Never mind, I found my keys.' },
    { id: 26, chunk: 'Out of curiosity', literalPtTrap: 'Por curiosidade', whenToUse: 'Perguntar por mera curiosidade.', example: 'Out of curiosity, how much did that cost?' },
    { id: 27, chunk: 'So far, so good', literalPtTrap: 'Tão longe tão bom', whenToUse: 'Até agora tudo bem.', example: 'How is the new role going? So far, so good.' },
    { id: 28, chunk: 'Give it a shot', literalPtTrap: 'Dar um tiro', whenToUse: 'Tentar fazer algo novo.', example: 'I have never coded in Python, but I’ll give it a shot.' },
    { id: 29, chunk: 'See you around', literalPtTrap: 'Te vejo ao redor', whenToUse: 'Despedida informal.', example: 'Thanks for the coffee, see you around!' },
    { id: 30, chunk: 'At the end of the day', literalPtTrap: 'No final do dia', whenToUse: 'Conclusão final de uma análise.', example: 'At the end of the day, customer satisfaction is what matters.' },
  ];

  // 20 situações de teste rápido
  const rapidTest20 = [
    { id: 1, situationInTarget: 'Dizendo a sua idade em uma entrevista de trabalho.', literalPtTrap: 'I have 29 years.', naturalTargetForm: 'I am 29 years old.' },
    { id: 2, situationInTarget: 'Pedindo para fazer uma pergunta na reunião.', literalPtTrap: 'Can I make a question?', naturalTargetForm: 'May I ask a question?' },
    { id: 3, situationInTarget: 'Dizendo que você perdeu o ônibus.', literalPtTrap: 'I lost the bus this morning.', naturalTargetForm: 'I missed the bus this morning.' },
    { id: 4, situationInTarget: 'Dizendo que concorda com o colega.', literalPtTrap: 'I am agree with that proposal.', naturalTargetForm: 'I agree with that proposal.' },
    { id: 5, situationInTarget: 'Pedindo para apagar a luz da sala.', literalPtTrap: 'Please close the light.', naturalTargetForm: 'Please turn off the light.' },
    { id: 6, situationInTarget: 'Explicando que depende do resultado.', literalPtTrap: 'It depends of the test result.', naturalTargetForm: 'It depends on the test result.' },
    { id: 7, situationInTarget: 'Pedindo mais uma xícara de café.', literalPtTrap: 'Can I have more one coffee?', naturalTargetForm: 'Can I have another coffee?' },
    { id: 8, situationInTarget: 'Dizendo que está acostumado com o trânsito.', literalPtTrap: 'I am costumed to heavy traffic.', naturalTargetForm: 'I am used to heavy traffic.' },
    { id: 9, situationInTarget: 'Pedindo para alguém te explicar uma regra.', literalPtTrap: 'Can you explain me this policy?', naturalTargetForm: 'Can you explain this policy to me?' },
    { id: 10, situationInTarget: 'Dando os parabéns a um amigo pelo casamento.', literalPtTrap: 'I congratulate you for your wedding.', naturalTargetForm: 'Congratulations on your wedding!' },
    { id: 11, situationInTarget: 'Dizendo que vai tomar um banho rápido.', literalPtTrap: 'I will take a bath now.', naturalTargetForm: 'I will take a quick shower now.' },
    { id: 12, situationInTarget: 'Falando que tomou a decisão final.', literalPtTrap: 'I took the decision yesterday.', naturalTargetForm: 'I made the decision yesterday.' },
    { id: 13, situationInTarget: 'Dizendo que não tem dúvida nenhuma.', literalPtTrap: 'I don’t have any doubt.', naturalTargetForm: 'I don’t have any questions / Everything is clear.' },
    { id: 14, situationInTarget: 'Avisando que o tempo da chamada está acabando.', literalPtTrap: 'We are staying without time.', naturalTargetForm: 'We are running out of time.' },
    { id: 15, situationInTarget: 'Dizendo que vai cuidar dos detalhes.', literalPtTrap: 'I will care about the details.', naturalTargetForm: 'I will take care of the details.' },
    { id: 16, situationInTarget: 'Dizendo que tomou café da manhã às 7h.', literalPtTrap: 'I drank breakfast at 7 AM.', naturalTargetForm: 'I had breakfast at 7 AM.' },
    { id: 17, situationInTarget: 'Perguntando se a proposta faz sentido.', literalPtTrap: 'Does this have sense to you?', naturalTargetForm: 'Does this make sense to you?' },
    { id: 18, situationInTarget: 'Pedindo para colocar a conversa em dia.', literalPtTrap: 'Let’s put the talk in day.', naturalTargetForm: 'Let’s catch up soon.' },
    { id: 19, situationInTarget: 'Dizendo que vai tentar pela primeira vez.', literalPtTrap: 'I will give a try/shot.', naturalTargetForm: 'I’ll give it a shot.' },
    { id: 20, situationInTarget: 'Dizendo até logo informalmente.', literalPtTrap: 'See you around.', naturalTargetForm: 'See you around / Catch you later.' },
  ];

  return {
    stage1Objects,
    stage2Actions,
    stage3Thoughts,
    stage4NarrationGuide,
    nativeChunks30,
    rapidTest20,
  };
}

export function generateImmersionPlan(
  vars: Record<PromptVariable, string>,
): ImmersionPlanData {
  const lang = vars.IDIOMA || 'Inglês';
  const minutes = parseInt(vars.MINUTOS, 10) || 30;
  const interests = vars.INTERESSES || 'tecnologia e carreira';

  return {
    routineBlocks: [
      {
        period: 'Manhã',
        currentHabitReplaced: 'Rolar feed de redes sociais em português na cama',
        inputActivity: `Ouvir podcast de 5 minutos sobre ${interests} em ${lang} enquanto prepara o café`,
        outputActivity: `Nomear em voz alta 10 objetos e ações em ${lang} enquanto se arruma`,
        vocabMicroTask: 'Revisar 10 cards no SRS (SM-2) antes de sair de casa',
        minutes: Math.max(5, Math.round(minutes * 0.25)),
      },
      {
        period: 'Deslocamento',
        currentHabitReplaced: 'Rádio comercial ou silêncio passivo no trânsito/transporte',
        inputActivity: `Audiolivro ou rádio internacional com notícias em ${lang}`,
        outputActivity: `Repetir em voz baixa frases e connected speech (shadowing)`,
        vocabMicroTask: 'Notar 3 placas ou estímulos visuais e traduzir mentalmente para chunks',
        minutes: Math.max(5, Math.round(minutes * 0.2)),
      },
      {
        period: 'Trabalho/Estudo',
        currentHabitReplaced: 'Fazer pesquisas no Google em português',
        inputActivity: `Pesquisar dúvidas técnicas e tutoriais exclusivamente em ${lang}`,
        outputActivity: `Redigir rascunhos de anotações e to-do lists pessoais em ${lang}`,
        vocabMicroTask: 'Salvar 2 colocações corporativas novas no bloco de notas',
        minutes: Math.max(5, Math.round(minutes * 0.15)),
      },
      {
        period: 'Intervalos',
        currentHabitReplaced: 'Pausa passiva checando mensagens aleatórias',
        inputActivity: `Ler um artigo curto de 3 parágrafos sobre ${interests}`,
        outputActivity: `Disparar 3 respostas rápidas de 5 segundos no app`,
        vocabMicroTask: 'Revisar 5 expressões do Top 50',
        minutes: Math.max(5, Math.round(minutes * 0.1)),
      },
      {
        period: 'Exercício',
        currentHabitReplaced: 'Música sem foco linguístico durante treino ou caminhada',
        inputActivity: `Playlist de músicas com letra acompanhada ou podcast estimulante em ${lang}`,
        outputActivity: `Cantar mentalmente ou repetir refrões focando na articulação do som`,
        vocabMicroTask: 'Fixar 1 expressão motivacional em ${lang}',
        minutes: Math.max(5, Math.round(minutes * 0.1)),
      },
      {
        period: 'Noite',
        currentHabitReplaced: 'Assistir a filmes com dublagem ou legenda em português',
        inputActivity: `Episódio de série com áudio e legenda em ${lang}`,
        outputActivity: `Escrever o diário de 5 linhas resumindo os pontos altos do dia`,
        vocabMicroTask: 'Revisar os cards do dia antes de dormir',
        minutes: Math.max(5, Math.round(minutes * 0.15)),
      },
      {
        period: 'Fim de semana',
        currentHabitReplaced: 'Desconexão total dos estudos de idiomas',
        inputActivity: `Documentário ou jogo com interface e narração em ${lang}`,
        outputActivity: `Sessão de conversação simulada de 15 minutos com o Professor de Conversação`,
        vocabMicroTask: 'Realizar o teste semanal de pronúncia de 15 frases',
        minutes: Math.max(10, Math.round(minutes * 0.3)),
      },
    ],
    immersionProtocol: [
      {
        id: 'proto-devices',
        title: 'Dispositivos no Idioma Alvo',
        action: `Mudar o idioma do smartphone, computador e interfaces de streaming para ${lang}.`,
        frequency: 'Permanente (Configuração única)',
      },
      {
        id: 'proto-searches',
        title: 'Pesquisas na Web em Modo Nativo',
        action: `Realizar 100% das buscas informativas, tutoriais e receitas em ${lang}.`,
        frequency: 'Diária',
      },
      {
        id: 'proto-diary',
        title: 'Diário Noturno de 5 Linhas',
        action: 'Escrever 5 frases curtas antes de dormir relatando o que realizou ou aprendeu.',
        frequency: 'Todas as noites',
      },
      {
        id: 'proto-audio',
        title: 'Áudio Espontâneo de 2 Minutos',
        action: `Gravar um áudio no gravador do celular comentando um tema de ${interests}.`,
        frequency: '3 vezes por semana',
      },
      {
        id: 'proto-entertainment',
        title: 'Substituição de Entretenimento Passivo',
        action: 'Consumir entretenimento e canais do YouTube exclusivamente no idioma-alvo.',
        frequency: 'Diária',
      },
      {
        id: 'proto-conversation',
        title: 'Conversa Simulada Diária',
        action: 'Completar ao menos 1 diálogo interativo com o Professor de Conversação.',
        frequency: 'Diária (mínimo 5 minutos)',
      },
    ],
    levels30Days: [
      {
        level: 1,
        daysRange: 'Dias 1–30',
        title: 'Nível 1: Troca de Ambiente Digital',
        dailyTargetMinutes: Math.max(20, minutes),
        mandatoryDeliverables: [
          'Todos os aparelhos e redes sociais no idioma-alvo',
          'Diário de 5 linhas concluído em pelo menos 20 dias',
          '50 cards dominados no SRS',
        ],
      },
      {
        level: 2,
        daysRange: 'Dias 31–60',
        title: 'Nível 2: Consumo Passivo Ativo',
        dailyTargetMinutes: Math.max(35, Math.round(minutes * 1.3)),
        mandatoryDeliverables: [
          'Nenhum conteúdo com legenda em português',
          '8 áudios de 2 minutos gravados e autoavaliados',
          '150 cards dominados no SRS',
        ],
      },
      {
        level: 3,
        daysRange: 'Dias 61–80',
        title: 'Nível 3: Produção Diária Espontânea',
        dailyTargetMinutes: Math.max(50, Math.round(minutes * 1.6)),
        mandatoryDeliverables: [
          'Narração mental de 10 minutos praticada 4 vezes por semana',
          'Conversas de 10 turnos com feedback fonético',
          '250 cards dominados no SRS',
        ],
      },
      {
        level: 4,
        daysRange: 'Dias 81–90',
        title: 'Nível 4: Imersão Total e Autonomia',
        dailyTargetMinutes: Math.max(60, Math.round(minutes * 2)),
        mandatoryDeliverables: [
          'Dia inteiro sem produzir uma única palavra na língua materna para estudos',
          'Avaliação final de conversação e pronúncia',
          '300 expressões de alta frequência dominadas',
        ],
      },
    ],
    idealImmersionDay: {
      totalMinutes: minutes,
      schedule: [
        { time: '07:15', block: 'Manhã', activity: 'Podcast e aquecimento de vocabulário', type: 'input', durationMinutes: Math.round(minutes * 0.3) },
        { time: '12:30', block: 'Almoço', activity: 'Disparo de respostas rápidas de fala', type: 'output', durationMinutes: Math.round(minutes * 0.3) },
        { time: '18:30', block: 'Fim de tarde', activity: 'Revisão espaçada de cards no SRS', type: 'vocab', durationMinutes: Math.round(minutes * 0.2) },
        { time: '22:00', block: 'Noite', activity: 'Diário de 5 linhas e auto-reflexão', type: 'output', durationMinutes: Math.round(minutes * 0.2) },
      ],
    },
  };
}
