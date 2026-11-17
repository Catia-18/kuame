import React, { useState } from 'react';
import { Bot, Send, ShieldAlert, Dumbbell, HeartPulse, Utensils } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  'Que exercícios devo fazer para desenvolver o peito?',
  'Como posso melhorar a minha resistência?',
  'Como organizar os meus treinos?',
  'Que alimentação devo seguir para ganhar massa muscular?',
  'Como posso melhorar a recuperação muscular?',
];

export const KimaKuamiAI: React.FC = () => {
  const { currentUser, state } = useAppState();

  const activeWorkoutPlan = state.workoutPlans.find(
    (wp) => wp.clientId === currentUser?.id
  );

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'ai_welcome',
      role: 'assistant',
      content:
        'Olá! Sou o teu assistente Kima Kuami AI. Estou aqui para ajudar-te a alcançar os teus objetivos.',
      timestamp: 'Agora',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || loading) return;

    setErrorMsg(null);
    const userMsg: AIMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: clean,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext: {
            name: currentUser?.name,
            goal: currentUser?.goal || activeWorkoutPlan?.goal,
            planName: activeWorkoutPlan?.name,
            level: currentUser?.level || activeWorkoutPlan?.level,
            weeklyCompleted: currentUser?.weeklyCompleted,
            weeklyTarget: currentUser?.weeklyTarget,
          },
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !data.reply) {
        setErrorMsg(
          data.error || 'Não foi possível obter resposta da Kima Kuami AI neste momento.'
        );
        return;
      }

      const aiReply: AIMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setErrorMsg('Erro de ligação ao servidor Kima Kuami AI. Tenta novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Context Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#1C2421] border border-[#245C43]/40 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#101312] flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 text-[#B7F34A]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#929B95]">Plano Considerado</p>
            <p className="text-xs font-semibold text-[#F5F7F3] mt-0.5 truncate">
              {activeWorkoutPlan?.name || 'Plano Base Kima Kuami'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1C2421] border border-[#245C43]/40 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#101312] flex items-center justify-center shrink-0">
            <HeartPulse className="w-4 h-4 text-[#B7F34A]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#929B95]">Objetivo & Nível</p>
            <p className="text-xs font-semibold text-[#F5F7F3] mt-0.5 truncate">
              {currentUser?.goal || 'Hipertrofia'} · {currentUser?.level || 'Intermédio'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1C2421] border border-[#245C43]/40 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#101312] flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4 text-[#B7F34A]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#929B95]">Orientação Segura</p>
            <p className="text-xs font-semibold text-[#F5F7F3] mt-0.5 truncate">
              Não substitui médico ou nutricionista
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl bg-[#1C2421] border border-[#245C43]/40 overflow-hidden flex flex-col min-h-[460px]">
        <div className="px-5 py-3.5 border-b border-[#101312] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B7F34A] text-[#101312] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#F5F7F3]">Kima Kuami AI</h3>
              <p className="text-[11px] text-[#929B95]">
                Assistente de treino e recuperação · Português de Angola
              </p>
            </div>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[380px]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-[#B7F34A] text-[#101312] font-medium rounded-br-sm'
                      : 'bg-[#101312] border border-[#245C43]/40 text-[#F5F7F3] rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-[#929B95] mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start">
              <div className="rounded-2xl bg-[#101312] border border-[#245C43]/40 px-4 py-3 text-xs text-[#929B95]">
                A preparar recomendação personalizada...
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl bg-red-950/50 border border-red-500/40 px-4 py-3 text-xs text-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-3 border-t border-[#101312] bg-[#101312]/40">
          <p className="text-[11px] text-[#929B95] mb-2">Sugestões rápidas:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#1C2421] hover:bg-[#245C43]/40 border border-[#245C43]/40 text-xs text-[#F5F7F3] whitespace-nowrap shrink-0 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="p-3 sm:p-4 border-t border-[#101312] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faz uma pergunta sobre treino, cargas ou recuperação..."
            className="flex-1 min-h-[46px] rounded-xl bg-[#101312] border border-[#245C43]/50 px-3.5 text-sm text-[#F5F7F3] placeholder:text-[#929B95]/60 focus:outline-none focus:border-[#B7F34A]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="min-w-[46px] min-h-[46px] px-4 rounded-xl bg-[#B7F34A] text-[#101312] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 hover:brightness-105 transition-all"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-[#929B95] leading-relaxed px-1">
        Nota responsável: A Kima Kuami AI oferece recomendações educativas baseadas no teu plano registado. Não substitui avaliação médica, fisioterapêutica ou acompanhamento nutricional clínico.
      </p>
    </div>
  );
};
