import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(cors());
app.use(express.json());

/* =========================
   STREAM DE CHAT (SSE)
========================= */
app.post("/api/chat-stream", async (req, res) => {
  const { type, userText } = req.body;

  let systemPrompt = `
Você é o Verdade & Graça.
Escreva sempre com clareza, elegância e profundidade.
Nunca use markdown, asteriscos ou listas visuais.
Texto corrido, jornalístico e humano.
`;

  let userPrompt = userText;

  if (type === "news") {
    userPrompt = `
Escreva um panorama das PRINCIPAIS NOTÍCIAS DA SEMANA,
com linguagem jornalística de alto nível (estilo Folha de S.Paulo / BBC Brasil).

Regras:
- Somente acontecimentos recentes (últimos 7 dias).
- Política, economia, ciência e sociedade.
- Texto fluido, bem escrito, contextualizado.
- Sem listas, sem tópicos, sem datas explícitas.
- Finalize com um parágrafo curto de discernimento bíblico equilibrado,
sem tom moralista ou religioso excessivo.
`;
  }

  if (type === "devotional") {
    userPrompt = `
Escreva um devocional cristão para hoje.

Estrutura natural (sem títulos):
Introdução reflexiva,
Desenvolvimento bíblico,
Conclusão pastoral e prática.

Linguagem acolhedora, profunda e moderna.
`;
  }

  if (type === "jesus") {
    userPrompt = `
Explique como Jesus lidaria hoje com:
dinheiro, trabalho, estudos e relacionamentos.

Baseie-se nos Evangelhos.
Texto fluido, pastoral e prático.
`;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
    import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(cors());
app.use(express.json());

/* =========================
   FUNÇÃO BASE IA
========================= */
async function callAI(prompt) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://verdadeegraca.vercel.app",
        "X-Title": "Verdade & Graça"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "Você é o Verdade & Graça. Responda com clareza, equilíbrio bíblico, verdade factual e linguagem acessível."
          },
          { role: "user", content: prompt }
        ]
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenRouter erro:", error);
    throw new Error("Erro IA");
  }

  const data = await response.json();

  return (
    data?.choices?.[0]?.message?.content ||
    "Não foi possível gerar a resposta agora."
  );
}

/* =========================
   CHAT GERAL
========================= */
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.json({ reply: "Digite uma pergunta." });
  }

  try {
    let finalPrompt = prompt;

    if (prompt === "Notícias do dia") {
      finalPrompt = `
Pesquise nos portais da CNN e BBC as principais notícias do dia.
Para cada uma:
- Resumo curto
- Importância
- Reflexão bíblica equilibrada
`;
    }

    if (prompt === "Devocional de hoje") {
      finalPrompt = `
Crie um devocional cristão para o dia de hoje.
Estrutura:
- Introdução
- Desenvolvimento
- Aplicação prática
- Versículo bíblico
- Conclusão
`;
    }

    if (prompt === "O que Jesus faria?") {
      finalPrompt = `
Explique como Jesus lidaria hoje com:
- Dinheiro
- Trabalho
- Relacionamentos
- Estudos
Use os evangelhos como base.
`;
    }

    const reply = await callAI(finalPrompt);
    res.json({ reply });

  } catch (err) {
    res.json({
      reply: "Não foi possível gerar a resposta agora."
    });
  }
});

app.listen(PORT, () => {
  console.log("🔥 Verdade & Graça rodando na porta", PORT);
});
