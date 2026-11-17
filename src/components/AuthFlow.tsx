import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { KimaKuamiLogo, MediaImage } from './KimaKuamiLogo';
import { BRAND_IMAGES } from '../data/mockData';
import { useAppState } from '../context/AppStateContext';
import { UserRole } from '../types';

export const AuthFlow: React.FC = () => {
  const {
    state,
    setAuthMode,
    setSelectedRoleForAuth,
    loginWithCredentials,
    loginQuickDemo,
    registerClient,
    showToast,
  } = useAppState();

  const mode = state.authMode;
  const selectedRole = state.selectedRoleForAuth;

  // Login form state
  const [identifier, setIdentifier] = useState('carlos.manuel@kimakuami.ao');
  const [password, setPassword] = useState('KimaKuami2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryContact, setRecoveryContact] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+244 ');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('1998-05-15');
  const [regGender, setRegGender] = useState('');
  const [regTerms, setRegTerms] = useState(false);
  const [regError, setRegError] = useState('');

  const handleSelectRoleForLogin = (role: UserRole) => {
    setSelectedRoleForAuth(role);
    setLoginError('');
    if (role === 'cliente') {
      setIdentifier('carlos.manuel@kimakuami.ao');
    } else if (role === 'trainer') {
      setIdentifier('ana.paula@kimakuami.ao');
    } else {
      setIdentifier('admin@kimakuami.ao');
    }
    setPassword('KimaKuami2026');
    setAuthMode('login');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = loginWithCredentials(identifier, password, selectedRole);
    if (!res.ok && res.error) {
      setLoginError(res.error);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim() || !regPhone.trim() || !regEmail.trim()) {
      setRegError('Preenche o nome completo, número de telefone e e-mail.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('As palavras-passe não coincidem.');
      return;
    }
    if (!regTerms) {
      setRegError('Deves aceitar os termos e condições da Kima Kuami.');
      return;
    }
    const res = registerClient({
      name: regName,
      phone: regPhone,
      email: regEmail,
      birthDate: regBirthDate,
      gender: regGender || undefined,
    });
    if (!res.ok && res.error) {
      setRegError(res.error);
    }
  };

  // Onboarding Screens (1, 2, 3)
  if (mode === 'onboarding_1' || mode === 'onboarding_2' || mode === 'onboarding_3') {
    const step = mode === 'onboarding_1' ? 1 : mode === 'onboarding_2' ? 2 : 3;
    const slides = {
      1: {
        image: BRAND_IMAGES.heroAthlete,
        title: 'A tua evolução começa aqui',
        text: 'Transforma os teus objetivos em resultados.',
        nextMode: 'onboarding_2' as const,
      },
      2: {
        image: BRAND_IMAGES.ptCoaching,
        title: 'Treina com orientação profissional',
        text: 'Acompanha os teus treinos e evolui com os melhores profissionais.',
        nextMode: 'onboarding_3' as const,
      },
      3: {
        image: BRAND_IMAGES.cardioRunner,
        title: 'Tudo o que precisas num só lugar',
        text: 'Controla a tua evolução e faz parte da comunidade Kima Kuami.',
        nextMode: 'welcome' as const,
      },
    };
    const current = slides[step];

    return (
      <div className="min-h-screen bg-[#101312] text-[#F5F7F3] flex flex-col lg:grid lg:grid-cols-12">
        {/* Visual Hero Side */}
        <div className="relative h-[56vh] lg:h-auto lg:col-span-7 overflow-hidden">
          <MediaImage
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover object-center"
            fallbackTitle="KIMA KUAMI FITNESS APP"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101312] via-[#101312]/45 to-black/30 lg:bg-gradient-to-r lg:from-black/30 lg:via-transparent lg:to-[#101312]" />

          <div className="absolute top-0 left-0 right-0 p-5 sm:p-8 flex items-center justify-between">
            <KimaKuamiLogo variant="horizontal" size="md" showTagline />
            <button
              onClick={() => setAuthMode('welcome')}
              className="min-h-[44px] px-4 text-sm font-medium text-[#F5F7F3]/85 hover:text-[#B7F34A] transition-colors whitespace-nowrap"
            >
              Saltar
            </button>
          </div>

          {step === 3 && (
            <div className="hidden sm:grid grid-cols-2 gap-3 absolute bottom-8 left-8 right-8 lg:right-16 max-w-lg">
              <div className="rounded-2xl bg-[#1C2421]/90 backdrop-blur-md border border-[#245C43]/50 p-3.5">
                <p className="text-xs text-[#929B95]">Treinos da Semana</p>
                <p className="text-base font-bold font-mono-tabular text-[#B7F34A] mt-0.5">
                  3 / 5 concluídos
                </p>
              </div>
              <div className="rounded-2xl bg-[#1C2421]/90 backdrop-blur-md border border-[#245C43]/50 p-3.5">
                <p className="text-xs text-[#929B95]">Mensalidade & Sessões</p>
                <p className="text-base font-bold font-mono-tabular text-[#F5F7F3] mt-0.5">
                  25.000 Kz · Ativa
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content & Controls Side */}
        <div className="flex-1 lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl mx-auto w-full">
          <div className="space-y-4 my-auto">
            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#929B95]">
              <span className="text-[#B7F34A] font-semibold">0{step}</span>
              <span>/</span>
              <span>03</span>
              <span aria-hidden="true">·</span>
              <span>Kima Kuami Angola</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7F3] text-balance leading-tight">
              {current.title}
            </h1>

            <p className="text-base text-[#929B95] leading-relaxed max-w-md">
              {current.text}
            </p>

            {/* Step indicators */}
            <div className="flex items-center gap-2 pt-2">
              {[1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setAuthMode(
                      idx === 1 ? 'onboarding_1' : idx === 2 ? 'onboarding_2' : 'onboarding_3'
                    )
                  }
                  aria-label={`Ir para ecrã ${idx}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === step ? 'w-8 bg-[#B7F34A]' : 'w-2.5 bg-[#1C2421] hover:bg-[#245C43]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-8 space-y-3">
            {step < 3 ? (
              <button
                onClick={() => setAuthMode(current.nextMode)}
                className="w-full min-h-[50px] rounded-2xl bg-[#B7F34A] text-[#101312] font-semibold text-base flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition-all"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setAuthMode('welcome')}
                  className="w-full min-h-[50px] rounded-2xl bg-[#B7F34A] text-[#101312] font-semibold text-base flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition-all"
                >
                  Começar agora
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setAuthMode('role_select')}
                  className="w-full min-h-[48px] rounded-2xl bg-[#1C2421] border border-[#245C43]/60 text-[#F5F7F3] font-semibold text-sm hover:border-[#B7F34A]/60 transition-colors"
                >
                  Já tenho conta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-[#101312] text-[#F5F7F3] flex flex-col lg:grid lg:grid-cols-12">
        <div className="relative h-[50vh] lg:h-auto lg:col-span-7 overflow-hidden">
          <MediaImage
            src={BRAND_IMAGES.heroAthlete}
            alt="Atleta angolano no ginásio Kima Kuami"
            className="w-full h-full object-cover"
            fallbackTitle="KIMA KUAMI FITNESS APP"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101312] via-[#101312]/40 to-black/30 lg:bg-gradient-to-r lg:from-black/30 lg:via-transparent lg:to-[#101312]" />
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <KimaKuamiLogo variant="horizontal" size="lg" showTagline />
          </div>
        </div>

        <div className="flex-1 lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl mx-auto w-full">
          <div className="my-auto space-y-5">
            <p className="text-xs font-semibold tracking-wide text-[#B7F34A]">
              KIMA KUAMI FITNESS APP · NAMIBE AO
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F5F7F3] leading-tight text-balance">
              A tua evolução começa aqui.
            </h1>
            <p className="text-base sm:text-lg text-[#929B95] leading-relaxed">
              Treina melhor. Evolui mais. Vive com saúde.
            </p>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => setAuthMode('role_select')}
                className="w-full min-h-[52px] rounded-2xl bg-[#B7F34A] text-[#101312] font-bold text-base hover:brightness-105 active:scale-[0.99] transition-all"
              >
                Entrar
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className="w-full min-h-[50px] rounded-2xl bg-[#1C2421] border border-[#245C43]/60 text-[#F5F7F3] font-semibold text-base hover:border-[#B7F34A]/60 transition-colors"
              >
                Criar conta
              </button>
            </div>
          </div>

          {/* Quick Demo Access for Evaluation */}
          <div className="pt-8 border-t border-[#1C2421]">
            <p className="text-xs text-[#929B95] mb-3">
              Acesso rápido ao protótipo (contas demonstrativas autorizadas):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => loginQuickDemo('cliente')}
                className="min-h-[44px] px-2 py-2 rounded-xl bg-[#1C2421] hover:bg-[#245C43]/40 border border-[#245C43]/40 text-xs font-semibold text-[#F5F7F3] transition-colors whitespace-nowrap"
              >
                Demo Cliente
              </button>
              <button
                onClick={() => loginQuickDemo('trainer')}
                className="min-h-[44px] px-2 py-2 rounded-xl bg-[#1C2421] hover:bg-[#245C43]/40 border border-[#245C43]/40 text-xs font-semibold text-[#F5F7F3] transition-colors whitespace-nowrap"
              >
                Demo Trainer
              </button>
              <button
                onClick={() => loginQuickDemo('admin')}
                className="min-h-[44px] px-2 py-2 rounded-xl bg-[#1C2421] hover:bg-[#245C43]/40 border border-[#245C43]/40 text-xs font-semibold text-[#F5F7F3] transition-colors whitespace-nowrap"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role Select Screen
  if (mode === 'role_select') {
    const roles: {
      role: UserRole;
      title: string;
      desc: string;
      restriction: string;
      icon: React.ReactNode;
    }[] = [
      {
        role: 'cliente',
        title: 'Cliente',
        desc: 'Acompanha treinos, marca sessões com personal trainers, gere mensalidades em Kz e interage com a comunidade e a Kima Kuami AI.',
        restriction: 'Acesso aberto a membros registados.',
        icon: <User className="w-6 h-6 text-[#B7F34A]" />,
      },
      {
        role: 'trainer',
        title: 'Personal Trainer',
        desc: 'Gere clientes atribuídos, constrói planos de treino por grupo muscular, confirma sessões na agenda e publica dicas técnicas.',
        restriction: 'Requer conta profissional autorizada pelo ginásio.',
        icon: <Dumbbell className="w-6 h-6 text-[#B7F34A]" />,
      },
      {
        role: 'admin',
        title: 'Administrador',
        desc: 'Controlo completo do ginásio: receitas em Kz, clientes, planos, mensalidades, personal trainers, moderação e relatórios.',
        restriction: 'Requer credenciais administrativas previamente autorizadas.',
        icon: <ShieldCheck className="w-6 h-6 text-[#B7F34A]" />,
      },
    ];

    return (
      <div className="min-h-screen bg-[#101312] text-[#F5F7F3] flex flex-col justify-center p-5 sm:p-10">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setAuthMode('welcome')}
              className="min-h-[44px] inline-flex items-center gap-2 text-sm text-[#929B95] hover:text-[#F5F7F3] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <KimaKuamiLogo variant="compact" size="sm" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F7F3]">
              Seleciona o teu perfil de acesso
            </h1>
            <p className="text-sm text-[#929B95]">
              Cada ambiente possui navegação e ferramentas dedicadas. Contas de Personal Trainer e Administrador exigem autorização prévia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => handleSelectRoleForLogin(r.role)}
                className="text-left rounded-3xl bg-[#1C2421] border border-[#245C43]/40 hover:border-[#B7F34A] p-6 flex flex-col justify-between gap-5 transition-all group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#101312] border border-[#245C43]/50 flex items-center justify-center group-hover:border-[#B7F34A]/60 transition-colors">
                    {r.icon}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#F5F7F3]">{r.title}</h2>
                    <p className="text-xs text-[#929B95] mt-2 leading-relaxed">{r.desc}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#101312] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#929B95] leading-snug">{r.restriction}</span>
                  <ArrowRight className="w-4 h-4 text-[#B7F34A] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-[#1C2421]/60 border border-[#245C43]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#B7F34A] shrink-0" />
              <p className="text-xs text-[#929B95]">
                Novo membro na Kima Kuami? Podes criar a tua conta de cliente em menos de um minuto.
              </p>
            </div>
            <button
              onClick={() => setAuthMode('register')}
              className="min-h-[44px] px-4 rounded-xl bg-[#245C43] hover:bg-[#245C43]/80 text-[#F5F7F3] text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Criar conta de cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (mode === 'login') {
    const roleLabel =
      selectedRole === 'cliente'
        ? 'Cliente'
        : selectedRole === 'trainer'
        ? 'Personal Trainer'
        : 'Administrador';

    return (
      <div className="min-h-screen bg-[#101312] text-[#F5F7F3] flex flex-col justify-center p-5 sm:p-10">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setAuthMode('role_select')}
              className="min-h-[44px] inline-flex items-center gap-2 text-sm text-[#929B95] hover:text-[#F5F7F3]"
            >
              <ArrowLeft className="w-4 h-4" />
              Trocar perfil
            </button>
            <KimaKuamiLogo variant="compact" size="sm" />
          </div>

          <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#B7F34A]">Perfil: {roleLabel}</p>
              <h1 className="font-display text-2xl font-bold text-[#F5F7F3] mt-1">
                Iniciar sessão
              </h1>
              <p className="text-xs text-[#929B95] mt-1.5">
                {selectedRole === 'cliente'
                  ? 'Acede aos teus treinos, sessões e mensalidade.'
                  : 'Área protegida. Apenas contas previamente autorizadas pela direção da Kima Kuami.'}
              </p>
            </div>

            {loginError && (
              <div className="rounded-2xl bg-red-950/60 border border-red-500/40 p-3.5 text-xs text-red-200 leading-relaxed">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#929B95] mb-1.5">
                  Telefone (+244) ou e-mail
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: +244 923 412 890 ou nome@kimakuami.ao"
                  className="w-full min-h-[46px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] placeholder:text-[#929B95]/50 focus:outline-none focus:border-[#B7F34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#929B95] mb-1.5">
                  Palavra-passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introduz a tua palavra-passe"
                    className="w-full min-h-[46px] rounded-xl bg-[#101312] border border-[#245C43]/50 pl-3.5 pr-12 text-sm text-[#F5F7F3] placeholder:text-[#929B95]/50 focus:outline-none focus:border-[#B7F34A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#929B95] hover:text-[#F5F7F3]"
                    aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-xs font-medium text-[#B7F34A] hover:underline py-1"
                >
                  Recuperar palavra-passe
                </button>
                {selectedRole !== 'cliente' && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#929B95]">
                    <Lock className="w-3 h-3" /> Conta autorizada
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-2xl bg-[#B7F34A] text-[#101312] font-bold text-sm hover:brightness-105 active:scale-[0.99] transition-all"
              >
                Iniciar sessão
              </button>
            </form>

            <div className="pt-4 border-t border-[#101312] space-y-2.5">
              <p className="text-[11px] text-[#929B95]">
                Atalho demonstrativo para o perfil {roleLabel}:
              </p>
              <button
                type="button"
                onClick={() => loginQuickDemo(selectedRole)}
                className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 hover:border-[#B7F34A]/60 text-xs font-semibold text-[#F5F7F3] transition-colors"
              >
                Entrar com conta autorizada de demonstração ({roleLabel})
              </button>
            </div>
          </div>

          {selectedRole === 'cliente' && (
            <p className="text-center text-xs text-[#929B95]">
              Ainda não tens conta?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="text-[#B7F34A] font-semibold hover:underline"
              >
                Criar conta
              </button>
            </p>
          )}
        </div>

        {/* Password Recovery Modal */}
        {showRecoveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#1C2421] border border-[#245C43]/50 p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#F5F7F3]">
                Recuperar palavra-passe
              </h2>
              <p className="text-xs text-[#929B95] leading-relaxed">
                Indica o teu e-mail ou número +244 registado para receberes instruções de recuperação (fluxo demonstrativo).
              </p>
              <input
                type="text"
                value={recoveryContact}
                onChange={(e) => setRecoveryContact(e.target.value)}
                placeholder="+244 923 000 000 ou e-mail"
                className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3 text-sm text-[#F5F7F3]"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowRecoveryModal(false)}
                  className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-[#929B95] hover:text-[#F5F7F3]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowRecoveryModal(false);
                    showToast('Instruções demonstrativas enviadas para o contacto indicado.', 'info');
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] text-xs font-bold"
                >
                  Enviar código
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Register Screen
  return (
    <div className="min-h-screen bg-[#101312] text-[#F5F7F3] flex flex-col justify-center p-5 sm:p-10">
      <div className="max-w-lg mx-auto w-full space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setAuthMode('welcome')}
            className="min-h-[44px] inline-flex items-center gap-2 text-sm text-[#929B95] hover:text-[#F5F7F3]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <KimaKuamiLogo variant="compact" size="sm" />
        </div>

        <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#B7F34A]">Novo Membro · Perfil Cliente</p>
            <h1 className="font-display text-2xl font-bold text-[#F5F7F3] mt-1">Criar conta</h1>
            <p className="text-xs text-[#929B95] mt-1">
              Junta-te à Kima Kuami e acompanha os teus treinos em Namibe AO.
            </p>
          </div>

          {regError && (
            <div className="rounded-2xl bg-red-950/60 border border-red-500/40 p-3.5 text-xs text-red-200">
              {regError}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#929B95] mb-1">
                Nome completo
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: Ndapewa Sebastião"
                className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] focus:outline-none focus:border-[#B7F34A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#929B95] mb-1">
                  Número de telefone
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+244 923 000 000"
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] focus:outline-none focus:border-[#B7F34A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#929B95] mb-1">E-mail</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nome@exemplo.ao"
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] focus:outline-none focus:border-[#B7F34A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#929B95] mb-1">
                  Palavra-passe
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] focus:outline-none focus:border-[#B7F34A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#929B95] mb-1">
                  Confirmar palavra-passe
                </label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Repete a palavra-passe"
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] focus:outline-none focus:border-[#B7F34A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#929B95] mb-1">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={regBirthDate}
                  onChange={(e) => setRegBirthDate(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] focus:outline-none focus:border-[#B7F34A]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#929B95] mb-1">
                  Género (opcional)
                </label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] focus:outline-none focus:border-[#B7F34A]"
                >
                  <option value="">Preferir não indicar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={regTerms}
                onChange={(e) => setRegTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#B7F34A]"
              />
              <span className="text-xs text-[#929B95] leading-relaxed">
                Aceito os termos de utilização e a política de privacidade do ginásio Kima Kuami.
              </span>
            </label>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-[#B7F34A] text-[#101312] font-bold text-sm flex items-center justify-center gap-2 hover:brightness-105 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Criar conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
