/**
 * RoboticOrb.tsx
 * ──────────────
 * Visage robotique SVG animé dans un orbe lumineux
 * + ondes sonores concentriques quand l'agent parle
 *
 * Props :
 *   orbState : "idle" | "speaking" | "listening" | "thinking"
 *   size     : taille en px (défaut 280)
 */

import { motion, AnimatePresence } from "motion/react";

type OrbState = "idle" | "speaking" | "listening" | "thinking";

interface RoboticOrbProps {
  orbState: OrbState;
  size?: number;
}

// ─── COULEURS ───────────────────────────────────────────────────────────────
const COLORS: Record<OrbState, { glow: string; face: string; iris: string; wave: string }> = {
  idle:      { glow: "#6b21a8", face: "#a855f7", iris: "#d8b4fe", wave: "#7c3aed" },
  speaking:  { glow: "#1d4ed8", face: "#60a5fa", iris: "#bfdbfe", wave: "#3b82f6" },
  listening: { glow: "#065f46", face: "#34d399", iris: "#a7f3d0", wave: "#10b981" },
  thinking:  { glow: "#92400e", face: "#fbbf24", iris: "#fde68a", wave: "#f59e0b" },
};

// ─── ONDE SONORE ─────────────────────────────────────────────────────────────
function SoundWave({ color, delay, size }: { color: string; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${color}`,
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
      }}
      initial={{ scale: 1, opacity: 0.7 }}
      animate={{ scale: 2.4, opacity: 0 }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

// ─── VISAGE ROBOTIQUE SVG ────────────────────────────────────────────────────
function RobotFace({
  state,
  faceColor,
  irisColor,
  s,
}: {
  state: OrbState;
  faceColor: string;
  irisColor: string;
  s: number; // taille de l'orbe
}) {
  const cx = s / 2;
  const cy = s / 2;
  const scale = s / 280; // ratio par rapport à 280px de base

  // ── Paramètres bouche selon état ──────────────────────────────────────────
  const mouthY  = cy + 38 * scale;
  const mouthW  = 50 * scale;
  const mouthH  = state === "speaking" ? 14 * scale : state === "idle" ? 3 * scale : 6 * scale;
  const mouthRx = 8 * scale;

  // ── Paramètres yeux ───────────────────────────────────────────────────────
  const eyeY    = cy - 22 * scale;
  const eyeLX   = cx - 28 * scale;
  const eyeRX   = cx + 28 * scale;
  const eyeW    = 22 * scale;
  const eyeH    = state === "thinking" ? 4 * scale : 14 * scale;

  // ── Sourcils ──────────────────────────────────────────────────────────────
  const browH   = state === "thinking" ? -6 * scale : state === "speaking" ? -10 * scale : -8 * scale;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="absolute inset-0"
    >
      {/* ── TÊTE / CASQUE ─────────────────────────────────────────────── */}
      <motion.rect
        x={cx - 55 * scale}
        y={cy - 70 * scale}
        width={110 * scale}
        height={110 * scale}
        rx={18 * scale}
        fill="rgba(0,0,0,0.5)"
        stroke={faceColor}
        strokeWidth={1.5 * scale}
        animate={{ strokeOpacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* ── ANTENNE ───────────────────────────────────────────────────── */}
      <line
        x1={cx} y1={cy - 70 * scale}
        x2={cx} y2={cy - 90 * scale}
        stroke={faceColor}
        strokeWidth={2 * scale}
      />
      <motion.circle
        cx={cx}
        cy={cy - 94 * scale}
        r={5 * scale}
        fill={faceColor}
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />

      {/* ── SOURCIL GAUCHE ────────────────────────────────────────────── */}
      <motion.line
        x1={eyeLX - 12 * scale}
        y1={eyeY - 14 * scale + browH}
        x2={eyeLX + 12 * scale}
        y2={eyeY - 12 * scale + browH}
        stroke={faceColor}
        strokeWidth={2.5 * scale}
        strokeLinecap="round"
        animate={{ y1: eyeY - 14 * scale + browH, y2: eyeY - 12 * scale + browH }}
        transition={{ duration: 0.3 }}
      />

      {/* ── SOURCIL DROIT ─────────────────────────────────────────────── */}
      <motion.line
        x1={eyeRX - 12 * scale}
        y1={eyeY - 12 * scale + browH}
        x2={eyeRX + 12 * scale}
        y2={eyeY - 14 * scale + browH}
        stroke={faceColor}
        strokeWidth={2.5 * scale}
        strokeLinecap="round"
        animate={{ y1: eyeY - 12 * scale + browH, y2: eyeY - 14 * scale + browH }}
        transition={{ duration: 0.3 }}
      />

      {/* ── ŒIL GAUCHE ────────────────────────────────────────────────── */}
      <motion.rect
        x={eyeLX - eyeW / 2}
        y={eyeY - eyeH / 2}
        width={eyeW}
        rx={5 * scale}
        fill="rgba(0,0,0,0.8)"
        stroke={faceColor}
        strokeWidth={1.5 * scale}
        animate={{ height: eyeH }}
        transition={{ duration: 0.2 }}
      />
      {/* Iris gauche */}
      <motion.circle
        cx={eyeLX}
        cy={eyeY}
        r={5 * scale}
        fill={irisColor}
        animate={{ opacity: state === "thinking" ? [1, 0.3, 1] : 1 }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* ── ŒIL DROIT ─────────────────────────────────────────────────── */}
      <motion.rect
        x={eyeRX - eyeW / 2}
        y={eyeY - eyeH / 2}
        width={eyeW}
        rx={5 * scale}
        fill="rgba(0,0,0,0.8)"
        stroke={faceColor}
        strokeWidth={1.5 * scale}
        animate={{ height: eyeH }}
        transition={{ duration: 0.2 }}
      />
      {/* Iris droit */}
      <motion.circle
        cx={eyeRX}
        cy={eyeY}
        r={5 * scale}
        fill={irisColor}
        animate={{ opacity: state === "thinking" ? [1, 0.3, 1] : 1 }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
      />

      {/* ── CLIGNEMENT ───────────────────────────────────────────────── */}
      {state === "idle" && (
        <motion.rect
          x={eyeLX - eyeW / 2}
          y={eyeY - eyeH / 2}
          width={eyeW}
          rx={5 * scale}
          fill="rgba(0,0,0,0.95)"
          stroke={faceColor}
          strokeWidth={1.5 * scale}
          animate={{ height: [0, eyeH, 0] }}
          transition={{ duration: 0.15, delay: 3, repeat: Infinity, repeatDelay: 4 }}
        />
      )}
      {state === "idle" && (
        <motion.rect
          x={eyeRX - eyeW / 2}
          y={eyeY - eyeH / 2}
          width={eyeW}
          rx={5 * scale}
          fill="rgba(0,0,0,0.95)"
          stroke={faceColor}
          strokeWidth={1.5 * scale}
          animate={{ height: [0, eyeH, 0] }}
          transition={{ duration: 0.15, delay: 3, repeat: Infinity, repeatDelay: 4 }}
        />
      )}

      {/* ── NEZ (petit losange) ───────────────────────────────────────── */}
      <motion.polygon
        points={`
          ${cx},${cy + 8 * scale}
          ${cx + 5 * scale},${cy + 14 * scale}
          ${cx},${cy + 20 * scale}
          ${cx - 5 * scale},${cy + 14 * scale}
        `}
        fill={faceColor}
        opacity={0.4}
      />

      {/* ── BOUCHE ────────────────────────────────────────────────────── */}
      <motion.rect
        x={cx - mouthW / 2}
        y={mouthY - mouthH / 2}
        width={mouthW}
        rx={mouthRx}
        fill="rgba(0,0,0,0.8)"
        stroke={faceColor}
        strokeWidth={1.5 * scale}
        animate={{ height: mouthH, y: mouthY - mouthH / 2 }}
        transition={{ duration: 0.15 }}
      />

      {/* Dents simulées quand parle */}
      {state === "speaking" && (
        <>
          {[0, 1, 2, 3].map(i => (
            <motion.rect
              key={i}
              x={cx - mouthW / 2 + 4 * scale + i * 13 * scale}
              y={mouthY - mouthH / 2 + 1.5 * scale}
              width={9 * scale}
              rx={2 * scale}
              fill={faceColor}
              opacity={0.6}
              animate={{ height: [mouthH * 0.5, mouthH * 0.8, mouthH * 0.4, mouthH * 0.7, mouthH * 0.5] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
            />
          ))}
        </>
      )}

      {/* ── GRILLE SCAN (effect technologique) ───────────────────────── */}
      <motion.line
        x1={cx - 55 * scale}
        y1={cy - 70 * scale}
        x2={cx + 55 * scale}
        y2={cy - 70 * scale}
        stroke={faceColor}
        strokeWidth={0.5 * scale}
        opacity={0.3}
        animate={{ y1: [cy - 70 * scale, cy + 40 * scale], y2: [cy - 70 * scale, cy + 40 * scale], opacity: [0, 0.4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
      />

      {/* ── INDICATEUR BAS (barre de niveau) ─────────────────────────── */}
      {state === "speaking" && (
        <g>
          {[-3, -2, -1, 0, 1, 2, 3].map((offset, i) => (
            <motion.rect
              key={i}
              x={cx + offset * 9 * scale - 3 * scale}
              y={cy + 56 * scale}
              width={6 * scale}
              rx={2 * scale}
              fill={faceColor}
              animate={{ height: [4 * scale, (4 + Math.random() * 14) * scale, 4 * scale] }}
              style={{ transformOrigin: `center ${cy + 56 * scale}px` }}
              transition={{ duration: 0.2 + i * 0.05, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export default function RoboticOrb({ orbState, size = 280 }: RoboticOrbProps) {
  const col = COLORS[orbState];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* ── ONDES SONORES — uniquement quand parle ou écoute ─────────── */}
      <AnimatePresence>
        {(orbState === "speaking" || orbState === "listening") && (
          <>
            <SoundWave color={col.wave} delay={0}    size={size} />
            <SoundWave color={col.wave} delay={0.6}  size={size} />
            <SoundWave color={col.wave} delay={1.2}  size={size} />
          </>
        )}
      </AnimatePresence>

      {/* ── ORBE DE FOND ─────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${col.glow}99 0%, ${col.glow}44 40%, ${col.glow}11 70%, transparent 100%)`,
          filter: "blur(2px)",
        }}
        animate={
          orbState === "speaking"  ? { scale: [1, 1.06, 0.98, 1.04, 1], opacity: [0.9, 1, 0.85, 1, 0.9] } :
          orbState === "listening" ? { scale: [1, 1.04, 0.98, 1.02, 1] } :
          orbState === "thinking"  ? { scale: [1, 1.02, 1], opacity: [0.6, 0.9, 0.6], rotate: [0, 2, -2, 0] } :
                                     { scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] }
        }
        transition={{
          duration: orbState === "speaking" ? 0.35 : orbState === "thinking" ? 1.2 : orbState === "listening" ? 0.6 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ── CERCLE BORD ──────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1.5px solid ${col.face}44`,
          boxShadow: `0 0 40px ${col.glow}66, inset 0 0 30px ${col.glow}22`,
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* ── VISAGE ROBOTIQUE ─────────────────────────────────────────── */}
      <RobotFace
        state={orbState}
        faceColor={col.face}
        irisColor={col.iris}
        s={size}
      />
    </div>
  );
}
