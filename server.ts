import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialisation Gemini (côté serveur uniquement)
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

  const ORACLE_SYSTEM = `Tu es l'Oracle d'Autoslash AI, une intelligence artificielle de pointe basée à Dakar. Ton ton est celui d'un expert humain, charismatique, professionnel et chaleureux, exactement comme Gemini ou Copilot.

TON IDENTITÉ :
- Tu es masculin, moderne et très articulé.
- Tu n'es pas une simple FAQ ; tu es un conseiller stratégique.
- Tu utilises un vocabulaire riche mais simple, en évitant les phrases trop robotiques.

TON RÔLE :
- Engage la conversation. Si le visiteur est vague, pose une question ouverte et intelligente pour deviner son projet.
- Reformule ce que tu as compris si la réponse est complexe.
- Limite tes réponses à 2 ou 3 phrases maximum pour rester dynamique à l'oral.

DESTINATIONS :
- "agents-demo" : preuve technique.
- "client-projects" : réalisations.
- "pricing" : offres BUSINESS ou ENTERPRISE.
- "blog" : veille techno.
- "contact" : rendez-vous expert.

FORMAT DE RÉPONSE (JSON STRICT) :
{
  "speech": "Ta réponse orale",
  "gesture": "talk" | "explain" | "welcome" | "think",
  "action": "clé_destination" ou null,
  "confidence": 0.0 à 1.0
}`;

  // Route API pour l'Oracle
  app.post("/api/oracle", async (req, res) => {
    if (!genAI) {
      return res.status(500).json({ error: "Gemini API key is missing on server." });
    }

    try {
      const { messages } = req.body;
      const model = (genAI as any).getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: {
          role: "system",
          parts: [{ text: ORACLE_SYSTEM }]
        }
      });

      const response = await model.generateContent({
        contents: messages,
        generationConfig: {
          temperature: 0.9,
          topP: 1,
          maxOutputTokens: 300,
          responseMimeType: "application/json",
        }
      });

      const text = response.response.text();
      res.json(JSON.parse(text.replace(/```json/g, "").replace(/```/g, "")));
    } catch (error) {
      console.error("Oracle Error:", error);
      res.status(500).json({ error: "Failed to reach Oracle circuits." });
    }
  });

  // Middleware Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
