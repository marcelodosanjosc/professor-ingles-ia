# FluênciaLab — Plataforma de Aprendizado Acelerado de Idiomas com 8 Professores de IA

**FluênciaLab** é uma plataforma web full-stack construída para acelerar a aquisição de idiomas no mundo real. Cada tela é conduzida por um **Professor Especializado alimentado por IA (API da Anthropic / Claude)**, que consome as variáveis do perfil do aluno preenchidas no **Onboarding** e alimenta um **Dashboard de Progresso** centralizado.

---

## Arquitetura & Stack

| Camada | Tecnologias |
|---|---|
| **Runtime & Monorepo** | **Node.js 26 LTS** + **pnpm 12 workspaces** (`apps/web`, `apps/api`, `packages/shared`) |
| **Front-end (`apps/web`)** | **React 19 + TypeScript 7 + Vite 8 + Tailwind CSS 4 + Recharts 3 + React Router 8 + TanStack Query 5** |
| **Back-end (`apps/api`)** | **Express 5 + TypeScript + Prisma 7 + SQLite** (`@prisma/adapter-better-sqlite3`, pronto para PostgreSQL) |
| **IA & Prompts** | **Groq / Gemini / Anthropic** (via `openai` + `@anthropic-ai/sdk`) + validação **Zod 4** (`jsonGuard`) + **Modo Mock** sem chave |
| **Autenticação & Segurança** | **Argon2id** (`@node-rs/argon2`), **JWT em cookie `httpOnly` / `SameSite=Strict`**, proteção CSRF por `Origin`, `helmet`, `express-rate-limit` e políticas de supply-chain no pnpm (`minimumReleaseAge` + `allowBuilds`) |
| **Áudio & Voz** | **Web Speech API** (`SpeechRecognition` STT + `speechSynthesis` TTS) + **`MediaRecorder`** (gravação comparativa com player lado a lado) |
| **Qualidade & Testes** | **Vitest 5 + Testing Library + Supertest** (suíte automatizada no back-end e no front-end) |

---

## Estrutura de Pastas

```text
professor-ingles-ia/
├── package.json                 # Scripts globais do monorepo (dev, build, typecheck, test, check, db:*)
├── pnpm-workspace.yaml          # Workspaces + políticas de segurança (minimumReleaseAge, allowBuilds)
├── tsconfig.base.json           # Configuração TypeScript estrita compartilhada
├── .env.example                 # Exemplo de variáveis de ambiente
├── packages/
│   └── shared/                  # Contratos, tipos e schemas Zod 4 compartilhados
│       └── src/
│           ├── teachers.ts          # Catálogo dos 8 professores (id, slug, ícone, cor, tagline)
│           ├── auth.ts              # Schemas de login/cadastro e PublicUser
│           ├── profile.ts           # Schema do Onboarding e injetor de variáveis [IDIOMA], [NÍVEL], etc.
│           ├── dashboard.ts         # Contrato DashboardData e 6 habilidades do Radar
│           └── teacherSchemas.ts    # Schemas estruturados dos 8 professores, SM-2 e sessões
└── apps/
    ├── api/                     # Servidor Express 5 + Prisma 7 + Motor de IA
    │   ├── prisma/
    │   │   ├── schema.prisma        # 11 modelos (User, Profile, StudyPlan, Session, VocabItem, ErrorRecord, etc.)
    │   │   └── seed.ts              # Usuário demo + 60 dias de histórico rico
    │   ├── src/
    │   │   ├── config/env.ts        # Validação fail-fast de variáveis de ambiente
    │   │   ├── middleware/          # auth.ts (JWT httpOnly), errorHandler.ts
    │   │   ├── services/
    │   │   │   ├── promptBuilder.ts # Templates dos 8 professores + substituição das variáveis do perfil
    │   │   │   ├── anthropic.ts     # Integração Claude /v1/messages + validação Zod + fallback determinístico
    │   │   │   ├── srs.ts           # Algoritmo SuperMemo 2 (SM-2) para repetição espaçada
    │   │   │   └── metrics.ts       # Agregações em tempo real do Dashboard
    │   │   └── routes/              # auth, profile, dashboard, teacher, sessions, vocab, pronunciation
    │   └── tests/                   # Testes de integração (Supertest + Vitest)
    └── web/                     # SPA React 19 + Tailwind 4 + Recharts
        └── src/
            ├── components/
            │   ├── ui/              # Design system escuro acessível (Button, Card, Input, Badge, ProgressBar...)
            │   ├── layout/          # AppShell, Sidebar responsiva com % por módulo, Topbar
            │   ├── dashboard/       # MetricCard, ProgressChart (Linha/Barras/Radar), PlanProgressBar, Heatmap...
            │   └── teacher/         # TeacherLayout, SessionSummaryModal, AudioRecorder
            ├── hooks/               # useAuth, useProfile, useDashboard, useTeacherSession, useSpeech, useAudioRecorder
            ├── pages/
            │   ├── auth/            # Login.tsx, Register.tsx
            │   ├── Onboarding.tsx   # Wizard de 3 etapas com preview de variáveis dos prompts
            │   ├── Dashboard.tsx    # Painel completo de KPIs, gráficos e recomendações
            │   └── teachers/        # As 8 telas especializadas (Architect, Vocabulary, Conversation, Listening, Speaking, Pronunciation, DirectThinking, Immersion)
            └── tests/               # Testes unitários e de integração de UI (Vitest + Testing Library)
```

---

## Os 8 Professores Especializados

1. **Professor Arquiteto da Fluência (`/professor/arquiteto`)**: Gera o Plano de 90 dias 80/20 em 7 seções (Diagnóstico, O que aprender primeiro, 3 Fases de 30 dias, Rotina diária em blocos com links diretos, Metas semanais, Checkpoints a cada 14 dias e O que ignorar por enquanto).
2. **Professor de Vocabulário de Alta Frequência (`/professor/vocabulario`)**: Top 50 expressões + 12 blocos funcionais contextualizados, repetição espaçada com algoritmo **SM-2** e Teste Ativo de produção sem consulta.
3. **Professor de Conversação Infinita (`/professor/conversacao`)**: Simulação de 9 papéis reais por texto e voz (~80% compreensível), bloco automático de **Correções importantes a cada 3 respostas** do aluno, perguntas complementares e resumo final da sessão.
4. **Treinador de Ouvido (`/professor/ouvido`)**: Sessão em 5 níveis de fala rápida por tipo de mídia, destaque de reduções/contrações/ligações, exercício de Shadowing com 10 frases em 3 velocidades e rotina de 15 minutos.
5. **Destruidor de Bloqueio na Fala (`/professor/fala`)**: 10 padrões para automatizar, treino de resposta rápida com **cronômetro regressivo de 5 segundos** (1ª e 2ª rodadas), 15 estruturas de substituição e 10 perguntas inesperadas.
6. **Corretor de Pronúncia (`/professor/pronuncia`)**: Os 10 erros fonéticos mais prováveis (destacando os 3 de maior impacto), mecânica de língua/lábios, pares mínimos, **player comparativo lado a lado** e teste semanal de 15 frases.
7. **Tradutor que Impede de Traduzir (`/professor/pensamento`)**: Treino de pensamento direto em 4 etapas (Objetos sem português, Ações, Pensamentos, Narração interna de 10 min), detector de tradução literal vs forma natural, 30 chunks nativos e teste rápido de 20 situações.
8. **Simulador de Imersão Total (`/professor/imersao`)**: Transforma os 7 blocos do dia em atividades de Input, Output e Microtarefa de vocabulário, protocolo de imersão com diário de 5 linhas corrigido pela IA, 4 níveis de 30 dias e cronograma do Dia Ideal de Imersão.

---

## Como Executar Localmente

### 1. Pré-requisitos
- **Node.js 26 LTS** (via `nvm use 26`)
- **pnpm 12+**

### 2. Instalação e Banco de Dados

```bash
# 1. Ative o Node 26
nvm use 26

# 2. Instale as dependências do monorepo
pnpm install

# 3. Configure o arquivo apps/api/.env (se ainda não existir)
cp .env.example apps/api/.env

# 4. Aplique as migrações do SQLite e popule os dados de demonstração
pnpm db:migrate
pnpm db:seed
```

> **Conta de demonstração pronta (criada pelo seed):**
> - **E-mail:** `demo@fluencialab.dev`
> - **Senha:** `demo12345`

> **Sobre a IA dos professores (`AI_PROVIDER` / `AI_API_KEY`):**
> - `AI_PROVIDER=groq` + chave Groq → free tier rápido ([console.groq.com](https://console.groq.com)).
> - `AI_PROVIDER=gemini` + chave Google AI Studio → free tier Gemini.
> - `AI_PROVIDER=anthropic` + chave Anthropic → Claude (pago).
> - Sem provedor/chave → **Modo Mock Determinístico** (sem custo).

### 3. Iniciar o Ambiente de Desenvolvimento

```bash
pnpm dev
```

- **Front-end (Vite):** `http://localhost:5173`
- **API (Express):** `http://localhost:3001/api/health`

### 4. Verificação Completa (Typecheck, Testes e Auditoria)

```bash
pnpm typecheck
pnpm test
pnpm --filter @fluencialab/web build
pnpm audit --prod
```
