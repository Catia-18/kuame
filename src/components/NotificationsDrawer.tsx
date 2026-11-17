import React from 'react';
import { Bell, CheckCheck, X, Calendar, CreditCard, Dumbbell, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { UserRole } from '../types';

export const ToastContainer: React.FC = () => {
  const { toasts } = useAppState();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-2xl px-4 py-3 text-sm font-medium shadow-xl border backdrop-blur-md transition-all ${
            t.tone === 'error'
              ? 'bg-[#2A1617]/95 border-red-500/40 text-red-100'
              : t.tone === 'info'
              ? 'bg-[#1C2421]/95 border-[#245C43] text-[#F5F7F3]'
              : 'bg-[#1C2421]/95 border-[#B7F34A]/60 text-[#F5F7F3]'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
};

export const NotificationsDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  role: UserRole;
}> = ({ open, onClose, role }) => {
  const { state, currentUser, markAllNotificationsRead, markNotificationRead } = useAppState();

  if (!open) return null;

  const items = state.notifications.filter((n) => {
    if (n.role !== role) return false;
    if (role === 'cliente' && n.userId && currentUser && n.userId !== currentUser.id) return false;
    return true;
  });

  const unreadCount = items.filter((i) => !i.read).length;

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'pagamento':
        return <CreditCard className="w-4 h-4 text-[#B7F34A]" />;
      case 'sessao':
        return <Calendar className="w-4 h-4 text-[#B7F34A]" />;
      case 'treino':
        return <Dumbbell className="w-4 h-4 text-[#B7F34A]" />;
      case 'comunidade':
        return <MessageSquare className="w-4 h-4 text-[#B7F34A]" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-[#B7F34A]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#101312] border-l border-[#245C43]/40 h-full flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#245C43]/30">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#B7F34A]" />
            <h2 className="font-display text-lg font-bold text-[#F5F7F3]">Notificações</h2>
            {unreadCount > 0 && (
              <span className="text-xs font-mono-tabular text-[#B7F34A]">
                · {unreadCount} por ler
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#929B95] hover:text-[#F5F7F3] hover:bg-[#1C2421] transition-colors"
            aria-label="Fechar notificações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#1C2421] flex items-center justify-between">
          <span className="text-xs text-[#929B95]">
            Alertas do perfil {role === 'cliente' ? 'Cliente' : role === 'trainer' ? 'Personal Trainer' : 'Administrador'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead(role)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B7F34A] hover:underline py-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar tudo como lido
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#1C2421]">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#929B95]">
              Sem notificações de momento.
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`w-full text-left px-5 py-4 flex items-start gap-3.5 transition-colors hover:bg-[#1C2421]/60 ${
                  !item.read ? 'bg-[#1C2421]/40' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#1C2421] border border-[#245C43]/40 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${!item.read ? 'text-[#F5F7F3]' : 'text-[#929B95]'}`}>
                      {item.title}
                    </p>
                    <span className="text-[11px] text-[#929B95] whitespace-nowrap shrink-0">
                      {item.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-[#929B95] mt-1 leading-relaxed">{item.message}</p>
                  {!item.read && (
                    <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#B7F34A]">
                      Nova notificação
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
