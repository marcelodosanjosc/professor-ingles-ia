import { useState, useEffect, useMemo, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Bot,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  profileSchema,
  profileToPromptVars,
  LEVELS,
  LEVEL_LABELS,
  GOALS,
  GOAL_LABELS,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  ROUTINES,
  ROUTINE_LABELS,
  type ProfileInput,
} from '@fluencialab/shared';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';

const QUICK_LANGUAGES = [
  'Inglês',
  'Espanhol',
  'Francês',
  'Alemão',
  'Italiano',
  'Mandarim',
  'Japonês',
] as const;

const QUICK_MINUTES = [15, 30, 45, 60] as const;
const QUICK_DEADLINES = [3, 6, 12] as const;

const SUGGESTED_INTERESTS = [
  'Tecnologia',
  'Viagens',
  'Filmes',
  'Música',
  'Negócios',
  'Gastronomia',
  'Esportes',
  'Livros',
  'Carreira',
  'Cultura Pop',
] as const;

export function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile: existingProfile, saveProfile, isSaving } = useProfile();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Campos do formulário
  const [targetLanguage, setTargetLanguage] = useState('Inglês');
  const [nativeLanguage, setNativeLanguage] = useState('Português');
  const [level, setLevel] = useState<ProfileInput['level']>('A1');
  const [levelOther, setLevelOther] = useState('');
  const [goal, setGoal] = useState<ProfileInput['goal']>('conversation');
  const [goalOther, setGoalOther] = useState('');

  const [minutesPerDay, setMinutesPerDay] = useState<number>(30);
  const [deadlineMonths, setDeadlineMonths] = useState<number>(6);
  const [otherLanguages, setOtherLanguages] = useState<string[]>([]);
  const [newOtherLang, setNewOtherLang] = useState('');
  const [mainDifficulty, setMainDifficulty] = useState<ProfileInput['mainDifficulty']>('speaking');

  const [routine, setRoutine] = useState<ProfileInput['routine']>('work');
  const [routineOther, setRoutineOther] = useState('');
  const [interests, setInterests] = useState<string[]>(['Tecnologia', 'Viagens']);
  const [newInterest, setNewInterest] = useState('');
  const [hardSounds, setHardSounds] = useState('');
  const [blockSituations, setBlockSituations] = useState('');

  // Preenche dados existentes se já houver perfil salvo
  useEffect(() => {
    if (existingProfile) {
      setTargetLanguage(existingProfile.targetLanguage);
      setNativeLanguage(existingProfile.nativeLanguage);
      setLevel(existingProfile.level);
      setLevelOther(existingProfile.levelOther ?? '');
      setGoal(existingProfile.goal);
      setGoalOther(existingProfile.goalOther ?? '');
      setMinutesPerDay(existingProfile.minutesPerDay);
      setDeadlineMonths(existingProfile.deadlineMonths);
      setOtherLanguages(existingProfile.otherLanguages ?? []);
      setMainDifficulty(existingProfile.mainDifficulty);
      setRoutine(existingProfile.routine);
      setRoutineOther(existingProfile.routineOther ?? '');
      setInterests(existingProfile.interests ?? []);
      setHardSounds(existingProfile.hardSounds ?? '');
      setBlockSituations(existingProfile.blockSituations ?? '');
    }
  }, [existingProfile]);

  // Monta objeto ProfileInput atual
  const currentFormData: ProfileInput = useMemo(
    () => ({
      targetLanguage,
      nativeLanguage,
      level,
      levelOther: level === 'other' ? levelOther : undefined,
      goal,
      goalOther: goal === 'other' ? goalOther : undefined,
      minutesPerDay,
      deadlineMonths,
      otherLanguages,
      mainDifficulty,
      interests,
      routine,
      routineOther: routine === 'other' ? routineOther : undefined,
      hardSounds: hardSounds.trim() ? hardSounds : undefined,
      blockSituations: blockSituations.trim() ? blockSituations : undefined,
    }),
    [
      targetLanguage,
      nativeLanguage,
      level,
      levelOther,
      goal,
      goalOther,
      minutesPerDay,
      deadlineMonths,
      otherLanguages,
      mainDifficulty,
      interests,
      routine,
      routineOther,
      hardSounds,
      blockSituations,
    ]
  );

  // Preview das variáveis dos professores
  const promptVars = useMemo(() => {
    try {
      return profileToPromptVars(currentFormData);
    } catch {
      return null;
    }
  }, [currentFormData]);

  // Manipuladores de tags
  const handleAddOtherLanguage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newOtherLang.trim();
    if (trimmed && !otherLanguages.includes(trimmed) && otherLanguages.length < 10) {
      setOtherLanguages([...otherLanguages, trimmed]);
      setNewOtherLang('');
    }
  };

  const handleRemoveOtherLanguage = (lang: string) => {
    setOtherLanguages(otherLanguages.filter((l) => l !== lang));
  };

  const handleAddInterest = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !interests.includes(trimmed) && interests.length < 20) {
      setInterests([...interests, trimmed]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  // Validação por passo
  const validateStep = (currentStep: 1 | 2 | 3): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!targetLanguage.trim() || targetLanguage.trim().length < 2) {
        errors.targetLanguage = 'Informe o idioma que quer aprender (mínimo 2 caracteres).';
      }
      if (!nativeLanguage.trim() || nativeLanguage.trim().length < 2) {
        errors.nativeLanguage = 'Informe seu idioma nativo.';
      }
      if (level === 'other' && !levelOther.trim()) {
        errors.levelOther = 'Descreva seu nível atual.';
      }
      if (goal === 'other' && !goalOther.trim()) {
        errors.goalOther = 'Descreva seu objetivo principal.';
      }
    } else if (currentStep === 2) {
      if (!minutesPerDay || minutesPerDay < 5 || minutesPerDay > 480) {
        errors.minutesPerDay = 'Dedicação diária deve ser entre 5 e 480 minutos.';
      }
      if (!deadlineMonths || deadlineMonths < 1 || deadlineMonths > 36) {
        errors.deadlineMonths = 'Prazo deve ser entre 1 e 36 meses.';
      }
    } else if (currentStep === 3) {
      if (routine === 'other' && !routineOther.trim()) {
        errors.routineOther = 'Descreva sua rotina diária.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep((s) => (s + 1) as 2 | 3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    setFormErrors({});
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveErrorMessage(null);

    // Validação com o Zod schema oficial
    const result = profileSchema.safeParse(currentFormData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setFormErrors(fieldErrors);
      setSaveErrorMessage('Por favor, revise os campos destacados antes de salvar.');
      return;
    }

    try {
      await saveProfile(result.data);
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar preferências. Tente novamente.';
      setSaveErrorMessage(msg);
    }
  };

  const stepTitles = {
    1: 'Idioma e Nível',
    2: 'Dedicação e Dificuldades',
    3: 'Rotina, Interesses e Personalização',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-lg shadow-violet-950/50">
              <Compass className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="violet" size="sm">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  {existingProfile ? 'Editar Preferências' : 'Configuração Inicial'}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                {existingProfile ? 'Meu Perfil de Aprendizado' : 'Personalize sua Jornada'}
              </h1>
            </div>
          </div>

          {user?.hasProfile && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/')}
              aria-label="Voltar ao Dashboard"
            >
              Voltar ao Dashboard
            </Button>
          )}
        </div>

        {/* Wizard Progress Bar */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-slate-300">
              Passo {step} de 3:{' '}
              <span className="text-violet-400">{stepTitles[step]}</span>
            </span>
            <span className="text-slate-400">{Math.round((step / 3) * 100)}%</span>
          </div>

          <ProgressBar value={step} max={3} variant="violet" size="sm" aria-label="Progresso do formulário" />

          {/* Marcadores de passos clicáveis */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-2 rounded-xl text-left transition-colors cursor-pointer border ${
                step === 1
                  ? 'bg-violet-950/60 border-violet-600/60 text-violet-200'
                  : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400">1. Idioma</div>
              <div className="truncate hidden sm:block">Alvo & Nível</div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateStep(1)) setStep(2);
              }}
              className={`p-2 rounded-xl text-left transition-colors cursor-pointer border ${
                step === 2
                  ? 'bg-violet-950/60 border-violet-600/60 text-violet-200'
                  : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400">2. Dedicação</div>
              <div className="truncate hidden sm:block">Tempo & Foco</div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateStep(1) && validateStep(2)) setStep(3);
              }}
              className={`p-2 rounded-xl text-left transition-colors cursor-pointer border ${
                step === 3
                  ? 'bg-violet-950/60 border-violet-600/60 text-violet-200'
                  : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400">3. Rotina</div>
              <div className="truncate hidden sm:block">Interesses & Sons</div>
            </button>
          </div>
        </div>

        {/* Mensagem geral de erro */}
        {saveErrorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Erro ao salvar perfil</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{saveErrorMessage}</p>
            </div>
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} noValidate>
          <Card className="border-slate-800 bg-slate-900 shadow-xl">
            <CardContent className="p-5 sm:p-7 space-y-6">
              {/* PASSO 1: IDIOMA E NÍVEL */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-white">Idioma que você quer aprender</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Escolha uma das sugestões rápidas ou digite outro idioma.
                    </p>
                  </div>

                  {/* Sugestões rápidas de idiomas */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Sugestões Rápidas:
                    </span>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Sugestões de idiomas">
                      {QUICK_LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setTargetLanguage(lang)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                            targetLanguage.toLowerCase() === lang.toLowerCase()
                              ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-900/50'
                              : 'bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Idioma Alvo"
                    id="targetLanguage"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    placeholder="Ex: Inglês, Alemão, Japonês..."
                    error={formErrors.targetLanguage}
                    required
                  />

                  <Input
                    label="Seu Idioma Nativo"
                    id="nativeLanguage"
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                    placeholder="Ex: Português"
                    error={formErrors.nativeLanguage}
                    required
                  />

                  {/* Nível Atual */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Qual é o seu nível atual no idioma? <span className="text-violet-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5" role="radiogroup" aria-label="Nível atual">
                      {LEVELS.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          role="radio"
                          aria-checked={level === lvl}
                          onClick={() => setLevel(lvl)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            level === lvl
                              ? 'bg-violet-600/20 border-violet-500 text-violet-200 font-bold ring-1 ring-violet-500'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-sm">{LEVEL_LABELS[lvl]}</span>
                        </button>
                      ))}
                    </div>

                    {level === 'other' && (
                      <div className="pt-2">
                        <Input
                          label="Descreva seu nível"
                          id="levelOther"
                          value={levelOther}
                          onChange={(e) => setLevelOther(e.target.value)}
                          placeholder="Ex: Leio bem artigos técnicos mas nunca falei"
                          error={formErrors.levelOther}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Objetivo Principal */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Qual é o seu objetivo principal? <span className="text-violet-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Objetivo principal">
                      {GOALS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          role="radio"
                          aria-checked={goal === g}
                          onClick={() => setGoal(g)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            goal === g
                              ? 'bg-violet-600/20 border-violet-500 text-violet-200 font-bold ring-1 ring-violet-500'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-sm">{GOAL_LABELS[g]}</span>
                        </button>
                      ))}
                    </div>

                    {goal === 'other' && (
                      <div className="pt-2">
                        <Input
                          label="Descreva seu objetivo"
                          id="goalOther"
                          value={goalOther}
                          onChange={(e) => setGoalOther(e.target.value)}
                          placeholder="Ex: Participar de conferências internacionais"
                          error={formErrors.goalOther}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PASSO 2: DEDICAÇÃO E DIFICULDADES */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-white">Sua Dedicação e Metas</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Defina sua rotina de estudos para que o Professor Arquiteto calibre seu plano de 90 dias.
                    </p>
                  </div>

                  {/* Minutos por dia */}
                  <div className="space-y-2">
                    <label htmlFor="minutesPerDayInput" className="text-sm font-medium text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-violet-400" aria-hidden="true" />
                        Tempo disponível por dia (minutos)
                        <span className="text-violet-400">*</span>
                      </span>
                      <span className="text-xs font-bold text-violet-400">{minutesPerDay} min/dia</span>
                    </label>

                    {/* Botões rápidos de minutos */}
                    <div className="flex flex-wrap gap-2">
                      {QUICK_MINUTES.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setMinutesPerDay(mins)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                            minutesPerDay === mins
                              ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                              : 'bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>

                    <Input
                      id="minutesPerDayInput"
                      type="number"
                      min={5}
                      max={480}
                      value={minutesPerDay}
                      onChange={(e) => setMinutesPerDay(Number(e.target.value) || 0)}
                      error={formErrors.minutesPerDay}
                      required
                    />
                  </div>

                  {/* Prazo em meses */}
                  <div className="space-y-2">
                    <label htmlFor="deadlineMonthsInput" className="text-sm font-medium text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-violet-400" aria-hidden="true" />
                        Prazo desejado para atingir a meta (meses)
                        <span className="text-violet-400">*</span>
                      </span>
                      <span className="text-xs font-bold text-violet-400">{deadlineMonths} meses</span>
                    </label>

                    {/* Botões rápidos de prazo */}
                    <div className="flex flex-wrap gap-2">
                      {QUICK_DEADLINES.map((months) => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setDeadlineMonths(months)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                            deadlineMonths === months
                              ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                              : 'bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {months} meses
                        </button>
                      ))}
                    </div>

                    <Input
                      id="deadlineMonthsInput"
                      type="number"
                      min={1}
                      max={36}
                      value={deadlineMonths}
                      onChange={(e) => setDeadlineMonths(Number(e.target.value) || 0)}
                      error={formErrors.deadlineMonths}
                      required
                    />
                  </div>

                  {/* Maior Dificuldade */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Onde você sente maior dificuldade atualmente? <span className="text-violet-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Maior dificuldade">
                      {DIFFICULTIES.map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          role="radio"
                          aria-checked={mainDifficulty === diff}
                          onClick={() => setMainDifficulty(diff)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            mainDifficulty === diff
                              ? 'bg-violet-600/20 border-violet-500 text-violet-200 font-bold ring-1 ring-violet-500'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-sm">{DIFFICULTY_LABELS[diff]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Idiomas que já fala */}
                  <div className="space-y-2">
                    <label htmlFor="otherLanguagesInput" className="text-sm font-medium text-slate-200">
                      Outros idiomas que você já fala (opcional)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="otherLanguagesInput"
                        value={newOtherLang}
                        onChange={(e) => setNewOtherLang(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddOtherLanguage();
                          }
                        }}
                        placeholder="Ex: Espanhol básico (pressione Enter para adicionar)"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleAddOtherLanguage()}
                        disabled={!newOtherLang.trim()}
                      >
                        Adicionar
                      </Button>
                    </div>

                    {otherLanguages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1" aria-label="Idiomas adicionados">
                        {otherLanguages.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={() => handleRemoveOtherLanguage(lang)}
                              className="text-slate-400 hover:text-rose-400 cursor-pointer"
                              aria-label={`Remover ${lang}`}
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PASSO 3: ROTINA, INTERESSES E PERSONALIZAÇÃO AVANÇADA */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-white">Rotina e Interesses Pessoais</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Personalize os tópicos de conversa e ajude os professores de fala a identificar seus pontos de trava.
                    </p>
                  </div>

                  {/* Rotina Atual */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Como é a sua rotina diária predominante? <span className="text-violet-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="radiogroup" aria-label="Rotina">
                      {ROUTINES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          role="radio"
                          aria-checked={routine === r}
                          onClick={() => setRoutine(r)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            routine === r
                              ? 'bg-violet-600/20 border-violet-500 text-violet-200 font-bold ring-1 ring-violet-500'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-sm">{ROUTINE_LABELS[r]}</span>
                        </button>
                      ))}
                    </div>

                    {routine === 'other' && (
                      <div className="pt-2">
                        <Input
                          label="Descreva sua rotina"
                          id="routineOther"
                          value={routineOther}
                          onChange={(e) => setRoutineOther(e.target.value)}
                          placeholder="Ex: Trabalho remoto em turnos alternados"
                          error={formErrors.routineOther}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Interesses */}
                  <div className="space-y-3">
                    <label htmlFor="newInterestInput" className="text-sm font-medium text-slate-200">
                      Seus interesses para temas de prática e conversas:
                    </label>

                    {/* Sugestões de chips */}
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Sugestões de temas">
                      {SUGGESTED_INTERESTS.map((item) => {
                        const isSelected = interests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => (isSelected ? handleRemoveInterest(item) : handleAddInterest(item))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                                : 'bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />}
                            {item}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        id="newInterestInput"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddInterest(newInterest);
                          }
                        }}
                        placeholder="Adicionar outro interesse (ex: Cripto, Vôlei, IA...)"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleAddInterest(newInterest)}
                        disabled={!newInterest.trim()}
                      >
                        Adicionar
                      </Button>
                    </div>

                    {interests.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1" aria-label="Interesses selecionados">
                        {interests.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-950/60 border border-violet-800/60 text-xs text-violet-200"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(item)}
                              className="text-violet-400 hover:text-rose-400 cursor-pointer"
                              aria-label={`Remover ${item}`}
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sons difíceis (opcional) */}
                  <div className="space-y-1.5">
                    <label htmlFor="hardSounds" className="text-sm font-medium text-slate-200 flex items-center justify-between">
                      <span>Sons ou pronúncias que considera difíceis (opcional)</span>
                      <span className="text-xs text-slate-500">Para o Corretor de Pronúncia</span>
                    </label>
                    <Input
                      id="hardSounds"
                      value={hardSounds}
                      onChange={(e) => setHardSounds(e.target.value)}
                      placeholder="Ex: Diferença entre 'sheet' e 'shit', som do 'th' sonoro, 'world'..."
                      hint="O Professor Corretor de Pronúncia focará em exercícios específicos para estes sons."
                    />
                  </div>

                  {/* Situações em que trava (opcional) */}
                  <div className="space-y-1.5">
                    <label htmlFor="blockSituations" className="text-sm font-medium text-slate-200 flex items-center justify-between">
                      <span>Situações em que você costuma travar na fala (opcional)</span>
                      <span className="text-xs text-slate-500">Para o Destruidor de Bloqueio</span>
                    </label>
                    <Input
                      id="blockSituations"
                      value={blockSituations}
                      onChange={(e) => setBlockSituations(e.target.value)}
                      placeholder="Ex: Falar com nativos ao telefone, entrevistas de emprego, falar em público..."
                      hint="O Destruidor de Bloqueio na Fala simulará simulações cronometradas com essas situações."
                    />
                  </div>
                </div>
              )}

              {/* PREVIEW EM TEMPO REAL DAS VARIÁVEIS DOS PROFESSORES */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPromptPreview((v) => !v)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                  aria-expanded={showPromptPreview}
                >
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-violet-400" aria-hidden="true" />
                    Preview: Como suas respostas alimentarão os 8 Professores IA
                  </span>
                  {showPromptPreview ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  )}
                </button>

                {showPromptPreview && promptVars && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-violet-900/40 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-violet-400 font-bold mb-2">
                      <Layers className="w-4 h-4" aria-hidden="true" />
                      Injeção Dinâmica de Variáveis de Contexto (System Prompts)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                        <span className="text-violet-400 font-bold">[IDIOMA]:</span>{' '}
                        <span className="text-slate-200">{promptVars.IDIOMA}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                        <span className="text-violet-400 font-bold">[IDIOMA_NATIVO]:</span>{' '}
                        <span className="text-slate-200">{promptVars.IDIOMA_NATIVO}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                        <span className="text-violet-400 font-bold">[NÍVEL]:</span>{' '}
                        <span className="text-slate-200">{promptVars['NÍVEL']}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                        <span className="text-violet-400 font-bold">[OBJETIVO]:</span>{' '}
                        <span className="text-slate-200">{promptVars.OBJETIVO}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                        <span className="text-violet-400 font-bold">[MINUTOS]:</span>{' '}
                        <span className="text-slate-200">{promptVars.MINUTOS} min/dia</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                        <span className="text-violet-400 font-bold">[PRAZO]:</span>{' '}
                        <span className="text-slate-200">{promptVars.PRAZO} meses</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                        <span className="text-violet-400 font-bold">[DIFICULDADE]:</span>{' '}
                        <span className="text-slate-200">{promptVars.DIFICULDADE}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                        <span className="text-violet-400 font-bold">[ROTINA]:</span>{' '}
                        <span className="text-slate-200">{promptVars.ROTINA}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800 sm:col-span-2">
                        <span className="text-violet-400 font-bold">[INTERESSES]:</span>{' '}
                        <span className="text-slate-200">{promptVars.INTERESSES}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded border border-slate-800 sm:col-span-2">
                        <span className="text-violet-400 font-bold">[SITUAÇÕES_TRAVA]:</span>{' '}
                        <span className="text-slate-200">{promptVars['SITUAÇÕES_TRAVA']}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação do Wizard */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePrevStep}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Voltar
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNextStep}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Avançar
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSaving}
                    leftIcon={<Check className="w-4 h-4" />}
                    className="shadow-lg shadow-violet-900/40"
                  >
                    {existingProfile ? 'Salvar Alterações' : 'Concluir e Ir ao Dashboard'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
