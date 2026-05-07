"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { supabase } from "@/lib/supabaseClient";
import { Send, RotateCcw, ArrowRight, ChevronRight } from "lucide-react";

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
  isTyping?: boolean;
}

// ─── AGENT VISUAL CONFIG ─────────────────────────────────────────────────────

const AGENT_CONFIG: Record<string, {
  color: string;
  glow: string;
  icon: string;
  grid: string;
}> = {
  "Agent Support":     { color: "#A8E6CF", glow: "rgba(168,230,207,0.15)", icon: "◎", grid: "rgba(168,230,207,0.03)" },
  "Agent Commercial":  { color: "#FFD3B6", glow: "rgba(255,211,182,0.15)", icon: "◈", grid: "rgba(255,211,182,0.03)" },
  "Agent Contenu":     { color: "#FFEAA7", glow: "rgba(255,234,167,0.15)", icon: "◉", grid: "rgba(255,234,167,0.03)" },
  "Agent RAG":         { color: "#DDD6FE", glow: "rgba(221,214,254,0.15)", icon: "◍", grid: "rgba(221,214,254,0.03)" },
  "Agent Mentor":      { color: "#FFFFFF", glow: "rgba(255,255,255,0.12)", icon: "✦",  grid: "rgba(255,255,255,0.03)" },
};

const getConfig = (name: string) =>
  AGENT_CONFIG[name] || { color: "#ffffff", glow: "rgba(255,255,255,0.1)", icon: "◎", grid: "rgba(255,255,255,0.03)" };

// ─── PARTICLE BACKGROUND ─────────────────────────────────────────────────────

function ParticleField({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={color} strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.2,
          }}
        />
      ))}

      {/* Diagonal accent line */}
      <div
        className="absolute top-0 right-0 w-px h-full opacity-10"
        style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }}
      />
    </div>
  );
}

// ─── TYPING ANIMATION ─────────────────────────────────────────────────────────

function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── AGENT CARD (HERO) ────────────────────────────────────────────────────────

function AgentCard({
  agent,
  isSelected,
  onClick,
  index,
}: {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const cfg = getConfig(agent.name);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-60, 60], [8, -8]);
  const rotateY = useTransform(mouseX, [-60, 60], [-8, 8]);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const resetMouse = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
      className="flex-1 min-w-[180px] max-w-[220px]"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouse}
        onMouseLeave={resetMouse}
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        className="cursor-pointer h-full"
      >
        <div
          className="relative h-[200px] rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-500"
          style={{
            background: isSelected
              ? `linear-gradient(135deg, ${cfg.color}15 0%, ${cfg.color}05 100%)`
              : "rgba(255,255,255,0.02)",
            border: `1px solid ${isSelected ? cfg.color + "40" : "rgba(255,255,255,0.06)"}`,
            boxShadow: isSelected ? `0 0 40px ${cfg.glow}, inset 0 0 20px ${cfg.color}08` : "none",
          }}
        >
          {/* Active pulse */}
          {isSelected && (
            <motion.div
              className="absolute top-3 right-3 w-2 h-2 rounded-full"
              style={{ backgroundColor: cfg.color }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Icon */}
          <div
            className="text-3xl font-black leading-none"
            style={{ color: isSelected ? cfg.color : "rgba(255,255,255,0.2)" }}
          >
            {cfg.icon}
          </div>

          {/* Info */}
          <div>
            <p
              className="text-[11px] font-black uppercase tracking-widest mb-1"
              style={{ color: isSelected ? cfg.color : "rgba(255,255,255,0.4)" }}
            >
              {agent.name.replace("Agent ", "")}
            </p>
            <p className="text-white/20 text-[10px] leading-tight">{agent.sector}</p>
          </div>

          {/* Shimmer on selected */}
          {isSelected && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(105deg, transparent 40%, ${cfg.color}08 50%, transparent 60%)`,
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AgentsDemo() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [msgCount, setMsgCount] = useState(0);
  const [redirectTarget, setRedirectTarget] = useState<Agent | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch agents
  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const { data } = await supabase
        .from("demo_agents")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (data?.length) {
        setAgents(data);
        initAgent(data[0]);
      }
      setIsFetching(false);
    })();
  }, []);

  // ── Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Init agent conversation
  const initAgent = useCallback((agent: Agent) => {
    setSelected(agent);
    setMsgCount(0);
    setRedirectTarget(null);
    setShowSuggestions(true);
    setInput("");
    setMessages([{
      role: "assistant",
      content: agent.opening_questions?.[0] ??
        `Bonjour ! Je suis ${agent.name}. Comment puis-je vous aider ?`,
    }]);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [agents]);

  // ── Check redirect
  const checkRedirect = useCallback((text: string, agent: Agent) => {
    if (!agent.redirect_rules) return;
    for (const [sector, targetName] of Object.entries(agent.redirect_rules)) {
      if (text.toLowerCase().includes(sector.toLowerCase())) {
        const target = agents.find(a =>
          a.name.toLowerCase().includes(targetName.replace("agent-", ""))
        );
        if (target) { setRedirectTarget(target); return; }
      }
    }
  }, [agents]);

  // ── Send message
  const send = useCallback(async (content: string) => {
    if (!content.trim() || !selected || isLoading || msgCount >= selected.max_messages) return;

    const userMsg: Message = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setMsgCount(c => c + 1);
    setShowSuggestions(false);
    checkRedirect(content, selected);

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          system: selected.system_prompt,
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
  }, [selected, isLoading, msgCount, messages, checkRedirect]);

  const cfg = selected ? getConfig(selected.name) : getConfig("");
  const isMaxReached = msgCount >= (selected?.max_messages ?? 5);

  // ─── LOADING STATE
  if (isFetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 border border-white/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
            Initialisation des agents
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── DYNAMIC BACKGROUND */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected?.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <ParticleField color={cfg.color} />
          {/* Ambient glow bottom */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20"
            style={{ background: cfg.color }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16">

        {/* ── HERO HEADER */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cfg.color }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white/30 text-[10px] font-bold tracking-[0.5em] uppercase">
              Démonstration Live — Autoslash AI
            </span>
          </motion.div>

          <div className="overflow-hidden mb-4">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              NOS AGENTS
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-none"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: cfg.color,
                opacity: 0.25,
              }}
            >
              EN ACTION.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md text-white/40 text-sm leading-relaxed"
          >
            Chaque agent est entraîné pour répondre comme un expert humain.
            Sélectionnez un agent et engagez une vraie conversation.
          </motion.p>
        </div>

        {/* ── AGENT SELECTOR CARDS */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-2 scrollbar-hide">
          {agents.map((agent, i) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selected?.id === agent.id}
              onClick={() => initAgent(agent)}
              index={i}
            />
          ))}
        </div>

        {/* ── CHAT INTERFACE */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(10,10,10,0.8)",
                border: `1px solid ${cfg.color}20`,
                backdropFilter: "blur(20px)",
                boxShadow: `0 0 60px ${cfg.glow}`,
              }}
            >

              {/* Chat header */}
              <div
                className="px-8 py-5 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${cfg.color}10` }}
              >
                <div className="flex items-center gap-4">
                  {/* Agent avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black"
                    style={{
                      background: `${cfg.color}10`,
                      border: `1px solid ${cfg.color}30`,
                      color: cfg.color,
                    }}
                  >
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-tight">
                      {selected.name}
                    </p>
                    <p className="text-white/30 text-[11px]">{selected.tagline}</p>
                  </div>
                  {/* Online indicator */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                      En ligne
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Message counter dots */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: selected.max_messages }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i < msgCount ? cfg.color : "rgba(255,255,255,0.1)",
                          boxShadow: i < msgCount ? `0 0 6px ${cfg.color}` : "none",
                        }}
                      />
                    ))}
                    <span className="text-white/20 text-[10px] ml-2">
                      {msgCount}/{selected.max_messages}
                    </span>
                  </div>

                  {/* Reset */}
                  <motion.button
                    onClick={() => initAgent(selected)}
                    whileHover={{ rotate: -180 }}
                    transition={{ duration: 0.4 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <RotateCcw size={13} className="text-white/30" />
                  </motion.button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[420px] overflow-y-auto px-8 py-6 space-y-5 scroll-smooth">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {/* Agent avatar */}
                      {msg.role === "assistant" && (
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-1"
                          style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}20`, color: cfg.color }}
                        >
                          {cfg.icon}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className="max-w-[72%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed"
                        style={msg.role === "user" ? {
                          background: cfg.color,
                          color: "#000",
                          fontWeight: 600,
                          borderRadius: "18px 18px 4px 18px",
                        } : {
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(255,255,255,0.75)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "18px 18px 18px 4px",
                        }}
                      >
                        {msg.content}
                      </div>

                      {/* User avatar */}
                      {msg.role === "user" && (
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 mt-1"
                          style={{ background: cfg.color, color: "#000" }}
                        >
                          Vs
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                        style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}20`, color: cfg.color }}
                      >
                        {cfg.icon}
                      </div>
                      <div
                        className="px-4 py-3 rounded-2xl rounded-tl-sm"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <TypingDots color={cfg.color} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Redirect suggestion */}
              <AnimatePresence>
                {redirectTarget && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-8 py-3 flex items-center justify-between"
                    style={{ borderTop: `1px solid ${cfg.color}10`, background: `${cfg.color}05` }}
                  >
                    <p className="text-white/40 text-xs">
                      💡 <span style={{ color: cfg.color }}>{redirectTarget.name}</span> serait plus adapté à votre secteur
                    </p>
                    <button
                      onClick={() => { initAgent(redirectTarget); setRedirectTarget(null); }}
                      className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest hover:gap-2.5 transition-all"
                      style={{ color: cfg.color }}
                    >
                      Essayer <ChevronRight size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggested prompts */}
              <AnimatePresence>
                {showSuggestions && !isMaxReached && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-8 py-4"
                    style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}
                  >
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-3">
                      Exemples de cas d'usage
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.suggested_prompts?.slice(0, 3).map((sp, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => send(sp.prompt)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-4 py-2 rounded-full text-[11px] font-medium transition-all"
                          style={{
                            background: `${cfg.color}10`,
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

              {/* Max reached CTA */}
              <AnimatePresence>
                {isMaxReached && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-8 py-5 flex items-center justify-between"
                    style={{ borderTop: `1px solid ${cfg.color}15`, background: `${cfg.color}05` }}
                  >
                    <div>
                      <p className="text-white/60 text-sm font-medium mb-0.5">
                        Vous avez découvert le potentiel de {selected.name}.
                      </p>
                      <p className="text-white/25 text-xs">
                        Prêt à le déployer dans votre entreprise ?
                      </p>
                    </div>
                    <a
                      href="/contact"
                      className="flex items-center gap-2 px-6 py-3 rounded-full font-black text-[11px] uppercase tracking-widest transition-all hover:gap-3"
                      style={{ background: cfg.color, color: "#000" }}
                    >
                      Démarrer <ArrowRight size={13} />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              {!isMaxReached && (
                <div
                  className="px-8 py-5"
                  style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}
                >
                  <div
                    className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-all duration-300 focus-within:shadow-lg"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid rgba(255,255,255,0.08)`,
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = cfg.color + "40";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && send(input)}
                      placeholder={`Parlez à ${selected.name}...`}
                      disabled={isLoading}
                      className="flex-1 bg-transparent outline-none text-white/70 text-sm placeholder:text-white/15 disabled:opacity-50"
                    />
                    <motion.button
                      onClick={() => send(input)}
                      disabled={isLoading || !input.trim()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all"
                      style={{ background: cfg.color }}
                    >
                      <Send size={14} className="text-black" />
                    </motion.button>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BOTTOM CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex items-center justify-between"
        >
          <p className="text-white/15 text-xs">
            Les agents sont alimentés par Claude AI — Anthropic
          </p>
          <a
            href="/contact"
            className="flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white hover:gap-3 transition-all"
          >
            Déployer dans mon entreprise <ArrowRight size={12} />
          </a>
        </motion.div>

      </div>
    </div>
  );
}
