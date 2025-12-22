import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // onde fica o index.html

// ===============================
// ROTA PRINCIPAL – REFLEXÃO DO DIA
// ===============================
app.post("/api/refletir", async (req, res) => {
  try {
    const { rotina } = req.body;

    if (!rotina) {
      return res.status(400).json({
        error: "Rotina não enviada"
      });
    }

    const systemPrompt = `
Você é um orientador espiritual cristão sábio, sereno e acolhedor.
Escreva de forma humana, fluida e pastoral.
Nunca use listas, tópicos ou markdown.
`;

    const userPrompt = `
A pessoa descreveu sua rotina do dia assim:

"${rotina}"

Com base nisso:
- Sugira bons momentos para oração, leitura bíblica e quietude.
- Gere uma reflexão conectando o dia com um texto bíblico.
- Finalize com encorajamento e esperança.

Escreva como alguém que caminha junto.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.6
        })
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error("Resposta inválida da IA");
    }

    res.json({
      resposta: data.choices[0].message.content
    });

  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      error: "Erro ao refletir o dia"
    });
  }
});

// ===============================
// START DO SERVIDOR
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Verdade & Graça rodando na porta ${PORT}`);
});
