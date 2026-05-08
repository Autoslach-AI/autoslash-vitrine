/**
 * Scene2Robot.tsx — L'Oracle Autoslash AI
 * ─────────────────────────────────────────
 * Robot Spline 3D qui :
 *   - S'éveille avec une animation d'entrée
 *   - Parle via Web Speech API (synthèse vocale)
 *   - Montre un glow lumineux sur la bouche quand il parle
 *   - Génère des cartes réponses dynamiques via Claude API
 *   - Guide le visiteur vers la bonne destination
 *
 * SOLUTION TEMPORAIRE (maintenant) :
 *   Cartes cliquables générées par Claude → pas de micro nécessaire
 *
 * SOLUTION LONG TERME (plus tard) :
 *   ElevenLabs pour voix naturelle + reconnaissance vocale bidirectionnelle
 *   n8n déclenche l'agent commercial Atlas dès qu'un prospect est identifié
 *   Auth Clerk → robot appelle le visiteur par son prénom
 */

import { Suspense, lazy, useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

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
    {"label": "texte court", "value": "clé"},
    ...max 4 cartes
  ],
  "destination": null
}

Quand tu as assez d'information (confidence > 0.75) :
{
  "speech": "phrase de recommandation enthousiaste courte",
  "cards": [],
  "destination": "clé-destination"
}

PREMIER TOUR — Toujours commencer par :
{
  "speech": "Bonjour. Mes circuits d'écoute sont en maintenance, j'utilise des cartes pour vous comprendre. Qu'est-ce qui vous amène ici ?",
  "cards": [
    {"label": "Voir vos agents IA", "value": "agents"},
    {"label": "Vos réalisations", "value": "projects"},
    {"label": "Tarifs et offres", "value": "pricing"},
    {"label": "Parler à l'équipe", "value": "contact"}
  ],
  "destination": null
}

RECADRAGE — Si le visiteur choisit quelque chose hors sujet :
Réponds avec une card qui recadre poliment vers l'écosystème Autoslash AI.`;

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
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : GLOW BOUCHE ROBOT
// ═══════════════════════════════════════════════════════════════

function MouthGlow({ speaking, robotShifted }: { speaking: boolean; robotShifted: boolean }) {
  // Position approximative de la bouche du robot sur l'écran
  // Robot centré → bouche ~50% horizontal, ~38% vertical
  // Robot shifté droite (25%) → bouche ~62% horizontal
  const left = robotShifted ? "62%" : "50%";

  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{ left, top: "38%", transform: "translate(-50%, -50%)" }}
    >
      <AnimatePresence>
        {speaking && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.3 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Lèvres lumineuses */}
            <motion.div
              className="relative"
              style={{ width: 48, height: 14 }}
            >
              {/* Lèvre supérieure */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 48,
                  height: 5,
                  top: 0,
                  background: "linear-gradient(90deg, transparent, rgba(0,180,255,0.9), rgba(100,220,255,1), rgba(0,180,255,0.9), transparent)",
                  boxShadow: "0 0 12px 4px rgba(0,180,255,0.7), 0 0 24px 8px rgba(0,100,255,0.4)",
                  filter: "blur(0.5px)",
                }}
                animate={{
                  scaleY: [1, 0.6, 1.2, 0.8, 1],
                  opacity: [0.9, 1, 0.8, 1, 0.9],
                }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Lèvre inférieure */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 40,
                  height: 4,
                  bottom: 0,
                  left: 4,
                  background: "linear-gradient(90deg, transparent, rgba(0,150,255,0.7), rgba(80,200,255,0.9), rgba(0,150,255,0.7), transparent)",
                  boxShadow: "0 0 10px 3px rgba(0,150,255,0.6)",
                  filter: "blur(0.5px)",
                }}
                animate={{
                  scaleY: [1, 1.4, 0.7, 1.2, 1],
                  opacity: [0.8, 1, 0.7, 0.9, 0.8],
                }}
                transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              />
              {/* Halo global */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(ellipse, rgba(0,180,255,0.3) 0%, transparent 70%)",
                  transform: "scale(2.5)",
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-2.5"
    >
      {cards.map((card, i) => (
        <motion.button
          key={`${card.value}-${i}`}
          initial={{ opacity: 0, x: -30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => !disabled && onSelect(card)}
          disabled={disabled}
          whileHover={!disabled ? { x: 6, scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-300 group max-w-[280px]"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 14px rgba(0,0,0,0.2)",
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {/* Label */}
          <span
            className="text-white font-medium text-xs group-hover:text-blue-300 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {card.label}
          </span>

          {/* Flèche */}
          <motion.span
            className="ml-auto text-white/10 group-hover:text-white/40 transition-colors text-[10px]"
            animate={disabled ? {} : { x: [0, 2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </motion.button>
      ))}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : BULLE CONVERSATION
// ═══════════════════════════════════════════════════════════════

function SpeechBubble({ text, visible }: { text: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.4 }}
          className="px-6 py-4 rounded-2xl max-w-sm"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(0,150,255,0.25)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 30px rgba(0,100,255,0.15)",
          }}
        >
          <p
            className="text-white/85 text-sm leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : INDICATEUR ÉTAT ROBOT
// ═══════════════════════════════════════════════════════════════

function RobotStatusBadge({ state }: { state: RobotState }) {
  const config: Record<RobotState, { label: string; color: string }> = {
    awakening: { label: "Initialisation...",  color: "#60a5fa" },
    speaking:  { label: "En ligne",           color: "#34d399" },
    waiting:   { label: "En attente",         color: "#fbbf24" },
    thinking:  { label: "Analyse en cours...", color: "#a78bfa" },
    farewell:  { label: "À bientôt",          color: "#f87171" },
  };
  const { label, color } = config[state];

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span
        className="text-white/30 text-[10px] font-bold uppercase tracking-widest"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : POINTS DE CHARGEMENT
// ═══════════════════════════════════════════════════════════════

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-blue-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCÈNE 2 — COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function Scene2Robot({ onComplete }: Scene2Props) {
  const [robotState, setRobotState]   = useState<RobotState>("awakening");
  const [cards, setCards]             = useState<Card[]>([]);
  const [currentSpeech, setSpeech]    = useState("");
  const [showBubble, setShowBubble]   = useState(false);
  const [robotShifted, setRobotShifted] = useState(false);
  const [splineReady, setSplineReady] = useState(false);
  const [history, setHistory]         = useState<{ role: string; content: string }[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const { speak, stop, speaking } = useSpeech();
  const fallbackSaidRef = useRef(false);

  // ── Appel Oracle Claude ────────────────────────────────────────────────
  const callOracle = useCallback(async (userMessage: string) => {
    setRobotState("thinking");
    setCards([]);
    setShowBubble(false);

    const newHistory = [
      ...history,
      { role: "user", content: userMessage },
    ];
    setHistory(newHistory);

    try {
      // NOTE: Appel client-side direct à Anthropic bloqué par CORS normalement
      // Ici on simule ou on attend une erreur pour déclencher le fallback
      const API_KEY = process.env.ANTHROPIC_API_KEY; 

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": API_KEY ?? "",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 400,
          system: ORACLE_SYSTEM,
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
        throw new Error("JSON Parse Error");
      }

      setHistory(prev => [...prev, { role: "assistant", content: parsed.speech }]);

      // Destination trouvée → farewell + transition
      if (parsed.destination && DEST_CONFIG[parsed.destination]) {
        setRobotShifted(true);
        setRobotState("farewell");
        setSpeech(parsed.speech);
        setShowBubble(true);
        speak(parsed.speech, () => {
          setTimeout(() => onComplete(parsed.destination!), 600);
        });
        return;
      }

      // Continuer la conversation
      setSpeech(parsed.speech);
      setRobotState("speaking");
      setShowBubble(true);

      speak(parsed.speech, () => {
        setRobotState("waiting");
        if (parsed.cards?.length) {
          setRobotShifted(true);
          setCards(parsed.cards);
        }
      });

    } catch (error) {
      console.warn("Oracle Fallback Triggered", error);
      const fallback = "Une perturbation dans mes circuits. Dites-moi simplement ce que vous cherchez.";
      
      setRobotState("speaking");
      
      // On ne montre pas la bulle pour le fallback (demande utilisateur)
      setShowBubble(false);
      
      // On ne dit la phrase qu'une seule fois (demande utilisateur)
      if (!fallbackSaidRef.current) {
        speak(fallback, () => {
          setRobotState("waiting");
          fallbackSaidRef.current = true;
          setCards([
            { label: "Tester les agents IA",  value: "agents" },
            { label: "Voir les réalisations",  value: "projects" },
            { label: "Découvrir les offres",   value: "pricing" },
            { label: "Parler à l'équipe",      value: "contact" },
          ]);
        });
      } else {
        setRobotState("waiting");
        setCards([
          { label: "Tester les agents IA",  value: "agents" },
          { label: "Voir les réalisations",  value: "projects" },
          { label: "Découvrir les offres",   value: "pricing" },
          { label: "Parler à l'équipe",      value: "contact" },
        ]);
      }
    }
  }, [history, speak, onComplete]);

  // ── Séquence d'éveil ──────────────────────────────────────────────────
  useEffect(() => {
    if (!splineReady) return;

    // Charger les voix
    window.speechSynthesis?.getVoices();

    const timer = setTimeout(() => {
      callOracle("__INIT__");
    }, 1200);

    return () => clearTimeout(timer);
  }, [splineReady]);

  // ── Sélection d'une carte ─────────────────────────────────────────────
  const handleCardSelect = useCallback((card: Card) => {
    if (robotState === "thinking" || robotState === "speaking") return;

    // SI LE VISITEUR VEUT TESTER LES AGENTS -> ON LUI PROPOSE LES DEUX OPTIONS
    if (card.value === "agents") {
      setSpeech("Très bien. Quel agent souhaitez-vous mettre à l'épreuve ?");
      setCards([
        { label: "Agent Business", value: "agent_business" },
        { label: "Agent Commercial", value: "agent_commercial" },
      ]);
      setRobotState("speaking");
      setShowBubble(true);
      speak("Très bien. Quel agent souhaitez-vous mettre à l'épreuve ?", () => {
        setRobotState("waiting");
      });
      return;
    }

    const DIRECT_DESTINATIONS: Record<string, string> = {
      agents:           "agents-demo",
      agent_business:   "agent_business",
      agent_commercial: "agent_commercial",
      projects:         "client-projects",
      pricing:          "pricing",
      blog:             "blog",
      contact:          "contact",
    };

    const FAREWELL_SPEECHES: Record<string, string> = {
      "agent_business":   "Compris. Je vous transfère vers l'Agent Business.",
      "agent_commercial": "C'est noté. L'Agent Commercial vous attend.",
      "agents-demo":      "Parfait. Je vous emmène voir nos agents en action.",
      "client-projects":  "Excellent. Découvrez nos réalisations concrètes.",
      "pricing":          "Je vous guide vers nos offres et packages.",
      "blog":             "Direction notre blog et actualités.",
      "contact":          "Notre équipe vous attend.",
    };

    stop();
    setCards([]);
    setShowBubble(false);
    setRobotState("farewell");
    setRobotShifted(false);

    const dest = DIRECT_DESTINATIONS[card.value] ?? "contact";
    const speech = FAREWELL_SPEECHES[dest] ?? "Je vous guide vers votre destination.";

    setSpeech(speech);
    setShowBubble(true);

    // Parler → puis déclencher Scène 3
    speak(speech, () => {
      setTimeout(() => onComplete(dest), 300);
    });

    // Failsafe si voix indisponible → déclenche après 2.5s
    const failsafe = setTimeout(() => onComplete(dest), 2500);

    // Annuler failsafe si voix a fonctionné
    return () => clearTimeout(failsafe);

  }, [robotState, stop, speak, onComplete]);

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

      {/* ── Zone gauche — bulle + cartes ─────────────────────────────── */}
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

          {/* Speaking + waiting */}
          {(robotState === "speaking" || robotState === "waiting" || robotState === "farewell") && (
            <motion.div
              key="speaking-zone"
              className="flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Bulle de parole */}
              <SpeechBubble text={currentSpeech} visible={showBubble} />

              {/* Cartes suggestions */}
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
