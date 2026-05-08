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

// --- Scene4Vocal (The Commercial Agent Interface) ---
export default function Scene4Vocal() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Bonjour ! Je suis votre Agent Commercial Vocal.");

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-between py-12 px-6">
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
      <div className="flex flex-col items-center gap-8">
        <motion.div
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <SiriOrb
            size="280px"
            animationDuration={isListening ? 5 : 20}
            className="drop-shadow-[0_0_50px_rgba(168,85,247,0.3)]"
            colors={{
              c1: "oklch(65% 0.25 280)",
              c2: "oklch(70% 0.2 320)",
              c3: "oklch(75% 0.15 350)"
            }}
          />
        </motion.div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isListening ? "Je vous écoute..." : status}
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wide">
            {isListening ? "Parlez maintenant" : "Cliquez sur le micro pour commencer"}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-xs flex items-center justify-center gap-8">
        <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:bg-white/10 transition-colors">
          <X size={20} />
        </button>
        
        <motion.button
          onClick={() => setIsListening(!isListening)}
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

      {/* Footer info */}
      <div className="text-[10px] text-white/10 font-bold uppercase tracking-[0.3em]">
        Autoslash AI · Agent Vocal Beta · Haute Fidélité
      </div>
    </div>
  );
}
