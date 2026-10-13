"use client";

/**
 * AgentCards.tsx — Cartes déplaçables + étapes de recherche
 *
 * Format attendu plus tard depuis l'Edge Function chat-agent :
 *   { content: [...], steps?: AgentStepData[], cards?: AgentCardData[] }
 */

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

export interface AgentCardData {
  id: string;
  title: string;
  subtitle?: string;
  rows?: { label: string; value: string }[];
  text?: string;
  links?: { label: string; url: string }[];
}

export interface AgentStepData {
  id: string;
  label: string;
  done: boolean;
}

interface AgentCardsProps {
  cards: AgentCardData[];
  steps: AgentStepData[];
  onCloseCard: (id: string) => void;
}

const isSafeUrl = (u: string) => /^https?:\/\//i.test(u);

function Card({
  card,
  layerRef,
  onClose,
}: {
  card: AgentCardData;
  layerRef: React.RefObject<HTMLDivElement | null>;
  onClose: (id: string) => void;
}) {
  return (
    <motion.div
      drag
      dragConstraints={layerRef as React.RefObject<Element>}
      dragElastic={0.08}
      dragMomentum={false}
      whileDrag={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
      className="pointer-events-auto rounded-xl"
      style={{
        background: "rgba(14,18,44,0.86)",
        border: "1px solid rgba(130,150,255,0.18)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 18px 40px -12px rgba(0,0,0,0.6)",
        padding: 14,
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-[13px] font-semibold text-white/90 leading-tight">{card.title}</p>
          {card.subtitle && (
            <p className="text-[11px] text-white/35 mt-0.5">{card.subtitle}</p>
          )}
        </div>
        <button
          onClick={() => onClose(card.id)}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-white/30 hover:text-white/70 transition-colors shrink-0"
          aria-label="Fermer la carte"
        >
          <X size={14} />
        </button>
      </div>

      {card.rows && card.rows.length > 0 && (
        <div className="rounded-lg overflow-hidden mb-2">
          {card.rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[auto_1fr] gap-x-4 px-2.5 py-1.5 text-[12px]"
              style={{ background: i % 2 === 0 ? "rgba(120,140,255,0.08)" : "transparent" }}
            >
              <span className="text-white/90 font-medium">{r.label}</span>
              <span className="text-white/55 text-right">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {card.text && (
        <p className="text-[12px] text-white/50 leading-relaxed mb-2">{card.text}</p>
      )}

      {card.links && card.links.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {card.links.filter((l) => isSafeUrl(l.url)).map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              className="text-[12px] underline underline-offset-2"
              style={{ color: "#8fb0ff" }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function AgentCards({ cards, steps, onCloseCard }: AgentCardsProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  // Chaque carte garde son côté (gauche/droite) même si une autre est fermée
  const sides = useRef(new Map<string, 0 | 1>());
  const counter = useRef(0);
  cards.forEach((c) => {
    if (!sides.current.has(c.id)) {
      sides.current.set(c.id, (counter.current++ % 2) as 0 | 1);
    }
  });

  useEffect(() => {
    const f = () => setNarrow(window.innerWidth < 768);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  const left = narrow ? cards : cards.filter((c) => sides.current.get(c.id) === 0);
  const right = narrow ? [] : cards.filter((c) => sides.current.get(c.id) === 1);
  const colStyle: React.CSSProperties = { top: 170, width: "min(300px, calc(100vw - 2rem))" };

  return (
    <div ref={layerRef} className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {/* Étapes de recherche */}
      <div
        className="absolute left-4 md:left-8 flex flex-col gap-1.5"
        style={{ top: 88, maxWidth: 320 }}
      >
        <AnimatePresence initial={false}>
          {steps.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[11px]"
              style={{ color: s.done ? "#4ade80" : "rgba(200,215,255,0.75)" }}
            >
              {s.done ? (
                <Check size={12} />
              ) : (
                <motion.span
                  className="inline-block w-1.5 h-1.5 rounded-full mx-[3px]"
                  style={{ background: "#8fb0ff" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              <span>{s.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Colonne gauche */}
      <div className="absolute left-4 md:left-8 flex flex-col gap-3" style={colStyle}>
        <AnimatePresence>
          {left.map((c) => (
            <Card key={c.id} card={c} layerRef={layerRef} onClose={onCloseCard} />
          ))}
        </AnimatePresence>
      </div>

      {/* Colonne droite */}
      <div className="absolute right-4 md:right-8 flex flex-col gap-3" style={colStyle}>
        <AnimatePresence>
          {right.map((c) => (
            <Card key={c.id} card={c} layerRef={layerRef} onClose={onCloseCard} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
