"use client";

/**
 * AgentsDemo.tsx — Autoslash AI Oracle
 * ══════════════════════════════════════
 * Une expérience en 5 actes :
 *
 * ACTE 0 — ÉVEIL        : Robot dormant → s'éveille au mouvement du curseur
 * ACTE 1 — ORACLE       : Robot parle (Web Speech), pose questions dynamiques (Claude)
 * ACTE 2 — ÉCOUTE       : Visiteur répond à voix haute (SpeechRecognition)
 * ACTE 3 — PORTAIL      : Portail tourbillonnant + carte holographique flottante
 * ACTE 4 — VOYAGE       : Distorsion temporelle → arrivée dans l'autre monde
 *
 * APIs utilisées (zéro coût) :
 *   - Web Speech API (SpeechSynthesis + SpeechRecognition) — natif navigateur
 *   - Claude API — questions dynamiques + guidage intelligent
 *   - Spline — robot 3D interactif
 */

import {
  Suspense, lazy, useEffect, useState, useRef,
  useCallback, useMemo,
} from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const Spline = lazy(() => import("@splinetool/react-spline"));

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type Act = "dormant" | "awakening" | "oracle" | "listening" | "thinking" | "portal" | "traveling";

interface Destination {
  path: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  glow: string;
}

interface OracleMessage {
  role: "user" | "assistant";
  content: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIG DESTINATIONS
// ═══════════════════════════════════════════════════════════════

const DESTINATIONS: Record<string, Destination> = {
  "agents-demo": {
    path: "/agents-demo",
    label: "Les Agents IA",
    description: "Testez nos agents en conditions réelles",
    color: "#A8E6CF",
    glow: "rgba(168,230,207,0.4)",
    icon: "◎",
  },
  "client-projects": {
    path: "/client-projects",
    label: "Nos Réalisations",
    description: "Découvrez l'impact de nos déploiements",
    color: "#FFD3B6",
    glow: "rgba(255,211,182,0.4)",
    icon: "◈",
  },
  "pricing": {
    path: "/pricing",
    label: "Nos Offres",
    description: "Choisissez votre package Autoslash AI",
    color: "#FFEAA7",
    glow: "rgba(255,234,167,0.4)",
    icon: "◉",
  },
  "blog": {
    path: "/blog",
    label: "Le Blog",
    description: "Actualités, études de cas et innovation",
    color: "#DDD6FE",
    glow: "rgba(221,214,254,0.4)",
    icon: "◍",
  },
  "contact": {
    path: "/contact",
    label: "Nous Contacter",
    description: "Parlez à l'équipe Autoslash AI",
    color: "#FFFFFF",
    glow: "rgba(255,255,255,0.35)",
    icon: "✦",
  },
};

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT ORACLE
// ═══════════════════════════════════════════════════════════════

const ORACLE_SYSTEM = `Tu es l'Oracle d'Autoslash AI — une présence intelligente et bienveillante qui accueille les visiteurs du site vitrine.

TON RÔLE :
- Poser des questions naturelles et dynamiques pour comprendre les besoins du visiteur
- Ne JAMAIS poser deux fois la même question
- Adapter ton ton : chaleureux, direct, jamais robotique
- Parler en phrases courtes (max 2 phrases par réponse) pour être dit à voix haute
- Recadrer poliment si le visiteur parle d'autre chose qu'Autoslash AI

DESTINATIONS DISPONIBLES :
- "agents-demo" → tester les agents IA, voir une démonstration, curiosité technique
- "client-projects" → voir des réalisations, projets livrés, preuves concrètes
- "pricing" → tarifs, packages, offres, prix, combien ça coûte
- "blog" → articles, actualités, études de cas, apprendre
- "contact" → parler à l'équipe, poser une question, démarrer un projet

RÈGLE ABSOLUE : Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication.

FORMAT DE RÉPONSE :
{
  "speech": "texte à dire à voix haute (court, naturel, 1-2 phrases max)",
  "subtitle": "même texte pour le sous-titre",
  "action": null ou une clé parmi: agents-demo, client-projects, pricing, blog, contact,
  "confidence": 0 à 1 (certitude que tu as bien compris le besoin),
  "recadrage": false ou true si le visiteur sort du sujet
}

Si confidence > 0.7 → inclure l'action et diriger le visiteur.
Si confidence < 0.7 → action: null, poser une question de précision.
Si recadrage: true → ramener poliment sur l'écosystème Autoslash AI.

EXEMPLES DE QUESTIONS QUE TU PEUX POSER (varie-les !) :
- "Qu'est-ce qui vous a amené ici aujourd'hui ?"
- "Avez-vous déjà utilisé des agents IA dans votre entreprise ?"
- "Quel est votre secteur d'activité ?"
- "Cherchez-vous à automatiser quelque chose de précis ?"
- "Êtes-vous plutôt curieux ou avez-vous un projet concret ?"`;

// ═══════════════════════════════════════════════════════════════
// HOOK : SYNTHÈSE VOCALE
// ═══════════════════════════════════════════════════════════════

function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (muted || !("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.88;
    utterance.pitch = 0.75;
    utterance.volume = 1;

    // Chercher une voix française
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith("fr")) ?? voices[0];
    if (frVoice) utterance.voice = frVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utterance);
  }, [muted]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, muted, setMuted };
}

// ═══════════════════════════════════════════════════════════════
// HOOK : RECONNAISSANCE VOCALE
// ═══════════════════════════════════════════════════════════════

function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => { setIsListening(false); setInterim(""); };

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      setInterim(interimText);
      if (finalText) onResult(finalText);
    };

    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { start, stop, isListening, interim };
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : PORTAIL TOURBILLONNANT
// ═══════════════════════════════════════════════════════════════

function Portal({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
      {/* Anneaux concentriques */}
      {[1, 0.8, 0.6, 0.4, 0.2].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 320 * scale,
            height: 320 * scale,
            borderColor: `${color}${Math.floor((1 - i * 0.15) * 255).toString(16).padStart(2, "0")}`,
            borderWidth: 1.5 - i * 0.2,
          }}
          animate={active ? {
            rotate: i % 2 === 0 ? [0, 360] : [360, 0],
            scale: [scale, scale * 1.04, scale],
          } : { opacity: 0 }}
          transition={{
            rotate: { duration: 4 + i * 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}

      {/* Spirale SVG centrale */}
      <motion.svg
        width="180" height="180" viewBox="0 0 180 180"
        animate={active ? { rotate: [0, 360] } : { opacity: 0 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute" }}
      >
        <defs>
          <radialGradient id="spiral-grad">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 20 + i * 5;
          const x = 90 + r * Math.cos(angle);
          const y = 90 + r * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x} cy={y} r={3 - i * 0.15}
              fill={color}
              opacity={1 - i * 0.07}
            />
          );
        })}
      </motion.svg>

      {/* Cœur lumineux */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 60, height: 60, background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
        animate={active ? { scale: [0.8, 1.3, 0.8], opacity: [0.6, 1, 0.6] } : { opacity: 0 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Particules orbitales */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * 360;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color, top: "50%", left: "50%", marginTop: -3, marginLeft: -3 }}
            animate={active ? {
              x: [0, Math.cos((angle * Math.PI) / 180) * 120, 0],
              y: [0, Math.sin((angle * Math.PI) / 180) * 120, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            } : { opacity: 0 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : CARTE HOLOGRAPHIQUE FLOTTANTE
// ═══════════════════════════════════════════════════════════════

function HoloCard({
  dest,
  onTravel,
}: {
  dest: Destination;
  onTravel: () => void;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 100, damping: 20 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    rotateX.set(-y * 18);
    rotateY.set(x * 18);
  };
  const resetMouse = () => { rotateX.set(0); rotateY.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
    >
      {/* Effet eau / flottement */}
      <motion.div
        animate={{
          y: [0, -14, 0, -8, 0],
          rotate: [0, 0.5, 0, -0.5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouse}
          onMouseLeave={resetMouse}
          onClick={onTravel}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer relative"
        >
          {/* Halo arc-en-ciel rotatif */}
          <motion.div
            className="absolute -inset-3 rounded-3xl opacity-60"
            style={{
              background: `conic-gradient(from 0deg, ${dest.color}, #ff6b9d, #c084fc, #60a5fa, #34d399, ${dest.color})`,
              filter: "blur(12px)",
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Corps de la carte */}
          <div
            className="relative overflow-hidden rounded-3xl p-8"
            style={{
              background: `linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(20,20,20,0.9) 100%)`,
              border: `1px solid ${dest.color}50`,
              boxShadow: `0 0 60px ${dest.glow}, 0 30px 80px rgba(0,0,0,0.8)`,
              width: 280,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(110deg, transparent 20%, ${dest.color}15 50%, transparent 80%)`,
              }}
              animate={{ x: ["-120%", "220%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />

            {/* Icône */}
            <motion.div
              className="text-5xl mb-5 leading-none"
              style={{ color: dest.color }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {dest.icon}
            </motion.div>

            {/* Nom */}
            <p
              className="text-xl font-black uppercase tracking-tight mb-2"
              style={{ color: dest.color, fontFamily: "'Playfair Display', serif" }}
            >
              {dest.label}
            </p>
            <p className="text-white/40 text-xs leading-relaxed mb-6">
              {dest.description}
            </p>

            {/* CTA */}
            <div
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
              style={{ color: dest.color }}
            >
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                Voyager →
              </motion.span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : DISTORSION VOYAGE TEMPOREL
// ═══════════════════════════════════════════════════════════════

function TimeTravel({ color }: { color: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 1, 0] }}
      transition={{ duration: 2.2, times: [0, 0.15, 0.6, 0.85, 1] }}
    >
      {/* Tunnel lumineux */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${(i + 1) * 5}vw`,
            height: `${(i + 1) * 5}vw`,
            borderColor: `${color}${Math.floor((1 - i / 20) * 255).toString(16).padStart(2, "0")}`,
            borderWidth: 1,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 4], opacity: [1, 0] }}
          transition={{
            duration: 1.4,
            delay: i * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}

      {/* Lignes de vitesse */}
      {[...Array(24)].map((_, i) => {
        const angle = (i / 24) * 360;
        return (
          <motion.div
            key={i}
            className="absolute origin-left"
            style={{
              width: "50vw",
              height: 1,
              background: `linear-gradient(to right, ${color}, transparent)`,
              left: "50%",
              top: "50%",
              rotate: `${angle}deg`,
              transformOrigin: "0 0",
            }}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: [0, 1, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1, delay: 0.3 + i * 0.02, ease: "easeOut" }}
          />
        );
      })}

      {/* Flash central */}
      <motion.div
        className="absolute rounded-full"
        style={{ background: color, width: 20, height: 20 }}
        animate={{ scale: [1, 60], opacity: [1, 0] }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Texte */}
      <motion.p
        className="absolute font-black text-white/60 text-[11px] uppercase tracking-[0.5em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.2, times: [0, 0.2, 0.8, 1] }}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Voyage en cours...
      </motion.p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : SOUS-TITRES ANIMÉS
// ═══════════════════════════════════════════════════════════════

function Subtitle({ text, visible }: { text: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl text-center px-8"
        >
          <p
            className="text-white text-xl md:text-2xl font-black leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
          >
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════

export default function AgentsDemo() {
  const navigate = useNavigate();

  // ── State
  const [act, setAct] = useState<Act>("dormant");
  const [splineReady, setSplineReady] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isTimeTravel, setIsTimeTravel] = useState(false);
  const [history, setHistory] = useState<OracleMessage[]>([]);
  const [turnCount, setTurnCount] = useState(0);

  const { speak, stop: stopSpeech, isSpeaking, muted, setMuted } = useSpeechSynthesis();

  // ── Reconnaissance vocale
  const handleVoiceResult = useCallback((text: string) => {
    setUserTranscript(text);
    setAct("thinking");
    askOracle(text);
  }, [history, turnCount]);

  const { start: startListening, stop: stopListening, isListening, interim } =
    useSpeechRecognition(handleVoiceResult);

  // ── Oracle Claude — question dynamique
  const askOracle = useCallback(async (userText: string) => {
    const newHistory: OracleMessage[] = [
      ...history,
      { role: "user", content: userText },
    ];
    setHistory(newHistory);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: ORACLE_SYSTEM,
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text ?? "{}";

      let parsed: {
        speech: string;
        subtitle: string;
        action: string | null;
        confidence: number;
        recadrage: boolean;
      };

      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {
          speech: "Pouvez-vous me préciser ce que vous cherchez sur Autoslash AI ?",
          subtitle: "Pouvez-vous me préciser ce que vous cherchez sur Autoslash AI ?",
          action: null,
          confidence: 0,
          recadrage: false,
        };
      }

      setHistory(prev => [...prev, { role: "assistant", content: parsed.speech }]);
      setTurnCount(c => c + 1);

      // Parler
      oracleSay(parsed.subtitle || parsed.speech, () => {
        if (parsed.action && parsed.confidence >= 0.7 && DESTINATIONS[parsed.action]) {
          // → montrer le portail
          setDestination(DESTINATIONS[parsed.action]);
          setAct("portal");
        } else {
          // → continuer l'écoute
          setAct("listening");
          setTimeout(() => startListening(), 400);
        }
      });

    } catch {
      oracleSay("Une erreur est survenue. Permettez-moi de vous demander — que cherchez-vous sur notre site ?", () => {
        setAct("listening");
        setTimeout(() => startListening(), 400);
      });
    }
  }, [history, turnCount, startListening, speak]);

  // ── Dire quelque chose et afficher sous-titre
  const oracleSay = useCallback((text: string, onEnd?: () => void) => {
    setSubtitle(text);
    setShowSubtitle(true);
    speak(text, () => {
      setTimeout(() => setShowSubtitle(false), 800);
      onEnd?.();
    });
  }, [speak]);

  // ── ÉVEIL au mouvement du curseur
  useEffect(() => {
    if (act !== "dormant" || !splineReady) return;
    const wake = () => {
      setAct("awakening");
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("touchstart", wake);
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("touchstart", wake);
    return () => {
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, [act, splineReady]);

  // ── Séquence d'éveil
  useEffect(() => {
    if (act !== "awakening") return;
    const timer = setTimeout(() => {
      setAct("oracle");
      oracleSay(
        "Bonjour. Je suis l'Oracle d'Autoslash AI. Je suis ici pour vous guider. Qu'est-ce qui vous amène aujourd'hui ?",
        () => {
          setAct("listening");
          setTimeout(() => startListening(), 500);
        }
      );
    }, 1200);
    return () => clearTimeout(timer);
  }, [act]);

  // ── Voyage temporel → navigation
  const handleTravel = useCallback(() => {
    if (!destination) return;
    stopListening();
    stopSpeech();
    setIsTimeTravel(true);
    setTimeout(() => {
      navigate(destination.path);
    }, 1800);
  }, [destination, navigate, stopListening, stopSpeech]);

  // ── Couleur active
  const activeColor = destination?.color ?? "#ffffff";
  const activeGlow = destination?.glow ?? "rgba(255,255,255,0.2)";

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", cursor: "none" }}
    >
      {/* ── CURSEUR PERSONNALISÉ */}
      <CursorDot act={act} />

      {/* ── VOYAGE TEMPOREL */}
      <AnimatePresence>
        {isTimeTravel && destination && (
          <TimeTravel color={destination.color} />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          ROBOT SPLINE — toujours présent sauf voyage
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {!isTimeTravel && (
          <motion.div
            key="robot"
            className="absolute inset-0"
            animate={{
              // Robot glisse à droite quand portail actif
              x: act === "portal" ? "25%" : "0%",
              scale: act === "dormant" ? 0.95 : 1,
            }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  className="w-16 h-16 border border-white/10 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
            }>
              <Spline
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
                onLoad={() => {
                  setSplineReady(true);
                  // Charger les voix
                  window.speechSynthesis?.getVoices();
                }}
              />
            </Suspense>

            {/* Overlays */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/60 to-transparent" />
            </div>

            {/* Effet dormant */}
            <AnimatePresence>
              {act === "dormant" && (
                <motion.div
                  className="absolute inset-0 bg-black"
                  initial={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          PORTAIL + CARTE — côté gauche
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {act === "portal" && destination && !isTimeTravel && (
          <motion.div
            key="portal-zone"
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
            style={{ width: "55%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-8">
              {/* Portail */}
              <Portal color={activeColor} active={true} />

              {/* Carte holographique — émerge du portail */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <HoloCard dest={destination} onTravel={handleTravel} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          SOUS-TITRES — centre bas
      ══════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-20 px-8 gap-6 pointer-events-none z-20">

        {/* Transcript utilisateur */}
        <AnimatePresence>
          {(isListening || userTranscript) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-5 py-2.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <p className="text-white/50 text-sm">
                {isListening ? (interim || "Je vous écoute...") : userTranscript}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sous-titre Oracle */}
        <Subtitle text={subtitle} visible={showSubtitle} />

        {/* Indicateur état */}
        <div className="flex items-center gap-3">
          {act === "dormant" && splineReady && (
            <motion.p
              className="text-white/20 text-[10px] font-bold uppercase tracking-[0.5em]"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Bougez votre curseur pour éveiller l'Oracle
            </motion.p>
          )}

          {act === "listening" && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-3 h-3 rounded-full bg-red-400"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                Parlez maintenant
              </span>
            </motion.div>
          )}

          {act === "thinking" && (
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/40"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest ml-2">
                Analyse en cours...
              </span>
            </div>
          )}

          {act === "portal" && (
            <motion.p
              className="text-white/30 text-[11px] font-bold uppercase tracking-widest"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Cliquez sur la carte pour voyager
            </motion.p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTRÔLES — coin supérieur droit
      ══════════════════════════════════════════ */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
        {/* Couper/activer le son */}
        <motion.button
          onClick={() => setMuted(m => !m)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {muted
            ? <VolumeX size={15} className="text-white/30" />
            : <Volume2 size={15} className="text-white/60" />
          }
        </motion.button>

        {/* Micro manuel */}
        {(act === "oracle" || act === "listening") && (
          <motion.button
            onClick={() => isListening ? stopListening() : startListening()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: isListening ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${isListening ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {isListening
              ? <Mic size={15} className="text-red-400" />
              : <MicOff size={15} className="text-white/40" />
            }
          </motion.button>
        )}

        {/* Recommencer */}
        {act !== "dormant" && (
          <motion.button
            onClick={() => {
              stopSpeech();
              stopListening();
              setAct("dormant");
              setHistory([]);
              setTurnCount(0);
              setDestination(null);
              setSubtitle("");
              setUserTranscript("");
            }}
            whileHover={{ scale: 1.05 }}
            className="text-white/15 text-[10px] font-bold uppercase tracking-widest hover:text-white/35 transition-colors"
          >
            Recommencer
          </motion.button>
        )}
      </div>

      {/* Badge Autoslash */}
      <div className="absolute top-6 left-6 z-30">
        <motion.div
          className="flex items-center gap-2"
          animate={act === "dormant" ? { opacity: 0.3 } : { opacity: 1 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: act === "portal" && destination ? destination.color : "#ffffff" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-white/30 text-[9px] font-bold tracking-[0.5em] uppercase">
            Oracle — Autoslash AI
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT : CURSEUR PERSONNALISÉ
// ═══════════════════════════════════════════════════════════════

function CursorDot({ act }: { act: Act }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true); };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseleave", leave); };
  }, []);

  const size = act === "portal" ? 20 : 10;

  return (
    <motion.div
      className="fixed pointer-events-none z-50 rounded-full mix-blend-screen"
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.9)",
        left: pos.x - size / 2,
        top: pos.y - size / 2,
        boxShadow: `0 0 ${size * 2}px ${size}px rgba(255,255,255,0.2)`,
      }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }}
      transition={{ duration: 0.12 }}
    />
  );
}
