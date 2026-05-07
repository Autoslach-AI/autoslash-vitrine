"use client";

/**
 * AgentsDemo.tsx — Autoslash AI
 * ─────────────────────────────
 * Page de démonstration interactive des agents IA
 * Architecture en 4 actes :
 *   ACTE 1 → Robot Spline plein écran + message d'accueil animé
 *   ACTE 2 → Question au visiteur + choix de l'agent
 *   ACTE 3 → Recommandation + carte agent + téléportation
 *   ACTE 4 → Chat plein écran immersif avec l'agent choisi
 *
 * Dépendances requises :
 *   npm install @splinetool/react-spline @splinetool/runtime
 *
 * Le composant SplineScene doit exister dans :
 *   src/components/ui/splite.tsx
 */

import { Suspense, lazy, useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { Send, RotateCcw, ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Spline lazy load ────────────────────────────────────────────────────────
const Spline = lazy(() => import("@splinetool/react-spline"));

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  use_case: string;
  system_prompt: string;
  opening_questions: string[];
  suggested_prompts: { label: string; prompt: string }[];
  compatible_sectors: string[];
  redirect_rules: Record<string, string>;
  max_messages: number;
  display_order: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Act = "intro" | "questions" | "recommendation" | "chat";

// ─── VISUAL CONFIG PAR AGENT ─────────────────────────────────────────────────

const AGENT_CONFIG: Record<string, { color: string; glow: string; icon: string }> = {
  "Agent Support":    { color: "#A8E6CF", glow: "rgba(168,230,207,0.25)", icon: "◎" },
  "Agent Commercial": { color: "#FFD3B6", glow: "rgba(255,211,182,0.25)", icon: "◈" },
  "Agent Contenu":    { color: "#FFEAA7", glow: "rgba(255,234,167,0.25)", icon: "◉" },
  "Agent RAG":        { color: "#DDD6FE", glow: "rgba(221,214,254,0.25)", icon: "◍" },
  "Agent Mentor":     { color: "#FFFFFF", glow: "rgba(255,255,255,0.18)", icon: "✦"  },
};

const getCfg = (name: string) =>
  AGENT_CONFIG[name] ?? { color: "#ffffff", glow: "rgba(255,255,255,0.1)", icon: "◎" };

// ─── MAPPING RÉPONSE → AGENT ──────────────────────────────────────────────────

const INTRO_QUESTION = {
  text: "Qu'attendez-vous vraiment de l'IA pour votre entreprise ?",
  options: [
    { label: "Automatiser mon support client",  value: "support"     },
    { label: "Convertir plus de prospects",      value: "commercial"  },
    { label: "Créer du contenu en masse",        value: "contenu"     },
    { label: "Exploiter mes données internes",   value: "rag"         },
    { label: "Être guidé stratégiquement",       value: "mentor"      },
  ],
};

const AGENT_MAP: Record<string, string> = {
  support:    "Agent Support",
  commercial: "Agent Commercial",
  contenu:    "Agent Contenu",
  rag:        "Agent RAG",
  mentor:     "Agent Mentor",
};

// ─── COMPOSANT : TEXTE ANIMÉ LETTRE PAR LETTRE ───────────────────────────────

function TypingText({ text, speed = 28, onDone }: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[0.85em] bg-white align-middle ml-1 rounded-full"
        />
      )}
    </span>
  );
}

// ─── COMPOSANT : POINTS DE CHARGEMENT ────────────────────────────────────────

function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── COMPOSANT : CURSEUR PERSONNALISÉ ────────────────────────────────────────

function CustomCursor({ act }: { act: Act }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true); };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseleave", leave); };
  }, []);

  if (act === "chat") return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-50 rounded-full mix-blend-screen"
      style={{
        width: 12,
        height: 12,
        background: "rgba(255,255,255,0.9)",
        left: pos.x - 6,
        top: pos.y - 6,
        boxShadow: "0 0 20px 6px rgba(255,255,255,0.3)",
      }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
    />
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function AgentsDemo() {
  // ── State global
  const [agents, setAgents] = useState<Agent[]>([]);
  const [act, setAct] = useState<Act>("intro");
  const [questionReady, setQuestionReady] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [recommendedAgent, setRecommendedAgent] = useState<Agent | null>(null);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [splineReady, setSplineReady] = useState(false);

  // ── State chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // ── State téléportation
  const [teleporting, setTeleporting] = useState(false);
  const [teleportColor, setTeleportColor] = useState("#ffffff");

  // ── Refs
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch agents depuis Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("demo_agents")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (!error && data) setAgents(data);
    })();
  }, []);

  // ── Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Sélection réponse → recommandation
  const handleAnswer = useCallback((value: string) => {
    setSelectedAnswer(value);
    const agentName = AGENT_MAP[value];
    const agent = agents.find(a => a.name === agentName) ?? agents[0];
    setRecommendedAgent(agent);
    setTimeout(() => setAct("recommendation"), 500);
  }, [agents]);

  // ── Téléportation vers le chat
  const handleTeleport = useCallback((agent: Agent) => {
    const c = getCfg(agent.name);
    setTeleportColor(c.color);
    setTeleporting(true);

    setTimeout(() => {
      setActiveAgent(agent);
      setMessages([{
        role: "assistant",
        content: agent.opening_questions?.[0] ??
          `Bonjour ! Je suis ${agent.name}. Comment puis-je vous aider ?`,
      }]);
      setMsgCount(0);
      setShowSuggestions(true);
      setInput("");
    }, 700);

    setTimeout(() => {
      setAct("chat");
      setTeleporting(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }, 1400);
  }, []);

  // ── Envoi message → Claude API
  const send = useCallback(async (content: string) => {
    if (!content.trim() || !activeAgent || isLoading || msgCount >= activeAgent.max_messages) return;

    const userMsg: Message = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setMsgCount(c => c + 1);
    setShowSuggestions(false);

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: activeAgent.system_prompt,
          messages: history,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content?.[0]?.text ?? "Une erreur est survenue.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connexion interrompue. Veuillez réessayer.",
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [activeAgent, isLoading, msgCount, messages]);

  // ── Helpers
  const cfg = activeAgent ? getCfg(activeAgent.name) : { color: "#fff", glow: "", icon: "◎" };
  const recCfg = recommendedAgent ? getCfg(recommendedAgent.name) : { color: "#fff", glow: "", icon: "◎" };
  const isMaxReached = msgCount >= (activeAgent?.max_messages ?? 5);

  // ══════════════════════════════════════════════════════════════════════════
  // FLASH DE TÉLÉPORTATION
  // ══════════════════════════════════════════════════════════════════════════

  if (teleporting) {
    return (
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
        style={{ background: "#000" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{ duration: 1.4, times: [0, 0.6, 1] }}
      >
        {/* Explosion de couleur */}
        <motion.div
          className="rounded-full"
          style={{ width: 60, height: 60, background: teleportColor }}
          animate={{
            scale: [0, 1, 40],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Rayons */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px origin-center"
            style={{
              height: "60vh",
              background: `linear-gradient(to top, ${teleportColor}, transparent)`,
              rotate: `${i * 45}deg`,
              transformOrigin: "50% 100%",
              bottom: "50%",
              left: "50%",
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          />
        ))}
      </motion.div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDU PRINCIPAL
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div
      className="min-h-screen bg-black overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", cursor: act !== "chat" ? "none" : "auto" }}
    >
      {/* Curseur personnalisé */}
      <CustomCursor act={act} />

      {/* ════════════════════════════════════════════════════════════════════
          SCÈNE ROBOT — ACTES 1, 2, 3
      ════════════════════════════════════════════════════════════════════ */}

      <AnimatePresence>
        {act !== "chat" && (
          <motion.div
            key="robot-scene"
            className="fixed inset-0 z-10"
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Robot Spline plein écran */}
            <div className="absolute inset-0">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <motion.div
                      className="w-20 h-20 border border-white/10 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                }
              >
                <Spline
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                  onLoad={() => setSplineReady(true)}
                />
              </Suspense>
            </div>

            {/* ── Overlays de profondeur */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Fondu bas */}
              <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/50 to-transparent" />
              {/* Fondu gauche */}
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/75 to-transparent" />
              {/* Grain subtil */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                  backgroundSize: "200px 200px",
                }}
              />
            </div>

            {/* ── Zone de texte — bas gauche */}
            <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 lg:px-24 pb-12 md:pb-20">

              <AnimatePresence mode="wait">

                {/* ── ACTE 1 — Message d'accueil */}
                {act === "intro" && (
                  <motion.div
                    key="intro"
                    className="max-w-2xl"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: splineReady ? 1 : 0, y: splineReady ? 0 : 60 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      className="flex items-center gap-3 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-white"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-white/25 text-[10px] font-bold tracking-[0.6em] uppercase">
                        Autoslash AI — Interface
                      </span>
                    </motion.div>

                    <h1
                      className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {splineReady ? (
                        <TypingText
                          text="Bonjour. Je suis votre interface Autoslash AI."
                          onDone={() => setTimeout(() => setAct("questions"), 1000)}
                        />
                      ) : (
                        <span className="opacity-0">.</span>
                      )}
                    </h1>
                  </motion.div>
                )}

                {/* ── ACTE 2 — Question */}
                {act === "questions" && (
                  <motion.div
                    key="questions"
                    className="max-w-3xl"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-white/25 text-[10px] font-bold tracking-[0.6em] uppercase mb-5">
                      Avant tout
                    </p>

                    <h2
                      className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-10"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      <TypingText
                        text={INTRO_QUESTION.text}
                        speed={22}
                        onDone={() => setQuestionReady(true)}
                      />
                    </h2>

                    {/* Options cliquables */}
                    <AnimatePresence>
                      {questionReady && (
                        <motion.div
                          className="flex flex-wrap gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          {INTRO_QUESTION.options.map((opt, i) => (
                            <motion.button
                              key={opt.value}
                              initial={{ opacity: 0, y: 24, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              onClick={() => handleAnswer(opt.value)}
                              whileHover={{ scale: 1.05, y: -3 }}
                              whileTap={{ scale: 0.97 }}
                              className="relative px-6 py-3 rounded-full text-sm font-bold transition-all duration-300"
                              style={{
                                background: selectedAnswer === opt.value
                                  ? "rgba(255,255,255,0.95)"
                                  : "rgba(255,255,255,0.07)",
                                border: `1px solid ${selectedAnswer === opt.value
                                  ? "rgba(255,255,255,0.95)"
                                  : "rgba(255,255,255,0.15)"}`,
                                color: selectedAnswer === opt.value ? "#000" : "rgba(255,255,255,0.85)",
                                backdropFilter: "blur(16px)",
                                boxShadow: selectedAnswer === opt.value
                                  ? "0 0 30px rgba(255,255,255,0.2)"
                                  : "none",
                              }}
                            >
                              {opt.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* ── ACTE 3 — Recommandation */}
                {act === "recommendation" && recommendedAgent && (
                  <motion.div
                    key="recommendation"
                    className="max-w-4xl"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-white/25 text-[10px] font-bold tracking-[0.6em] uppercase mb-5">
                      Ma recommandation
                    </p>

                    <h2
                      className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-[1.1] mb-10"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      <TypingText
                        text={`J'ai l'agent qu'il vous faut. Rencontrez ${recommendedAgent.name}.`}
                        speed={20}
                      />
                    </h2>

                    <div className="flex flex-wrap gap-5 items-start">

                      {/* Carte agent recommandé */}
                      <motion.button
                        initial={{ opacity: 0, y: 40, scale: 0.93 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => handleTeleport(recommendedAgent)}
                        whileHover={{ scale: 1.03, y: -6 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative overflow-hidden rounded-3xl p-7 text-left"
                        style={{
                          background: `linear-gradient(135deg, ${recCfg.color}20 0%, ${recCfg.color}06 100%)`,
                          border: `1px solid ${recCfg.color}40`,
                          boxShadow: `0 0 80px ${recCfg.glow}, 0 24px 80px rgba(0,0,0,0.7)`,
                          minWidth: 260,
                          maxWidth: 320,
                          backdropFilter: "blur(20px)",
                        }}
                      >
                        {/* Shimmer animé */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(110deg, transparent 25%, ${recCfg.color}12 50%, transparent 75%)`,
                          }}
                          animate={{ x: ["-120%", "220%"] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 1 }}
                        />

                        {/* Header carte */}
                        <div className="flex items-start justify-between mb-6">
                          <span
                            className="text-4xl leading-none"
                            style={{ color: recCfg.color }}
                          >
                            {recCfg.icon}
                          </span>
                          <motion.div
                            className="flex items-center gap-1.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                          >
                            <motion.div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: recCfg.color }}
                              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <span
                              className="text-[9px] font-black uppercase tracking-widest"
                              style={{ color: recCfg.color }}
                            >
                              Recommandé
                            </span>
                          </motion.div>
                        </div>

                        {/* Infos agent */}
                        <p
                          className="text-xl font-black uppercase tracking-tight mb-2"
                          style={{ color: recCfg.color, fontFamily: "'Playfair Display', serif" }}
                        >
                          {recommendedAgent.name}
                        </p>
                        <p className="text-white/35 text-xs leading-relaxed mb-7">
                          {recommendedAgent.tagline}
                        </p>

                        {/* CTA */}
                        <div
                          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all"
                          style={{ color: recCfg.color }}
                        >
                          Entrer dans l'espace <ArrowRight size={12} />
                        </div>
                      </motion.button>

                      {/* Liste autres agents */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3, duration: 0.6 }}
                        className="flex flex-col gap-2"
                      >
                        <p className="text-white/15 text-[10px] font-bold uppercase tracking-widest mb-2">
                          Autres agents disponibles
                        </p>
                        {agents
                          .filter(a => a.id !== recommendedAgent.id)
                          .map((agent, i) => {
                            const c = getCfg(agent.name);
                            return (
                              <motion.button
                                key={agent.id}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.4 + i * 0.08 }}
                                onClick={() => handleTeleport(agent)}
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  border: `1px solid ${c.color}18`,
                                  backdropFilter: "blur(10px)",
                                }}
                              >
                                <span style={{ color: c.color }} className="text-sm">{c.icon}</span>
                                <span className="text-white/40 text-xs font-bold">
                                  {agent.name.replace("Agent ", "")}
                                </span>
                                <ArrowRight size={10} className="text-white/15 ml-auto" />
                              </motion.button>
                            );
                          })}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════
          ACTE 4 — CHAT PLEIN ÉCRAN IMMERSIF
      ════════════════════════════════════════════════════════════════════ */}

      <AnimatePresence>
        {act === "chat" && activeAgent && (
          <motion.div
            key="chat"
            className="fixed inset-0 z-20 flex flex-col"
            style={{ background: "#020202" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.15 }}
          >
            {/* Ambient glow selon la couleur de l'agent */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              style={{
                background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${cfg.color}07 0%, transparent 70%)`,
              }}
            />

            {/* Grille subtile */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none">
              <defs>
                <pattern id="chat-grid" width="52" height="52" patternUnits="userSpaceOnUse">
                  <path d="M 52 0 L 0 0 0 52" fill="none" stroke={cfg.color} strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#chat-grid)" />
            </svg>

            {/* ── HEADER */}
            <div
              className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              {/* Identité agent */}
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
                  style={{
                    background: `${cfg.color}10`,
                    border: `1px solid ${cfg.color}28`,
                    color: cfg.color,
                    boxShadow: `0 0 20px ${cfg.color}15`,
                  }}
                >
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-tight">
                    {activeAgent.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                      En ligne
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {/* Barre de progression messages */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: activeAgent.max_messages }).map((_, i) => (
                    <div
                      key={i}
                      className="transition-all duration-500 rounded-full"
                      style={{
                        width: i < msgCount ? "16px" : "6px",
                        height: "6px",
                        backgroundColor: i < msgCount ? cfg.color : "rgba(255,255,255,0.08)",
                        boxShadow: i < msgCount ? `0 0 8px ${cfg.color}80` : "none",
                      }}
                    />
                  ))}
                  <span className="text-white/15 text-[10px] ml-2 font-mono">
                    {msgCount}/{activeAgent.max_messages}
                  </span>
                </div>

                {/* Reset conversation */}
                <motion.button
                  onClick={() => {
                    setMessages([{
                      role: "assistant",
                      content: activeAgent.opening_questions?.[0] ?? "Bonjour !",
                    }]);
                    setMsgCount(0);
                    setShowSuggestions(true);
                  }}
                  whileHover={{ rotate: -180 }}
                  transition={{ duration: 0.4 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <RotateCcw size={13} className="text-white/25" />
                </motion.button>

                {/* Recommencer depuis le début */}
                <button
                  onClick={() => {
                    setAct("intro");
                    setQuestionReady(false);
                    setSelectedAnswer(null);
                    setSplineReady(false);
                    setTimeout(() => setSplineReady(true), 100);
                  }}
                  className="text-white/15 text-[10px] font-bold uppercase tracking-widest hover:text-white/40 transition-colors hidden md:block"
                >
                  Recommencer
                </button>
              </div>
            </div>

            {/* ── MESSAGES */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 md:px-16 lg:px-24 py-8 space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Avatar agent */}
                    {msg.role === "assistant" && (
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-base shrink-0 mt-1"
                        style={{
                          background: `${cfg.color}10`,
                          border: `1px solid ${cfg.color}22`,
                          color: cfg.color,
                        }}
                      >
                        {cfg.icon}
                      </div>
                    )}

                    {/* Bulle de message */}
                    <div
                      className="max-w-[68%] md:max-w-[60%] px-5 py-4 text-sm leading-relaxed"
                      style={msg.role === "user" ? {
                        background: cfg.color,
                        color: "#000",
                        fontWeight: 600,
                        borderRadius: "20px 20px 5px 20px",
                        boxShadow: `0 4px 20px ${cfg.color}25`,
                      } : {
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.78)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "20px 20px 20px 5px",
                      }}
                    >
                      {msg.content}
                    </div>

                    {/* Avatar utilisateur */}
                    {msg.role === "user" && (
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black shrink-0 mt-1"
                        style={{ background: cfg.color, color: "#000" }}
                      >
                        Vs
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Indicateur de frappe */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center text-base shrink-0"
                      style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}22`, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <div
                      className="px-5 py-3 rounded-3xl rounded-tl-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <TypingDots color={cfg.color} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* ── PROMPTS SUGGÉRÉS */}
            <AnimatePresence>
              {showSuggestions && !isMaxReached && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative z-10 px-6 md:px-16 lg:px-24 py-4 shrink-0"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <p className="text-white/15 text-[10px] font-bold uppercase tracking-widest mb-3">
                    Exemples de cas d'usage
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeAgent.suggested_prompts?.slice(0, 3).map((sp, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => send(sp.prompt)}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-4 py-2 rounded-full text-[11px] font-medium transition-all"
                        style={{
                          background: `${cfg.color}0D`,
                          border: `1px solid ${cfg.color}25`,
                          color: cfg.color,
                        }}
                      >
                        {sp.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── LIMITE ATTEINTE → CTA */}
            <AnimatePresence>
              {isMaxReached && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 px-6 md:px-16 lg:px-24 py-5 flex items-center justify-between shrink-0"
                  style={{
                    borderTop: `1px solid ${cfg.color}18`,
                    background: `${cfg.color}05`,
                  }}
                >
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-1">
                      Vous avez découvert {activeAgent.name}.
                    </p>
                    <p className="text-white/25 text-xs">
                      Prêt à le déployer dans votre entreprise ?
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="flex items-center gap-2 px-7 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:gap-3 transition-all"
                    style={{ background: cfg.color, color: "#000", boxShadow: `0 0 30px ${cfg.color}40` }}
                  >
                    Démarrer <ArrowRight size={13} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── INPUT */}
            {!isMaxReached && (
              <div
                className="relative z-10 px-6 md:px-16 lg:px-24 py-5 shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div
                  className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-300 focus-within:border-opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                    placeholder={`Parlez à ${activeAgent.name}...`}
                    disabled={isLoading}
                    className="flex-1 bg-transparent outline-none text-white/70 text-sm placeholder:text-white/12 disabled:opacity-30"
                  />
                  <motion.button
                    onClick={() => send(input)}
                    disabled={isLoading || !input.trim()}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-20 shrink-0 transition-all"
                    style={{ background: cfg.color, boxShadow: `0 0 20px ${cfg.color}40` }}
                  >
                    <Send size={15} className="text-black" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* ── FLÈCHE CONTACT DISCRÈTE */}
            <motion.div
              className="relative z-10 flex justify-center pb-3 shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              <Link
                to="/contact"
                className="flex flex-col items-center gap-1 group"
                style={{ color: "rgba(255,255,255,0.1)" }}
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] group-hover:opacity-50 transition-opacity">
                  Déployer dans mon entreprise
                </span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowDown size={11} />
                </motion.div>
              </Link>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
