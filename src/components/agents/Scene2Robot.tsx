/**
 * Scene2Robot.tsx — Oracle Autoslash AI
 * ───────────────────────────────────────
 * Flux en 2 tours :
 *   TOUR 1 → Oracle demande le secteur/métier du visiteur
 *   TOUR 2 → Oracle recommande Agent Business OU Agent Commercial
 *            selon le secteur → Scène 3 hyperspace → bonne destination
 *
 * SOLUTION TEMPORAIRE :
 *   Cartes cliquables prégénérées (pas de micro)
 *   Robot dit que ses circuits d'écoute sont en maintenance
 *
 * SOLUTION LONG TERME (Phase 2) :
 *   ElevenLabs voix naturelle + micro bidirectionnel
 *   n8n webhook → Atlas (agent commercial) dès prospect identifié
 *   Auth Clerk → robot appelle le visiteur par son prénom
 *   Supabase stocke chaque interaction pour qualification
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

type RobotState = "awakening" | "speaking" | "waiting" | "thinking" | "farewell";
type ConvTurn   = "sector" | "need" | "done";

interface Scene2Props {
  onComplete: (destination: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// DESTINATIONS — chemins avec "/" obligatoire
// ═══════════════════════════════════════════════════════════════

const DESTINATIONS = {
  agentBusiness:    "/agents-demo?agent=business",
  agentCommercial:  "/agents-demo?agent=commercial",
  clientProjects:   "/client-projects",
  pricing:          "/pricing",
  blog:             "/blog",
  contact:          "/contact",
} as const;

// ═══════════════════════════════════════════════════════════════
// CARTES PAR TOUR
// ═══════════════════════════════════════════════════════════════

// Tour 1 — Secteur
const SECTOR_CARDS: Card[] = [
  { label: "Entrepreneuriat / Startup", value: "entrepreneur", emoji: "🚀" },
  { label: "Commerce & Ventes",         value: "commercial",   emoji: "📈" },
  { label: "E-commerce",                value: "ecommerce",    emoji: "🛒" },
  { label: "Santé / Clinique",          value: "sante",        emoji: "🏥" },
  { label: "Finance / Assurance",       value: "finance",      emoji: "💼" },
  { label: "Immobilier",                value: "immobilier",   emoji: "🏠" },
];

// Tour 2 — Besoin (selon secteur)
const NEED_CARDS: Record<string, Card[]> = {
  entrepreneur: [
    { label: "Lancer mon projet avec l'IA",     value: "launch",    emoji: "⚡" },
    { label: "Scaler mon business rapidement",  value: "scale",     emoji: "📊" },
    { label: "Automatiser mes opérations",      value: "automate",  emoji: "🤖" },
    { label: "Voir les offres d'abord",         value: "pricing",   emoji: "💡" },
  ],
  commercial: [
    { label: "Automatiser ma prospection",      value: "prospect",  emoji: "🎯" },
    { label: "Convertir plus de leads",         value: "convert",   emoji: "💰" },
    { label: "Agent commercial IA en démo",     value: "demo_com",  emoji: "🤝" },
    { label: "Voir nos réalisations",           value: "projects",  emoji: "🏆" },
  ],
  ecommerce: [
    { label: "Automatiser le support client",   value: "support",   emoji: "💬" },
    { label: "Agent vente sur WhatsApp",        value: "whatsapp",  emoji: "📱" },
    { label: "Voir l'agent en démonstration",   value: "demo_com",  emoji: "🤖" },
    { label: "Découvrir les offres",            value: "pricing",   emoji: "💡" },
  ],
  sante: [
    { label: "Gestion automatisée des RDV",     value: "rdv",       emoji: "📅" },
    { label: "Support patient intelligent",     value: "support",   emoji: "💬" },
    { label: "Voir une démonstration live",     value: "demo_biz",  emoji: "🤖" },
    { label: "Parler à l'équipe",               value: "contact",   emoji: "✉️" },
  ],
  finance: [
    { label: "Analyser mes documents IA",       value: "rag",       emoji: "📄" },
    { label: "Automatiser le support client",   value: "support",   emoji: "💬" },
    { label: "Voir nos réalisations Finance",   value: "projects",  emoji: "🏆" },
    { label: "Parler à l'équipe",               value: "contact",   emoji: "✉️" },
  ],
  immobilier: [
    { label: "Qualifier mes prospects auto",    value: "prospect",  emoji: "🎯" },
    { label: "Agent commercial en démo",        value: "demo_com",  emoji: "🤝" },
    { label: "Voir nos projets Immobilier",     value: "projects",  emoji: "🏆" },
    { label: "Découvrir les offres",            value: "pricing",   emoji: "💡" },
  ],
};

// Fallback si secteur inconnu
const DEFAULT_NEED_CARDS: Card[] = [
  { label: "Voir les agents IA en démo",    value: "demo_biz",  emoji: "🤖" },
  { label: "Découvrir nos offres",          value: "pricing",   emoji: "💡" },
  { label: "Voir nos réalisations",         value: "projects",  emoji: "🏆" },
  { label: "Parler à l'équipe",             value: "contact",   emoji: "✉️" },
];

// Mapping valeur besoin → destination
const NEED_TO_DEST: Record<string, string> = {
  launch:    DESTINATIONS.agentBusiness,
  scale:     DESTINATIONS.agentBusiness,
  automate:  DESTINATIONS.agentBusiness,
  rdv:       DESTINATIONS.agentBusiness,
  rag:       DESTINATIONS.agentBusiness,
  demo_biz:  DESTINATIONS.agentBusiness,
  prospect:  DESTINATIONS.agentCommercial,
  convert:   DESTINATIONS.agentCommercial,
  whatsapp:  DESTINATIONS.agentCommercial,
  demo_com:  DESTINATIONS.agentCommercial,
  support:   DESTINATIONS.agentCommercial,
  pricing:   DESTINATIONS.pricing,
  projects:  DESTINATIONS.clientProjects,
  contact:   DESTINATIONS.contact,
};

// Textes d'au revoir selon destination
const FAREWELL: Record<string, string> = {
  [DESTINATIONS.agentBusiness]:   "Je vous emmène rencontrer notre Agent Business. Préparez-vous.",
  [DESTINATIONS.agentCommercial]: "Direction notre Agent Commercial. Il va vous impressionner.",
  [DESTINATIONS.clientProjects]:  "Découvrez ce que nous avons livré pour nos clients.",
  [DESTINATIONS.pricing]:         "Voici nos offres. Tout est transparent.",
  [DESTINATIONS.blog]:            "Notre blog vous attend avec les dernières actualités.",
  [DESTINATIONS.contact]:         "Notre équipe vous attend. À très bientôt.",
};

// ═══════════════════════════════════════════════════════════════
// HOOK : SYNTHÈSE VOCALE
// ═══════════════════════════════════════════════════════════════

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const speakRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; u.rate = 0.85; u.pitch = 0.7; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find(v => v.lang.startsWith("fr")) ?? voices[0];
    if (fr) u.voice = fr;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => { setSpeaking(false); onEnd?.(); };
    u.onerror = () => { setSpeaking(false); onEnd?.(); };
    speakRef.current = u;
    window.speechSynthesis.speak(u);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : GLOW BOUCHE
// ═══════════════════════════════════════════════════════════════

function MouthGlow({ speaking }: { speaking: boolean }) {
  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{ left: "50%", top: "37%", transform: "translate(-50%, -50%)" }}
    >
      <AnimatePresence>
        {speaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Lèvre supérieure */}
            <motion.div
              style={{
                width: 50, height: 5, borderRadius: 10,
                background: "linear-gradient(90deg, transparent, rgba(0,180,255,0.9), rgba(120,220,255,1), rgba(0,180,255,0.9), transparent)",
                boxShadow: "0 0 14px 5px rgba(0,180,255,0.7)",
                marginBottom: 4,
              }}
              animate={{ scaleY: [1, 0.5, 1.3, 0.8, 1], opacity: [0.9, 1, 0.8, 1, 0.9] }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
            {/* Lèvre inférieure */}
            <motion.div
              style={{
                width: 40, height: 4, borderRadius: 10, margin: "0 auto",
                background: "linear-gradient(90deg, transparent, rgba(0,150,255,0.7), rgba(80,200,255,0.9), rgba(0,150,255,0.7), transparent)",
                boxShadow: "0 0 10px 3px rgba(0,150,255,0.6)",
              }}
              animate={{ scaleY: [1, 1.5, 0.7, 1.2, 1], opacity: [0.8, 1, 0.7, 0.9, 0.8] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : CARTES CLIQUABLES
// ═══════════════════════════════════════════════════════════════

function Cards({ cards, onSelect, disabled }: {
  cards: Card[];
  onSelect: (c: Card) => void;
  disabled: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col gap-2.5"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {cards.map((card, i) => (
        <motion.button
          key={card.value}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          onClick={() => !disabled && onSelect(card)}
          disabled={disabled}
          whileHover={!disabled ? { x: 8, scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.97 } : {}}
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left transition-all group"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(16px)",
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.4 : 1,
          }}
        >
          {card.emoji && <span className="text-lg shrink-0">{card.emoji}</span>}
          <span
            className="text-white/80 font-bold text-sm group-hover:text-white transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {card.label}
          </span>
          <motion.span
            className="ml-auto text-white/20 group-hover:text-blue-400 transition-colors"
            animate={!disabled ? { x: [0, 3, 0] } : {}}
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
// COMPOSANT : BULLE DE PAROLE
// ═══════════════════════════════════════════════════════════════

function SpeechBubble({ text, visible }: { text: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="px-5 py-4 rounded-2xl mb-4"
          style={{
            background: "rgba(0,0,0,0.65)",
            border: "1px solid rgba(0,150,255,0.2)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 30px rgba(0,80,255,0.1)",
            maxWidth: 340,
          }}
        >
          <p
            className="text-white/80 text-sm leading-relaxed"
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
// SCÈNE 2 — COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function Scene2Robot({ onComplete }: Scene2Props) {
  const navigate = useNavigate();

  const [robotState, setRobotState] = useState<RobotState>("awakening");
  const [convTurn, setConvTurn]     = useState<ConvTurn>("sector");
  const [cards, setCards]           = useState<Card[]>([]);
  const [speech, setSpeech]         = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [splineReady, setSplineReady] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const navigatedRef = useRef(false); // évite double navigation

  const { speak, stop, speaking } = useSpeech();

  // ── Navigation sécurisée (une seule fois) ──────────────────────────────
  const goTo = useCallback((dest: string) => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    onComplete(dest);
  }, [onComplete]);

  // ── Au revoir → Scène 3 ───────────────────────────────────────────────
  const farewell = useCallback((dest: string) => {
    stop();
    setCards([]);
    setRobotState("farewell");

    const text = FAREWELL[dest] ?? "Je vous guide vers votre destination.";
    setSpeech(text);
    setShowBubble(true);

    // Voix → puis naviguer
    speak(text, () => setTimeout(() => goTo(dest), 400));
    // Failsafe : si voix ne démarre pas dans 3s → naviguer quand même
    setTimeout(() => goTo(dest), 3000);
  }, [stop, speak, goTo]);

  // ── Tour 1 : sélection du secteur ─────────────────────────────────────
  const handleSectorSelect = useCallback((card: Card) => {
    if (robotState !== "waiting") return;
    setSelectedSector(card.value);
    stop();
    setCards([]);
    setShowBubble(false);
    setRobotState("thinking");

    setTimeout(() => {
      const needCards = NEED_CARDS[card.value] ?? DEFAULT_NEED_CARDS;
      const q2 = "Et quel est votre besoin principal ?";
      setSpeech(q2);
      setRobotState("speaking");
      setShowBubble(true);
      setConvTurn("need");

      speak(q2, () => {
        setRobotState("waiting");
        setCards(needCards);
      });

      // Failsafe voix
      setTimeout(() => {
        if (robotState !== "waiting") return;
        setRobotState("waiting");
        setCards(needCards);
      }, 2500);
    }, 500);
  }, [robotState, stop, speak]);

  // ── Tour 2 : sélection du besoin → destination ────────────────────────
  const handleNeedSelect = useCallback((card: Card) => {
    if (robotState !== "waiting") return;
    const dest = NEED_TO_DEST[card.value] ?? DESTINATIONS.agentBusiness;
    farewell(dest);
  }, [robotState, farewell]);

  // ── Dispatch sélection selon le tour ──────────────────────────────────
  const handleCardSelect = useCallback((card: Card) => {
    if (convTurn === "sector") handleSectorSelect(card);
    else                       handleNeedSelect(card);
  }, [convTurn, handleSectorSelect, handleNeedSelect]);

  // ── Séquence d'éveil ──────────────────────────────────────────────────
  useEffect(() => {
    if (!splineReady) return;
    window.speechSynthesis?.getVoices();

    const t = setTimeout(() => {
      const intro = "Mes circuits d'écoute sont en maintenance. J'utilise des cartes pour vous comprendre. Dans quel secteur évoluez-vous ?";
      setSpeech(intro);
      setRobotState("speaking");
      setShowBubble(true);

      speak(intro, () => {
        setRobotState("waiting");
        setCards(SECTOR_CARDS);
      });

      // Failsafe
      setTimeout(() => {
        setRobotState("waiting");
        setCards(SECTOR_CARDS);
      }, 5000);
    }, 1000);

    return () => clearTimeout(t);
  }, [splineReady, speak]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">

      {/* ── Robot Spline ────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              className="w-16 h-16 border border-blue-400/20 rounded-full"
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

        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black/85 to-transparent" />
        </div>
      </div>

      {/* ── Glow bouche ─────────────────────────────────────────────── */}
      <MouthGlow speaking={speaking} />

      {/* ── Zone gauche — bulle + cartes ────────────────────────────── */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center px-8 md:px-14 z-20"
        style={{ width: "46%" }}
      >
        {/* Awakening loader */}
        <AnimatePresence>
          {robotState === "awakening" && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div
                className="w-8 h-8 border border-blue-400/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Initialisation...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking dots */}
        <AnimatePresence>
          {robotState === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-blue-400"
                  animate={{ opacity: [0.3,1,0.3], scale: [0.8,1.2,0.8] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulle + Cartes */}
        <AnimatePresence>
          {(robotState === "speaking" || robotState === "waiting" || robotState === "farewell") && (
            <motion.div key="content" className="flex flex-col gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <SpeechBubble text={speech} visible={showBubble} />

              {cards.length > 0 && robotState === "waiting" && (
                <div>
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-3"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {convTurn === "sector" ? "Votre secteur" : "Votre besoin"}
                  </p>
                  <Cards
                    cards={cards}
                    onSelect={handleCardSelect}
                    disabled={robotState !== "waiting"}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Badge Oracle ─────────────────────────────────────────────── */}
      <div className="absolute top-5 left-5 z-30 flex flex-col gap-1.5">
        <p className="text-white/15 text-[9px] font-bold uppercase tracking-[0.5em]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Oracle — Autoslash AI
        </p>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: robotState === "waiting" ? "#fbbf24" : robotState === "farewell" ? "#f87171" : "#60a5fa" }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-white/25 text-[10px] font-bold uppercase tracking-widest"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {{
              awakening: "Initialisation",
              speaking:  "En ligne",
              waiting:   "En attente",
              thinking:  "Analyse...",
              farewell:  "Au revoir",
            }[robotState]}
          </span>
        </div>
      </div>

      {/* ── Ambient glow ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "30%", background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,60,255,0.05) 0%, transparent 70%)" }}
      />

      {/* ── Grille subtile ───────────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none">
        <defs>
          <pattern id="g2" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0066ff" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g2)"/>
      </svg>

    </div>
  );
}
