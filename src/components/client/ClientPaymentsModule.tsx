import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Landmark,
  Smartphone,
  Store,
  X,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { formatKz } from '../../data/mockData';
import { PaymentMethod, PaymentRecord } from '../../types';
import { KimaKuamiLogo } from '../KimaKuamiLogo';

const PAYMENT_METHODS: { id: PaymentMethod; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'Multicaixa Express',
    desc: 'Pedido demonstrativo para telemóvel +244',
    icon: <Smartphone className="w-4 h-4 text-[#B7F34A]" />,
  },
  {
    id: 'Referência Multicaixa',
    desc: 'Entidade 00542 · Pagamento por ATM ou Internet Banking',
    icon: <CreditCard className="w-4 h-4 text-[#B7F34A]" />,
  },
  {
    id: 'Transferência Bancária',
    desc: 'IBAN Kima Kuami (BAI / BFA / BIC)',
    icon: <Landmark className="w-4 h-4 text-[#B7F34A]" />,
  },
  {
    id: 'Pagamento Presencial',
    desc: 'Liquidação na receção do ginásio em Namibe AO',
    icon: <Store className="w-4 h-4 text-[#B7F34A]" />,
  },
];

export const ClientPaymentsModule: React.FC = () => {
  const { state, currentUser, createDemoInvoicePayment } = useAppState();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Multicaixa Express');
  const [receiptModal, setReceiptModal] = useState<PaymentRecord | null>(null);

  const currentPlan =
    state.plans.find((p) => p.id === currentUser?.planId) || state.plans[1];

  const myPayments = state.payments.filter((p) => p.clientId === currentUser?.id);
  const latestPayment = myPayments[0];

  const currentStatus = latestPayment?.status || 'Pago';

  const statusMeta = {
    Pago: { color: 'text-[#B7F34A]', icon: <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" /> },
    Pendente: { color: 'text-amber-300', icon: <Clock className="w-4 h-4 text-amber-300" /> },
    'Em atraso': {
      color: 'text-red-400',
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    },
  }[currentStatus];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#F5F7F3]">Pagamentos & Mensalidade</h1>
        <p className="text-xs text-[#929B95] mt-0.5">
          Consulta o estado da tua subscrição em Kwanza (Kz), referências e recibos
        </p>
      </div>

      {/* Membership Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-[#929B95]">Plano atual</p>
              <h2 className="font-display text-xl font-bold text-[#F5F7F3] mt-0.5">
                Plano {currentPlan.name} · {currentPlan.durationLabel}
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 text-sm font-bold">
              {statusMeta.icon}
              <span className={statusMeta.color}>{currentStatus}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-[#101312]">
            <div>
              <p className="text-xs text-[#929B95]">Valor da mensalidade</p>
              <p className="font-mono-tabular text-xl font-bold text-[#F5F7F3] mt-1 tabular-nums">
                {formatKz(currentPlan.priceKz)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#929B95]">Data de vencimento</p>
              <p className="font-mono-tabular text-sm font-semibold text-[#F5F7F3] mt-1.5">
                10 Dez 2026
              </p>
            </div>
            <div>
              <p className="text-xs text-[#929B95]">Próximo pagamento</p>
              <p className="font-mono-tabular text-sm font-semibold text-[#B7F34A] mt-1.5">
                {formatKz(currentPlan.priceKz)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#101312] p-4 text-xs text-[#929B95] space-y-1">
            <p className="font-semibold text-[#F5F7F3]">Dados bancários Kima Kuami (Angola)</p>
            <p className="font-mono-tabular">
              Entidade Multicaixa: {state.settings.multicaixaEntity} · IBAN: {state.settings.iban}
            </p>
          </div>
        </div>

        {/* Payment Method Demo Generator */}
        <div className="lg:col-span-5 rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-5 space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-[#F5F7F3]">
              Simular pagamento da próxima mensalidade
            </h3>
            <p className="text-[11px] text-[#929B95] mt-1">
              Ambiente demonstrativo: gera uma referência pendente de validação administrativa, sem transação bancária real.
            </p>
          </div>

          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => {
              const active = selectedMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`w-full text-left rounded-2xl p-3 border flex items-center gap-3 transition-colors ${
                    active
                      ? 'bg-[#101312] border-[#B7F34A]'
                      : 'bg-[#101312]/50 border-[#245C43]/30 hover:border-[#245C43]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#1C2421] flex items-center justify-center shrink-0">
                    {m.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#F5F7F3]">{m.id}</p>
                    <p className="text-[11px] text-[#929B95] truncate">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              currentUser && createDemoInvoicePayment(currentUser.id, currentPlan.id, selectedMethod)
            }
            className="w-full min-h-[46px] rounded-2xl bg-[#B7F34A] text-[#101312] font-bold text-xs hover:brightness-105 transition-all"
          >
            Gerar referência demonstrativa ({formatKz(currentPlan.priceKz)})
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#101312] flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-[#F5F7F3]">
            Histórico financeiro
          </h3>
          <span className="text-xs text-[#929B95] tabular-nums">
            {myPayments.length} registos
          </span>
        </div>

        <div className="divide-y divide-[#101312]">
          {myPayments.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#929B95]">
              Sem faturas registadas até ao momento.
            </div>
          ) : (
            myPayments.map((pay) => (
              <div
                key={pay.id}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#101312]/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F5F7F3]">
                    <span>{pay.monthLabel}</span>
                    <span className="text-[#929B95] font-normal">·</span>
                    <span className="font-mono-tabular">{formatKz(pay.amountKz)}</span>
                  </div>
                  <p className="text-xs text-[#929B95] font-mono-tabular">
                    {pay.paidDate ? `Pago em ${pay.paidDate}` : `Vence em ${pay.dueDate}`} ·{' '}
                    {pay.method} · Ref: {pay.reference}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span
                    className={`text-xs font-bold ${
                      pay.status === 'Pago'
                        ? 'text-[#B7F34A]'
                        : pay.status === 'Pendente'
                        ? 'text-amber-300'
                        : 'text-red-400'
                    }`}
                  >
                    {pay.status}
                  </span>
                  <button
                    onClick={() => setReceiptModal(pay)}
                    className="min-h-[38px] px-3.5 rounded-xl bg-[#101312] border border-[#245C43]/50 text-xs font-semibold text-[#F5F7F3] inline-flex items-center gap-1.5 hover:border-[#B7F34A]"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#B7F34A]" />
                    Consultar recibo
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#1C2421] border border-[#245C43]/60 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <KimaKuamiLogo variant="horizontal" size="sm" />
              <button
                onClick={() => setReceiptModal(null)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#929B95] hover:text-[#F5F7F3]"
                aria-label="Fechar recibo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#101312] p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C2421]">
                <span className="text-[#929B95]">Documento</span>
                <span className="font-semibold text-[#F5F7F3]">
                  {receiptModal.isDemoSimulation
                    ? 'Comprovativo Demonstrativo'
                    : 'Recibo de Mensalidade'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#929B95]">Cliente</span>
                <span className="font-semibold text-[#F5F7F3]">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#929B95]">Referência</span>
                <span className="font-mono-tabular text-[#F5F7F3]">{receiptModal.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#929B95]">Período</span>
                <span className="text-[#F5F7F3]">{receiptModal.monthLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#929B95]">Método</span>
                <span className="text-[#F5F7F3]">{receiptModal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#929B95]">Estado</span>
                <span className="font-bold text-[#B7F34A]">{receiptModal.status}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1C2421] text-sm">
                <span className="font-semibold text-[#F5F7F3]">Total</span>
                <span className="font-mono-tabular font-bold text-[#B7F34A]">
                  {formatKz(receiptModal.amountKz)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#929B95] leading-relaxed">
              {state.settings.gymName} · {state.settings.address} · NIF {state.settings.nif}.
              Recibo demonstrativo do protótipo Kima Kuami Fitness App.
            </p>

            <button
              onClick={() => setReceiptModal(null)}
              className="w-full min-h-[44px] rounded-xl bg-[#B7F34A] text-[#101312] font-bold text-xs"
            >
              Fechar recibo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
