import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Star,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { MediaImage } from '../KimaKuamiLogo';
import { TrainingSession } from '../../types';

const CALENDAR_DAYS = [
  { date: '2026-11-18', dow: 'Qua', day: '18', available: true },
  { date: '2026-11-19', dow: 'Qui', day: '19', available: true },
  { date: '2026-11-20', dow: 'Sex', day: '20', available: true },
  { date: '2026-11-21', dow: 'Sáb', day: '21', available: true },
  { date: '2026-11-22', dow: 'Dom', day: '22', available: false },
  { date: '2026-11-23', dow: 'Seg', day: '23', available: true },
  { date: '2026-11-24', dow: 'Ter', day: '24', available: true },
];

export const ClientSessionsModule: React.FC = () => {
  const { state, currentUser, bookSession, updateSessionStatus } = useAppState();

  const [tab, setTab] = useState<'agendar' | 'proximas' | 'historico'>('agendar');
  const [calendarMode, setCalendarMode] = useState<'semanal' | 'mensal'>('semanal');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('pt_ana');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-19');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('Treino Personalizado de Hipertrofia');
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [confirmedBanner, setConfirmedBanner] = useState<string | null>(null);

  // Reschedule modal
  const [rescheduleTarget, setRescheduleTarget] = useState<TrainingSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-11-23');
  const [rescheduleTime, setRescheduleTime] = useState('18:00');

  const trainers = state.users.filter((u) => u.role === 'trainer' && u.status === 'Ativo');
  const selectedTrainer = trainers.find((t) => t.id === selectedTrainerId) || trainers[0];

  const mySessions = state.sessions.filter((s) => s.clientId === currentUser?.id);
  const upcomingSessions = mySessions.filter(
    (s) => s.status === 'Confirmada' || s.status === 'Pendente'
  );
  const historySessions = mySessions.filter(
    (s) => s.status === 'Concluída' || s.status === 'Cancelada'
  );

  // Check occupied slots for selected trainer and date
  const occupiedSlots = state.sessions
    .filter(
      (s) =>
        s.trainerId === selectedTrainerId &&
        s.date === selectedDate &&
        s.status !== 'Cancelada'
    )
    .map((s) => s.time);

  const handleConfirmBooking = () => {
    if (!currentUser || !selectedTrainer || !selectedTime) return;
    bookSession({
      clientId: currentUser.id,
      trainerId: selectedTrainer.id,
      date: selectedDate,
      time: selectedTime,
      type: sessionType,
      location: 'Sala Principal · Namibe, AO',
    });
    setConfirmedBanner(
      `Sessão marcada com ${selectedTrainer.name} para ${selectedDate} às ${selectedTime}.`
    );
    setSelectedTime('');
    setBookingStep(1);
    setTab('proximas');
  };

  const getStatusStyle = (status: TrainingSession['status']) => {
    switch (status) {
      case 'Confirmada':
        return 'text-[#B7F34A]';
      case 'Pendente':
        return 'text-amber-300';
      case 'Concluída':
        return 'text-emerald-300';
      case 'Cancelada':
        return 'text-red-400';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">Sessões & Personal Trainers</h1>
          <p className="text-xs text-[#929B95] mt-0.5">
            Marca, confirma, reagenda ou consulta o histórico das tuas sessões
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#1C2421] rounded-2xl border border-[#245C43]/30 w-fit">
          {[
            { id: 'agendar', label: 'Agendar Sessão' },
            { id: 'proximas', label: `Próximas (${upcomingSessions.length})` },
            { id: 'historico', label: 'Histórico' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'agendar' | 'proximas' | 'historico')}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-[#B7F34A] text-[#101312]'
                  : 'text-[#929B95] hover:text-[#F5F7F3]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {confirmedBanner && (
        <div className="rounded-2xl bg-[#245C43]/30 border border-[#B7F34A]/60 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm text-[#F5F7F3]">
            <CheckCircle2 className="w-5 h-5 text-[#B7F34A] shrink-0" />
            <span>{confirmedBanner}</span>
          </div>
          <button
            onClick={() => setConfirmedBanner(null)}
            className="text-xs text-[#929B95] hover:text-[#F5F7F3]"
          >
            Fechar
          </button>
        </div>
      )}

      {/* TAB 1: AGENDAR SESSÃO (5-STEP FLOW) */}
      {tab === 'agendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Trainers + Calendar + Slots */}
          <div className="lg:col-span-8 space-y-5">
            {/* Step 1: Escolher Personal Trainer */}
            <section className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#F5F7F3]">
                  1. Escolher Personal Trainer
                </h2>
                <span className="text-xs text-[#929B95]">{trainers.length} disponíveis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trainers.map((pt) => {
                  const selected = pt.id === selectedTrainerId;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => {
                        setSelectedTrainerId(pt.id);
                        setSelectedTime('');
                        setBookingStep(2);
                      }}
                      className={`text-left rounded-2xl p-4 border flex items-start gap-3.5 transition-all ${
                        selected
                          ? 'bg-[#101312] border-[#B7F34A]'
                          : 'bg-[#101312]/50 border-[#245C43]/30 hover:border-[#245C43]'
                      }`}
                    >
                      <MediaImage
                        src={pt.avatar}
                        alt={pt.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-[#F5F7F3] truncate">{pt.name}</h3>
                          <span className="inline-flex items-center gap-1 text-xs font-mono-tabular text-[#B7F34A]">
                            <Star className="w-3 h-3 fill-[#B7F34A]" />
                            {pt.rating}
                          </span>
                        </div>
                        <p className="text-xs text-[#929B95] mt-1 line-clamp-2">
                          {pt.specialties?.join(' · ')}
                        </p>
                        <p className="text-[11px] text-[#929B95] mt-1.5">{pt.workingHours}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Selecionar Data (Semanal / Mensal) */}
            <section className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#F5F7F3]">
                  2. Selecionar Data · Novembro 2026
                </h2>
                <div className="flex items-center gap-1 p-1 bg-[#101312] rounded-xl">
                  <button
                    onClick={() => setCalendarMode('semanal')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      calendarMode === 'semanal'
                        ? 'bg-[#245C43] text-[#F5F7F3]'
                        : 'text-[#929B95]'
                    }`}
                  >
                    Semanal
                  </button>
                  <button
                    onClick={() => setCalendarMode('mensal')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      calendarMode === 'mensal'
                        ? 'bg-[#245C43] text-[#F5F7F3]'
                        : 'text-[#929B95]'
                    }`}
                  >
                    Mensal
                  </button>
                </div>
              </div>

              {calendarMode === 'semanal' ? (
                <div className="grid grid-cols-7 gap-2">
                  {CALENDAR_DAYS.map((d) => {
                    const active = selectedDate === d.date;
                    return (
                      <button
                        key={d.date}
                        disabled={!d.available}
                        onClick={() => {
                          setSelectedDate(d.date);
                          setSelectedTime('');
                          setBookingStep(3);
                        }}
                        className={`min-h-[68px] rounded-2xl flex flex-col items-center justify-center gap-1 border transition-colors ${
                          !d.available
                            ? 'bg-[#101312]/30 border-transparent text-[#929B95]/40 cursor-not-allowed'
                            : active
                            ? 'bg-[#B7F34A] border-[#B7F34A] text-[#101312]'
                            : 'bg-[#101312] border-[#245C43]/30 text-[#F5F7F3] hover:border-[#B7F34A]/60'
                        }`}
                      >
                        <span className="text-[11px] font-medium">{d.dow}</span>
                        <span className="font-mono-tabular text-base font-bold">{d.day}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((h) => (
                    <span key={h} className="text-[11px] text-[#929B95] py-1">
                      {h}
                    </span>
                  ))}
                  {Array.from({ length: 21 }, (_, idx) => {
                    const dayNum = idx + 10;
                    const dateStr = `2026-11-${String(dayNum).padStart(2, '0')}`;
                    const isPast = dayNum < 18;
                    const isSunday = (idx + 1) % 7 === 0;
                    const disabled = isPast || isSunday;
                    const active = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedTime('');
                          setBookingStep(3);
                        }}
                        className={`min-h-[42px] rounded-xl font-mono-tabular text-xs font-semibold transition-colors ${
                          disabled
                            ? 'text-[#929B95]/30 cursor-not-allowed'
                            : active
                            ? 'bg-[#B7F34A] text-[#101312]'
                            : 'bg-[#101312] text-[#F5F7F3] hover:border hover:border-[#B7F34A]/60'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 3 & 4: Consultar e Escolher Horários Disponíveis */}
            <section className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#F5F7F3]">
                  3 & 4. Horários livres em {selectedDate}
                </h2>
                <span className="text-xs text-[#929B95]">Duração: 60 min</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {(selectedTrainer?.availabilitySlots || []).map((slot) => {
                  const isTaken = occupiedSlots.includes(slot);
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      disabled={isTaken}
                      onClick={() => {
                        setSelectedTime(slot);
                        setBookingStep(5);
                      }}
                      className={`min-h-[44px] rounded-xl font-mono-tabular text-xs font-bold border transition-colors ${
                        isTaken
                          ? 'bg-[#101312]/40 border-transparent text-[#929B95]/40 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#B7F34A] border-[#B7F34A] text-[#101312]'
                          : 'bg-[#101312] border-[#245C43]/40 text-[#F5F7F3] hover:border-[#B7F34A]'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs text-[#929B95] mb-1.5">Tipo de sessão</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
                >
                  <option value="Treino Personalizado de Hipertrofia">
                    Treino Personalizado de Hipertrofia
                  </option>
                  <option value="Avaliação Física & Composição Corporal">
                    Avaliação Física & Composição Corporal
                  </option>
                  <option value="Treino Funcional & Resistência">
                    Treino Funcional & Resistência
                  </option>
                  <option value="Correção Técnica & Força">Correção Técnica & Força</option>
                </select>
              </div>
            </section>
          </div>

          {/* Right: Step 5 Confirmation Summary */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-5 sticky top-20">
              <div>
                <p className="text-xs font-semibold text-[#B7F34A]">Passo {bookingStep} de 5</p>
                <h2 className="font-display text-lg font-bold text-[#F5F7F3] mt-1">
                  5. Confirmar marcação
                </h2>
              </div>

              {selectedTrainer && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#101312]">
                  <MediaImage
                    src={selectedTrainer.avatar}
                    alt={selectedTrainer.name}
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#F5F7F3] truncate">
                      {selectedTrainer.name}
                    </p>
                    <p className="text-xs text-[#929B95] truncate">
                      {selectedTrainer.specialties?.[0]}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-[#101312]">
                  <span className="text-[#929B95]">Data selecionada</span>
                  <span className="font-mono-tabular font-semibold text-[#F5F7F3]">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#101312]">
                  <span className="text-[#929B95]">Horário</span>
                  <span className="font-mono-tabular font-semibold text-[#B7F34A]">
                    {selectedTime || 'Seleciona um horário'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#101312]">
                  <span className="text-[#929B95]">Modalidade</span>
                  <span className="font-medium text-[#F5F7F3] text-right max-w-[180px] truncate">
                    {sessionType}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#929B95]">Local</span>
                  <span className="font-medium text-[#F5F7F3]">Kima Kuami · Namibe, AO</span>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={!selectedTime}
                className="w-full min-h-[48px] rounded-2xl bg-[#B7F34A] text-[#101312] font-bold text-sm disabled:opacity-40 hover:brightness-105 transition-all"
              >
                Confirmar marcação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRÓXIMAS SESSÕES */}
      {tab === 'proximas' && (
        <div className="space-y-3">
          {upcomingSessions.length === 0 ? (
            <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/30 p-8 text-center space-y-3">
              <CalendarIcon className="w-8 h-8 text-[#929B95] mx-auto" />
              <p className="text-sm font-semibold text-[#F5F7F3]">
                Não tens sessões futuras agendadas
              </p>
              <button
                onClick={() => setTab('agendar')}
                className="min-h-[42px] px-5 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
              >
                Agendar primeira sessão
              </button>
            </div>
          ) : (
            upcomingSessions.map((ses) => {
              const trainer = state.users.find((u) => u.id === ses.trainerId);
              return (
                <div
                  key={ses.id}
                  className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <MediaImage
                      src={trainer?.avatar || ''}
                      alt={trainer?.name || 'Personal Trainer'}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-bold ${getStatusStyle(ses.status)}`}>
                          {ses.status}
                        </span>
                        <span aria-hidden="true" className="text-[#929B95]">·</span>
                        <span className="font-mono-tabular text-[#929B95]">
                          {ses.date} às {ses.time}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-[#F5F7F3]">
                        {ses.type}
                      </h3>
                      <p className="text-xs text-[#929B95] flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-[#B7F34A]" />
                          {trainer?.name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {ses.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {ses.durationMinutes} min
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setRescheduleTarget(ses);
                        setRescheduleDate(ses.date);
                        setRescheduleTime(ses.time);
                      }}
                      className="min-h-[40px] px-3.5 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3] inline-flex items-center gap-1.5 hover:border-[#B7F34A]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reagendar
                    </button>
                    <button
                      onClick={() => updateSessionStatus(ses.id, 'Cancelada')}
                      className="min-h-[40px] px-3.5 rounded-xl bg-[#101312] border border-red-500/30 text-xs font-semibold text-red-300 inline-flex items-center gap-1.5 hover:bg-red-950/40"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: HISTÓRICO */}
      {tab === 'historico' && (
        <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 divide-y divide-[#101312]">
          {historySessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#929B95]">
              Ainda não tens sessões concluídas ou canceladas no histórico.
            </div>
          ) : (
            historySessions.map((ses) => {
              const trainer = state.users.find((u) => u.id === ses.trainerId);
              return (
                <div
                  key={ses.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-mono-tabular text-[#929B95]">
                      {ses.date} · {ses.time} · {trainer?.name}
                    </p>
                    <p className="text-sm font-semibold text-[#F5F7F3] mt-0.5">{ses.type}</p>
                  </div>
                  <span className={`text-xs font-bold ${getStatusStyle(ses.status)}`}>
                    {ses.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#1C2421] border border-[#245C43]/50 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#F5F7F3]">Reagendar sessão</h2>
            <p className="text-xs text-[#929B95]">{rescheduleTarget.type}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#929B95] mb-1">Nova data</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#929B95] mb-1">Novo horário</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
                >
                  {['07:00', '08:30', '10:00', '16:30', '18:00', '19:30'].map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="min-h-[42px] px-4 rounded-xl text-xs font-semibold text-[#929B95]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateSessionStatus(
                    rescheduleTarget.id,
                    'Pendente',
                    rescheduleDate,
                    rescheduleTime
                  );
                  setRescheduleTarget(null);
                }}
                className="min-h-[42px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
              >
                Guardar alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
