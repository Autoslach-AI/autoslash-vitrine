/**
 * Scene4Chat.tsx — Interface de conversation Agent Autoslash AI
 * ──────────────────────────────────────────────────────────────
 * Scène 4 — arrivée après le voyage hyperspace
 *
 * Agent Business   → orbe violet/bleu profond  — stratégie & croissance
 * Agent Commercial → orbe orange/ambre chaud   — ventes & conversion
 *
 * Aucune icône IA générique. Design éditorial premium.
 * Inspiré : Bloomberg Terminal × Wallpaper* Magazine
 */

import * as React from "react";
import {
  useState, useRef, useEffect, useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { Send, RotateCcw, Plus, Sparkles, ChevronDown } from "lucide-react";

import { ShiningText } from "@/components/ui/shining-text";

// ═══════════════════════════════════════════════════════════════
// CONFIG PAR AGENT
// ═══════════════════════════════════════════════════════════════

const AGENT_CONFIG = {
  business: {
    name:       "Agent Business",
    handle:     "AS·BIZ",
    tagline:    "Stratégie · Lancement · Croissance",
    orb1:       "#3b0fa0",
    orb2:       "#0f3fa0",
    accent:     "#7c5cfc",
    accentSoft: "rgba(124,92,252,0.15)",
    border:     "rgba(124,92,252,0.2)",
    greeting:   "Bonjour. Parlez-moi de votre projet ou de votre ambition — je suis là pour vous aider à construire et scaler.",
    prompts: [
      "Lancer mon projet avec l'IA",
      "Passer de 0 à mes 10 premiers clients",
      "Automatiser mes opérations",
      "Définir ma stratégie de croissance",
      "Scaler mon business rapidement",
    ],
  },
  commercial: {
    name:       "Agent Commercial",
    handle:     "AS·COM",
    tagline:    "Prospection · Conversion · Closing",
    orb1:       "#a04f0f",
    orb2:       "#a08a0f",
    accent:     "#f5a623",
    accentSoft: "rgba(245,166,35,0.12)",
    border:     "rgba(245,166,35,0.2)",
    greeting:   "Bonjour. Parlez-moi de vos prospects et objectifs de vente — ensemble on va convertir.",
    prompts: [
      "Qualifier mes leads automatiquement",
      "Script de prospection pour mon secteur",
      "Relancer un prospect froid",
      "Closer une vente qui hésite",
      "Augmenter mon taux de conversion",
    ],
  },
} as const;

type AgentKey = keyof typeof AGENT_CONFIG;

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  ts: number;
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════════

const SYSTEM: Record<AgentKey, string> = {
  business: `Tu es l'Agent Business d'Autoslash AI. Tu es un conseiller stratégique expert en lancement de projet, croissance et transformation digitale par l'IA.
Tu réponds de façon directe, structurée et actionnable. Pas de blabla. Tu poses des questions pertinentes pour affiner ton conseil.
Tu parles de l'écosystème Autoslash AI quand c'est pertinent (agents IA, automatisation, n8n, Supabase).
Si quelqu'un sort du sujet, tu recadres poliment.
Réponds en français. Maximum 4 phrases par réponse sauf si on te demande plus.`,

  commercial: `Tu es l'Agent Commercial d'Autoslash AI. Tu es expert en prospection, qualification de leads, scripts de vente et closing.
Tu réponds de façon directe, percutante et orientée résultats. Chaque réponse doit être immédiatement actionnable.
Tu connais les techniques de vente modernes (SPIN, BANT, social selling) et l'automatisation commerciale via IA.
Si quelqu'un sort du sujet commercial, tu recadres vers les opportunités de vente.
Réponds en français. Sois énergique mais pas agressif. Maximum 4 phrases par réponse sauf si on te demande plus.`,
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : ORB DE FOND
// ═══════════════════════════════════════════════════════════════

function BackgroundOrb({ cfg, pulsing }: { cfg: typeof AGENT_CONFIG[AgentKey]; pulsing: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orbe principal */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "70vw",
          height: "70vw",
          maxWidth: 800,
          maxHeight: 800,
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          background: `radial-gradient(circle, ${cfg.orb1}55 0%, ${cfg.orb2}33 40%, transparent 70%)`,
          filter: "blur(60px)",
        }}
        animate={pulsing ? {
          scale: [1, 1.08, 1],
          opacity: [0.7, 1, 0.7],
        } : {
          scale: 1,
          opacity: 0.7,
        }}
        transition={{ duration: 2.5, repeat: pulsing ? Infinity : 0, ease: "easeInOut" }}
      />

      {/* Orbe secondaire décalé */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: 500,
          maxHeight: 500,
          bottom: "-10%",
          right: "-5%",
          background: `radial-gradient(circle, ${cfg.accent}22 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      {/* Ligne diagonale décorative */}
      <div
        className="absolute opacity-[0.04]"
        style={{
          width: "200%",
          height: 1,
          background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
          top: "35%",
          left: "-50%",
          transform: "rotate(-8deg)",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : BULLE MESSAGE
// ═══════════════════════════════════════════════════════════════

function MessageBubble({ msg, accent }: {
  msg: Message;
  accent: string;
  key?: React.Key;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="w-full flex flex-col items-center mb-10"
    >
      <div className={`w-full max-w-2xl px-6 md:px-0 flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {isUser ? (
          <div
            className="px-6 py-4 text-[15px] leading-relaxed border border-white/5 shadow-2xl"
            style={{
              background: "#111",
              color: "#fff",
              borderRadius: "24px 24px 4px 24px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {msg.content}
          </div>
        ) : (
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Autoslash AI</span>
            </div>
            <div
              className="text-[16px] leading-[1.6] text-white/90"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "pre-wrap"
              }}
            >
              {msg.content}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════

function TypingIndicator({ accent }: { accent: string; key?: React.Key }) {
  return (
    <div className="w-full flex justify-center mb-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-2xl px-6 md:px-0 flex items-center gap-3"
      >
        <ShiningText text="L'agent réfléchit..." />
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : GREETING ANIMÉ
// ═══════════════════════════════════════════════════════════════

function GreetingText({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
        onDone();
      }
    }, 22);
    return () => clearInterval(id);
  }, [text, onDone]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-white align-middle ml-0.5"
        />
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCÈNE 4 — COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface Scene4ChatProps {
  initialMessage?: string;
}

export default function Scene4Chat({ initialMessage }: Scene4ChatProps) {
  const [searchParams]  = useSearchParams();
  const agentKey        = (searchParams.get("agent") ?? "business") as AgentKey;
  const cfg             = AGENT_CONFIG[agentKey] ?? AGENT_CONFIG.business;
  const systemPrompt    = SYSTEM[agentKey] ?? SYSTEM.business;

  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [greetingDone, setGreetingDone] = useState(false);
  const [agentPulsing, setAgentPulsing] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const greetedRef = useRef(false);
  const initialMessageHandled = useRef(false);

  // ── Scroll automatique ─────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Appel Claude API ───────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string, currentMessages?: Message[]) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      ts: Date.now(),
    };

    const msgs = currentMessages || messages;
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setAgentPulsing(true);

    // Historique pour Claude
    const history = [...msgs, userMsg]
      .filter(m => m.id !== "greeting" || m.role === "agent")
      .map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

    try {
      const res = await fetch("https://vrmkpnqjmqztpfowwkzv.supabase.co/functions/v1/chat-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentKey,
          messages: history,
        }),
      });
      const data = await res.json();
      const content = data.content?.[0]?.text ?? "Une erreur est survenue.";

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: "agent",
        content,
        ts: Date.now(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "agent",
        content: "Connexion interrompue. Réessayez.",
        ts: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
      setAgentPulsing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isLoading, systemPrompt]);

  // ── Greeting initial ───────────────────────────────────────────────────
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;

    const timer = setTimeout(() => {
      const gMsg: Message = {
        id: "greeting",
        role: "agent",
        content: cfg.greeting,
        ts: Date.now(),
      };
      setMessages([gMsg]);

      // If initialMessage exists, handle it immediately after greeting is set
      if (initialMessage && !initialMessageHandled.current) {
        initialMessageHandled.current = true;
        setGreetingDone(true); // Skip animation if message comes from intro
        sendMessage(initialMessage, [gMsg]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [cfg.greeting, initialMessage, sendMessage]);

  // ── Prompt rapide → envoi direct ──────────────────────────────────────
  const handleQuickPrompt = useCallback((p: string) => {
    sendMessage(p);
  }, [sendMessage]);

  // ── Auto-resize textarea ───────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isFirstMessage = messages.length <= 1 && !isLoading;

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "#040404", fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ── FOND ANIMÉ ──────────────────────────────────────────────── */}
      <BackgroundOrb cfg={cfg} pulsing={agentPulsing} />

      {/* ══════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════ */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-8 md:px-14 py-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-5">
          {/* Handle monospace */}
          <div
            className="px-3 py-1.5 rounded-lg"
            style={{
              background: cfg.accentSoft,
              border: `1px solid ${cfg.border}`,
            }}
          >
            <span
              className="text-[11px] font-black tracking-widest uppercase"
              style={{ color: cfg.accent, fontFamily: "monospace" }}
            >
              {cfg.handle}
            </span>
          </div>

          <div>
            <p
              className="text-white font-black text-sm uppercase tracking-tight leading-none mb-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {cfg.name}
            </p>
            <p className="text-white/25 text-[10px] tracking-widest uppercase">
              {cfg.tagline}
            </p>
          </div>
        </div>

        {/* Status + Reset */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: cfg.accent }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              />
            <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              {isLoading ? "Réflexion..." : "En ligne"}
            </span>
          </div>

          <motion.button
            onClick={() => {
              greetedRef.current = false;
              setMessages([]);
              setInput("");
              setTimeout(() => {
                greetedRef.current = true;
                setMessages([{
                  id: "greeting-reset",
                  role: "agent",
                  content: cfg.greeting,
                  ts: Date.now(),
                }]);
              }, 100);
            }}
            whileHover={{ rotate: -180 }}
            transition={{ duration: 0.4 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <RotateCcw size={13} className="text-white/25" />
          </motion.button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════
          ZONE MESSAGES
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 overflow-y-auto pt-12 pb-32">
        <div className="w-full max-w-4xl mx-auto flex flex-col">

          {/* Message d'accueil animé lettre par lettre */}
          {messages.length > 0 && messages[0].id.startsWith("greeting") && !greetingDone && (
            <div className="w-full flex justify-center mb-10">
              <div className="w-full max-w-2xl px-6 md:px-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.accent }} />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Système Initialisé</span>
                </div>
                <div
                  className="text-[18px] leading-[1.6] text-white/90 font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <GreetingText
                    text={cfg.greeting}
                    onDone={() => {
                      setGreetingDone(true);
                      setTimeout(() => inputRef.current?.focus(), 200);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Messages après le greeting */}
          <AnimatePresence initial={false}>
            {messages
              .filter(m => !m.id.startsWith("greeting") || greetingDone)
              .map(msg => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  accent={cfg.accent}
                />
              ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isLoading && <TypingIndicator key="typing" accent={cfg.accent} />}
          </AnimatePresence>

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          INPUT FLOTTANT
      ══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-10 bg-gradient-to-t from-[#040404] via-[#040404]/90 to-transparent pointer-events-none">
        <div className="w-full max-w-2xl mx-auto px-6 md:px-0 pointer-events-auto">

          {/* Quick Prompts */}
          <AnimatePresence>
            {isFirstMessage && greetingDone && (
              <motion.div
                key="quick-prompts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {cfg.prompts.map((p, i) => (
                  <motion.button
                    key={p}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleQuickPrompt(p)}
                    className="px-4 py-2 rounded-xl text-[11px] font-bold border border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.05] hover:border-white/10 transition-all uppercase tracking-widest"
                  >
                    {p}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Barre d'input style Doc/Pill */}
          <motion.div
            className="relative bg-[#0d0d0d] rounded-[32px] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-end px-4 py-3 gap-2">

              {/* Bouton Plus */}
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-colors shrink-0 mb-0.5">
                <Plus size={20} />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Écrire un message..."
                disabled={isLoading || !greetingDone}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-white/90 text-[15px] py-2.5 placeholder:text-white/20 leading-relaxed font-medium"
                style={{
                  minHeight: 44,
                  maxHeight: 180,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />

              <div className="flex items-center gap-2 mb-1 shrink-0">
                {/* Model Selector Info */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 mr-1">
                  <Sparkles size={11} className="text-white/30" />
                  <span className="text-[10px] font-bold text-white/30 tracking-tight">Sonnet 3.5</span>
                  <ChevronDown size={10} className="text-white/20" />
                </div>

                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim() || !greetingDone}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white text-black disabled:bg-white/5 disabled:text-white/10"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <p className="text-[9px] text-center mt-4 text-white/10 font-bold uppercase tracking-[0.3em]">
            Autoslash AI · Intelligence Assistée · Infrastructure Stable
          </p>
        </div>
      </div>

    </div>
  );
}
