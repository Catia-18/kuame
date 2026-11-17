import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppNotification,
  AuthScreenMode,
  ChallengeItem,
  CommunityPost,
  EvolutionRecord,
  GymPlan,
  GymSettings,
  PaymentMethod,
  PaymentRecord,
  SessionStatus,
  TrainingSession,
  UserAccount,
  UserRole,
  WorkoutPlan,
} from '../types';
import {
  BRAND_IMAGES,
  INITIAL_CHALLENGES,
  INITIAL_EVOLUTION,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_PLANS,
  INITIAL_POSTS,
  INITIAL_SESSIONS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_WORKOUT_PLANS,
} from '../data/mockData';

const STORAGE_KEY = 'kima_kuami_prototype_v3';

interface PersistedState {
  users: UserAccount[];
  plans: GymPlan[];
  workoutPlans: WorkoutPlan[];
  evolution: EvolutionRecord[];
  sessions: TrainingSession[];
  payments: PaymentRecord[];
  posts: CommunityPost[];
  challenges: ChallengeItem[];
  notifications: AppNotification[];
  settings: GymSettings;
  currentUserId: string | null;
  authMode: AuthScreenMode;
  selectedRoleForAuth: UserRole;
}

const DEFAULT_STATE: PersistedState = {
  users: INITIAL_USERS,
  plans: INITIAL_PLANS,
  workoutPlans: INITIAL_WORKOUT_PLANS,
  evolution: INITIAL_EVOLUTION,
  sessions: INITIAL_SESSIONS,
  payments: INITIAL_PAYMENTS,
  posts: INITIAL_POSTS,
  challenges: INITIAL_CHALLENGES,
  notifications: INITIAL_NOTIFICATIONS,
  settings: INITIAL_SETTINGS,
  currentUserId: null,
  authMode: 'onboarding_1',
  selectedRoleForAuth: 'cliente',
};

interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'error';
}

interface AppContextValue {
  state: PersistedState;
  currentUser: UserAccount | null;
  toasts: ToastMessage[];
  showToast: (text: string, tone?: 'success' | 'info' | 'error') => void;
  setAuthMode: (mode: AuthScreenMode) => void;
  setSelectedRoleForAuth: (role: UserRole) => void;
  loginWithCredentials: (
    identifier: string,
    password: string,
    role: UserRole
  ) => { ok: boolean; error?: string };
  loginQuickDemo: (role: UserRole) => void;
  registerClient: (input: {
    name: string;
    phone: string;
    email: string;
    birthDate: string;
    gender?: string;
  }) => { ok: boolean; error?: string };
  logout: () => void;
  resetDemoData: () => void;
  // Client & Trainer workout actions
  completeClientWorkout: (clientId: string) => void;
  addEvolutionRecord: (record: Omit<EvolutionRecord, 'id'>) => void;
  saveWorkoutPlan: (plan: WorkoutPlan) => void;
  // Sessions
  bookSession: (input: {
    clientId: string;
    trainerId: string;
    date: string;
    time: string;
    type: string;
    location?: string;
  }) => void;
  updateSessionStatus: (sessionId: string, status: SessionStatus, newDate?: string, newTime?: string) => void;
  // Payments
  simulatePayment: (paymentId: string, method: PaymentMethod) => void;
  createDemoInvoicePayment: (clientId: string, planId: string, method: PaymentMethod) => void;
  markPaymentPaidByAdmin: (paymentId: string) => void;
  // Community
  createCommunityPost: (content: string, category: CommunityPost['category'], image?: string) => void;
  toggleLikePost: (postId: string) => void;
  addCommentToPost: (postId: string, text: string) => void;
  toggleJoinChallenge: (challengeId: string) => void;
  moderatePost: (postId: string, action: 'approve' | 'remove') => void;
  // Admin & PT Management
  upsertClient: (client: UserAccount) => void;
  toggleUserStatus: (userId: string) => void;
  upsertPlan: (plan: GymPlan) => void;
  togglePlanActive: (planId: string) => void;
  upsertTrainer: (trainer: UserAccount) => void;
  assignClientTrainer: (clientId: string, trainerId: string, planId?: string) => void;
  createChallenge: (challenge: Omit<ChallengeItem, 'id'>) => void;
  updateSettings: (settings: GymSettings) => void;
  // Notifications
  markAllNotificationsRead: (role: UserRole) => void;
  markNotificationRead: (id: string) => void;
}

const AppStateContext = createContext<AppContextValue | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<PersistedState>;
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // ignore corrupted localStorage
    }
    return DEFAULT_STATE;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state]);

  const showToast = (text: string, tone: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  const currentUser = state.users.find((u) => u.id === state.currentUserId) || null;

  const setAuthMode = (authMode: AuthScreenMode) => {
    setState((prev) => ({ ...prev, authMode }));
  };

  const setSelectedRoleForAuth = (selectedRoleForAuth: UserRole) => {
    setState((prev) => ({ ...prev, selectedRoleForAuth }));
  };

  const loginWithCredentials = (
    identifier: string,
    password: string,
    role: UserRole
  ): { ok: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId || password.trim().length < 4) {
      return { ok: false, error: 'Introduz o teu telefone ou e-mail e uma palavra-passe válida.' };
    }

    const matchedUser = state.users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/\s+/g, '').toLowerCase() === cleanId.replace(/\s+/g, '')
    );

    if (!matchedUser) {
      if (role === 'admin' || role === 'trainer') {
        return {
          ok: false,
          error:
            role === 'admin'
              ? 'Acesso administrativo restrito a contas previamente autorizadas pela direção da Kima Kuami.'
              : 'O acesso como Personal Trainer requer uma conta profissional previamente autorizada pelo ginásio.',
        };
      }
      return {
        ok: false,
        error: 'Conta não encontrada. Verifica os teus dados ou cria uma nova conta de cliente.',
      };
    }

    if (matchedUser.role !== role) {
      return {
        ok: false,
        error: `Esta conta pertence ao perfil ${
          matchedUser.role === 'cliente'
            ? 'Cliente'
            : matchedUser.role === 'trainer'
            ? 'Personal Trainer'
            : 'Administrador'
        }. Seleciona o perfil correto ou utiliza uma conta autorizada.`,
      };
    }

    if (!matchedUser.authorized) {
      return {
        ok: false,
        error: 'Esta conta não tem autorização ativa para o perfil selecionado.',
      };
    }

    if (matchedUser.status === 'Inativo') {
      return {
        ok: false,
        error: 'Conta temporariamente suspensa. Contacta a receção da Kima Kuami.',
      };
    }

    setState((prev) => ({ ...prev, currentUserId: matchedUser.id }));
    showToast(`Bem-vindo de volta, ${matchedUser.name}!`, 'success');
    return { ok: true };
  };

  const loginQuickDemo = (role: UserRole) => {
    const demoId =
      role === 'cliente' ? 'cli_carlos' : role === 'trainer' ? 'pt_ana' : 'adm_domingos';
    const user = state.users.find((u) => u.id === demoId);
    if (user) {
      setState((prev) => ({
        ...prev,
        currentUserId: user.id,
        selectedRoleForAuth: role,
      }));
      showToast(`Sessão demonstrativa iniciada como ${user.name}.`, 'info');
    }
  };

  const registerClient = (input: {
    name: string;
    phone: string;
    email: string;
    birthDate: string;
    gender?: string;
  }): { ok: boolean; error?: string } => {
    const exists = state.users.some(
      (u) => u.email.toLowerCase() === input.email.trim().toLowerCase()
    );
    if (exists) {
      return { ok: false, error: 'Já existe uma conta registada com este e-mail.' };
    }

    const newClientId = `cli_${Date.now()}`;
    const newClient: UserAccount = {
      id: newClientId,
      role: 'cliente',
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      avatar: BRAND_IMAGES.avatarCarlos,
      birthDate: input.birthDate,
      gender: input.gender || 'Não especificado',
      authorized: true,
      status: 'Ativo',
      joinDate: new Date().toISOString().slice(0, 10),
      goal: 'Condicionamento e Hipertrofia',
      level: 'Iniciante',
      planId: 'plan_basico',
      trainerId: 'pt_ana',
      weeklyCompleted: 0,
      weeklyTarget: 4,
      streakDays: 1,
    };

    const newNotification: AppNotification = {
      id: `not_${Date.now()}`,
      role: 'admin',
      title: 'Novo cliente registado',
      message: `${newClient.name} criou conta na Kima Kuami Fitness App.`,
      timeAgo: 'Agora mesmo',
      read: false,
      category: 'sistema',
    };

    setState((prev) => ({
      ...prev,
      users: [newClient, ...prev.users],
      notifications: [newNotification, ...prev.notifications],
      currentUserId: newClient.id,
      selectedRoleForAuth: 'cliente',
    }));

    showToast(`Conta criada com sucesso! Bem-vindo à Kima Kuami, ${newClient.name}.`, 'success');
    return { ok: true };
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUserId: null,
      authMode: 'welcome',
    }));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
    showToast('Dados demonstrativos repostos ao estado inicial.', 'info');
  };

  const completeClientWorkout = (clientId: string) => {
    setState((prev) => {
      const targetUser = prev.users.find((u) => u.id === clientId);
      const nextCompleted = (targetUser?.weeklyCompleted || 0) + 1;
      const targetGoal = targetUser?.weeklyTarget || 5;

      const newNotif: AppNotification | null =
        nextCompleted === targetGoal
          ? {
              id: `not_goal_${Date.now()}`,
              role: 'cliente',
              userId: clientId,
              title: 'Objetivo semanal concluído',
              message: `Parabéns! Completaste ${targetGoal} de ${targetGoal} treinos esta semana.`,
              timeAgo: 'Agora mesmo',
              read: false,
              category: 'treino',
            }
          : null;

      return {
        ...prev,
        users: prev.users.map((u) =>
          u.id === clientId
            ? {
                ...u,
                weeklyCompleted: Math.min((u.weeklyCompleted || 0) + 1, (u.weeklyTarget || 5) + 2),
                streakDays: (u.streakDays || 0) + 1,
              }
            : u
        ),
        workoutPlans: prev.workoutPlans.map((wp) =>
          wp.clientId === clientId
            ? { ...wp, progressPercent: Math.min(100, wp.progressPercent + 6) }
            : wp
        ),
        challenges: prev.challenges.map((ch) =>
          ch.id === 'ch_30dias' || ch.id === 'ch_5semana'
            ? { ...ch, currentProgress: Math.min(ch.targetCount, ch.currentProgress + 1) }
            : ch
        ),
        notifications: newNotif ? [newNotif, ...prev.notifications] : prev.notifications,
      };
    });
    showToast('Treino concluído e registado na tua evolução!', 'success');
  };

  const addEvolutionRecord = (record: Omit<EvolutionRecord, 'id'>) => {
    const item: EvolutionRecord = { ...record, id: `ev_${Date.now()}` };
    setState((prev) => ({
      ...prev,
      evolution: [...prev.evolution, item],
    }));
    showToast('Nova medição física registada com sucesso.', 'success');
  };

  const saveWorkoutPlan = (plan: WorkoutPlan) => {
    setState((prev) => {
      const exists = prev.workoutPlans.some((p) => p.id === plan.id);
      const updatedPlans = exists
        ? prev.workoutPlans.map((p) => (p.id === plan.id ? plan : p))
        : [plan, ...prev.workoutPlans];

      const notif: AppNotification = {
        id: `not_wp_${Date.now()}`,
        role: 'cliente',
        userId: plan.clientId,
        title: 'Plano atualizado',
        message: `O teu plano "${plan.name}" foi atualizado pelo teu Personal Trainer.`,
        timeAgo: 'Agora mesmo',
        read: false,
        category: 'treino',
      };

      return {
        ...prev,
        workoutPlans: updatedPlans,
        notifications: [notif, ...prev.notifications],
      };
    });
    showToast('Plano de treino guardado e sincronizado.', 'success');
  };

  const bookSession = (input: {
    clientId: string;
    trainerId: string;
    date: string;
    time: string;
    type: string;
    location?: string;
  }) => {
    const client = state.users.find((u) => u.id === input.clientId);
    const newSession: TrainingSession = {
      id: `ses_${Date.now()}`,
      clientId: input.clientId,
      trainerId: input.trainerId,
      date: input.date,
      time: input.time,
      durationMinutes: 60,
      type: input.type,
      location: input.location || 'Zona de Treino · Namibe AO',
      status: state.settings.autoConfirmSessions ? 'Confirmada' : 'Pendente',
    };

    const trainerNotif: AppNotification = {
      id: `not_ses_pt_${Date.now()}`,
      role: 'trainer',
      title: 'Nova sessão marcada',
      message: `${client?.name || 'Cliente'} marcou sessão para ${input.date} às ${input.time}.`,
      timeAgo: 'Agora mesmo',
      read: false,
      category: 'sessao',
    };

    const adminNotif: AppNotification = {
      id: `not_ses_adm_${Date.now()}`,
      role: 'admin',
      title: 'Nova marcação',
      message: `Sessão agendada por ${client?.name || 'Cliente'} (${input.date} · ${input.time}).`,
      timeAgo: 'Agora mesmo',
      read: false,
      category: 'sessao',
    };

    setState((prev) => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      notifications: [trainerNotif, adminNotif, ...prev.notifications],
    }));
    showToast('Marcação registada com sucesso!', 'success');
  };

  const updateSessionStatus = (
    sessionId: string,
    status: SessionStatus,
    newDate?: string,
    newTime?: string
  ) => {
    setState((prev) => {
      const target = prev.sessions.find((s) => s.id === sessionId);
      const clientNotif: AppNotification | null = target
        ? {
            id: `not_s_${Date.now()}`,
            role: 'cliente',
            userId: target.clientId,
            title:
              status === 'Confirmada'
                ? 'Sessão confirmada'
                : status === 'Cancelada'
                ? 'Sessão cancelada'
                : 'Sessão atualizada',
            message: newDate
              ? `A tua sessão foi reagendada para ${newDate} às ${newTime}.`
              : `O estado da tua sessão de ${target.date} às ${target.time} passou para ${status}.`,
            timeAgo: 'Agora mesmo',
            read: false,
            category: 'sessao',
          }
        : null;

      return {
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status,
                date: newDate || s.date,
                time: newTime || s.time,
              }
            : s
        ),
        notifications: clientNotif ? [clientNotif, ...prev.notifications] : prev.notifications,
      };
    });
    showToast(`Sessão atualizada (${status}).`, 'info');
  };

  const simulatePayment = (paymentId: string, method: PaymentMethod) => {
    setState((prev) => ({
      ...prev,
      payments: prev.payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              method,
              status: 'Pendente',
              isDemoSimulation: true,
              reference: `DEMO-${Math.floor(100000 + Math.random() * 899999)}`,
            }
          : p
      ),
    }));
    showToast(
      `Simulação de pagamento por ${method} registada como Pendente de confirmação.`,
      'info'
    );
  };

  const createDemoInvoicePayment = (
    clientId: string,
    planId: string,
    method: PaymentMethod
  ) => {
    const plan = state.plans.find((p) => p.id === planId);
    const client = state.users.find((u) => u.id === clientId);
    if (!plan) return;

    const newPay: PaymentRecord = {
      id: `pay_${Date.now()}`,
      clientId,
      planId,
      monthLabel: 'Dezembro 2026',
      dueDate: '2026-12-10',
      amountKz: plan.priceKz,
      method,
      status: 'Pendente',
      reference: `DEMO-${Math.floor(100000 + Math.random() * 899999)}`,
      isDemoSimulation: true,
    };

    const adminNotif: AppNotification = {
      id: `not_pay_adm_${Date.now()}`,
      role: 'admin',
      title: 'Nova intenção de pagamento (Demo)',
      message: `${client?.name || 'Cliente'} gerou referência demonstrativa de ${plan.priceKz.toLocaleString('pt-PT')} Kz via ${method}.`,
      timeAgo: 'Agora mesmo',
      read: false,
      category: 'pagamento',
    };

    setState((prev) => ({
      ...prev,
      payments: [newPay, ...prev.payments],
      notifications: [adminNotif, ...prev.notifications],
    }));

    showToast('Referência demonstrativa gerada. Aguarda validação do ginásio.', 'info');
  };

  const markPaymentPaidByAdmin = (paymentId: string) => {
    setState((prev) => {
      const target = prev.payments.find((p) => p.id === paymentId);
      const client = prev.users.find((u) => u.id === target?.clientId);

      const notif: AppNotification = {
        id: `not_pay_ok_${Date.now()}`,
        role: 'admin',
        title: 'Pagamento recebido',
        message: `Mensalidade de ${client?.name || 'Cliente'} marcada como paga.`,
        timeAgo: 'Agora mesmo',
        read: false,
        category: 'pagamento',
      };

      return {
        ...prev,
        payments: prev.payments.map((p) =>
          p.id === paymentId
            ? { ...p, status: 'Pago', paidDate: new Date().toISOString().slice(0, 10) }
            : p
        ),
        notifications: [notif, ...prev.notifications],
      };
    });
    showToast('Pagamento marcado como Pago.', 'success');
  };

  const createCommunityPost = (
    content: string,
    category: CommunityPost['category'],
    image?: string
  ) => {
    if (!currentUser) return;
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      category,
      content,
      image,
      likes: [],
      comments: [],
      createdAt: 'Agora mesmo',
    };
    setState((prev) => ({ ...prev, posts: [newPost, ...prev.posts] }));
    showToast('Publicação partilhada na comunidade Kima Kuami!', 'success');
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return;
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => {
        if (p.id !== postId) return p;
        const already = p.likes.includes(currentUser.id);
        return {
          ...p,
          likes: already
            ? p.likes.filter((id) => id !== currentUser.id)
            : [...p.likes, currentUser.id],
        };
      }),
    }));
  };

  const addCommentToPost = (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `com_${Date.now()}`,
                  authorId: currentUser.id,
                  authorName: currentUser.name,
                  authorRole: currentUser.role,
                  authorAvatar: currentUser.avatar,
                  text: text.trim(),
                  createdAt: 'Agora mesmo',
                },
              ],
            }
          : p
      ),
    }));
    showToast('Comentário adicionado.', 'success');
  };

  const toggleJoinChallenge = (challengeId: string) => {
    setState((prev) => ({
      ...prev,
      challenges: prev.challenges.map((ch) =>
        ch.id === challengeId
          ? {
              ...ch,
              joined: !ch.joined,
              participantsCount: ch.joined ? ch.participantsCount - 1 : ch.participantsCount + 1,
            }
          : ch
      ),
    }));
  };

  const moderatePost = (postId: string, action: 'approve' | 'remove') => {
    setState((prev) => ({
      ...prev,
      posts:
        action === 'remove'
          ? prev.posts.filter((p) => p.id !== postId)
          : prev.posts.map((p) =>
              p.id === postId ? { ...p, reported: false, reportReason: undefined } : p
            ),
    }));
    showToast(
      action === 'remove' ? 'Publicação removida pelo administrador.' : 'Denúncia arquivada e publicação mantida.',
      'info'
    );
  };

  const upsertClient = (client: UserAccount) => {
    setState((prev) => {
      const exists = prev.users.some((u) => u.id === client.id);
      return {
        ...prev,
        users: exists
          ? prev.users.map((u) => (u.id === client.id ? client : u))
          : [client, ...prev.users],
      };
    });
    showToast(`Dados de ${client.name} guardados.`, 'success');
  };

  const toggleUserStatus = (userId: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u
      ),
    }));
    showToast('Estado da conta atualizado.', 'info');
  };

  const upsertPlan = (plan: GymPlan) => {
    setState((prev) => {
      const exists = prev.plans.some((p) => p.id === plan.id);
      return {
        ...prev,
        plans: exists
          ? prev.plans.map((p) => (p.id === plan.id ? plan : p))
          : [...prev.plans, plan],
      };
    });
    showToast(`Plano "${plan.name}" guardado.`, 'success');
  };

  const togglePlanActive = (planId: string) => {
    setState((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === planId ? { ...p, active: !p.active } : p)),
    }));
  };

  const upsertTrainer = (trainer: UserAccount) => {
    setState((prev) => {
      const exists = prev.users.some((u) => u.id === trainer.id);
      const notif: AppNotification | null = !exists
        ? {
            id: `not_pt_${Date.now()}`,
            role: 'admin',
            title: 'Novo personal trainer',
            message: `${trainer.name} foi adicionado à equipa técnica da Kima Kuami.`,
            timeAgo: 'Agora mesmo',
            read: false,
            category: 'sistema',
          }
        : null;
      return {
        ...prev,
        users: exists
          ? prev.users.map((u) => (u.id === trainer.id ? trainer : u))
          : [trainer, ...prev.users],
        notifications: notif ? [notif, ...prev.notifications] : prev.notifications,
      };
    });
    showToast(`Personal trainer ${trainer.name} guardado.`, 'success');
  };

  const assignClientTrainer = (clientId: string, trainerId: string, planId?: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === clientId ? { ...u, trainerId, planId: planId || u.planId } : u
      ),
    }));
    showToast('Atribuição de cliente atualizada.', 'success');
  };

  const createChallenge = (challenge: Omit<ChallengeItem, 'id'>) => {
    const newCh: ChallengeItem = { ...challenge, id: `ch_${Date.now()}` };
    setState((prev) => ({ ...prev, challenges: [newCh, ...prev.challenges] }));
    showToast(`Desafio "${newCh.title}" publicado.`, 'success');
  };

  const updateSettings = (settings: GymSettings) => {
    setState((prev) => ({ ...prev, settings }));
    showToast('Configurações do ginásio guardadas.', 'success');
  };

  const markAllNotificationsRead = (role: UserRole) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)),
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  return (
    <AppStateContext.Provider
      value={{
        state,
        currentUser,
        toasts,
        showToast,
        setAuthMode,
        setSelectedRoleForAuth,
        loginWithCredentials,
        loginQuickDemo,
        registerClient,
        logout,
        resetDemoData,
        completeClientWorkout,
        addEvolutionRecord,
        saveWorkoutPlan,
        bookSession,
        updateSessionStatus,
        simulatePayment,
        createDemoInvoicePayment,
        markPaymentPaidByAdmin,
        createCommunityPost,
        toggleLikePost,
        addCommentToPost,
        toggleJoinChallenge,
        moderatePost,
        upsertClient,
        toggleUserStatus,
        upsertPlan,
        togglePlanActive,
        upsertTrainer,
        assignClientTrainer,
        createChallenge,
        updateSettings,
        markAllNotificationsRead,
        markNotificationRead,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState(): AppContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
