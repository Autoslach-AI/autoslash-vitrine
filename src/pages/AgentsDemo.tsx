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
import { useSearchParams } from "react-router-dom";
import Scene1Intro from "@/components/agents/Scene1Intro";
import Scene2Robot from "@/components/agents/Scene2Robot";
import Scene3Travel from "@/components/agents/Scene3Travel";
import Scene4Chat from "@/components/agents/Scene4Chat";

type Scene = "scene1" | "scene2" | "scene3" | "scene4";

export default function AgentsDemo() {
  const [searchParams] = useSearchParams();
  const initialScene = searchParams.get("scene") === "4" ? "scene4" : "scene1";
  const [scene, setScene] = useState<Scene>(initialScene);
  const [flash, setFlash] = useState(false);
  const [finalDestination, setFinalDestination] = useState<string | null>(null);

  // Quand le portail est traversé → flash blanc → Scène 2
  const handleScene1Complete = () => {
    setFlash(true);
    setTimeout(() => {
      setScene("scene2");
      setFlash(false);
    }, 800);
  };

  // Quand l'Oracle a fini → transition vers Scène 3 (ou destination finale)
  const handleScene2Complete = (destination: string) => {
    setFinalDestination(destination);
    setFlash(true);
    setTimeout(() => {
      setScene("scene3");
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

      {/* ── SCÈNE 2 — Le Robot Oracle */}
      <AnimatePresence>
        {scene === "scene2" && (
          <motion.div
            key="s2"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Scene2Robot onComplete={handleScene2Complete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCÈNE 3 — Voyage Hyperspace */}
      <AnimatePresence>
        {scene === "scene3" && (
          <motion.div
            key="s3"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Scene3Travel destination={finalDestination || "agents-demo"} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCÈNE 4 — Interface de Chat */}
      <AnimatePresence>
        {scene === "scene4" && (
          <motion.div
            key="s4"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Scene4Chat />
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
