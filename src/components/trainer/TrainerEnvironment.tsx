import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Home,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { KimaKuamiLogo, MediaImage } from '../KimaKuamiLogo';
import { NotificationsDrawer } from '../NotificationsDrawer';
import { CommunityView } from '../CommunityView';
import { BRAND_IMAGES } from '../../data/mockData';
import { ExerciseItem, MuscleGroup, TrainingSession, WorkoutPlan } from '../../types';

type TrainerPage = 'inicio' | 'clientes' | 'treinos' | 'agenda' | 'comunidade' | 'perfil';

export const TrainerEnvironment: React.FC = () => {
  const {
    state,
    currentUser,
    logout,
    loginQuickDemo,
    saveWorkoutPlan,
    updateSessionStatus,
    showToast,
  } = useAppState();

  const [page, setPage] = useState<TrainerPage>('inicio');
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [agendaMode, setAgendaMode] = useState<'semanal' | 'mensal'>('semanal');
  const [rescheduleTarget, setRescheduleTarget] = useState<TrainingSession | null>(null);
  const [resDate, setResDate] = useState('2026-11-20');
  const [resTime, setResTime] = useState('18:00');

  // Workout Builder state
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Peito');
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState('10');
  const [newExWeight, setNewExWeight] = useState(40);
  const [newExRest, setNewExRest] = useState(75);
  const [newExDay, setNewExDay] = useState('Dia A — Peito & Tríceps');

  if (!currentUser) return null;

  const myClients = state.users.filter(
    (u) => u.role === 'cliente' && (u.trainerId === currentUser.id || u.status === 'Ativo')
  );
  const assignedClients = state.users.filter(
    (u) => u.role === 'cliente' && u.trainerId === currentUser.id
  );
  const mySessions = state.sessions.filter((s) => s.trainerId === currentUser.id);
  const todaySessions = mySessions.filter(
    (s) => s.date === '2026-11-18' && s.status !== 'Cancelada'
  );
  const completedSessions = mySessions.filter((s) => s.status === 'Concluída');
  const upcomingSessions = mySessions.filter(
    (s) => s.status === 'Confirmada' || s.status === 'Pendente'
  );
  const plansToReview = state.workoutPlans.filter((wp) => wp.needsReview).length;

  const unreadNotifs = state.notifications.filter(
    (n) => n.role === 'trainer' && !n.read
  ).length;

  const selectedClient = state.users.find((u) => u.id === selectedClientId) || null;
  const selectedClientPlan = state.workoutPlans.find((wp) => wp.clientId === selectedClient?.id);

  const openBuilderForPlan = (plan?: WorkoutPlan, clientId?: string) => {
    if (plan) {
      setEditingPlan(JSON.parse(JSON.stringify(plan)) as WorkoutPlan);
    } else {
      setEditingPlan({
        id: `wp_${Date.now()}`,
        name: 'Novo Plano Personalizado',
        goal: 'Hipertrofia e Força',
        level: 'Intermédio',
        trainingDays: ['Seg', 'Qua', 'Sex'],
        progressPercent: 0,
        nextWorkoutName: 'Dia A — Corpo Superior',
        trainerId: currentUser.id,
        clientId: clientId || myClients[0]?.id,
        needsReview: false,
        exercises: [],
      });
    }
    setPage('treinos');
  };

  const handleAddExerciseToBuilder = () => {
    if (!editingPlan || !newExName.trim()) return;
    const item: ExerciseItem = {
      id: `ex_${Date.now()}`,
      name: newExName.trim(),
      muscleGroup: newExMuscle,
      image:
        newExMuscle === 'Pernas'
          ? BRAND_IMAGES.ptCoaching
          : newExMuscle === 'Abdómen'
          ? BRAND_IMAGES.cardioRunner
          : BRAND_IMAGES.strengthBench,
      sets: newExSets,
      reps: newExReps,
      restSeconds: newExRest,
      recommendedWeightKg: newExWeight,
      instructions: 'Execução controlada com foco na postura e amplitude completa.',
      dayLabel: newExDay,
    };
    setEditingPlan({
      ...editingPlan,
      exercises: [...editingPlan.exercises, item],
    });
    setNewExName('');
  };

  const handleSaveBuilder = () => {
    if (!editingPlan) return;
    if (!editingPlan.name.trim()) {
      showToast('Indica o nome do plano de treino.', 'error');
      return;
    }
    saveWorkoutPlan({ ...editingPlan, needsReview: false });
    setEditingPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#101312] text-[#F5F7F3] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#101312] border-r border-[#1C2421] p-5 justify-between">
        <div className="space-y-8">
          <KimaKuamiLogo variant="horizontal" size="md" showTagline />
          <nav className="space-y-1.5">
            {[
              { id: 'inicio', label: 'Dashboard', icon: Home },
              { id: 'clientes', label: 'Clientes', icon: Users },
              { id: 'treinos', label: 'Construtor de Treinos', icon: Dumbbell },
              { id: 'agenda', label: 'Agenda', icon: Calendar },
              { id: 'comunidade', label: 'Comunidade', icon: ClipboardList },
              { id: 'perfil', label: 'Perfil Profissional', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id as TrainerPage)}
                  className={`w-full min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#B7F34A] text-[#101312]'
                      : 'text-[#929B95] hover:text-[#F5F7F3] hover:bg-[#1C2421]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#1C2421]">
          <p className="text-[11px] text-[#929B95] px-2">Alternar ambiente demo</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => loginQuickDemo('cliente')}
              className="min-h-[36px] rounded-xl bg-[#1C2421] text-[11px] font-semibold text-[#F5F7F3]"
            >
              Cliente
            </button>
            <button
              onClick={() => loginQuickDemo('admin')}
              className="min-h-[36px] rounded-xl bg-[#1C2421] text-[11px] font-semibold text-[#F5F7F3]"
            >
              Administrador
            </button>
          </div>
          <button
            onClick={logout}
            className="w-full min-h-[42px] px-3 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#929B95] hover:text-red-300 hover:bg-[#1C2421]"
          >
            <LogOut className="w-4 h-4" />
            Terminar sessão
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-24 lg:pb-10">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-[#101312]/90 backdrop-blur-md border-b border-[#1C2421] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <KimaKuamiLogo variant="compact" size="sm" />
            </div>
            <span className="hidden lg:inline text-xs text-[#929B95]">
              Ambiente Personal Trainer · {state.settings.gymName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative min-w-[44px] min-h-[44px] rounded-xl bg-[#1C2421] border border-[#245C43]/30 flex items-center justify-center"
              aria-label="Notificações do Personal Trainer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B7F34A] text-[#101312] text-[10px] font-bold flex items-center justify-center font-mono-tabular">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <button
              onClick={() => setPage('perfil')}
              className="min-h-[44px] flex items-center gap-2 pl-1.5 pr-3 rounded-xl bg-[#1C2421] border border-[#245C43]/30"
            >
              <MediaImage
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="hidden sm:inline text-xs font-semibold text-[#F5F7F3]">
                PT {currentUser.name}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-6xl w-full mx-auto">
          {/* 6.1 DASHBOARD */}
          {page === 'inicio' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <MediaImage
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#B7F34A]">Personal Trainer Autorizado</p>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F7F3]">
                      Olá, {currentUser.name}!
                    </h1>
                    <p className="text-xs text-[#929B95] mt-0.5">{currentUser.workingHours}</p>
                  </div>
                </div>

                <button
                  onClick={() => openBuilderForPlan()}
                  className="min-h-[44px] px-5 rounded-2xl bg-[#B7F34A] text-[#101312] font-bold text-xs inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Criar plano de treino
                </button>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    label: 'Clientes acompanhados',
                    val: `${assignedClients.length}`,
                    sub: `${myClients.length} ativos no clube`,
                  },
                  {
                    label: 'Sessões de hoje',
                    val: `${todaySessions.length}`,
                    sub: `${upcomingSessions.length} próximas na semana`,
                  },
                  {
                    label: 'Treinos por rever',
                    val: `${plansToReview}`,
                    sub: `${completedSessions.length} sessões concluídas`,
                  },
                  {
                    label: 'Taxa de assiduidade',
                    val: '92%',
                    sub: 'Média últimos 30 dias',
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-4 sm:p-5"
                  >
                    <p className="text-xs text-[#929B95]">{kpi.label}</p>
                    <p className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[#F5F7F3] mt-1.5 tabular-nums">
                      {kpi.val}
                    </p>
                    <p className="text-[11px] text-[#B7F34A] mt-1">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Today's sessions & Priority Clients */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-[#F5F7F3]">
                      Sessões de Hoje & Próximas
                    </h2>
                    <button
                      onClick={() => setPage('agenda')}
                      className="text-xs font-semibold text-[#B7F34A] hover:underline"
                    >
                      Ver agenda completa
                    </button>
                  </div>

                  <div className="space-y-3">
                    {upcomingSessions.slice(0, 4).map((ses) => {
                      const cli = state.users.find((u) => u.id === ses.clientId);
                      return (
                        <div
                          key={ses.id}
                          className="rounded-2xl bg-[#101312] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <MediaImage
                              src={cli?.avatar || ''}
                              alt={cli?.name || 'Cliente'}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <p className="text-sm font-bold text-[#F5F7F3]">{cli?.name}</p>
                              <p className="text-xs text-[#929B95]">
                                {ses.date} · {ses.time} ({ses.durationMinutes} min) · {ses.type}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {ses.status === 'Pendente' && (
                              <button
                                onClick={() => updateSessionStatus(ses.id, 'Confirmada')}
                                className="min-h-[36px] px-3 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
                              >
                                Confirmar
                              </button>
                            )}
                            <span className="text-xs font-semibold text-[#B7F34A]">
                              {ses.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-[#F5F7F3]">
                      Clientes Acompanhados
                    </h2>
                    <button
                      onClick={() => setPage('clientes')}
                      className="text-xs font-semibold text-[#B7F34A] hover:underline"
                    >
                      Gerir lista
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {assignedClients.map((cli) => {
                      const wp = state.workoutPlans.find((p) => p.clientId === cli.id);
                      return (
                        <button
                          key={cli.id}
                          onClick={() => {
                            setSelectedClientId(cli.id);
                            setPage('clientes');
                          }}
                          className="w-full text-left rounded-2xl bg-[#101312] p-3.5 flex items-center justify-between gap-3 hover:border hover:border-[#B7F34A]/60"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <MediaImage
                              src={cli.avatar}
                              alt={cli.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#F5F7F3] truncate">
                                {cli.name}
                              </p>
                              <p className="text-xs text-[#929B95] truncate">
                                {wp?.name || cli.goal}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono-tabular text-xs font-bold text-[#B7F34A]">
                              {wp?.progressPercent ?? 50}%
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#929B95]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6.2 GESTÃO DE CLIENTES */}
          {page === 'clientes' && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                  Gestão de Clientes
                </h1>
                <p className="text-xs text-[#929B95] mt-0.5">
                  Seleciona um cliente para consultar o histórico e ajustar o plano de treino
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6 space-y-3">
                  {myClients.map((cli) => {
                    const wp = state.workoutPlans.find((p) => p.clientId === cli.id);
                    const active = selectedClientId === cli.id;
                    return (
                      <button
                        key={cli.id}
                        onClick={() => setSelectedClientId(cli.id)}
                        className={`w-full text-left rounded-3xl p-4 border flex items-center justify-between gap-4 transition-colors ${
                          active
                            ? 'bg-[#1C2421] border-[#B7F34A]'
                            : 'bg-[#1C2421] border-[#245C43]/40 hover:border-[#245C43]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <MediaImage
                            src={cli.avatar}
                            alt={cli.name}
                            className="w-12 h-12 rounded-2xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#F5F7F3] truncate">{cli.name}</p>
                            <p className="text-xs text-[#929B95] truncate">{cli.goal}</p>
                            <p className="text-[11px] text-[#B7F34A] mt-0.5">
                              {wp?.name || 'Sem plano'} · Última atividade: Hoje
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono-tabular text-sm font-bold text-[#F5F7F3]">
                            {wp?.progressPercent ?? 45}%
                          </span>
                          <p className="text-[11px] text-[#929B95]">progresso</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Client Detail */}
                <div className="lg:col-span-6">
                  {selectedClient ? (
                    <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <MediaImage
                          src={selectedClient.avatar}
                          alt={selectedClient.name}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0"
                        />
                        <div>
                          <h2 className="font-display text-xl font-bold text-[#F5F7F3]">
                            {selectedClient.name}
                          </h2>
                          <p className="text-xs text-[#929B95]">
                            {selectedClient.phone} · Nível {selectedClient.level}
                          </p>
                          <p className="text-xs text-[#B7F34A] mt-1">{selectedClient.goal}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 rounded-2xl bg-[#101312] p-4 text-center">
                        <div>
                          <p className="text-[11px] text-[#929B95]">Treinos/Sem</p>
                          <p className="font-mono-tabular text-base font-bold text-[#F5F7F3] mt-0.5">
                            {selectedClient.weeklyCompleted}/{selectedClient.weeklyTarget}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#929B95]">Sequência</p>
                          <p className="font-mono-tabular text-base font-bold text-[#B7F34A] mt-0.5">
                            {selectedClient.streakDays} dias
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#929B95]">Progresso</p>
                          <p className="font-mono-tabular text-base font-bold text-[#F5F7F3] mt-0.5">
                            {selectedClientPlan?.progressPercent ?? 50}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-[#F5F7F3]">
                          Histórico de acompanhamento & Plano atual
                        </h3>
                        <p className="text-xs text-[#929B95] leading-relaxed">
                          Plano ativo:{' '}
                          <strong className="text-[#F5F7F3]">
                            {selectedClientPlan?.name || 'Plano Base'}
                          </strong>
                          . Aderência consistente nas últimas 4 semanas com evolução de carga nos movimentos compostos.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => openBuilderForPlan(selectedClientPlan, selectedClient.id)}
                          className="min-h-[42px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
                        >
                          {selectedClientPlan ? 'Ajustar plano de treino' : 'Criar plano para cliente'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/30 p-8 text-center text-sm text-[#929B95]">
                      Seleciona um cliente à esquerda para visualizar o perfil completo e histórico de acompanhamento.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6.3 CRIAÇÃO E GESTÃO DE TREINOS */}
          {page === 'treinos' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                    Construtor e Gestão de Treinos
                  </h1>
                  <p className="text-xs text-[#929B95] mt-0.5">
                    Cria, edita e ajusta cargas, séries, repetições e intervalos por cliente
                  </p>
                </div>

                {!editingPlan && (
                  <button
                    onClick={() => openBuilderForPlan()}
                    className="min-h-[42px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Novo plano
                  </button>
                )}
              </div>

              {editingPlan ? (
                <div className="rounded-3xl bg-[#1C2421] border border-[#B7F34A]/50 p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-[#F5F7F3]">
                      Editor Visual de Plano
                    </h2>
                    <button
                      onClick={() => setEditingPlan(null)}
                      className="text-xs text-[#929B95] hover:text-[#F5F7F3]"
                    >
                      Cancelar edição
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-[#929B95] mb-1">Nome do plano</label>
                      <input
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, name: e.target.value })
                        }
                        className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#929B95] mb-1">Objetivo</label>
                      <input
                        type="text"
                        value={editingPlan.goal}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, goal: e.target.value })
                        }
                        className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#929B95] mb-1">Cliente atribuído</label>
                      <select
                        value={editingPlan.clientId || ''}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, clientId: e.target.value })
                        }
                        className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
                      >
                        {myClients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#929B95] mb-1">Nível</label>
                      <select
                        value={editingPlan.level}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            level: e.target.value as WorkoutPlan['level'],
                          })
                        }
                        className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
                      >
                        <option value="Iniciante">Iniciante</option>
                        <option value="Intermédio">Intermédio</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                    </div>
                  </div>

                  {/* Add Exercise Form */}
                  <div className="rounded-2xl bg-[#101312] p-4 space-y-3">
                    <p className="text-xs font-bold text-[#B7F34A]">Adicionar exercício ao plano</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                      <input
                        type="text"
                        placeholder="Nome do exercício"
                        value={newExName}
                        onChange={(e) => setNewExName(e.target.value)}
                        className="lg:col-span-2 min-h-[40px] rounded-xl bg-[#1C2421] border border-[#245C43]/40 px-3 text-xs text-[#F5F7F3]"
                      />
                      <select
                        value={newExMuscle}
                        onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
                        className="min-h-[40px] rounded-xl bg-[#1C2421] border border-[#245C43]/40 px-2.5 text-xs text-[#F5F7F3]"
                      >
                        {['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Abdómen'].map(
                          (m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          )
                        )}
                      </select>
                      <input
                        type="number"
                        placeholder="Séries"
                        value={newExSets}
                        onChange={(e) => setNewExSets(Number(e.target.value))}
                        className="min-h-[40px] rounded-xl bg-[#1C2421] border border-[#245C43]/40 px-2.5 text-xs font-mono-tabular text-[#F5F7F3]"
                      />
                      <input
                        type="text"
                        placeholder="Reps (ex: 10-12)"
                        value={newExReps}
                        onChange={(e) => setNewExReps(e.target.value)}
                        className="min-h-[40px] rounded-xl bg-[#1C2421] border border-[#245C43]/40 px-2.5 text-xs font-mono-tabular text-[#F5F7F3]"
                      />
                      <button
                        type="button"
                        onClick={handleAddExerciseToBuilder}
                        className="min-h-[40px] rounded-xl bg-[#245C43] text-[#F5F7F3] text-xs font-bold hover:bg-[#245C43]/80"
                      >
                        + Adicionar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        value={newExDay}
                        onChange={(e) => setNewExDay(e.target.value)}
                        placeholder="Dia de treino (ex: Dia A — Peito)"
                        className="min-h-[38px] rounded-xl bg-[#1C2421] border border-[#245C43]/40 px-3 text-xs text-[#F5F7F3]"
                      />
                      <div className="flex items-center gap-2 text-xs text-[#929B95]">
                        <span>Carga (kg):</span>
                        <input
                          type="number"
                          value={newExWeight}
                          onChange={(e) => setNewExWeight(Number(e.target.value))}
                          className="w-20 min-h-[38px] rounded-xl bg-[#1C2421] border border-[#245C43]/40 px-2.5 text-xs font-mono-tabular text-[#F5F7F3]"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#929B95]">
                        <span>Descanso (seg):</span>
                        <input
                          type="number"
                          value={newExRest}
                          onChange={(e) => setNewExRest(Number(e.target.value))}
                          className="w-20 min-h-[38px] rounded-xl bg-[#1C2421] border border-[#245C43]/40 px-2.5 text-xs font-mono-tabular text-[#F5F7F3]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current Exercises in Plan */}
                  <div className="space-y-2">
                    {editingPlan.exercises.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className="rounded-2xl bg-[#101312] p-3.5 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs text-[#B7F34A]">
                            {idx + 1}. {ex.muscleGroup} · {ex.dayLabel}
                          </p>
                          <p className="text-sm font-bold text-[#F5F7F3]">{ex.name}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono-tabular text-[#929B95]">
                          <span>
                            {ex.sets}×{ex.reps}
                          </span>
                          <span>{ex.recommendedWeightKg} kg</span>
                          <span>{ex.restSeconds}s</span>
                          <button
                            onClick={() =>
                              setEditingPlan({
                                ...editingPlan,
                                exercises: editingPlan.exercises.filter((e) => e.id !== ex.id),
                              })
                            }
                            className="p-2 rounded-lg text-red-400 hover:bg-red-950/40"
                            aria-label="Remover exercício"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setEditingPlan(null)}
                      className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-[#929B95]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveBuilder}
                      className="min-h-[44px] px-6 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
                    >
                      Guardar e atribuir plano
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.workoutPlans.map((wp) => {
                    const cli = state.users.find((u) => u.id === wp.clientId);
                    return (
                      <div
                        key={wp.id}
                        className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 flex flex-col justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#B7F34A] font-semibold">
                              {cli?.name || 'Modelo Geral'}
                            </span>
                            <span className="text-[#929B95] font-mono-tabular">
                              {wp.exercises.length} exercícios
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-[#F5F7F3] mt-1">
                            {wp.name}
                          </h3>
                          <p className="text-xs text-[#929B95] mt-1">
                            {wp.goal} · {wp.trainingDays.join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#101312]">
                          <span className="text-xs text-[#929B95]">
                            {wp.needsReview ? 'Aguarda revisão de cargas' : 'Atualizado'}
                          </span>
                          <button
                            onClick={() => openBuilderForPlan(wp)}
                            className="min-h-[40px] px-4 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3] hover:border-[#B7F34A]"
                          >
                            Editar plano
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 6.4 AGENDA */}
          {page === 'agenda' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                    Agenda do Personal Trainer
                  </h1>
                  <p className="text-xs text-[#929B95] mt-0.5">
                    Confirma, reagenda ou gere todas as marcações dos teus clientes
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#1C2421] rounded-xl border border-[#245C43]/30">
                  <button
                    onClick={() => setAgendaMode('semanal')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold ${
                      agendaMode === 'semanal' ? 'bg-[#B7F34A] text-[#101312]' : 'text-[#929B95]'
                    }`}
                  >
                    Vista Semanal
                  </button>
                  <button
                    onClick={() => setAgendaMode('mensal')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold ${
                      agendaMode === 'mensal' ? 'bg-[#B7F34A] text-[#101312]' : 'text-[#929B95]'
                    }`}
                  >
                    Vista Mensal
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {mySessions.map((ses) => {
                  const cli = state.users.find((u) => u.id === ses.clientId);
                  return (
                    <div
                      key={ses.id}
                      className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <MediaImage
                          src={cli?.avatar || ''}
                          alt={cli?.name || 'Cliente'}
                          className="w-12 h-12 rounded-2xl object-cover shrink-0"
                        />
                        <div>
                          <p className="text-xs font-mono-tabular text-[#B7F34A]">
                            {ses.date} · {ses.time} ({ses.durationMinutes} min) · {ses.status}
                          </p>
                          <p className="text-sm font-bold text-[#F5F7F3] mt-0.5">
                            {cli?.name} — {ses.type}
                          </p>
                          <p className="text-xs text-[#929B95]">{ses.location}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {ses.status === 'Pendente' && (
                          <button
                            onClick={() => updateSessionStatus(ses.id, 'Confirmada')}
                            className="min-h-[38px] px-3.5 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirmar
                          </button>
                        )}
                        {ses.status === 'Confirmada' && (
                          <button
                            onClick={() => updateSessionStatus(ses.id, 'Concluída')}
                            className="min-h-[38px] px-3.5 rounded-xl bg-[#245C43] text-[#F5F7F3] text-xs font-semibold"
                          >
                            Marcar concluída
                          </button>
                        )}
                        {ses.status !== 'Cancelada' && ses.status !== 'Concluída' && (
                          <>
                            <button
                              onClick={() => {
                                setRescheduleTarget(ses);
                                setResDate(ses.date);
                                setResTime(ses.time);
                              }}
                              className="min-h-[38px] px-3 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs text-[#F5F7F3] inline-flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Reagendar
                            </button>
                            <button
                              onClick={() => updateSessionStatus(ses.id, 'Cancelada')}
                              className="min-h-[38px] px-3 rounded-xl bg-[#101312] border border-red-500/30 text-xs text-red-300 inline-flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6.5 COMUNIDADE */}
          {page === 'comunidade' && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                  Comunidade Kima Kuami
                </h1>
                <p className="text-xs text-[#929B95] mt-0.5">
                  Publica dicas educativas, acompanha conquistas e motiva os teus atletas
                </p>
              </div>
              <CommunityView />
            </div>
          )}

          {/* 6.6 PERFIL PROFISSIONAL */}
          {page === 'perfil' && (
            <div className="max-w-2xl space-y-5">
              <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                Perfil Profissional
              </h1>
              <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-6 flex items-center gap-4">
                <MediaImage
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <h2 className="font-display text-xl font-bold text-[#F5F7F3]">
                    {currentUser.name}
                  </h2>
                  <p className="text-xs text-[#B7F34A] font-semibold">
                    {currentUser.specialties?.join(' · ')}
                  </p>
                  <p className="text-xs text-[#929B95] mt-1">
                    {currentUser.email} · {currentUser.phone}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-3 text-xs">
                <p className="text-[#F5F7F3] leading-relaxed">{currentUser.bio}</p>
                <div className="flex justify-between py-2 border-t border-[#101312]">
                  <span className="text-[#929B95]">Horário de atendimento</span>
                  <span className="font-semibold text-[#F5F7F3]">{currentUser.workingHours}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-[#101312]">
                  <span className="text-[#929B95]">Clientes atribuídos</span>
                  <span className="font-mono-tabular font-bold text-[#B7F34A]">
                    {assignedClients.length} ativos
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-[#101312]">
                  <span className="text-[#929B95]">Experiência</span>
                  <span className="font-mono-tabular font-semibold text-[#F5F7F3]">
                    {currentUser.experienceYears} anos
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => loginQuickDemo('cliente')}
                  className="min-h-[42px] px-4 rounded-xl bg-[#1C2421] border border-[#245C43]/50 text-xs font-semibold"
                >
                  Alternar para Cliente
                </button>
                <button
                  onClick={() => loginQuickDemo('admin')}
                  className="min-h-[42px] px-4 rounded-xl bg-[#1C2421] border border-[#245C43]/50 text-xs font-semibold"
                >
                  Alternar para Administrador
                </button>
                <button
                  onClick={logout}
                  className="min-h-[42px] px-4 rounded-xl bg-red-950/60 border border-red-500/40 text-xs font-semibold text-red-200"
                >
                  Terminar sessão
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101312]/95 backdrop-blur-md border-t border-[#1C2421] grid grid-cols-5 h-16 pb-safe">
        {[
          { id: 'inicio', label: 'Início', icon: Home },
          { id: 'clientes', label: 'Clientes', icon: Users },
          { id: 'treinos', label: 'Treinos', icon: Dumbbell },
          { id: 'agenda', label: 'Agenda', icon: Calendar },
          { id: 'perfil', label: 'Perfil', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id as TrainerPage)}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                active ? 'text-[#B7F34A]' : 'text-[#929B95]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#1C2421] border border-[#245C43]/50 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#F5F7F3]">Reagendar marcação</h2>
            <div className="space-y-3">
              <input
                type="date"
                value={resDate}
                onChange={(e) => setResDate(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
              <input
                type="time"
                value={resTime}
                onChange={(e) => setResTime(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="min-h-[40px] px-4 text-xs text-[#929B95]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateSessionStatus(rescheduleTarget.id, 'Confirmada', resDate, resTime);
                  setRescheduleTarget(null);
                }}
                className="min-h-[40px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} role="trainer" />
    </div>
  );
};
