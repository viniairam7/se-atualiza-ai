import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.json({
      reply: "Por favor, escreva uma pergunta, reflexão ou escolha uma opção acima."
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
              "Você é o Verdade & Graça: um assistente cristão que responde com clareza, verdade bíblica, equilíbrio teológico e linguagem acessível."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.6
      })
    });

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "Não foi possível gerar uma resposta no momento.";

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.json({
      reply: "Erro ao comunicar com a IA. Tente novamente em alguns instantes."
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Verdade & Graça API rodando na porta ${PORT}`);
});
