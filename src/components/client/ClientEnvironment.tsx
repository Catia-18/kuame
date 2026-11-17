import React, { useState } from 'react';
import {
  Bell,
  Bot,
  Calendar,
  ChevronRight,
  CreditCard,
  Dumbbell,
  Flame,
  Home,
  LogOut,
  RotateCcw,
  User,
  Users,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { KimaKuamiLogo, MediaImage } from '../KimaKuamiLogo';
import { ProgressRing } from '../Charts';
import { NotificationsDrawer } from '../NotificationsDrawer';
import { ClientWorkoutsModule } from './ClientWorkoutsModule';
import { ClientSessionsModule } from './ClientSessionsModule';
import { ClientPaymentsModule } from './ClientPaymentsModule';
import { CommunityView } from '../CommunityView';
import { KimaKuamiAI } from '../KimaKuamiAI';
import { formatKz } from '../../data/mockData';

type ClientPage =
  | 'inicio'
  | 'treinos'
  | 'sessoes'
  | 'pagamentos'
  | 'comunidade'
  | 'ia'
  | 'perfil';

export const ClientEnvironment: React.FC = () => {
  const { state, currentUser, logout, resetDemoData, loginQuickDemo } = useAppState();
  const [page, setPage] = useState<ClientPage>('inicio');
  const [communityTab, setCommunityTab] = useState<'comunidade' | 'ia'>('comunidade');
  const [notifOpen, setNotifOpen] = useState(false);

  if (!currentUser) return null;

  const firstName = currentUser.name.split(' ')[0];
  const weeklyCompleted = currentUser.weeklyCompleted ?? 3;
  const weeklyTarget = currentUser.weeklyTarget ?? 5;
  const weeklyPercent = Math.min(100, Math.round((weeklyCompleted / weeklyTarget) * 100));

  const currentPlan =
    state.plans.find((p) => p.id === currentUser.planId) || state.plans[1];

  const nextSession = state.sessions.find(
    (s) =>
      s.clientId === currentUser.id &&
      (s.status === 'Confirmada' || s.status === 'Pendente')
  );
  const nextTrainer = state.users.find((u) => u.id === nextSession?.trainerId);

  const myPayments = state.payments.filter((p) => p.clientId === currentUser.id);
  const latestPayment = myPayments[0];
  const membershipStatus = latestPayment?.status || 'Pago';

  const unreadNotifs = state.notifications.filter(
    (n) => n.role === 'cliente' && (!n.userId || n.userId === currentUser.id) && !n.read
  ).length;

  const openCommunityOrAI = (target: 'comunidade' | 'ia') => {
    setCommunityTab(target);
    setPage('comunidade');
  };

  return (
    <div className="min-h-screen bg-[#101312] text-[#F5F7F3] flex flex-col lg:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#101312] border-r border-[#1C2421] p-5 justify-between">
        <div className="space-y-8">
          <KimaKuamiLogo variant="horizontal" size="md" showTagline />

          <nav className="space-y-1.5">
            {[
              { id: 'inicio', label: 'Início', icon: Home },
              { id: 'treinos', label: 'Treinos', icon: Dumbbell },
              { id: 'sessoes', label: 'Sessões', icon: Calendar },
              { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
              { id: 'comunidade', label: 'Comunidade + IA', icon: Users },
              { id: 'perfil', label: 'Perfil', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id as ClientPage)}
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
              onClick={() => loginQuickDemo('trainer')}
              className="min-h-[36px] rounded-xl bg-[#1C2421] text-[11px] font-semibold text-[#F5F7F3] hover:border hover:border-[#B7F34A]/50"
            >
              Personal Trainer
            </button>
            <button
              onClick={() => loginQuickDemo('admin')}
              className="min-h-[36px] rounded-xl bg-[#1C2421] text-[11px] font-semibold text-[#F5F7F3] hover:border hover:border-[#B7F34A]/50"
            >
              Administrador
            </button>
          </div>
          <button
            onClick={logout}
            className="w-full min-h-[42px] px-3 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#929B95] hover:text-red-300 hover:bg-[#1C2421] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-24 lg:pb-10">
        {/* Compact Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#101312]/90 backdrop-blur-md border-b border-[#1C2421] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden">
              <KimaKuamiLogo variant="compact" size="sm" />
            </div>
            <span className="hidden lg:inline text-xs text-[#929B95] whitespace-nowrap">
              {state.settings.gymName} · Mensalidade {membershipStatus} ({currentPlan.name})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative min-w-[44px] min-h-[44px] rounded-xl bg-[#1C2421] border border-[#245C43]/30 flex items-center justify-center text-[#F5F7F3] hover:border-[#B7F34A]/60"
              aria-label="Abrir notificações"
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
              className="min-h-[44px] flex items-center gap-2 pl-1.5 pr-2.5 rounded-xl bg-[#1C2421] border border-[#245C43]/30 hover:border-[#B7F34A]/60"
            >
              <MediaImage
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="hidden sm:inline text-xs font-semibold text-[#F5F7F3] whitespace-nowrap">
                {firstName}
              </span>
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-6xl w-full mx-auto">
          {/* 5.1 DASHBOARD PRINCIPAL */}
          {page === 'inicio' && (
            <div className="space-y-6">
              {/* Top Personal Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F7F3] text-balance">
                    Olá, {firstName}! Vamos treinar hoje?
                  </h1>
                  <p className="text-xs text-[#929B95] mt-1">
                    Estado da mensalidade:{' '}
                    <span className="text-[#B7F34A] font-semibold">
                      {membershipStatus} · Plano {currentPlan.name}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#929B95]">
                  <Flame className="w-4 h-4 text-[#B7F34A]" />
                  <span className="font-mono-tabular font-semibold text-[#F5F7F3]">
                    {currentUser.streakDays || 14} dias consecutivos
                  </span>
                </div>
              </div>

              {/* Hero Highlight Card: Objetivo & Progresso Semanal */}
              <div className="rounded-3xl bg-gradient-to-br from-[#1C2421] via-[#1C2421] to-[#245C43]/35 border border-[#245C43]/50 p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <p className="text-xs font-semibold text-[#B7F34A]">
                    Objetivo atual · {currentUser.goal}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F7F3]">
                    Esta semana: {weeklyCompleted} de {weeklyTarget} treinos concluídos
                  </h2>
                  <p className="text-xs text-[#929B95] leading-relaxed max-w-xl">
                    Mantém o ritmo para atingires a tua meta semanal na Kima Kuami. A tua próxima sessão técnica está preparada.
                  </p>

                  <div className="pt-2 max-w-md space-y-1.5">
                    <div className="h-2.5 rounded-full bg-[#101312] overflow-hidden">
                      <div
                        className="h-full bg-[#B7F34A] rounded-full transition-all duration-300"
                        style={{ width: `${weeklyPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono-tabular text-[#929B95]">
                      <span>Dias treinados: {weeklyCompleted}</span>
                      <span>Meta: {weeklyTarget} treinos</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-5">
                  <ProgressRing percent={weeklyPercent} size={84} strokeWidth={7} />
                  <button
                    onClick={() => setPage('treinos')}
                    className="min-h-[48px] px-5 rounded-2xl bg-[#B7F34A] text-[#101312] font-bold text-xs sm:text-sm whitespace-nowrap hover:brightness-105 transition-all"
                  >
                    Treinar agora
                  </button>
                </div>
              </div>

              {/* 4 Main Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setPage('treinos')}
                  className="text-left rounded-3xl bg-[#1C2421] border border-[#245C43]/40 hover:border-[#B7F34A] p-5 flex flex-col justify-between gap-5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#101312] flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-[#B7F34A]" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#929B95] group-hover:text-[#B7F34A]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#F5F7F3]">1. TREINOS</h3>
                    <p className="text-xs text-[#929B95] mt-1 leading-relaxed">
                      Planos, exercícios por músculo, séries e evolução física.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPage('sessoes')}
                  className="text-left rounded-3xl bg-[#1C2421] border border-[#245C43]/40 hover:border-[#B7F34A] p-5 flex flex-col justify-between gap-5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#101312] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#B7F34A]" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#929B95] group-hover:text-[#B7F34A]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#F5F7F3]">2. SESSÕES</h3>
                    <p className="text-xs text-[#929B95] mt-1 leading-relaxed">
                      Calendário e agendamento com personal trainers.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPage('pagamentos')}
                  className="text-left rounded-3xl bg-[#1C2421] border border-[#245C43]/40 hover:border-[#B7F34A] p-5 flex flex-col justify-between gap-5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#101312] flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#B7F34A]" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#929B95] group-hover:text-[#B7F34A]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#F5F7F3]">3. PAGAMENTOS</h3>
                    <p className="text-xs text-[#929B95] mt-1 leading-relaxed">
                      Mensalidade ({formatKz(currentPlan.priceKz)}) e recibos.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => openCommunityOrAI('ia')}
                  className="text-left rounded-3xl bg-[#1C2421] border border-[#245C43]/40 hover:border-[#B7F34A] p-5 flex flex-col justify-between gap-5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#101312] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#B7F34A]" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#929B95] group-hover:text-[#B7F34A]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#F5F7F3]">
                      4. COMUNIDADE + IA
                    </h3>
                    <p className="text-xs text-[#929B95] mt-1 leading-relaxed">
                      Comunidade de membros e assistente Kima Kuami AI.
                    </p>
                  </div>
                </button>
              </div>

              {/* Secção: Próxima sessão */}
              <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-[#F5F7F3]">Próxima sessão</h2>
                  <button
                    onClick={() => setPage('sessoes')}
                    className="text-xs font-semibold text-[#B7F34A] hover:underline"
                  >
                    Gerir sessões
                  </button>
                </div>

                {nextSession ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#101312] p-4">
                    <div className="flex items-center gap-3.5">
                      <MediaImage
                        src={nextTrainer?.avatar || ''}
                        alt={nextTrainer?.name || 'Personal Trainer'}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#B7F34A]">
                          {nextSession.status} · {nextSession.date} às {nextSession.time}
                        </p>
                        <p className="text-sm font-bold text-[#F5F7F3] mt-0.5">
                          {nextSession.type}
                        </p>
                        <p className="text-xs text-[#929B95]">
                          Personal Trainer: {nextTrainer?.name} · {nextSession.location}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setPage('sessoes')}
                      className="min-h-[42px] px-4 rounded-xl bg-[#245C43] text-[#F5F7F3] text-xs font-semibold whitespace-nowrap shrink-0 hover:bg-[#245C43]/80"
                    >
                      Ver calendário
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#101312] p-4 flex items-center justify-between">
                    <p className="text-xs text-[#929B95]">Nenhuma sessão futura agendada.</p>
                    <button
                      onClick={() => setPage('sessoes')}
                      className="min-h-[38px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
                    >
                      Marcar sessão
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {page === 'treinos' && <ClientWorkoutsModule />}
          {page === 'sessoes' && <ClientSessionsModule />}
          {page === 'pagamentos' && <ClientPaymentsModule />}

          {page === 'comunidade' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                    Comunidade + Kima Kuami AI
                  </h1>
                  <p className="text-xs text-[#929B95] mt-0.5">
                    Partilha conquistas com o clube e conversa com o teu assistente inteligente
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#1C2421] rounded-2xl border border-[#245C43]/30 w-fit">
                  <button
                    onClick={() => setCommunityTab('comunidade')}
                    className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold transition-colors ${
                      communityTab === 'comunidade'
                        ? 'bg-[#B7F34A] text-[#101312]'
                        : 'text-[#929B95] hover:text-[#F5F7F3]'
                    }`}
                  >
                    Comunidade
                  </button>
                  <button
                    onClick={() => setCommunityTab('ia')}
                    className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                      communityTab === 'ia'
                        ? 'bg-[#B7F34A] text-[#101312]'
                        : 'text-[#929B95] hover:text-[#F5F7F3]'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Kima Kuami AI
                  </button>
                </div>
              </div>

              {communityTab === 'comunidade' ? <CommunityView /> : <KimaKuamiAI />}
            </div>
          )}

          {page === 'perfil' && (
            <div className="max-w-2xl space-y-5">
              <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">Meu Perfil</h1>

              <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-6 flex items-center gap-4">
                <MediaImage
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold text-[#F5F7F3]">
                    {currentUser.name}
                  </h2>
                  <p className="text-xs text-[#929B95] mt-0.5">
                    {currentUser.email} · {currentUser.phone}
                  </p>
                  <p className="text-xs text-[#B7F34A] mt-1 font-semibold">
                    Plano {currentPlan.name} · Membro desde {currentUser.joinDate}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#101312]">
                  <span className="text-[#929B95]">Objetivo principal</span>
                  <span className="font-semibold text-[#F5F7F3]">{currentUser.goal}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#101312]">
                  <span className="text-[#929B95]">Nível atual</span>
                  <span className="font-semibold text-[#F5F7F3]">{currentUser.level}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#929B95]">Unidade Kima Kuami</span>
                  <span className="font-semibold text-[#F5F7F3]">Namibe AO</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setPage('pagamentos')}
                  className="min-h-[46px] rounded-2xl bg-[#1C2421] border border-[#245C43]/40 text-xs font-semibold text-[#F5F7F3] hover:border-[#B7F34A]"
                >
                  Consultar Pagamentos & Recibos
                </button>
                <button
                  onClick={() => openCommunityOrAI('ia')}
                  className="min-h-[46px] rounded-2xl bg-[#1C2421] border border-[#245C43]/40 text-xs font-semibold text-[#F5F7F3] hover:border-[#B7F34A]"
                >
                  Abrir Kima Kuami AI
                </button>
              </div>

              {/* Switch Demo Role / Reset */}
              <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-3">
                <p className="text-xs font-semibold text-[#F5F7F3]">
                  Controlo da Demonstração
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loginQuickDemo('trainer')}
                    className="min-h-[40px] px-4 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3]"
                  >
                    Mudar para Personal Trainer
                  </button>
                  <button
                    onClick={() => loginQuickDemo('admin')}
                    className="min-h-[40px] px-4 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3]"
                  >
                    Mudar para Administrador
                  </button>
                  <button
                    onClick={resetDemoData}
                    className="min-h-[40px] px-4 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#929B95] inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Repor dados demo
                  </button>
                  <button
                    onClick={logout}
                    className="min-h-[40px] px-4 rounded-xl bg-red-950/60 border border-red-500/40 text-xs font-semibold text-red-200 inline-flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (5 exact destinations from spec) */}
      <nav
        aria-label="Navegação principal"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101312]/95 backdrop-blur-md border-t border-[#1C2421] grid grid-cols-5 h-16 pb-safe"
      >
        {[
          { id: 'inicio', label: 'Início', icon: Home },
          { id: 'treinos', label: 'Treinos', icon: Dumbbell },
          { id: 'sessoes', label: 'Sessões', icon: Calendar },
          { id: 'comunidade', label: 'Comunidade', icon: Users },
          { id: 'perfil', label: 'Perfil', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id as ClientPage)}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                active ? 'text-[#B7F34A]' : 'text-[#929B95]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <NotificationsDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        role="cliente"
      />
    </div>
  );
};
