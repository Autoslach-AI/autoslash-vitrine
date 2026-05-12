import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let __filename = "";
let __dirname = "";

try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  // Fallback for CommonJS bundle
}

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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Critical: GEMINI_API_KEY is not set in environment variables.");
      return res.status(500).json({ error: "Configuration manquante sur le serveur." });
    }

    try {
      const genAI = new GoogleGenAI({ apiKey });
      const { messages } = req.body;
      
      // Nettoyage des messages pour Gemini (s'assurer de l'alternance des rôles)
      const validMessages = messages.filter((m: any) => m.parts && m.parts[0]?.text);

      const model = (genAI as any).getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: {
          role: "system",
          parts: [{ text: ORACLE_SYSTEM }]
        }
      });

      const result = await model.generateContent({
        contents: validMessages,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 400,
          responseMimeType: "application/json",
        }
      });

      const text = result.response.text();
      // Nettoyage rigoureux du JSON
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error("Oracle Server Error:", error);
      res.status(500).json({ 
        error: "Erreur de connexion aux circuits neurologiques.",
        details: error.message 
      });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
