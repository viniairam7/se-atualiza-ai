import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(cors({ origin: "*" }));
app.use(express.json());

/* =========================
   CHAT COM IA
========================= */
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages,
        temperature: 0.7
      })
    });

    const data = await response.json();

    res.json({
      content: data.choices?.[0]?.message?.content || "Sem resposta da IA."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ content: "Erro ao comunicar com a IA." });
  }
});

/* =========================
   NOTÍCIAS IMPARCIAIS
========================= */
app.get("/api/noticias", async (req, res) => {
  const prompt = `
Gere 12 notícias imparciais no estilo jornalístico profissional.
Retorne APENAS um JSON válido no formato:

[
  {
    "titulo": "",
    "resumo": "",
    "analise": "",
    "reflexao_biblica": ""
  }
]
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    });

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "[]";

    // 🧠 LIMPEZA DE JSON (anti-quebra)
    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let noticias;
    try {
      noticias = JSON.parse(content);
    } catch {
      noticias = [];
    }

    res.json(noticias);

  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

/* ========================= */
app.listen(PORT, () => {
  console.log("🔥 Verdade & Graça API rodando na porta", PORT);
});

