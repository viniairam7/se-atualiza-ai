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
Liste 5 notícias atuais e reais (Brasil e mundo).
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
