import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { KimaKuamiLogo, MediaImage } from '../KimaKuamiLogo';
import { BRAND_IMAGES, formatKz } from '../../data/mockData';
import { UserAccount } from '../../types';

export const AdminTrainersPanel: React.FC = () => {
  const { state, upsertTrainer } = useAppState();
  const trainers = state.users.filter((u) => u.role === 'trainer');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+244 9');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('Hipertrofia');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const newPt: UserAccount = {
      id: `pt_${Date.now()}`,
      role: 'trainer',
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      avatar: BRAND_IMAGES.ptCoaching,
      authorized: true,
      status: 'Ativo',
      joinDate: new Date().toISOString().slice(0, 10),
      specialties: [specialty],
      workingHours: 'Seg a Sáb · 07:00 – 19:00',
      availabilitySlots: ['07:00', '09:00', '16:30', '18:00'],
      rating: 4.9,
      experienceYears: 4,
    };
    upsertTrainer(newPt);
    setName('');
    setEmail('');
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
            Gestão de Personal Trainers
          </h1>
          <p className="text-xs text-[#929B95] mt-0.5">
            Equipa técnica autorizada, disponibilidade e carga de clientes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="min-h-[42px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Cadastrar personal trainer
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-3xl bg-[#1C2421] border border-[#B7F34A]/50 p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
        >
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-xs text-[#F5F7F3]"
          />
          <input
            type="text"
            placeholder="+244 923 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-xs text-[#F5F7F3]"
          />
          <input
            type="email"
            placeholder="email@kimakuami.ao"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-xs text-[#F5F7F3]"
          />
          <input
            type="text"
            placeholder="Especialidade"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-xs text-[#F5F7F3]"
          />
          <button
            type="submit"
            className="min-h-[42px] rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
          >
            Guardar profissional
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainers.map((pt) => {
          const clientsCount = state.users.filter(
            (u) => u.role === 'cliente' && u.trainerId === pt.id
          ).length;
          const sessionsCount = state.sessions.filter((s) => s.trainerId === pt.id).length;
          return (
            <div
              key={pt.id}
              className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4"
            >
              <div className="flex items-start gap-4">
                <MediaImage
                  src={pt.avatar}
                  alt={pt.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-bold text-[#F5F7F3] truncate">
                      {pt.name}
                    </h2>
                    <span className="text-xs font-bold text-[#B7F34A]">{pt.status}</span>
                  </div>
                  <p className="text-xs text-[#929B95] mt-0.5">{pt.specialties?.join(' · ')}</p>
                  <p className="text-[11px] text-[#929B95] mt-1">
                    {pt.phone} · {pt.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#101312] p-3 text-center">
                <div>
                  <p className="text-[11px] text-[#929B95]">Clientes</p>
                  <p className="font-mono-tabular text-sm font-bold text-[#F5F7F3]">
                    {clientsCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#929B95]">Sessões</p>
                  <p className="font-mono-tabular text-sm font-bold text-[#F5F7F3]">
                    {sessionsCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#929B95]">Horário</p>
                  <p className="text-[11px] font-semibold text-[#B7F34A] truncate px-1">
                    {pt.availabilitySlots?.length || 0} blocos
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AdminSessionsPanel: React.FC = () => {
  const { state, updateSessionStatus } = useAppState();

  // Detect same trainer + same date + same time active sessions
  const slotCounts: Record<string, number> = {};
  state.sessions.forEach((s) => {
    if (s.status !== 'Cancelada') {
      const key = `${s.trainerId}_${s.date}_${s.time}`;
      slotCounts[key] = (slotCounts[key] || 0) + 1;
    }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
          Gestão Geral de Sessões
        </h1>
        <p className="text-xs text-[#929B95] mt-0.5">
          Calendário central do ginásio com deteção automática de conflitos de horário
        </p>
      </div>

      <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#101312] text-[11px] text-[#929B95]">
                <th className="py-3.5 px-4 font-semibold">Cliente</th>
                <th className="py-3.5 px-4 font-semibold">Personal Trainer</th>
                <th className="py-3.5 px-4 font-semibold">Data & Hora</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101312] text-xs">
              {state.sessions.map((ses) => {
                const cli = state.users.find((u) => u.id === ses.clientId);
                const pt = state.users.find((u) => u.id === ses.trainerId);
                const key = `${ses.trainerId}_${ses.date}_${ses.time}`;
                const hasConflict = ses.status !== 'Cancelada' && (slotCounts[key] || 0) > 1;
                return (
                  <tr key={ses.id} className="hover:bg-[#101312]/30">
                    <td className="py-3.5 px-4 font-semibold text-[#F5F7F3]">{cli?.name}</td>
                    <td className="py-3.5 px-4 text-[#929B95]">{pt?.name}</td>
                    <td className="py-3.5 px-4 font-mono-tabular text-[#F5F7F3]">
                      {ses.date} · {ses.time}
                      {hasConflict && (
                        <span className="ml-2 inline-flex items-center gap-1 text-amber-300 font-sans">
                          <AlertTriangle className="w-3.5 h-3.5" /> Conflito
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#B7F34A]">{ses.status}</td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {ses.status === 'Pendente' && (
                        <button
                          onClick={() => updateSessionStatus(ses.id, 'Confirmada')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#B7F34A] text-[#101312] font-bold"
                        >
                          Confirmar
                        </button>
                      )}
                      {hasConflict && (
                        <button
                          onClick={() => updateSessionStatus(ses.id, 'Pendente', ses.date, '19:30')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#245C43] text-[#F5F7F3] font-semibold"
                        >
                          Mover p/ 19:30
                        </button>
                      )}
                      {ses.status !== 'Cancelada' && (
                        <button
                          onClick={() => updateSessionStatus(ses.id, 'Cancelada')}
                          className="px-2.5 py-1.5 rounded-lg bg-[#101312] text-red-300 border border-red-500/30"
                        >
                          Cancelar
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
  );
};

export const AdminCommunityModerationPanel: React.FC = () => {
  const { state, moderatePost, createChallenge } = useAppState();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(15);

  const reportedPosts = state.posts.filter((p) => p.reported);
  const allPosts = state.posts;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
          Gestão & Moderação da Comunidade
        </h1>
        <p className="text-xs text-[#929B95] mt-0.5">
          Gere denúncias, publicações de membros e desafios oficiais do clube
        </p>
      </div>

      {/* Reported Alerts */}
      <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-300" />
          <h2 className="font-display text-base font-bold text-[#F5F7F3]">
            Denúncias por analisar ({reportedPosts.length})
          </h2>
        </div>

        {reportedPosts.length === 0 ? (
          <p className="text-xs text-[#929B95]">
            Sem denúncias pendentes. A comunidade está em conformidade.
          </p>
        ) : (
          reportedPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl bg-[#101312] border border-amber-500/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-300">
                  Denunciado: {post.reportReason}
                </p>
                <p className="text-sm font-semibold text-[#F5F7F3]">
                  {post.authorName}: "{post.content}"
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => moderatePost(post.id, 'approve')}
                  className="min-h-[38px] px-3.5 rounded-xl bg-[#245C43] text-[#F5F7F3] text-xs font-semibold inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Manter
                </button>
                <button
                  onClick={() => moderatePost(post.id, 'remove')}
                  className="min-h-[38px] px-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Challenge */}
      <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-3">
        <h2 className="font-display text-base font-bold text-[#F5F7F3]">
          Criar novo desafio semanal
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Desafio Namibe 21 Dias"
            className="flex-1 min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-xs text-[#F5F7F3]"
          />
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-28 min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-xs font-mono-tabular text-[#F5F7F3]"
          />
          <button
            onClick={() => {
              if (!title.trim()) return;
              createChallenge({
                title: title.trim(),
                description: 'Desafio oficial lançado pela administração da Kima Kuami.',
                targetCount: target,
                unitLabel: 'treinos',
                currentProgress: 0,
                participantsCount: 1,
                endsAt: '15 Dez 2026',
                joined: false,
              });
              setTitle('');
            }}
            className="min-h-[42px] px-5 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
          >
            Lançar desafio
          </button>
        </div>
      </div>

      {/* All Posts Moderation Table */}
      <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 divide-y divide-[#101312]">
        {allPosts.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-[#F5F7F3]">
                {p.authorName} · {p.category}
              </p>
              <p className="text-[#929B95] truncate mt-0.5">{p.content}</p>
            </div>
            <button
              onClick={() => moderatePost(p.id, 'remove')}
              className="min-h-[36px] px-3 rounded-xl bg-[#101312] text-red-300 border border-red-500/30 shrink-0"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminReportsPanel: React.FC = () => {
  const { state, showToast } = useAppState();
  const [period, setPeriod] = useState('Novembro 2026');

  const paidTotal = state.payments
    .filter((p) => p.status === 'Pago')
    .reduce((acc, p) => acc + p.amountKz, 0);

  const exportCsvDemo = (reportName: string) => {
    const csv = `Relatorio,Periodo,Total_Clientes,Receita_Kz\n${reportName},${period},${state.users.filter((u) => u.role === 'cliente').length},${paidTotal}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kima_kuami_${reportName.toLowerCase().replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exportação Excel/CSV de "${reportName}" gerada.`, 'success');
  };

  const reports = [
    { title: 'Relatório de Receitas & Mensalidades', metric: formatKz(paidTotal) },
    {
      title: 'Relatório de Clientes & Novos Membros',
      metric: `${state.users.filter((u) => u.role === 'cliente').length} registados`,
    },
    {
      title: 'Relatório de Sessões & Ocupação',
      metric: `${state.sessions.length} sessões`,
    },
    {
      title: 'Desempenho dos Personal Trainers',
      metric: `${state.users.filter((u) => u.role === 'trainer').length} profissionais`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">Relatórios Executivos</h1>
          <p className="text-xs text-[#929B95] mt-0.5">
            Análise operacional com exportação demonstrativa em PDF e Excel/CSV
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="min-h-[42px] rounded-xl bg-[#1C2421] border border-[#245C43]/50 px-3.5 text-xs text-[#F5F7F3]"
        >
          <option value="Novembro 2026">Novembro 2026</option>
          <option value="Outubro 2026">Outubro 2026</option>
          <option value="4º Trimestre 2026">4º Trimestre 2026</option>
          <option value="Ano 2026">Ano 2026</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => (
          <div
            key={rep.title}
            className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <p className="text-xs text-[#929B95]">{period}</p>
              <h2 className="font-display text-lg font-bold text-[#F5F7F3] mt-1">{rep.title}</h2>
              <p className="font-mono-tabular text-xl font-bold text-[#B7F34A] mt-2">
                {rep.metric}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-[#101312]">
              <button
                onClick={() =>
                  showToast(`Pré-visualização PDF demonstrativa gerada para "${rep.title}".`, 'info')
                }
                className="min-h-[40px] px-3.5 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3] inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#B7F34A]" />
                Exportar PDF (Demo)
              </button>
              <button
                onClick={() => exportCsvDemo(rep.title)}
                className="min-h-[40px] px-3.5 rounded-xl bg-[#245C43] text-[#F5F7F3] text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <Download className="w-3 h-3" />
                Excel / CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminSettingsPanel: React.FC = () => {
  const { state, updateSettings, resetDemoData } = useAppState();
  const [form, setForm] = useState(state.settings);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">
          Configurações & Identidade Visual
        </h1>
        <p className="text-xs text-[#929B95] mt-0.5">
          Dados do ginásio, permissões e demonstração oficial do logótipo Kima Kuami
        </p>
      </div>

      {/* Brand Showcase */}
      <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
        <h2 className="font-display text-base font-bold text-[#F5F7F3]">
          Sistema de Logótipo KIMA KUAMI (Fundos Escuros e Claros)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#101312] border border-[#245C43]/40 p-5 flex flex-col items-center justify-center gap-3">
            <KimaKuamiLogo variant="horizontal" theme="dark" size="md" showTagline />
            <span className="text-[11px] text-[#929B95]">Versão Horizontal · Fundo Escuro</span>
          </div>
          <div className="rounded-2xl bg-[#F5F7F3] p-5 flex flex-col items-center justify-center gap-3">
            <KimaKuamiLogo variant="horizontal" theme="light" size="md" showTagline />
            <span className="text-[11px] text-[#245C43] font-semibold">
              Versão Horizontal · Fundo Claro
            </span>
          </div>
          <div className="rounded-2xl bg-[#101312] border border-[#245C43]/40 p-5 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-4">
              <KimaKuamiLogo variant="icon" theme="dark" size="lg" />
              <KimaKuamiLogo variant="compact" theme="dark" size="sm" />
            </div>
            <span className="text-[11px] text-[#929B95]">Ícone App Mobile & Compacta</span>
          </div>
        </div>
      </div>

      {/* Gym Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateSettings(form);
        }}
        className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 sm:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#929B95] mb-1">Nome do ginásio</label>
            <input
              type="text"
              value={form.gymName}
              onChange={(e) => setForm({ ...form, gymName: e.target.value })}
              className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#929B95] mb-1">Telefone (+244)</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#929B95] mb-1">Endereço</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#929B95] mb-1">E-mail institucional</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full min-h-[42px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <label className="flex items-center gap-2.5 text-xs text-[#F5F7F3] cursor-pointer">
            <input
              type="checkbox"
              checked={form.allowCommunityPosts}
              onChange={(e) => setForm({ ...form, allowCommunityPosts: e.target.checked })}
              className="w-4 h-4 accent-[#B7F34A]"
            />
            Permitir publicações na comunidade
          </label>
          <label className="flex items-center gap-2.5 text-xs text-[#F5F7F3] cursor-pointer">
            <input
              type="checkbox"
              checked={form.autoConfirmSessions}
              onChange={(e) => setForm({ ...form, autoConfirmSessions: e.target.checked })}
              className="w-4 h-4 accent-[#B7F34A]"
            />
            Confirmar sessões automaticamente
          </label>
          <label className="flex items-center gap-2.5 text-xs text-[#F5F7F3] cursor-pointer">
            <input
              type="checkbox"
              checked={form.notificationsEnabled}
              onChange={(e) => setForm({ ...form, notificationsEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#B7F34A]"
            />
            Sistema de notificações ativo
          </label>
        </div>

        <div className="flex flex-wrap justify-between gap-3 pt-3 border-t border-[#101312]">
          <button
            type="button"
            onClick={resetDemoData}
            className="min-h-[42px] px-4 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#929B95]"
          >
            Repor dados de demonstração
          </button>
          <button
            type="submit"
            className="min-h-[42px] px-6 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
          >
            Guardar configurações
          </button>
        </div>
      </form>
    </div>
  );
};
