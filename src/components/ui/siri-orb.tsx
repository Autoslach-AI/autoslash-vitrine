"use client"

import { cn } from "@/lib/utils";
import * as React from "react";
import { useState } from "react";
import { Settings, Mic, X, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Minimal Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "candy" | "default"
  size?: "sm" | "md"
}
const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
  const variants: Record<string, string> = {
    default:
      "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    candy: "bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500",
  }
  const sizes: Record<string, string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
  }
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

// --- SiriOrb Component ---
interface SiriOrbProps {
  size?: string
  className?: string
  colors?: {
    bg?: string
    c1?: string
    c2?: string
    c3?: string
  }
  animationDuration?: number
}
export const SiriOrb: React.FC<SiriOrbProps> = ({
  size = "192px",
  className,
  colors,
  animationDuration = 20,
}) => {
  const defaultColors = {
    bg: "transparent",
    c1: "oklch(75% 0.15 350)",
    c2: "oklch(80% 0.12 200)", 
    c3: "oklch(78% 0.14 280)",
  }

  const finalColors = { ...defaultColors, ...colors }
  const sizeValue = parseInt(size.replace("px", ""), 10)

  const blurAmount = Math.max(sizeValue * 0.08, 8)
  const contrastAmount = Math.max(sizeValue * 0.003, 1.8)

  return (
    <div
      className={cn("siri-orb", className)}
      style={
        {
          width: size,
          height: size,
          "--bg": finalColors.bg,
          "--c1": finalColors.c1,
          "--c2": finalColors.c2,
          "--c3": finalColors.c3,
          "--animation-duration": `${animationDuration}s`,
          "--blur-amount": `${blurAmount}px`,
          "--contrast-amount": contrastAmount,
        } as React.CSSProperties
      }
    >
      <style>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .siri-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(
            circle,
            rgba(0, 0, 0, 0.08) 0%,
            rgba(0, 0, 0, 0.03) 30%,
            transparent 70%
          );
        }

        .dark .siri-orb {
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.02) 30%,
            transparent 70%
          );
        }

        .siri-orb::before {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background:
            conic-gradient(
              from calc(var(--angle) * 1.2) at 30% 65%,
              var(--c3) 0deg,
              transparent 45deg 315deg,
              var(--c3) 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * 0.8) at 70% 35%,
              var(--c2) 0deg,
              transparent 60deg 300deg,
              var(--c2) 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * -1.5) at 65% 75%,
              var(--c1) 0deg,
              transparent 90deg 270deg,
              var(--c1) 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * 2.1) at 25% 25%,
              var(--c2) 0deg,
              transparent 30deg 330deg,
              var(--c2) 360deg
            ),
            conic-gradient(
              from calc(var(--angle) * -0.7) at 80% 80%,
              var(--c1) 0deg,
              transparent 45deg 315deg,
              var(--c1) 360deg
            ),
            radial-gradient(
              ellipse 120% 80% at 40% 60%,
              var(--c3) 0%,
              transparent 50%
            );
          filter: blur(var(--blur-amount)) contrast(var(--contrast-amount)) saturate(1.2);
          animation: rotate var(--animation-duration) linear infinite;
          transform: translateZ(0);
          will-change: transform;
        }

        .siri-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle at 45% 55%,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 30%,
            transparent 60%
          );
          mix-blend-mode: overlay;
        }

        @keyframes rotate {
          from {
            --angle: 0deg;
          }
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .siri-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

// --- Vocal Agent Config (Modifiable plus tard, non codé en dur dans le JSX) ---
const VOCAL_CONFIG = {
  presentation: "Bonjour, je suis votre Agent Autoslash. Cliquez sur le micro pour lancer l'appel avec moi.",
  listening: "Je vous écoute...",
  hint: "Cliquez pour démarrer",
  hintActive: "Appel en cours"
};

// --- Scene4Vocal (The Commercial Agent Interface) ---
export default function Scene4Vocal() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState(""); // Vide au départ (Efface le texte fixe)

  // L'agent se présente dynamiquement après l'arrivée sur la page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setStatus(VOCAL_CONFIG.presentation);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-between py-12 px-6">
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-lg shadow-purple-500/20 text-white">AS</div>
          <div>
            <h2 className="text-white font-bold text-sm tracking-tight">AGENT COMMERCIAL</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Système Actif</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-white/5 text-white/20 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Center: The Orb focus */}
      <div className="flex flex-col items-center gap-16">
        <motion.div
          animate={{
            scale: isListening ? [1, 1.08, 1] : [1, 1.02, 1],
          }}
          transition={{
            duration: isListening ? 2 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <SiriOrb
            size="340px"
            animationDuration={isListening ? 3 : 20}
            className="drop-shadow-[0_0_100px_rgba(139,92,246,0.1)]"
            colors={{
              c1: "oklch(55% 0.2 280)",
              c2: "oklch(60% 0.15 320)",
              c3: "oklch(65% 0.1 350)"
            }}
          />
        </motion.div>
        
        <div className="text-center h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                key={isListening ? "listening" : status}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="max-w-xl"
              >
                <h1 className="text-xl md:text-2xl font-medium text-white/80 tracking-tight leading-relaxed italic opacity-90" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {isListening ? VOCAL_CONFIG.listening : status}
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full flex flex-col items-center gap-8">
        <div className="flex items-center justify-center gap-12">
          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
          
          <motion.button
            onClick={() => setIsListening(!isListening)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl",
              isListening 
                ? "bg-red-500 text-white shadow-[0_0_60px_rgba(239,68,68,0.3)] border-4 border-red-400/20" 
                : "bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.1)] hover:shadow-white/20"
            )}
          >
            <Mic size={36} className={cn("transition-transform duration-500", isListening ? "scale-110" : "scale-100")} />
          </motion.button>

          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all">
            <Settings size={20} />
          </button>
        </div>

        <p className="text-[9px] text-white/10 font-bold uppercase tracking-[0.6em] mb-4">
          Autoslash AI · Agent Vocal Propulsé par ElevenLabs
        </p>
      </div>

      {/* Decorative Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Footer Info */}
      <div className="absolute bottom-6 text-[9px] text-white/10 font-bold uppercase tracking-[0.4em]">
        Autoslash AI · Agent Vocal Beta · Haute Fidélité
      </div>
    </div>
  );
}
