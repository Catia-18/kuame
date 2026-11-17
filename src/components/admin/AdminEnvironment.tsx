import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Shield,
  Tag,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { KimaKuamiLogo, MediaImage } from '../KimaKuamiLogo';
import { NotificationsDrawer } from '../NotificationsDrawer';
import { BarComparisonChart, DonutDistributionChart, LineTrendChart } from '../Charts';
import { BRAND_IMAGES, formatKz } from '../../data/mockData';
import { GymPlan, PaymentStatus, UserAccount } from '../../types';
import {
  AdminCommunityModerationPanel,
  AdminReportsPanel,
  AdminSessionsPanel,
  AdminSettingsPanel,
  AdminTrainersPanel,
} from './AdminOperationsPanels';

type AdminPage =
  | 'dashboard'
  | 'clientes'
  | 'planos'
  | 'pagamentos'
  | 'trainers'
  | 'sessoes'
  | 'comunidade'
  | 'relatorios'
  | 'configuracoes';

export const AdminEnvironment: React.FC = () => {
  const {
    state,
    currentUser,
    logout,
    loginQuickDemo,
    upsertClient,
    toggleUserStatus,
    assignClientTrainer,
    upsertPlan,
    togglePlanActive,
    markPaymentPaidByAdmin,
  } = useAppState();

  const [page, setPage] = useState<AdminPage>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Clients filters & add/edit modal
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilterStatus, setClientFilterStatus] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');
  const [clientModal, setClientModal] = useState<UserAccount | null>(null);

  // Plan modal
  const [planModal, setPlanModal] = useState<GymPlan | null>(null);

  // Payment filters
  const [payFilter, setPayFilter] = useState<'Todos' | PaymentStatus>('Todos');

  if (!currentUser) return null;

  const clients = state.users.filter((u) => u.role === 'cliente');
  const activeClients = clients.filter((u) => u.status === 'Ativo');
  const trainers = state.users.filter((u) => u.role === 'trainer' && u.status === 'Ativo');

  const paidPayments = state.payments.filter((p) => p.status === 'Pago');
  const pendingPayments = state.payments.filter((p) => p.status === 'Pendente');
  const overduePayments = state.payments.filter((p) => p.status === 'Em atraso');

  const monthlyRevenue = paidPayments.reduce((acc, p) => acc + p.amountKz, 0);
  const accumulatedRevenue = monthlyRevenue + 640000;

  const unreadNotifs = state.notifications.filter((n) => n.role === 'admin' && !n.read).length;

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesStatus = clientFilterStatus === 'Todos' || c.status === clientFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = state.payments.filter(
    (p) => payFilter === 'Todos' || p.status === payFilter
  );

  const navItems: { id: AdminPage; label: string; icon: React.ComponentType<{ className?: string }> }[] =
    [
      { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'clientes', label: 'Clientes', icon: Users },
      { id: 'planos', label: 'Planos', icon: Tag },
      { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
      { id: 'trainers', label: 'Personal Trainers', icon: UserCheck },
      { id: 'sessoes', label: 'Sessões', icon: Calendar },
      { id: 'comunidade', label: 'Comunidade', icon: Shield },
      { id: 'relatorios', label: 'Relatórios', icon: FileSpreadsheet },
      { id: 'configuracoes', label: 'Configurações', icon: Settings },
    ];

  return (
    <div className="min-h-screen bg-[#101312] text-[#F5F7F3] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#101312] border-r border-[#1C2421] p-5 justify-between">
        <div className="space-y-6 overflow-y-auto">
          <KimaKuamiLogo variant="horizontal" size="md" showTagline />
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full min-h-[42px] px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors ${
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
              className="min-h-[36px] rounded-xl bg-[#1C2421] text-[11px] font-semibold"
            >
              Cliente
            </button>
            <button
              onClick={() => loginQuickDemo('trainer')}
              className="min-h-[36px] rounded-xl bg-[#1C2421] text-[11px] font-semibold"
            >
              Trainer
            </button>
          </div>
          <button
            onClick={logout}
            className="w-full min-h-[40px] px-3 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#929B95] hover:text-red-300 hover:bg-[#1C2421]"
          >
            <LogOut className="w-4 h-4" />
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#101312]/90 backdrop-blur-md border-b border-[#1C2421] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-[#F5F7F3]"
              aria-label="Abrir menu administrativo"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden">
              <KimaKuamiLogo variant="compact" size="sm" />
            </div>
            <span className="hidden lg:inline text-xs text-[#929B95] truncate">
              {state.settings.gymName} · Painel Executivo · 17 Nov 2026
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative min-w-[44px] min-h-[44px] rounded-xl bg-[#1C2421] border border-[#245C43]/30 flex items-center justify-center"
              aria-label="Notificações administrativas"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B7F34A] text-[#101312] text-[10px] font-bold flex items-center justify-center font-mono-tabular">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <div className="min-h-[44px] flex items-center gap-2 pl-1.5 pr-3 rounded-xl bg-[#1C2421] border border-[#245C43]/30">
              <MediaImage
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="hidden sm:inline text-xs font-semibold text-[#F5F7F3]">
                {currentUser.name}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-7xl w-full mx-auto">
          {/* 7.1 DASHBOARD ADMINISTRATIVO */}
          {page === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#B7F34A]">
                    {state.settings.gymName} · Administração
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F7F3] mt-0.5">
                    Olá, {currentUser.name}
                  </h1>
                  <p className="text-xs text-[#929B95] mt-0.5">
                    17 de Novembro de 2026 · Sede Namibe, AO
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage('pagamentos')}
                    className="min-h-[42px] px-4 rounded-xl bg-[#1C2421] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3]"
                  >
                    Ver financeiro
                  </button>
                  <button
                    onClick={() => setPage('relatorios')}
                    className="min-h-[42px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Relatórios
                  </button>
                </div>
              </div>

              {/* Main KPI Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    label: 'Total de clientes',
                    val: `${clients.length}`,
                    sub: `${activeClients.length} ativos · 1 novo este mês`,
                  },
                  {
                    label: 'Mensalidades pagas',
                    val: `${paidPayments.length}`,
                    sub: `${pendingPayments.length + overduePayments.length} pendentes/atraso`,
                  },
                  {
                    label: 'Receita mensal (Nov)',
                    val: formatKz(monthlyRevenue),
                    sub: 'Taxa de retenção: 94%',
                  },
                  {
                    label: 'Personal trainers ativos',
                    val: `${trainers.length}`,
                    sub: `${state.sessions.length} sessões registadas`,
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-4 sm:p-5"
                  >
                    <p className="text-xs text-[#929B95]">{kpi.label}</p>
                    <p className="font-mono-tabular text-xl sm:text-2xl font-bold text-[#F5F7F3] mt-1.5 tabular-nums">
                      {kpi.val}
                    </p>
                    <p className="text-[11px] text-[#B7F34A] mt-1">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-3">
                  <h2 className="font-display text-base font-bold text-[#F5F7F3]">
                    Evolução das Receitas (Kz)
                  </h2>
                  <LineTrendChart
                    data={[
                      { label: 'Jun', value: 145000 },
                      { label: 'Jul', value: 165000 },
                      { label: 'Ago', value: 190000 },
                      { label: 'Set', value: 215000 },
                      { label: 'Out', value: 240000 },
                      { label: 'Nov', value: monthlyRevenue + 180000 },
                    ]}
                    formatValue={(v) => formatKz(v)}
                  />
                </div>

                <div className="lg:col-span-6 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-3">
                  <h2 className="font-display text-base font-bold text-[#F5F7F3]">
                    Comparação Mensal de Pagamentos & Crescimento
                  </h2>
                  <BarComparisonChart
                    data={[
                      { label: 'Jun', primary: 145, secondary: 25 },
                      { label: 'Jul', primary: 165, secondary: 20 },
                      { label: 'Ago', primary: 190, secondary: 15 },
                      { label: 'Set', primary: 215, secondary: 30 },
                      { label: 'Out', primary: 240, secondary: 15 },
                      { label: 'Nov', primary: Math.round(monthlyRevenue / 1000), secondary: 30 },
                    ]}
                    primaryLabel="Recebido (mil Kz)"
                    secondaryLabel="Pendente (mil Kz)"
                    formatValue={(v) => `${v}.000 Kz`}
                  />
                </div>
              </div>

              {/* Charts Row 2 + Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
                  <h2 className="font-display text-base font-bold text-[#F5F7F3]">
                    Distribuição de Planos & Taxa de Retenção
                  </h2>
                  <DonutDistributionChart
                    centerValue="94%"
                    centerLabel="Retenção"
                    segments={[
                      {
                        label: 'Básico (15.000 Kz)',
                        value: clients.filter((c) => c.planId === 'plan_basico').length || 2,
                        color: '#929B95',
                      },
                      {
                        label: 'Premium (25.000 Kz)',
                        value: clients.filter((c) => c.planId === 'plan_premium').length || 1,
                        color: '#245C43',
                      },
                      {
                        label: 'VIP / Anual',
                        value:
                          clients.filter(
                            (c) => c.planId === 'plan_vip' || c.planId === 'plan_anual'
                          ).length || 2,
                        color: '#B7F34A',
                      },
                    ]}
                  />
                </div>

                <div className="lg:col-span-6 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
                  <h2 className="font-display text-base font-bold text-[#F5F7F3]">
                    Atividade Recente
                  </h2>
                  <div className="divide-y divide-[#101312]">
                    {state.notifications
                      .filter((n) => n.role === 'admin')
                      .slice(0, 4)
                      .map((act) => (
                        <div key={act.id} className="py-2.5 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-[#F5F7F3]">{act.title}</p>
                            <p className="text-xs text-[#929B95] mt-0.5">{act.message}</p>
                          </div>
                          <span className="text-[11px] text-[#929B95] whitespace-nowrap">
                            {act.timeAgo}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7.2 GESTÃO DE CLIENTES */}
          {page === 'clientes' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                    Gestão de Clientes
                  </h1>
                  <p className="text-xs text-[#929B95] mt-0.5">
                    Cadastra, edita, atribui planos/treinadores e gere estados das contas
                  </p>
                </div>

                <button
                  onClick={() =>
                    setClientModal({
                      id: `cli_${Date.now()}`,
                      role: 'cliente',
                      name: '',
                      phone: '+244 9',
                      email: '',
                      avatar: BRAND_IMAGES.avatarCarlos,
                      authorized: true,
                      status: 'Ativo',
                      joinDate: new Date().toISOString().slice(0, 10),
                      planId: 'plan_basico',
                      trainerId: 'pt_ana',
                      goal: 'Condicionamento Geral',
                      level: 'Iniciante',
                      weeklyCompleted: 0,
                      weeklyTarget: 4,
                      streakDays: 0,
                    })
                  }
                  className="min-h-[42px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar cliente
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#929B95] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Pesquisar por nome, telefone +244 ou e-mail..."
                    className="w-full min-h-[42px] rounded-xl bg-[#1C2421] border border-[#245C43]/40 pl-10 pr-3 text-xs text-[#F5F7F3]"
                  />
                </div>
                <div className="flex items-center gap-1 p-1 bg-[#1C2421] rounded-xl border border-[#245C43]/30">
                  {(['Todos', 'Ativo', 'Inativo'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setClientFilterStatus(st)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold ${
                        clientFilterStatus === st
                          ? 'bg-[#B7F34A] text-[#101312]'
                          : 'text-[#929B95]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#101312] text-[11px] text-[#929B95]">
                        <th className="py-3.5 px-4 font-semibold">Nome</th>
                        <th className="py-3.5 px-4 font-semibold">Telefone / E-mail</th>
                        <th className="py-3.5 px-4 font-semibold">Plano</th>
                        <th className="py-3.5 px-4 font-semibold">Personal Trainer</th>
                        <th className="py-3.5 px-4 font-semibold">Estado</th>
                        <th className="py-3.5 px-4 font-semibold">Inscrição</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#101312] text-xs">
                      {filteredClients.map((c) => {
                        const plan = state.plans.find((p) => p.id === c.planId);
                        return (
                          <tr key={c.id} className="hover:bg-[#101312]/30">
                            <td className="py-3.5 px-4 font-bold text-[#F5F7F3] whitespace-nowrap">
                              {c.name}
                            </td>
                            <td className="py-3.5 px-4 text-[#929B95]">
                              <div className="font-mono-tabular">{c.phone}</div>
                              <div className="text-[11px]">{c.email}</div>
                            </td>
                            <td className="py-3.5 px-4 text-[#F5F7F3]">
                              <select
                                value={c.planId || 'plan_basico'}
                                onChange={(e) =>
                                  assignClientTrainer(c.id, c.trainerId || 'pt_ana', e.target.value)
                                }
                                className="rounded-lg bg-[#101312] border border-[#245C43]/40 px-2 py-1 text-xs text-[#F5F7F3]"
                              >
                                {state.plans.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({formatKz(p.priceKz)})
                                  </option>
                                ))}
                              </select>
                              <div className="text-[10px] text-[#929B95] mt-0.5">
                                {plan?.durationLabel}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={c.trainerId || 'pt_ana'}
                                onChange={(e) => assignClientTrainer(c.id, e.target.value)}
                                className="rounded-lg bg-[#101312] border border-[#245C43]/40 px-2 py-1 text-xs text-[#F5F7F3]"
                              >
                                {trainers.map((pt) => (
                                  <option key={pt.id} value={pt.id}>
                                    {pt.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`font-bold ${
                                  c.status === 'Ativo' ? 'text-[#B7F34A]' : 'text-red-400'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono-tabular text-[#929B95]">
                              {c.joinDate}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => setClientModal(c)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#101312] border border-[#245C43]/40 text-[#F5F7F3]"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => toggleUserStatus(c.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#245C43] text-[#F5F7F3]"
                              >
                                {c.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7.3 GESTÃO DE PLANOS */}
          {page === 'planos' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                    Gestão de Planos (Kz)
                  </h1>
                  <p className="text-xs text-[#929B95] mt-0.5">
                    Cria, edita preços em Kwanza e ativa ou desativa planos do ginásio
                  </p>
                </div>

                <button
                  onClick={() =>
                    setPlanModal({
                      id: `plan_${Date.now()}`,
                      name: '',
                      priceKz: 20000,
                      durationLabel: 'Mensal',
                      durationMonths: 1,
                      description: '',
                      benefits: ['Acesso total à sala de musculação'],
                      active: true,
                    })
                  }
                  className="min-h-[42px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Novo plano
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.plans.map((pl) => (
                  <div
                    key={pl.id}
                    className={`rounded-3xl bg-[#1C2421] border p-5 flex flex-col justify-between gap-4 ${
                      pl.active ? 'border-[#245C43]/50' : 'border-red-500/30 opacity-75'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#929B95]">{pl.durationLabel}</span>
                        <span
                          className={`font-bold ${
                            pl.active ? 'text-[#B7F34A]' : 'text-red-400'
                          }`}
                        >
                          {pl.active ? 'Ativo' : 'Desativado'}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-bold text-[#F5F7F3]">{pl.name}</h2>
                      <p className="font-mono-tabular text-2xl font-bold text-[#B7F34A] tabular-nums">
                        {formatKz(pl.priceKz)}
                      </p>
                      <p className="text-xs text-[#929B95] leading-relaxed">{pl.description}</p>
                      <ul className="space-y-1 pt-2 border-t border-[#101312] text-xs text-[#F5F7F3]/90">
                        {pl.benefits.map((b) => (
                          <li key={b}>• {b}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#101312]">
                      <button
                        onClick={() => setPlanModal(pl)}
                        className="flex-1 min-h-[40px] rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => togglePlanActive(pl.id)}
                        className="flex-1 min-h-[40px] rounded-xl bg-[#245C43] text-xs font-semibold text-[#F5F7F3]"
                      >
                        {pl.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7.4 GESTÃO DE PAGAMENTOS */}
          {page === 'pagamentos' && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
                  Gestão Financeira & Pagamentos
                </h1>
                <p className="text-xs text-[#929B95] mt-0.5">
                  Controlo de mensalidades recebidas, pendentes e em atraso (Kz)
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Receita mensal', val: formatKz(monthlyRevenue) },
                  { label: 'Receita acumulada', val: formatKz(accumulatedRevenue) },
                  { label: 'Pagamentos pendentes', val: `${pendingPayments.length}` },
                  { label: 'Clientes em atraso', val: `${overduePayments.length}` },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl bg-[#1C2421] border border-[#245C43]/40 p-4"
                  >
                    <p className="text-xs text-[#929B95]">{m.label}</p>
                    <p className="font-mono-tabular text-xl font-bold text-[#F5F7F3] mt-1 tabular-nums">
                      {m.val}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#1C2421] rounded-xl border border-[#245C43]/30 w-fit">
                {(['Todos', 'Pago', 'Pendente', 'Em atraso'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPayFilter(st)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold ${
                      payFilter === st ? 'bg-[#B7F34A] text-[#101312]' : 'text-[#929B95]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#101312] text-[11px] text-[#929B95]">
                        <th className="py-3.5 px-4 font-semibold">Cliente</th>
                        <th className="py-3.5 px-4 font-semibold">Plano</th>
                        <th className="py-3.5 px-4 font-semibold">Valor</th>
                        <th className="py-3.5 px-4 font-semibold">Data</th>
                        <th className="py-3.5 px-4 font-semibold">Método</th>
                        <th className="py-3.5 px-4 font-semibold">Referência</th>
                        <th className="py-3.5 px-4 font-semibold">Estado</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#101312] text-xs">
                      {filteredPayments.map((pay) => {
                        const cli = state.users.find((u) => u.id === pay.clientId);
                        const pl = state.plans.find((p) => p.id === pay.planId);
                        return (
                          <tr key={pay.id} className="hover:bg-[#101312]/30">
                            <td className="py-3.5 px-4 font-bold text-[#F5F7F3]">{cli?.name}</td>
                            <td className="py-3.5 px-4 text-[#929B95]">{pl?.name}</td>
                            <td className="py-3.5 px-4 font-mono-tabular font-bold text-[#F5F7F3]">
                              {formatKz(pay.amountKz)}
                            </td>
                            <td className="py-3.5 px-4 font-mono-tabular text-[#929B95]">
                              {pay.paidDate || pay.dueDate}
                            </td>
                            <td className="py-3.5 px-4 text-[#929B95]">{pay.method}</td>
                            <td className="py-3.5 px-4 font-mono-tabular text-[#929B95]">
                              {pay.reference}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`font-bold ${
                                  pay.status === 'Pago'
                                    ? 'text-[#B7F34A]'
                                    : pay.status === 'Pendente'
                                    ? 'text-amber-300'
                                    : 'text-red-400'
                                }`}
                              >
                                {pay.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {pay.status !== 'Pago' && (
                                <button
                                  onClick={() => markPaymentPaidByAdmin(pay.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#B7F34A] text-[#101312] font-bold whitespace-nowrap"
                                >
                                  Confirmar recebimento
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {page === 'trainers' && <AdminTrainersPanel />}
          {page === 'sessoes' && <AdminSessionsPanel />}
          {page === 'comunidade' && <AdminCommunityModerationPanel />}
          {page === 'relatorios' && <AdminReportsPanel />}
          {page === 'configuracoes' && <AdminSettingsPanel />}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-sm lg:hidden">
          <div className="w-72 bg-[#101312] border-r border-[#1C2421] h-full p-5 flex flex-col justify-between">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between">
                <KimaKuamiLogo variant="compact" size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#929B95]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold ${
                        active ? 'bg-[#B7F34A] text-[#101312]' : 'text-[#929B95]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <button
              onClick={logout}
              className="w-full min-h-[44px] px-3 rounded-xl bg-[#1C2421] text-xs font-semibold text-red-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Terminar sessão
            </button>
          </div>
        </div>
      )}

      {/* Client Add/Edit Modal */}
      {clientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!clientModal.name.trim()) return;
              upsertClient(clientModal);
              setClientModal(null);
            }}
            className="w-full max-w-md rounded-3xl bg-[#1C2421] border border-[#245C43]/60 p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-[#F5F7F3]">Ficha do Cliente</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome completo"
                value={clientModal.name}
                onChange={(e) => setClientModal({ ...clientModal, name: e.target.value })}
                className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
              <input
                type="text"
                placeholder="+244 923 000 000"
                value={clientModal.phone}
                onChange={(e) => setClientModal({ ...clientModal, phone: e.target.value })}
                className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
              <input
                type="email"
                placeholder="email@exemplo.ao"
                value={clientModal.email}
                onChange={(e) => setClientModal({ ...clientModal, email: e.target.value })}
                className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
              <input
                type="text"
                placeholder="Objetivo"
                value={clientModal.goal || ''}
                onChange={(e) => setClientModal({ ...clientModal, goal: e.target.value })}
                className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClientModal(null)}
                className="min-h-[40px] px-4 text-xs text-[#929B95]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-5 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
              >
                Guardar cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plan Add/Edit Modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!planModal.name.trim()) return;
              upsertPlan(planModal);
              setPlanModal(null);
            }}
            className="w-full max-w-md rounded-3xl bg-[#1C2421] border border-[#245C43]/60 p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-[#F5F7F3]">Configurar Plano (Kz)</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do plano (ex: Executivo)"
                value={planModal.name}
                onChange={(e) => setPlanModal({ ...planModal, name: e.target.value })}
                className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
              <input
                type="number"
                placeholder="Preço em Kz"
                value={planModal.priceKz}
                onChange={(e) => setPlanModal({ ...planModal, priceKz: Number(e.target.value) })}
                className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm font-mono-tabular text-[#F5F7F3]"
              />
              <input
                type="text"
                placeholder="Duração (ex: Mensal, Trimestral)"
                value={planModal.durationLabel}
                onChange={(e) => setPlanModal({ ...planModal, durationLabel: e.target.value })}
                className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
              <textarea
                rows={2}
                placeholder="Descrição do plano"
                value={planModal.description}
                onChange={(e) => setPlanModal({ ...planModal, description: e.target.value })}
                className="w-full rounded-xl bg-[#101312] border border-[#245C43]/50 p-3 text-xs text-[#F5F7F3]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPlanModal(null)}
                className="min-h-[40px] px-4 text-xs text-[#929B95]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-5 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
              >
                Guardar plano
              </button>
            </div>
          </form>
        </div>
      )}

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} role="admin" />
    </div>
  );
};
