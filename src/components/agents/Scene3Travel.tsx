/**
 * Scene3Travel.tsx — Le Voyage Hyperspace
 * ─────────────────────────────────────────
 * Animation canvas de particules à grande vitesse.
 * Déclenchée quand le visiteur a choisi sa destination.
 *
 * Séquence :
 *   0.0s → Étoiles commencent à filer lentement
 *   0.5s → Accélération progressive
 *   2.0s → Texte "Autoslash AI" + nom destination apparaît
 *   3.5s → Flash bleu → navigation vers la destination
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

// ─── CONFIG DESTINATIONS ─────────────────────────────────────────────────────

const DEST_CONFIG: Record<string, { label: string; sublabel: string; color: string }> = {
  "agents-demo":     { label: "Les Agents IA",    sublabel: "Démonstration live",         color: "#60c8ff" },
  "client-projects": { label: "Nos Réalisations", sublabel: "Projets livrés",             color: "#60c8ff" },
  "pricing":         { label: "Nos Offres",        sublabel: "Packages & tarifs",          color: "#60c8ff" },
  "blog":            { label: "Le Blog",           sublabel: "Actualités & études de cas", color: "#60c8ff" },
  "contact":         { label: "Nous Contacter",    sublabel: "Parler à l'équipe",          color: "#60c8ff" },
};

interface Scene3Props {
  destination: string;
  onComplete?: () => void;
}

export default function Scene3Travel({ destination, onComplete }: Scene3Props) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const navigate      = useNavigate();
  const [showText, setShowText]   = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const destInfo = DEST_CONFIG[destination] ?? {
    label: "Autoslash AI",
    sublabel: "Bienvenue",
    color: "#60c8ff",
  };

  // ── Animation Hyperspace ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width  = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const onResize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // ── Étoiles ───────────────────────────────────────────────────────────
    const STAR_COUNT = 1400;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h,
      z: Math.random() * w,
    }));

    let speed        = 1.5;
    const maxSpeed   = 36;
    let flashDone    = false;
    let raf: number;

    const draw = () => {
      // Motion blur
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        const prevZ = s.z;
        s.z -= speed;

        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * w;
          s.y = (Math.random() - 0.5) * h;
          s.z = w;
        }

        const k     = 128 / s.z;
        const px    = s.x * k + w / 2;
        const py    = s.y * k + h / 2;
        const kPrev = 128 / prevZ;
        const pxP   = s.x * kPrev + w / 2;
        const pyP   = s.y * kPrev + h / 2;

        // Couleur : bleu → blanc selon vitesse
        const speedRatio = Math.min(speed / maxSpeed, 1);
        const r = Math.floor(60  + speedRatio * 195);
        const g = Math.floor(150 + speedRatio * 105);
        const b = 255;
        const a = 0.6 + speedRatio * 0.4;

        ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
        ctx.lineWidth   = (1 - s.z / w) * (2.5 + speedRatio * 2);
        ctx.beginPath();
        ctx.moveTo(pxP, pyP);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // Accélération progressive
      if (speed < maxSpeed) speed += 0.18;

      // Flash et navigation
      if (speed > 28 && !flashDone) {
        flashDone = true;
        setShowFlash(true);
        setTimeout(() => {
          onComplete?.();
          // Au lieu de navigate directement vers la page externe
          // On revient à AgentsDemo avec le paramètre agent
          const dest = destination.includes("business") ? "business" : "commercial";
          navigate(`/agents-demo?agent=${dest}&scene=4`);
        }, 900);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    // Texte après 2s
    const textTimer = setTimeout(() => setShowText(true), 1800);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(textTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [destination, navigate, onComplete]);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-black">

      {/* ── Canvas hyperspace ─────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* ── Vignette centrale ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(0,0,0,0.6) 0%, transparent 70%)",
        }}
      />

      {/* ── Texte destination ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showText && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.p
              className="text-blue-300/60 text-[11px] font-bold uppercase tracking-[0.6em] mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Autoslash AI
            </motion.p>

            {/* Titre destination */}
            <motion.h1
              className="font-black text-center leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px, 7vw, 80px)",
                color: "#fff",
                textShadow: `
                  0 0 20px rgba(0,150,255,0.8),
                  0 0 40px rgba(0,100,255,0.5),
                  2px 2px 0 rgba(0,0,0,0.8),
                  4px 4px 12px rgba(0,0,0,0.6)
                `,
              }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{
                opacity: 1, y: 0, scale: 1,
                // Légère vibration comme à grande vitesse
                x: [0, -2, 2, -1, 1, 0],
              }}
              transition={{
                opacity: { duration: 0.6 },
                y:       { duration: 0.6 },
                scale:   { duration: 0.6 },
                x:       { duration: 0.3, repeat: Infinity, repeatType: "mirror" },
              }}
            >
              {destInfo.label}
            </motion.h1>

            {/* Sous-label */}
            <motion.p
              className="text-blue-200/50 mt-3 font-medium"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(12px, 1.5vw, 18px)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {destInfo.sublabel}
            </motion.p>

            {/* Ligne de vitesse sous le texte */}
            <motion.div
              className="mt-6 flex items-center gap-3"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-blue-400/60" />
              <motion.span
                className="text-blue-400/60 text-[10px] font-bold uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                En route...
              </motion.span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-blue-400/60" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Flash bleu final ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              background: "radial-gradient(circle, rgba(0,150,255,0.95) 0%, rgba(0,0,0,0) 70%)",
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 2.5, 2.5] }}
            transition={{ duration: 0.9, times: [0, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
