import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContextInput {
  name?: string;
  goal?: string;
  planName?: string;
  level?: string;
  weeklyCompleted?: number;
  weeklyTarget?: number;
}

app.post('/api/ai/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        error: 'A chave de API do Gemini ainda não está configurada no ambiente do servidor. Verifica o painel Settings > Secrets.',
      });
    }

    const { messages, userContext } = req.body as {
      messages?: ChatMessageInput[];
      userContext?: UserContextInput;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Envia uma mensagem válida para a Kima Kuami AI.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contextSummary = userContext
      ? `Contexto do membro Kima Kuami:
- Nome: ${userContext.name || 'Membro'}
- Objetivo atual: ${userContext.goal || 'Condicionamento físico geral'}
- Plano de treino atual: ${userContext.planName || 'Plano Base'}
- Nível: ${userContext.level || 'Intermédio'}
- Progresso semanal: ${userContext.weeklyCompleted ?? 0} de ${userContext.weeklyTarget ?? 5} treinos concluídos`
      : '';

    const systemInstruction = `És a Kima Kuami AI, o assistente inteligente oficial do ginásio Kima Kuami em Angola (Namibe, AO).
Responde SEMPRE em Português de Angola claro, motivador, técnico mas acessível e bem estruturado.
Usa formatação limpa com tópicos curtos quando recomendares exercícios, séries, repetições ou hábitos de alimentação/recuperação.
${contextSummary}
Regras importantes:
1. Adapta as sugestões ao objetivo, plano de treino e nível do membro sempre que disponíveis.
2. Mantém as respostas práticas e concisas (máximo 180-220 palavras).
3. Em questões de alimentação, lesões ou saúde clínica, recorda sempre de forma natural e responsável que as orientações são educativas e não substituem um nutricionista, médico ou o acompanhamento presencial do personal trainer na Kima Kuami.`;

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return res.status(502).json({ error: 'Não foi possível gerar resposta neste momento. Tenta novamente.' });
    }

    return res.json({ reply: text });
  } catch (err: unknown) {
    console.error('Erro Kima Kuami AI:', err);
    const message = err instanceof Error ? err.message : 'Erro interno ao consultar a Kima Kuami AI.';
    return res.status(500).json({
      error: `Não foi possível processar a tua pergunta agora. (${message})`,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kima Kuami Fitness App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
