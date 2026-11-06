import { Flame, Clock, MessageSquare, Volume2, Mic, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import {
  MetricCard,
  ProgressChart,
  PlanProgressBar,
  ConsistencyHeatmap,
  WeeklyGoalsCard,
  NextActionCard,
  AchievementsCard,
  RecurringErrorsCard,
} from '../components/dashboard';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, updateWeeklyGoal } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Carregando dados do painel">
        {/* Header Skeleton */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 space-y-4">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-10 w-72 rounded-xl" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-44 rounded-lg" />
          </div>
        </div>

        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          ))}
        </div>

        {/* Plan & Next Action Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
          <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
          <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Erro ao carregar o painel"
          message={
            error instanceof Error
              ? error.message
              : 'Não foi possível buscar as informações do dashboard. Tente recarregar a página.'
          }
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12">
        <EmptyState
          title="Nenhum dado disponível"
          description="Você ainda não possui métricas registradas. Acesse os professores para iniciar suas primeiras sessões!"
        />
      </div>
    );
  }

  const { header, kpis, dailyMinutes, weeklyByTeacher, skills, plan, heatmap, weeklyGoals, nextAction, achievements, recurringErrors } = data;

  const todayGoalPercent = Math.min(
    100,
    Math.round((header.todayMinutes / (header.dailyGoalMinutes || 1)) * 100)
  );

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Dashboard */}
      <section
        aria-label="Resumo do Aluno"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/70 via-slate-900 to-slate-900 border border-violet-900/40 p-6 md:p-8 shadow-2xl"
      >
        <div
          className="absolute -right-12 -bottom-12 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="violet" size="sm">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 mr-1" aria-hidden="true" />
                {header.targetLanguage} &bull; Nível {header.level}
              </Badge>

              <Badge variant="amber" size="sm" className="font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400 mr-1 fill-amber-400" aria-hidden="true" />
                {header.streakDays} dias de sequência
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Olá, {header.name || user?.name || 'Estudante'}!
            </h1>

            <p className="text-sm text-slate-300">
              Mantenha o foco: cada dia de exposição compreensível aproxima você da fluência real.
            </p>
          </div>

          {/* Meta Diária */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 min-w-[240px] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
                Meta do Dia
              </span>
              <span className="text-violet-400 font-bold">
                {header.todayMinutes} / {header.dailyGoalMinutes} min
              </span>
            </div>

            <ProgressBar
              value={header.todayMinutes}
              max={header.dailyGoalMinutes}
              variant={todayGoalPercent >= 100 ? 'emerald' : 'violet'}
              size="sm"
              aria-label="Meta de minutos de estudo do dia"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{todayGoalPercent}% concluída hoje</span>
              {todayGoalPercent >= 100 && (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  Meta batida!
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6 Cards de Resumo (KPIs) */}
      <section aria-labelledby="kpis-heading" className="space-y-3">
        <h2 id="kpis-heading" className="sr-only">
          Indicadores Chave de Desempenho
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* 1. Minutos de Exposição */}
          <MetricCard
            label="Exposição"
            value={`${kpis.exposureMinutesToday} min`}
            subtext={`${kpis.exposureMinutesWeek} min na semana`}
            icon={<Volume2 className="w-4 h-4" />}
            variant="violet"
          />

          {/* 2. Minutos Falando */}
          <MetricCard
            label="Produção de Fala"
            value={`${kpis.speakingMinutesWeek} min`}
            subtext="Tempo falando na semana"
            icon={<Mic className="w-4 h-4" />}
            variant="rose"
          />

          {/* 3. Palavras Recuperadas */}
          <MetricCard
            label="Vocabulário Ativo"
            value={kpis.wordsRecalled}
            subtext="Palavras sem ajuda"
            icon={<BookOpen className="w-4 h-4" />}
            variant="sky"
          />

          {/* 4. Conversas Concluídas */}
          <MetricCard
            label="Conversações"
            value={kpis.conversationsCompleted}
            subtext="Diálogos concluídos"
            icon={<MessageSquare className="w-4 h-4" />}
            variant="emerald"
          />

          {/* 5. Pronúncias Dominadas */}
          <MetricCard
            label="Pronúncia"
            value={kpis.pronunciationMastered}
            subtext="Frases calibradas"
            icon={<Sparkles className="w-4 h-4" />}
            variant="fuchsia"
          />

          {/* 6. Dia do Plano de 90 Dias */}
          <MetricCard
            label="Plano de 90 Dias"
            value={`Dia ${kpis.planDay}/90`}
            subtext={kpis.planPhase ?? 'Fase 1: Fundação'}
            icon={<Clock className="w-4 h-4" />}
            variant="amber"
          />
        </div>
      </section>

      {/* Seção Plano de 90 Dias + Próxima Ação */}
      <section aria-label="Plano e Próxima Ação" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlanProgressBar
            day={plan?.day ?? kpis.planDay}
            phase={kpis.planPhase}
            checkpoints={plan?.checkpoints}
          />
        </div>

        <div>
          <NextActionCard nextAction={nextAction} className="h-full" />
        </div>
      </section>

      {/* Seção Gráficos (3 Recharts: Linha/Área, Barras, Radar) */}
      <section aria-labelledby="graficos-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="graficos-heading" className="text-lg font-bold text-white tracking-tight">
            Análise Visual de Progresso
          </h2>
          <span className="text-xs text-slate-400">Últimos 30 dias & Panorama de Habilidades</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico 1: Linha / Área (30 dias) */}
          <ProgressChart
            type="area"
            data={dailyMinutes}
            title="Minutos Diários de Estudo"
            subtitle="Volume de prática nos últimos 30 dias"
          />

          {/* Gráfico 2: Barras (Tempo por professor na semana) */}
          <ProgressChart
            type="bar"
            data={weeklyByTeacher}
            title="Dedicação por Professor"
            subtitle="Tempo investido em cada módulo na semana"
          />

          {/* Gráfico 3: Radar (6 habilidades) */}
          <ProgressChart
            type="radar"
            data={skills}
            title="Radar de Fluência (6 Habilidades)"
            subtitle="Nível atual em cada eixo da matriz"
          />
        </div>
      </section>

      {/* Seção Mapa de Calor de Consistência (Heatmap estilo GitHub) */}
      <section aria-label="Mapa de Consistência">
        <ConsistencyHeatmap data={heatmap} />
      </section>

      {/* Seção Listas: Metas da Semana, Conquistas e Erros Recorrentes */}
      <section aria-label="Acompanhamento Detalhado" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WeeklyGoalsCard
          goals={weeklyGoals}
          onToggleGoal={(id, done) => void updateWeeklyGoal(id, done)}
        />

        <AchievementsCard achievements={achievements} />

        <RecurringErrorsCard errors={recurringErrors} />
      </section>
    </div>
  );
}
