import React, { useEffect, useState } from 'react';
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Play,
  Plus,
  RotateCcw,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { ExerciseItem, MuscleGroup, WorkoutSetLog } from '../../types';
import { MediaImage } from '../KimaKuamiLogo';
import { BarComparisonChart, LineTrendChart, ProgressRing } from '../Charts';

const MUSCLE_GROUPS: ('Todos' | MuscleGroup)[] = [
  'Todos',
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Abdómen',
];

export const ClientWorkoutsModule: React.FC = () => {
  const { state, currentUser, completeClientWorkout, addEvolutionRecord } = useAppState();

  const [activeSubTab, setActiveSubTab] = useState<'plano' | 'ativo' | 'evolucao'>('plano');
  const [selectedMuscle, setSelectedMuscle] = useState<'Todos' | MuscleGroup>('Todos');
  const [expandedExId, setExpandedExId] = useState<string | null>(null);

  // Evolution states
  const [evoPeriod, setEvoPeriod] = useState<'semanal' | 'mensal'>('semanal');
  const [evoMetric, setEvoMetric] = useState<'peso' | 'cargas' | 'frequencia' | 'medidas'>('peso');
  const [showAddEvo, setShowAddEvo] = useState(false);
  const [newWeight, setNewWeight] = useState('78.5');
  const [newBench, setNewBench] = useState('77.5');
  const [newWaist, setNewWaist] = useState('80.5');

  const plan =
    state.workoutPlans.find((wp) => wp.clientId === currentUser?.id) ||
    state.workoutPlans[0];

  // Active workout tracking state
  const [setLogs, setSetLogs] = useState<Record<string, WorkoutSetLog[]>>({});
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [restRunning, setRestRunning] = useState(false);

  // Initialize workout logs from plan
  useEffect(() => {
    if (!plan) return;
    const initial: Record<string, WorkoutSetLog[]> = {};
    plan.exercises.forEach((ex) => {
      const setsArr: WorkoutSetLog[] = [];
      for (let i = 1; i <= ex.sets; i++) {
        setsArr.push({
          exerciseId: ex.id,
          setNumber: i,
          weightKg: ex.recommendedWeightKg,
          reps: parseInt(ex.reps, 10) || 10,
          completed: false,
        });
      }
      initial[ex.id] = setsArr;
    });
    setSetLogs(initial);
  }, [plan?.id]);

  // Countdown rest timer
  useEffect(() => {
    if (!restRunning || restSecondsLeft <= 0) {
      if (restSecondsLeft <= 0 && restRunning) setRestRunning(false);
      return;
    }
    const timer = setInterval(() => {
      setRestSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [restRunning, restSecondsLeft]);

  const startRestTimer = (seconds: number) => {
    setRestSecondsLeft(seconds);
    setRestRunning(true);
  };

  const toggleSetComplete = (ex: ExerciseItem, setNum: number) => {
    setSetLogs((prev) => {
      const list = prev[ex.id] || [];
      const updated = list.map((s) =>
        s.setNumber === setNum ? { ...s, completed: !s.completed } : s
      );
      const justCompleted = updated.find((s) => s.setNumber === setNum)?.completed;
      if (justCompleted) {
        startRestTimer(ex.restSeconds);
      }
      const allDone = updated.length > 0 && updated.every((s) => s.completed);
      setCompletedExercises((ce) => ({ ...ce, [ex.id]: allDone }));
      return { ...prev, [ex.id]: updated };
    });
  };

  const updateSetField = (
    exId: string,
    setNum: number,
    field: 'weightKg' | 'reps',
    val: number
  ) => {
    setSetLogs((prev) => ({
      ...prev,
      [exId]: (prev[exId] || []).map((s) =>
        s.setNumber === setNum ? { ...s, [field]: Math.max(0, val) } : s
      ),
    }));
  };

  const toggleExerciseComplete = (exId: string) => {
    const nextVal = !completedExercises[exId];
    setCompletedExercises((prev) => ({ ...prev, [exId]: nextVal }));
    setSetLogs((prev) => ({
      ...prev,
      [exId]: (prev[exId] || []).map((s) => ({ ...s, completed: nextVal })),
    }));
  };

  const filteredExercises =
    plan?.exercises.filter(
      (ex) => selectedMuscle === 'Todos' || ex.muscleGroup === selectedMuscle
    ) || [];

  const totalExercises = plan?.exercises.length || 0;
  const doneExercisesCount =
    plan?.exercises.filter((ex) => completedExercises[ex.id]).length || 0;

  const clientEvolution = state.evolution.filter(
    (e) => e.clientId === (currentUser?.id || 'cli_carlos') && e.period === evoPeriod
  );

  const latestEvo = clientEvolution[clientEvolution.length - 1];

  const handleFinishWorkout = () => {
    if (!currentUser) return;
    completeClientWorkout(currentUser.id);
    setCompletedExercises({});
    setActiveSubTab('evolucao');
  };

  const handleSaveEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addEvolutionRecord({
      clientId: currentUser.id,
      dateLabel: evoPeriod === 'semanal' ? `Sem ${clientEvolution.length + 1}` : 'Hoje',
      period: evoPeriod,
      bodyWeightKg: parseFloat(newWeight) || 78,
      benchLoadKg: parseFloat(newBench) || 75,
      squatLoadKg: (parseFloat(newBench) || 75) + 15,
      workoutsCount: currentUser.weeklyCompleted || 4,
      chestCm: (latestEvo?.chestCm || 100) + 0.3,
      waistCm: parseFloat(newWaist) || 81,
      armCm: (latestEvo?.armCm || 37) + 0.2,
      thighCm: latestEvo?.thighCm || 58,
    });
    setShowAddEvo(false);
  };

  return (
    <div className="space-y-5">
      {/* Module Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">Módulo de Treinos</h1>
          <p className="text-xs text-[#929B95] mt-0.5">
            {plan?.name} · {plan?.level}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#1C2421] rounded-2xl border border-[#245C43]/30 w-fit">
          {[
            { id: 'plano', label: 'Plano & Exercícios' },
            { id: 'ativo', label: 'Treino em Andamento' },
            { id: 'evolucao', label: 'Evolução Física' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as 'plano' | 'ativo' | 'evolucao')}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-[#B7F34A] text-[#101312]'
                  : 'text-[#929B95] hover:text-[#F5F7F3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: PLANO & EXERCÍCIOS */}
      {activeSubTab === 'plano' && plan && (
        <div className="space-y-5">
          {/* Current Plan Hero Summary */}
          <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-8 space-y-3">
              <p className="text-xs font-semibold text-[#B7F34A]">Plano de treino atual</p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F5F7F3]">
                {plan.name}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#929B95]">
                <span>Objetivo: {plan.goal}</span>
                <span aria-hidden="true">·</span>
                <span>Dias: {plan.trainingDays.join(', ')}</span>
              </div>
              <p className="text-xs text-[#F5F7F3]/90">
                Próximo treino: <span className="font-semibold text-[#B7F34A]">{plan.nextWorkoutName}</span>
              </p>
            </div>

            <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#101312]">
              <div className="flex items-center gap-3">
                <ProgressRing percent={plan.progressPercent} size={64} />
                <div>
                  <p className="text-xs text-[#929B95]">Progresso geral</p>
                  <p className="text-sm font-bold text-[#F5F7F3] tabular-nums">
                    {plan.exercises.length} exercícios
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('ativo')}
                className="min-h-[44px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:brightness-105"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Iniciar treino
              </button>
            </div>
          </div>

          {/* Muscle Group Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(mg)}
                className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                  selectedMuscle === mg
                    ? 'bg-[#245C43] border-[#B7F34A]/60 text-[#F5F7F3]'
                    : 'bg-[#1C2421] border-[#245C43]/30 text-[#929B95] hover:text-[#F5F7F3]'
                }`}
              >
                {mg}
              </button>
            ))}
          </div>

          {/* Exercise List */}
          {filteredExercises.length === 0 ? (
            <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/30 p-8 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-[#929B95] mx-auto" />
              <p className="text-sm font-semibold text-[#F5F7F3]">
                Sem exercícios registados para {selectedMuscle} neste plano
              </p>
              <button
                onClick={() => setSelectedMuscle('Todos')}
                className="text-xs font-semibold text-[#B7F34A] hover:underline"
              >
                Mostrar todos os grupos musculares
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((ex) => {
                const isOpen = expandedExId === ex.id;
                return (
                  <div
                    key={ex.id}
                    className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 overflow-hidden flex flex-col"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#101312] shrink-0">
                        <MediaImage
                          src={ex.image}
                          alt={ex.name}
                          className="w-full h-full object-cover"
                          fallbackTitle={ex.muscleGroup}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-[#B7F34A]">
                            {ex.muscleGroup} · {ex.dayLabel}
                          </p>
                          <h3 className="font-display text-base font-bold text-[#F5F7F3] mt-0.5 leading-snug">
                            {ex.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                          <div>
                            <span className="text-[#929B95] block text-[11px]">Séries × Reps</span>
                            <span className="font-mono-tabular font-semibold text-[#F5F7F3]">
                              {ex.sets} × {ex.reps}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#929B95] block text-[11px]">Carga rec.</span>
                            <span className="font-mono-tabular font-semibold text-[#F5F7F3]">
                              {ex.recommendedWeightKg > 0 ? `${ex.recommendedWeightKg} kg` : 'Corporal'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#929B95] block text-[11px]">Descanso</span>
                            <span className="font-mono-tabular font-semibold text-[#F5F7F3]">
                              {ex.restSeconds}s
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-3">
                      <button
                        onClick={() => setExpandedExId(isOpen ? null : ex.id)}
                        className="w-full min-h-[38px] rounded-xl bg-[#101312] px-3 flex items-center justify-between text-xs text-[#929B95] hover:text-[#F5F7F3] transition-colors"
                      >
                        <span>Instruções técnicas de execução</span>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isOpen && (
                        <p className="mt-2.5 text-xs text-[#F5F7F3]/90 leading-relaxed px-1 pb-1">
                          {ex.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: TREINO EM ANDAMENTO */}
      {activeSubTab === 'ativo' && plan && (
        <div className="space-y-4">
          {/* Active Workout Timer & Summary Bar */}
          <div className="rounded-3xl bg-[#1C2421] border border-[#B7F34A]/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#101312] border border-[#245C43] flex items-center justify-center shrink-0">
                <Timer className="w-6 h-6 text-[#B7F34A]" />
              </div>
              <div>
                <p className="text-xs text-[#929B95]">Cronómetro de descanso</p>
                <p className="font-mono-tabular text-2xl font-bold text-[#F5F7F3] tabular-nums">
                  {Math.floor(restSecondsLeft / 60)}:
                  {String(restSecondsLeft % 60).padStart(2, '0')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setRestRunning(!restRunning)}
                disabled={restSecondsLeft === 0}
                className="min-h-[40px] px-3.5 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3] disabled:opacity-40"
              >
                {restRunning ? 'Pausar' : 'Retomar'}
              </button>
              <button
                onClick={() => startRestTimer((restSecondsLeft || 60) + 15)}
                className="min-h-[40px] px-3.5 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#B7F34A]"
              >
                +15 seg
              </button>
              <button
                onClick={() => {
                  setRestRunning(false);
                  setRestSecondsLeft(0);
                }}
                className="min-h-[40px] px-3 rounded-xl bg-[#101312] text-xs text-[#929B95] hover:text-[#F5F7F3] inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Zerar
              </button>
            </div>
          </div>

          {/* Progress Status */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-[#929B95]">
              Exercícios concluídos:{' '}
              <strong className="font-mono-tabular text-[#F5F7F3]">
                {doneExercisesCount} / {totalExercises}
              </strong>
            </span>
            <button
              onClick={handleFinishWorkout}
              className="min-h-[42px] px-5 rounded-xl bg-[#B7F34A] text-[#101312] font-bold text-xs inline-flex items-center gap-1.5 hover:brightness-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              Concluir treino
            </button>
          </div>

          {/* Interactive Exercise Set Logger */}
          <div className="space-y-3">
            {plan.exercises.map((ex) => {
              const sets = setLogs[ex.id] || [];
              const exDone = !!completedExercises[ex.id];
              return (
                <div
                  key={ex.id}
                  className={`rounded-3xl border p-4 sm:p-5 space-y-3 transition-colors ${
                    exDone
                      ? 'bg-[#245C43]/20 border-[#B7F34A]/60'
                      : 'bg-[#1C2421] border-[#245C43]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#B7F34A] font-semibold">
                        {ex.muscleGroup} · Descanso {ex.restSeconds}s
                      </p>
                      <h3 className="font-display text-base font-bold text-[#F5F7F3] truncate">
                        {ex.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => toggleExerciseComplete(ex.id)}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors ${
                        exDone
                          ? 'bg-[#B7F34A] text-[#101312]'
                          : 'bg-[#101312] border border-[#245C43]/50 text-[#F5F7F3]'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {exDone ? 'Concluído' : 'Marcar exercício'}
                    </button>
                  </div>

                  {/* Sets table */}
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-12 gap-2 text-[11px] text-[#929B95] px-2">
                      <span className="col-span-2">Série</span>
                      <span className="col-span-4">Carga (kg)</span>
                      <span className="col-span-4">Repetições</span>
                      <span className="col-span-2 text-right">Feito</span>
                    </div>

                    {sets.map((s) => (
                      <div
                        key={s.setNumber}
                        className={`grid grid-cols-12 gap-2 items-center rounded-xl px-2 py-1.5 ${
                          s.completed ? 'bg-[#101312]/80' : 'bg-[#101312]/40'
                        }`}
                      >
                        <span className="col-span-2 font-mono-tabular text-xs font-bold text-[#F5F7F3]">
                          #{s.setNumber}
                        </span>
                        <div className="col-span-4">
                          <input
                            type="number"
                            value={s.weightKg}
                            onChange={(e) =>
                              updateSetField(
                                ex.id,
                                s.setNumber,
                                'weightKg',
                                Number(e.target.value)
                              )
                            }
                            className="w-full min-h-[36px] rounded-lg bg-[#1C2421] border border-[#245C43]/40 px-2.5 text-xs font-mono-tabular text-[#F5F7F3]"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="number"
                            value={s.reps}
                            onChange={(e) =>
                              updateSetField(ex.id, s.setNumber, 'reps', Number(e.target.value))
                            }
                            className="w-full min-h-[36px] rounded-lg bg-[#1C2421] border border-[#245C43]/40 px-2.5 text-xs font-mono-tabular text-[#F5F7F3]"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button
                            onClick={() => toggleSetComplete(ex, s.setNumber)}
                            aria-label={`Concluir série ${s.setNumber}`}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                              s.completed
                                ? 'bg-[#B7F34A] text-[#101312]'
                                : 'bg-[#1C2421] border border-[#245C43]/60 text-[#929B95]'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => startRestTimer(ex.restSeconds)}
                      className="text-xs font-semibold text-[#B7F34A] inline-flex items-center gap-1 hover:underline py-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Iniciar descanso ({ex.restSeconds}s)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: EVOLUÇÃO FÍSICA */}
      {activeSubTab === 'evolucao' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#1C2421] rounded-xl border border-[#245C43]/30">
              <button
                onClick={() => setEvoPeriod('semanal')}
                className={`min-h-[36px] px-3.5 rounded-lg text-xs font-semibold transition-colors ${
                  evoPeriod === 'semanal'
                    ? 'bg-[#245C43] text-[#F5F7F3]'
                    : 'text-[#929B95] hover:text-[#F5F7F3]'
                }`}
              >
                Evolução Semanal
              </button>
              <button
                onClick={() => setEvoPeriod('mensal')}
                className={`min-h-[36px] px-3.5 rounded-lg text-xs font-semibold transition-colors ${
                  evoPeriod === 'mensal'
                    ? 'bg-[#245C43] text-[#F5F7F3]'
                    : 'text-[#929B95] hover:text-[#F5F7F3]'
                }`}
              >
                Evolução Mensal
              </button>
            </div>

            <button
              onClick={() => setShowAddEvo(!showAddEvo)}
              className="min-h-[40px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Registar medição
            </button>
          </div>

          {showAddEvo && (
            <form
              onSubmit={handleSaveEvolution}
              className="rounded-3xl bg-[#1C2421] border border-[#B7F34A]/50 p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-xs text-[#929B95] mb-1">Peso corporal (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm font-mono-tabular text-[#F5F7F3]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#929B95] mb-1">Carga Supino (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newBench}
                  onChange={(e) => setNewBench(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm font-mono-tabular text-[#F5F7F3]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#929B95] mb-1">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newWaist}
                  onChange={(e) => setNewWaist(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm font-mono-tabular text-[#F5F7F3]"
                />
              </div>
              <button
                type="submit"
                className="min-h-[42px] rounded-xl bg-[#B7F34A] text-[#101312] font-bold text-xs"
              >
                Guardar registo
              </button>
            </form>
          )}

          {/* Metric Selector Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'peso',
                label: 'Peso corporal',
                val: `${latestEvo?.bodyWeightKg ?? 78.2} kg`,
                delta: '+1.8 kg massa limpa',
              },
              {
                id: 'cargas',
                label: 'Cargas utilizadas',
                val: `${latestEvo?.benchLoadKg ?? 75} kg`,
                delta: 'Supino · +10 kg',
              },
              {
                id: 'frequencia',
                label: 'Frequência de treinos',
                val: `${latestEvo?.workoutsCount ?? 4} treinos`,
                delta: evoPeriod === 'semanal' ? 'Nesta semana' : 'Este mês',
              },
              {
                id: 'medidas',
                label: 'Medidas corporais',
                val: `${latestEvo?.chestCm ?? 100.2} cm`,
                delta: `Cintura ${latestEvo?.waistCm ?? 81} cm`,
              },
            ].map((card) => (
              <button
                key={card.id}
                onClick={() =>
                  setEvoMetric(card.id as 'peso' | 'cargas' | 'frequencia' | 'medidas')
                }
                className={`text-left rounded-2xl p-4 border transition-colors ${
                  evoMetric === card.id
                    ? 'bg-[#1C2421] border-[#B7F34A]'
                    : 'bg-[#1C2421] border-[#245C43]/30 hover:border-[#245C43]'
                }`}
              >
                <p className="text-xs text-[#929B95]">{card.label}</p>
                <p className="font-mono-tabular text-xl font-bold text-[#F5F7F3] mt-1 tabular-nums">
                  {card.val}
                </p>
                <p className="text-[11px] text-[#B7F34A] mt-1">{card.delta}</p>
              </button>
            ))}
          </div>

          {/* Chart Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#B7F34A]" />
                  <h3 className="font-display text-base font-bold text-[#F5F7F3]">
                    {evoMetric === 'peso'
                      ? 'Evolução do Peso Corporal (kg)'
                      : evoMetric === 'cargas'
                      ? 'Progressão de Cargas no Supino (kg)'
                      : evoMetric === 'frequencia'
                      ? 'Frequência de Treinos'
                      : 'Perímetro Torácico (cm)'}
                  </h3>
                </div>
                <span className="text-xs text-[#929B95]">
                  {evoPeriod === 'semanal' ? 'Últimas semanas' : 'Últimos meses'}
                </span>
              </div>

              {evoMetric === 'frequencia' ? (
                <BarComparisonChart
                  data={clientEvolution.map((e) => ({
                    label: e.dateLabel,
                    primary: e.workoutsCount,
                  }))}
                  primaryLabel="Treinos concluídos"
                  formatValue={(v) => `${v} treinos`}
                />
              ) : (
                <LineTrendChart
                  data={clientEvolution.map((e) => ({
                    label: e.dateLabel,
                    value:
                      evoMetric === 'peso'
                        ? e.bodyWeightKg
                        : evoMetric === 'cargas'
                        ? e.benchLoadKg
                        : e.chestCm,
                  }))}
                  unit={evoMetric === 'medidas' ? 'cm' : 'kg'}
                />
              )}
            </div>

            {/* Body Measurements Breakdown */}
            <div className="lg:col-span-5 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#B7F34A]" />
                <h3 className="font-display text-base font-bold text-[#F5F7F3]">
                  Medidas Corporais Atuais
                </h3>
              </div>

              <div className="divide-y divide-[#101312]">
                {[
                  { label: 'Peitoral', value: `${latestEvo?.chestCm ?? 100.2} cm`, change: '+2.2 cm' },
                  { label: 'Cintura', value: `${latestEvo?.waistCm ?? 81} cm`, change: '-2.0 cm' },
                  { label: 'Braço (contraído)', value: `${latestEvo?.armCm ?? 37.2} cm`, change: '+1.7 cm' },
                  { label: 'Coxa medial', value: `${latestEvo?.thighCm ?? 58} cm`, change: '+2.0 cm' },
                  { label: 'Agachamento (carga)', value: `${latestEvo?.squatLoadKg ?? 90} kg`, change: '+12 kg' },
                ].map((m) => (
                  <div key={m.label} className="py-3 flex items-center justify-between text-sm">
                    <span className="text-[#929B95]">{m.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#B7F34A] font-mono-tabular">{m.change}</span>
                      <span className="font-mono-tabular font-bold text-[#F5F7F3] tabular-nums">
                        {m.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
