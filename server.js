import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error("❌ OPENROUTER_API_KEY não definida");
  process.exit(1);
}

/**
 * Endpoint principal
 * Recebe os planos do dia e devolve:
 * - Sugestão de horários espirituais
 * - Reflexão bíblica personalizada
 */
app.post("/api/planos", async (req, res) => {
  const { planos } = req.body;

  if (!planos) {
    return res.status(400).json({ error: "Planos do dia não informados." });
  }

  try {
    const prompt = `
Você é um mentor cristão pastoral, sábio e encorajador.

O usuário descreveu sua rotina diária:
"${planos}"

Tarefas:
1. Analise os horários informados.
2. Sugira os MELHORES horários para:
   - oração
   - leitura da Bíblia
   - momento silencioso com Deus
3. Gere uma reflexão espiritual conectando a rotina à fé cristã.
4. Inclua ao menos UM texto bíblico (com referência).
5. Use tom acolhedor, claro e prático.

Responda em português, bem organizado, com títulos.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://verdadeegraca.onrender.com",
        "X-Title": "Verdade & Graça"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um assistente cristão experiente." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices) {
      console.error("❌ Erro OpenRouter:", data);
      return res.status(500).json({ error: "Erro ao gerar resposta espiritual." });
    }

    res.json({
      resposta: data.choices[0].message.content
    });

  } catch (error) {
    console.error("🔥 Erro interno:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.get("/", (req, res) => {
  res.send("🙏 API Verdade & Graça — OpenRouter ativa");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
