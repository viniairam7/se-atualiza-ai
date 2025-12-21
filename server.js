import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

app.use(cors({ origin: "*" }));
app.use(express.json());

/* =========================
   CHAT PRINCIPAL
========================= */
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.json({
      reply: "Por favor, digite uma pergunta ou manchete."
    });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Você é o Verdade & Graça, um analista imparcial. Responda com clareza, base factual e reflexão bíblica equilibrada, sem viés político."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.6
        })
      }
    );

    const data = await response.json();

    const text =
      data?.choices?.[0]?.message?.content ||
      "Não foi possível gerar uma resposta no momento.";

    res.json({ reply: text });

  } catch (error) {
    res.json({
      reply:
        "Erro ao comunicar com a IA. Tente novamente em alguns instantes."
    });
  }
});

/* =========================
   NOTÍCIAS DO DIA (REAIS)
========================= */
app.get("/api/noticias", async (req, res) => {
  try {
    /* 1️⃣ Buscar notícias reais */
    const newsResponse = await fetch(
      "https://newsapi.org/v2/top-headlines?language=pt&pageSize=12",
      {
        headers: {
          "X-Api-Key": NEWS_API_KEY
        }
      }
    );

    const newsData = await newsResponse.json();

    if (!newsData.articles || newsData.articles.length === 0) {
      return res.json({
        reply: "Não foi possível carregar notícias reais hoje."
      });
    }

    /* 2️⃣ Montar texto factual */
    const noticiasTexto = newsData.articles
      .map(
        (n, i) => `
${i + 1}. ${n.title}
Fonte: ${n.source.name}
Resumo: ${n.description || "Resumo indisponível."}
`
      )
      .join("\n");

    /* 3️⃣ IA analisa (sem inventar fatos) */
    const prompt = `
A seguir estão notícias REAIS do dia, com fonte jornalística.

Para CADA notícia:
• Avalie a relevância
• Comente brevemente a veracidade com base na fonte
• Traga uma reflexão bíblica equilibrada (sem proselitismo político)

NOTÍCIAS:
${noticiasTexto}
`;

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4
        })
      }
    );

    const aiData = await aiResponse.json();

    const text =
      aiData?.choices?.[0]?.message?.content ||
      "Não foi possível analisar as notícias hoje.";

    res.json({ reply: text });

  } catch (error) {
    res.json({
      reply: "Erro ao buscar ou analisar notícias."
    });
  }
});

/* ========================= */
app.listen(PORT, () => {
  console.log("🔥 Verdade & Graça API rodando");
});
