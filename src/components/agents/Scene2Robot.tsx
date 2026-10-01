/**
 * Scene2Robot.tsx — L'Oracle Autoslash AI
 * ─────────────────────────────────────────
 * Robot Spline 3D original qui :
 *   - S'éveille avec une animation d'entrée
 *   - Parle via Web Speech API (synthèse vocale) sans sous-titre à l'écran
 *   - Écoute automatiquement le visiteur après avoir parlé via Web Speech API (reconnaissance vocale)
 *   - Transmet le texte reconnu à callOracle(), exactement comme un clic sur une carte
 *   - Génère des cartes réponses dynamiques via l'Edge Function chat-agent (agent_id: "axon_voice")
 *   - Guide le visiteur vers la bonne destination
 */

import { Suspense, lazy, useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

const Spline = lazy(() => import("@splinetool/react-spline"));

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Card {
  label: string;
  value: string;
  emoji?: string;
}

interface OracleResponse {
  speech: string;
  cards: Card[];
  destination: string | null;
}

interface Scene2Props {
  onComplete: (destination: string) => void;
}

type RobotState = "awakening" | "speaking" | "waiting" | "thinking" | "farewell";

// ═══════════════════════════════════════════════════════════════
// CONFIG DESTINATIONS
// ═══════════════════════════════════════════════════════════════

const DEST_CONFIG: Record<string, { color: string; label: string }> = {
  "agents-demo":     { color: "#A8E6CF", label: "Les Agents IA"      },
  "client-projects": { color: "#FFD3B6", label: "Nos Réalisations"   },
  "pricing":         { color: "#FFEAA7", label: "Nos Offres"         },
  "blog":            { color: "#DDD6FE", label: "Le Blog"            },
  "contact":         { color: "#FFFFFF", label: "Nous Contacter"     },
};

// ═══════════════════════════════════════════════════════════════
// CARTES CONSTANTES (Sans emojis)
// ═══════════════════════════════════════════════════════════════

const SECTOR_CARDS: Card[] = [
  { label: "Tester les agents IA",  value: "agents"   },
  { label: "Voir les réalisations", value: "projects" },
  { label: "Découvrir les offres",  value: "pricing"  },
  { label: "Parler à l'équipe",     value: "contact"  },
];

const AGENT_CARDS: Card[] = [
  { label: "Agent Business",   value: "business"   },
  { label: "Agent Commercial", value: "commercial" },
];

const DIRECT_DESTINATIONS: Record<string, string> = {
  agents:   "/agents-demo?agent=business",
  projects: "/client-projects",
  pricing:  "/pricing",
  blog:     "/blog",
  contact:  "/contact",
};

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT ORACLE
// ═══════════════════════════════════════════════════════════════

const ORACLE_SYSTEM = `Tu es l'Oracle d'Autoslash AI — une intelligence artificielle bienveillante et précise.
Tu guides les visiteurs du site vitrine vers la bonne destination.

TON CARACTÈRE :
- Direct et chaleureux, jamais robotique
- Phrases courtes (max 2 phrases) car tu parles à voix haute
- Tu te présentes en disant que tes circuits d'écoute sont en maintenance donc tu utilises des cartes
- Tu poses des questions intelligentes pour comprendre le besoin

DESTINATIONS :
- "agents-demo"     → tester les agents IA, voir une démo, curiosité technique
- "client-projects" → voir des réalisations concrètes, preuves, cas clients  
- "pricing"         → tarifs, packages, combien ça coûte, offres
- "blog"            → articles, actualités, apprendre, études de cas
- "contact"         → parler à l'équipe, démarrer un projet, question spécifique

RÈGLE ABSOLUE : Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication.

FORMAT :
{
  "speech": "texte à dire à voix haute (1-2 phrases max, naturel)",
  "cards": [
    {"label": "texte court", "value": "clé"}
  ],
  "destination": null
}`;

// ═══════════════════════════════════════════════════════════════
// HOOK : SYNTHÈSE VOCALE
// ═══════════════════════════════════════════════════════════════

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang    = "fr-FR";
    u.rate    = 0.85;
    u.pitch   = 0.7;
    u.volume  = 1;
    // Voix française
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find(v => v.lang.startsWith("fr")) ?? voices[0];
    if (fr) u.voice = fr;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => { setSpeaking(false); onEnd?.(); };
    u.onerror = () => { setSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(u);
  }, []);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, stop, speaking };
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : CARTES SUGGESTIONS
// ═══════════════════════════════════════════════════════════════

function SuggestionCards({
  cards,
  onSelect,
  disabled,
}: {
  cards: Card[];
  onSelect: (card: Card) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5 max-w-sm">
      {cards.map((card, i) => (
        <motion.button
          key={card.value}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          disabled={disabled}
          onClick={() => onSelect(card)}
          className="group relative flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
          whileHover={disabled ? {} : {
            scale: 1.02,
            backgroundColor: "rgba(0, 102, 255, 0.08)",
            borderColor: "rgba(0, 102, 255, 0.35)",
          }}
          whileTap={disabled ? {} : { scale: 0.98 }}
        >
          <span
            className="text-white/80 text-sm font-light group-hover:text-white transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {card.label}
          </span>

          <span className="text-white/20 text-xs group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
            →
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : ÉTAT ROBOT (BADGE)
// ═══════════════════════════════════════════════════════════════

function RobotStatusBadge({ state }: { state: RobotState }) {
  const config = {
    awakening: { label: "Connexion",    color: "#60a5fa" },
    speaking:  { label: "En parole",    color: "#34d399" },
    waiting:   { label: "À l'écoute",   color: "#a78bfa" },
    thinking:  { label: "Analyse...",   color: "#fbbf24" },
    farewell:  { label: "Départ",       color: "#f87171" },
  }[state];

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md"
      style={{
        background: "rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: config.color }}
      />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {config.label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : POINTS DE RÉFLEXION
// ═══════════════════════════════════════════════════════════════

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl max-w-[80px]"
      style={{
        background: "rgba(10, 15, 30, 0.75)",
        border: "1px solid rgba(0, 102, 255, 0.2)",
      }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-blue-400"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCÈNE 2 — COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function Scene2Robot({ onComplete }: Scene2Props) {
  const navigate = useNavigate();
  const [robotState, setRobotState]   = useState<RobotState>("awakening");
  const [cards, setCards]             = useState<Card[]>([]);
  const [robotShifted, setRobotShifted] = useState(false);
  const [splineReady, setSplineReady] = useState(false);
  const [history, setHistory]         = useState<{ role: string; content: string }[]>([]);

  const recognitionRef = useRef<any>(null);
  const callOracleRef = useRef<(msg: string) => Promise<void>>(async () => {});
  const startListeningRef = useRef<() => void>(() => {});
  const fallbackSaidRef = useRef(false);
  const hasAwokenRef = useRef(false);

  const { speak, stop, speaking } = useSpeech();

  // ── Reconnaissance Vocale (Web Speech API) ─────────────────────────────
  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const text = e.results[0][0]?.transcript;
      if (text && text.trim()) {
        callOracleRef.current(text.trim());
      }
    };

    rec.onerror = () => {};
    rec.onend = () => {};

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {}
  }, []);

  startListeningRef.current = startListening;

  // ── Appel Oracle (Edge Function chat-agent avec agent_id: "axon_voice") ──
  const callOracle = useCallback(async (userMessage: string) => {
    // Interrompre toute écoute en cours pendant que le robot réfléchit
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    setRobotState("thinking");
    setCards([]);

    const newHistory = [
      ...history,
      { role: "user", content: userMessage },
    ];
    setHistory(newHistory);

    try {
      const res = await fetch("https://vrmkpnqjmqztpfowwkzv.supabase.co/functions/v1/chat-agent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: "axon_voice",
          messages: newHistory,
        }),
      });
      
      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      const raw  = data.content?.[0]?.text ?? "{}";

      let parsed: OracleResponse;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {
          speech: raw,
          cards: SECTOR_CARDS,
          destination: null,
        };
      }

      setHistory(prev => [...prev, { role: "assistant", content: parsed.speech }]);

      // Destination trouvée → farewell + transition
      if (parsed.destination && DEST_CONFIG[parsed.destination]) {
        setRobotShifted(true);
        setRobotState("farewell");
        speak(parsed.speech, () => {
          setTimeout(() => onComplete(parsed.destination!), 600);
        });
        return;
      }

      // Continuer la conversation
      setRobotState("speaking");

      speak(parsed.speech, () => {
        setRobotState("waiting");
        if (parsed.cards?.length) {
          setRobotShifted(true);
          setCards(parsed.cards);
        }
        // Démarrage automatique de l'écoute après que le robot a fini de parler
        startListeningRef.current();
      });

    } catch (error) {
      console.warn("Oracle Fallback Triggered", error);
      const fallback = "Une perturbation dans mes circuits. Dites-moi simplement ce que vous cherchez.";
      
      setRobotState("speaking");
      
      // On ne dit la phrase qu'une seule fois (demande utilisateur)
      if (!fallbackSaidRef.current) {
        speak(fallback, () => {
          setRobotState("waiting");
          fallbackSaidRef.current = true;
          setCards(SECTOR_CARDS);
          startListeningRef.current();
        });
      } else {
        setRobotState("waiting");
        setCards(SECTOR_CARDS);
        startListeningRef.current();
      }
    }
  }, [history, speak, onComplete]);

  callOracleRef.current = callOracle;

  // ── Séquence d'éveil (déclenchée UNE SEULE FOIS après chargement Spline) ──
  useEffect(() => {
    if (!splineReady || hasAwokenRef.current) return;
    hasAwokenRef.current = true;

    // Charger les voix
    window.speechSynthesis?.getVoices();

    const timer = setTimeout(() => {
      callOracleRef.current("__INIT__");
    }, 1200);

    return () => clearTimeout(timer);
  }, [splineReady]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stop();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [stop]);

  // ── Sélection d'une carte ─────────────────────────────────────────────
  const handleCardSelect = useCallback((card: Card) => {
    if (robotState === "thinking" || robotState === "speaking") return;

    // Interrompre le micro si un clic est effectué
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    // SI LE VISITEUR VEUT TESTER LES AGENTS -> ON LUI PROPOSE LES DEUX OPTIONS
    if (card.value === "agents") {
      setCards(AGENT_CARDS);
      setRobotState("speaking");
      speak("Très bien. Quel agent souhaitez-vous mettre à l'épreuve ?", () => {
        setRobotState("waiting");
        startListeningRef.current();
      });
      return;
    }

    const FAREWELL_SPEECHES: Record<string, string> = {
      "business":   "Compris. Je vous transfère vers l'Agent Business.",
      "commercial": "C'est noté. L'Agent Commercial vous attend.",
      "agents":     "Parfait. Je vous emmène voir nos agents en action.",
      "projects":   "Excellent. Découvrez nos réalisations concrètes.",
      "pricing":    "Je vous guide vers nos offres et packages.",
      "blog":       "Direction notre blog et actualités.",
      "contact":    "Notre équipe vous attend.",
    };

    stop();
    setCards([]);
    setRobotState("farewell");
    setRobotShifted(false);

    const destPath = DIRECT_DESTINATIONS[card.value];
    const speechKey = card.value;
    const speech = FAREWELL_SPEECHES[speechKey] ?? "Je vous guide vers votre destination.";

    // Parler → puis naviguer ou déclencher Scène 3
    const performNavigation = () => {
      if (destPath && destPath.startsWith("/")) {
        navigate(destPath);
      } else {
        const finalDest = (card.value === "business" || card.value === "commercial") 
          ? card.value 
          : (destPath || "contact");
        onComplete(finalDest);
      }
    };

    speak(speech, () => {
      setTimeout(performNavigation, 300);
    });

    // Failsafe si voix indisponible → déclenche après 2.5s
    const failsafe = setTimeout(performNavigation, 2500);
    return () => clearTimeout(failsafe);

  }, [robotState, stop, speak, onComplete, navigate]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">

      {/* ── Robot Spline ───────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        animate={{ x: robotShifted ? "20%" : "0%" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              className="w-16 h-16 border border-blue-500/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        }>
          <Spline
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
            onLoad={() => setSplineReady(true)}
          />
        </Suspense>

        {/* Overlays de profondeur */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black/80 to-transparent" />
        </div>
      </motion.div>

      {/* ── Zone gauche — cartes de suggestions ─────────────────────────── */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center px-10 md:px-16"
        style={{ width: "45%", zIndex: 20 }}
      >
        <AnimatePresence mode="wait">

          {/* Awakening loader */}
          {robotState === "awakening" && (
            <motion.div
              key="awakening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <motion.div
                className="w-12 h-12 border border-blue-400/30 rounded-full"
                animate={{ rotate: 360, borderColor: ["rgba(96,165,250,0.3)", "rgba(96,165,250,0.8)", "rgba(96,165,250,0.3)"] }}
                transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, borderColor: { duration: 1.5, repeat: Infinity } }}
              />
              <p
                className="text-white/20 text-xs font-bold uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Initialisation de l'Oracle...
              </p>
            </motion.div>
          )}

          {/* Thinking */}
          {robotState === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ThinkingDots />
            </motion.div>
          )}

          {/* Cartes suggestions (sans bulle de sous-titre) */}
          {(robotState === "speaking" || robotState === "waiting" || robotState === "farewell") && (
            <motion.div
              key="speaking-zone"
              className="flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnimatePresence>
                {cards.length > 0 && robotState === "waiting" && (
                  <motion.div
                    key="cards"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p
                      className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-3"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Choisissez une réponse
                    </p>
                    <SuggestionCards
                      cards={cards}
                      onSelect={handleCardSelect}
                      disabled={robotState !== "waiting"}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Header — Badge Oracle ─────────────────────────────────────── */}
      <div className="absolute top-6 left-6 z-30">
        <div className="flex flex-col gap-2">
          <motion.p
            className="text-white/20 text-[9px] font-bold uppercase tracking-[0.5em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Oracle — Autoslash AI
          </motion.p>
          <RobotStatusBadge state={robotState} />
        </div>
      </div>

      {/* ── Ambient glow bleu bas ─────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "30%",
          background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,80,255,0.06) 0%, transparent 70%)",
        }}
      />

      {/* ── Grille subtile ───────────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none">
        <defs>
          <pattern id="s2-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0066ff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#s2-grid)" />
      </svg>

    </div>
  );
}
