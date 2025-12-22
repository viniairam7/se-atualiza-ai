import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Necessário para __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Rota principal (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 ROTA DE REFLEXÃO DO DIA
app.post("/api/refletir-dia", async (req, res) => {
  try {
    const { plano } = req.body;

    if (!plano) {
      return res.status(400).json({ error: "Plano do dia não informado." });
    }

    const prompt = `
Você é um assistente cristão pastoral e sensível.

A pessoa descreveu sua programação do dia assim:
"${plano}"

Tarefas:
1. Sugira horários práticos para:
   - oração
   - leitura bíblica
   - um momento de silêncio com Deus
2. Em seguida, escreva uma reflexão pastoral conectando essa rotina com Deus
3. Inclua um texto bíblico apropriado
4. Termine com encorajamento, paz e esperança

Use uma linguagem:
- acolhedora
- simples
- profunda
- humana
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices) {
      console.error(data);
      return res.status(500).json({ error: "Erro ao gerar reflexão." });
    }

    res.json({
      resposta: data.choices[0].message.content
    });

  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Inicialização
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
