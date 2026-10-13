"use client"

import { cn } from "@/lib/utils";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Mic, X, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import AgentOrb, { type OrbState } from "@/components/ui/AgentOrb";
import AgentCards, { type AgentCardData, type AgentStepData } from "@/components/ui/AgentCards";

// --- Vocal Agent Config (Easy to modify later) ---
const VOCAL_CONFIG = {
  greeting: "Je suis prêt. Cliquez sur l'icône micro pour lancer l'appel avec moi.",
  listening: "Je vous écoute...",
  hint: "Cliquez pour commencer",
  hintActive: "Parlez maintenant",
  // Texte au centre de l'anneau
  idleText: "Bonjour",
  thinkingTexts: [
    "Je réfléchis…",
    "J'analyse votre besoin…",
    "Je prépare ma réponse…",
  ],
};

// --- Données fictives pour le mode démo (?demo=1) ---
const DEMO_STEPS = [
  "Rechercher les leads du mois",
  "Analyser les relances en attente",
  "Préparer le résumé",
];
const DEMO_CARDS: AgentCardData[] = [
  {
    id: "demo-1",
    title: "Leads à relancer",
    subtitle: "Données de démonstration",
    rows: [
      { label: "Prospect A", value: "Relance J+3" },
      { label: "Prospect B", value: "Devis envoyé" },
      { label: "Prospect C", value: "Rendez-vous à fixer" },
    ],
  },
  {
    id: "demo-2",
    title: "Résumé de la semaine",
    rows: [
      { label: "Nouveaux leads", value: "18" },
      { label: "Réponses reçues", value: "7" },
      { label: "Rendez-vous", value: "3" },
    ],
    text: "Données fictives pour tester l'affichage des cartes.",
    links: [{ label: "Exemple de source", url: "https://example.com" }],
  },
];

// --- Scene4Vocal (The Commercial Agent Interface) ---
export default function Scene4Vocal() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState(VOCAL_CONFIG.greeting);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [cards, setCards] = useState<AgentCardData[]>([]);
  const [steps, setSteps] = useState<AgentStepData[]>([]);
  const [thinkingLines, setThinkingLines] = useState<string[]>(VOCAL_CONFIG.thinkingTexts);
  const timersRef = useRef<number[]>([]);

  const recognitionRef = useRef<any>(null);
  const conversationRef = useRef<{role: string; parts: {text: string}[]}[]>([]);
  // Impulsion envoyée à l'orbe à chaque mot prononcé (0 → 1, décroît dans AgentOrb)
  const pulseRef = useRef(0);

  // Mode démo : ajoute ?demo=1 à l'URL pour tester l'animation sans micro
  const demo = true; // TEMPORAIRE : à retirer après les tests

  useEffect(() => {
    // Charger les voix au montage
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => timersRef.current.forEach((id) => window.clearTimeout(id));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const clearSearchUI = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setCards([]);
    setSteps([]);
  };

  // Simulation d'une recherche : étapes cochées, puis cartes (sans micro ni serveur)
  const runDemoSearch = () => {
    clearSearchUI();
    setOrbState("thinking");
    setThinkingLines([
      "Je cherche les leads du mois…",
      "Je compare avec les relances en attente…",
      "Je prépare le résumé…",
    ]);
    DEMO_STEPS.forEach((label, i) => {
      const id = `s${i}`;
      later(() => setSteps((p) => [...p, { id, label, done: false }]), i * 900);
      later(() => setSteps((p) => p.map((s) => (s.id === id ? { ...s, done: true } : s))), i * 900 + 800);
    });
    later(() => { setOrbState("speaking"); setCards([DEMO_CARDS[0]]); }, 3000);
    later(() => setCards((p) => [...p, DEMO_CARDS[1]]), 4200);
    later(() => setOrbState("idle"), 9000);
  };

  // Fait défiler les textes de réflexion pendant l'état "thinking"
  useEffect(() => {
    if (orbState !== "thinking") {
      setThinkingIdx(0);
      return;
    }
    const id = setInterval(
      () => setThinkingIdx((i) => (i + 1) % Math.max(thinkingLines.length, 1)),
      2200
    );
    return () => clearInterval(id);
  }, [orbState, thinkingLines]);

  const agentSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setOrbState("speaking");
    setStatus(text);

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.9;
    u.pitch = 0.8;

    const voices = window.speechSynthesis.getVoices();
    // Priorité aux voix françaises de qualité
    const fr = voices.find(v => v.lang.startsWith("fr") && (v.name.includes("Google") || v.name.includes("Enhanced"))) ||
               voices.find(v => v.lang.startsWith("fr")) ||
               voices[0];

    if (fr) u.voice = fr;

    // Chaque mot prononcé fait pulser l'orbe (si la voix émet l'évènement)
    u.onboundary = () => { pulseRef.current = 1; };
    u.onend = () => startListening();
    u.onerror = () => startListening();
    window.speechSynthesis.speak(u);

    conversationRef.current.push({ role: "model", parts: [{ text }] });
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setIsListening(false);
      setOrbState("idle");
      return;
    }

    setOrbState("listening");
    setIsListening(true);
    setStatus(VOCAL_CONFIG.listening);

    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      conversationRef.current.push({ role: "user", parts: [{ text }] });
      callAI(text);
    };

    rec.onerror = () => {
      setOrbState("idle");
      setIsListening(false);
      setStatus(VOCAL_CONFIG.greeting);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const callAI = async (userText: string) => {
    setOrbState("thinking");
    setStatus("Je réfléchis...");
    const topic = userText.length > 40 ? userText.slice(0, 40).trim() + "…" : userText;
    setThinkingLines([
      `J'écoute votre demande : « ${topic} »`,
      "J'analyse ce qu'il faut savoir…",
      "Je prépare une réponse adaptée…",
    ]);

    try {
      const history = conversationRef.current.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.parts[0].text,
      }));

      const res = await fetch("https://vrmkpnqjmqztpfowwkzv.supabase.co/functions/v1/chat-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: "commercial",
          messages: history,
        }),
      });

      const data = await res.json();
      // Étapes et cartes de recherche (quand chat-agent les renverra)
      if (Array.isArray(data.steps)) setSteps(data.steps);
      if (Array.isArray(data.cards)) setCards(data.cards);
      const reply = data.content?.[0]?.text || "Pouvez-vous répéter ?";
      agentSpeak(reply);
    } catch (error) {
      console.error("AI Error:", error);
      agentSpeak("Une erreur technique est survenue. Pouvez-vous répéter votre demande ?");
    }
  };

  const toggleCall = () => {
    if (!isListening && orbState === "idle") {
      // Premier appel
      agentSpeak("Bonjour. Je suis votre Agent Commercial Autoslash AI. Parlez-moi de votre activité et de vos objectifs de vente.");
    } else {
      // Arrêt complet
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setOrbState("idle");
      setStatus(VOCAL_CONFIG.greeting);
      conversationRef.current = [];
      clearSearchUI();
    }
  };

  const centerText =
    orbState === "thinking"
      ? (thinkingLines[thinkingIdx] ?? VOCAL_CONFIG.thinkingTexts[0])
      : orbState === "idle"
      ? VOCAL_CONFIG.idleText
      : undefined;

  return (
    <div className="fixed inset-0 bg-[#07061a] flex flex-col items-center justify-between py-12 px-6">
      {/* Étapes + cartes déplaçables */}
      <AgentCards
        cards={cards}
        steps={steps}
        onCloseCard={(id) => setCards((p) => p.filter((c) => c.id !== id))}
      />

      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs">AS</div>
          <div>
            <h2 className="text-white font-bold text-sm">AGENT COMMERCIAL</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">En ligne</span>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 text-white/40 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Center: The Orb */}
      <div className="flex flex-col items-center justify-center">
        <AgentOrb
          orbState={orbState}
          size={300}
          centerText={centerText}
          pulseRef={pulseRef}
        />
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        {demo && (
          <div className="flex gap-2">
            {(["idle", "listening", "thinking", "speaking"] as OrbState[]).map((s) => (
              <button
                key={s}
                onClick={() => setOrbState(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] border transition-colors",
                  orbState === s
                    ? "bg-white text-black border-white"
                    : "text-white/50 border-white/15 hover:bg-white/5"
                )}
              >
                {s}
              </button>
            ))}
            <button
              onClick={runDemoSearch}
              className="px-3 py-1.5 rounded-full text-[11px] border text-[#8fb0ff] border-[#8fb0ff]/40 hover:bg-white/5 transition-colors"
            >
              simuler recherche
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              if (recognitionRef.current) recognitionRef.current.stop();
              setIsListening(false);
              setOrbState("idle");
              setStatus(VOCAL_CONFIG.greeting);
              clearSearchUI();
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <motion.button
            onClick={toggleCall}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl",
              isListening
                ? "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                : "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            )}
          >
            <Mic size={32} />
          </motion.button>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-[10px] text-white/10 font-bold uppercase tracking-[0.3em]">
        Autoslash AI · Agent Vocal Beta · Haute Fidélité
      </div>
    </div>
  );
}
