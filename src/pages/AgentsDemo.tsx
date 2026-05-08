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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router-dom";
import Scene1Intro from "@/components/agents/Scene1Intro";
import Scene2Robot from "@/components/agents/Scene2Robot";
import Scene3Travel from "@/components/agents/Scene3Travel";
import Scene4Chat from "@/components/agents/Scene4Chat";
import RuixenMoonChat from "@/components/ui/ruixen-moon-chat";
import Scene4Vocal from "@/components/ui/siri-orb";

type Scene = "scene1" | "scene2" | "scene3" | "scene4";

export default function AgentsDemo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const agentParam = searchParams.get("agent");
  const sceneParam = searchParams.get("scene") as Scene | null;

  const [scene, setScene] = useState<Scene>(sceneParam || (agentParam ? "scene4" : "scene1"));
  const [flash, setFlash] = useState(false);
  const [finalDestination, setFinalDestination] = useState<string | null>(null);

  // State for the intro chat (Ruixen moon style)
  const [showIntroChat, setShowIntroChat] = useState(false);
  const [initialMsg, setInitialMsg] = useState<string | undefined>(undefined);

  // Sync state with URL params for back/forward navigation support
  useEffect(() => {
    const s = (searchParams.get("scene") as Scene) || (agentParam ? "scene4" : "scene1");
    if (s !== scene) {
      setScene(s);
    }
  }, [searchParams, agentParam, scene]);

  // Si on vient de la Scene3 avec "business", on affiche l'intro chat d'abord
  useEffect(() => {
    if (scene === "scene4" && agentParam === "business" && initialMsg === undefined) {
      setShowIntroChat(true);
    } else {
      setShowIntroChat(false);
    }
  }, [scene, agentParam, initialMsg]);

  // Quand le portail est traversé → flash blanc → Scène 2
  const handleScene1Complete = () => {
    setFlash(true);
    setTimeout(() => {
      setSearchParams({ scene: "scene2" });
      setFlash(false);
    }, 800);
  };

  // Quand l'Oracle a fini → transition vers Scène 3 (ou destination finale)
  const handleScene2Complete = (destination: string) => {
    setFinalDestination(destination);
    setFlash(true);
    setTimeout(() => {
      setSearchParams({ scene: "scene3", dest: destination });
      setFlash(false);
    }, 800);
  };

  // Recover finalDestination from URL if needed (for scene3 reload)
  useEffect(() => {
    const dest = searchParams.get("dest");
    if (dest && dest !== finalDestination) {
      setFinalDestination(dest);
    }
  }, [searchParams, finalDestination]);

  const handleIntroMessage = (msg: string) => {
    setInitialMsg(msg);
    setShowIntroChat(false);
  };

  const renderScene4 = () => {
    if (agentParam === "commercial") {
      return <Scene4Vocal />;
    }

    if (showIntroChat) {
      return <RuixenMoonChat onSendMessage={handleIntroMessage} />;
    }

    return <Scene4Chat initialMessage={initialMsg} />;
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
      <AnimatePresence mode="wait">
        {scene === "scene4" && (
          <motion.div
            key={`s4-${agentParam}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          >
            {renderScene4()}
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
