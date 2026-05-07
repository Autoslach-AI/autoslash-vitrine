"use client";

/**
 * AgentsDemo.tsx
 * ──────────────
 * Architecture en scènes séparées — on construit une à la fois
 *
 * SCÈNE 1 ✅ → Scene1Intro  : Sphère portail Three.js bleue + scroll zoom
 * SCÈNE 2 ⏳ → Scene2Robot  : Robot Spline + cartes suggestions (à venir)
 * SCÈNE 3 ⏳ → Scene3Travel : Hyperspace canvas + voyage (à venir)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Scene1Intro from "@/components/agents/Scene1Intro";

type Scene = "scene1" | "scene2" | "scene3";

export default function AgentsDemo() {
  const [scene, setScene] = useState<Scene>("scene1");
  const [flash, setFlash] = useState(false);

  // Quand le portail est traversé → flash blanc → Scène 2
  const handleScene1Complete = () => {
    setFlash(true);
    setTimeout(() => {
      setScene("scene2");
      setFlash(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">

      {/* ── SCÈNE 1 — Portail */}
      <AnimatePresence>
        {scene === "scene1" && (
          <motion.div
            key="s1"
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Scene1Intro onComplete={handleScene1Complete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCÈNE 2 — Placeholder robot (à construire) */}
      <AnimatePresence>
        {scene === "scene2" && (
          <motion.div
            key="s2"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="w-3 h-3 rounded-full bg-blue-400 mx-auto mb-6"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p
                className="text-white/40 text-sm font-bold uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Scène 2 — Robot en cours de construction
              </p>
              <button
                onClick={() => setScene("scene1")}
                className="mt-8 text-white/20 text-xs hover:text-white/40 transition-colors uppercase tracking-widest"
              >
                ← Recommencer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLASH BLANC — transition entre scènes */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            className="absolute inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.8, times: [0, 0.2, 0.6, 1] }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
