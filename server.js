import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔓 Middlewares
app.use(cors());
app.use(express.json());

// 🤖 OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ ROTA DE TESTE (IMPORTANTE)
app.get("/", (req, res) => {
  res.send("Servidor Verdade & Graça ativo 🙏");
});

// ✅ ROTA PRINCIPAL
app.post("/api/refletir-dia", async (req, res) => {
  try {
    const { planos } = req.body;

    if (!planos || planos.trim().length < 2) {
      return res.status(400).json({
        error: "Planos do dia não informados."
      });
    }

    const prompt = `
Você é um orientador cristão sábio, calmo e encorajador.

A pessoa descreveu seu dia assim:
"${planos}"

Tarefas:
1. Sugira horários realistas para:
   - oração
   - leitura bíblica
   - um momento de silêncio com Deus
2. Explique o porquê dessas sugestões
3. Traga uma reflexão bíblica conectada à rotina descrita
4. Cite pelo menos 1 versículo bíblico
5. Finalize com uma palavra de encorajamento pastoral

Tom:
- acolhedor
- simples
- profundo
- pastoral
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const texto = response.output_text;

    res.json({ resultado: texto });

  } catch (error) {
    console.error("ERRO NA ROTA /api/refletir-dia:", error);
    res.status(500).json({
      error: "Não consegui refletir agora. Tente novamente em instantes."
    });
  }
});

// 🚀 START
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
