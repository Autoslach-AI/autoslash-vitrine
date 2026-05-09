/**
 * HolographicFace.tsx
 * ────────────────────
 * Visage humanoïde holographique inspiré de la référence
 * avec bouche pseudo-synchronisée à la voix
 * + particules fluides en vague permanente
 * + anneau lumineux rotatif
 * + bouton appel et bouton annuler
 *
 * Props :
 *   orbState : "idle" | "speaking" | "listening" | "thinking"
 *   onCall   : () => void  — clic bouton appel
 *   onCancel : () => void  — clic bouton annuler
 *   agentName: string
 *
 * PHASE 2 — ElevenLabs visèmes pour sync parfaite
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

interface HolographicFaceProps {
  orbState: OrbState;
  onCall: () => void;
  onCancel: () => void;
  agentName?: string;
  isCallActive?: boolean;
}

// ─── PALETTE ─────────────────────────────────────────────────────────────────

const PALETTE = {
  idle:      { ring: "#60a5fa", glow: "#1d4ed8", particle: "#93c5fd", face: "#e0f2fe" },
  speaking:  { ring: "#a78bfa", glow: "#6d28d9", particle: "#c4b5fd", face: "#ede9fe" },
  listening: { ring: "#34d399", glow: "#065f46", particle: "#6ee7b7", face: "#d1fae5" },
  thinking:  { ring: "#fbbf24", glow: "#92400e", particle: "#fde68a", face: "#fef3c7" },
};

// ─── PARTICULE ────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  r: number;
  speed: number;
  offset: number;
  amplitude: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: 0.8 + Math.random() * 2.2,
    speed: 4 + Math.random() * 8,
    offset: Math.random() * Math.PI * 2,
    amplitude: 3 + Math.random() * 8,
  }));
}

// ─── CANVAS PARTICULES ────────────────────────────────────────────────────────

function ParticleCanvas({ color, state }: { color: string; state: OrbState }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const particles  = useRef<Particle[]>(generateParticles(80));
  const rafRef     = useRef<number>(0);
  const tRef       = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const speedMult = state === "speaking" ? 1.6 : state === "listening" ? 1.3 : state === "thinking" ? 0.8 : 1;

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return;
      ctx.clearRect(0, 0, w, h);
      tRef.current += 0.012 * speedMult;

      particles.current.forEach(p => {
        // Mouvement en vague fluide
        const waveX = Math.sin(tRef.current * (1 / p.speed) + p.offset) * p.amplitude;
        const waveY = Math.cos(tRef.current * (0.7 / p.speed) + p.offset * 1.3) * p.amplitude * 0.6;
        const px = (p.x / 100) * w + waveX;
        const py = (p.y / 100) * h + waveY;

        // Opacité pulsante douce
        const opacityValue = 0.2 + Math.sin(tRef.current * (0.5 / p.speed) + p.offset) * 0.25 + 0.15;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(Math.min(opacityValue, 0.6) * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [color, state]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── ANNEAU HOLOGRAPHIQUE ─────────────────────────────────────────────────────

function HolographicRing({ color, state, size }: { color: string; state: OrbState; size: number }) {
  const r = size / 2 - 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 pointer-events-none"
    >
      <defs>
        <filter id="glow-ring">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Anneau principal rotatif */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={`${r * 0.6} ${r * 0.15} ${r * 0.3} ${r * 0.1}`}
        opacity={0.7}
        filter="url(#glow-ring)"
        animate={{ rotate: 360 }}
        transition={{ duration: state === "speaking" ? 4 : 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      />

      {/* Anneau secondaire contre-rotatif */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r - 12}
        fill="none"
        stroke={color}
        strokeWidth={0.8}
        strokeDasharray={`${r * 0.2} ${r * 0.3}`}
        opacity={0.4}
        animate={{ rotate: -360 }}
        transition={{ duration: state === "speaking" ? 6 : 18, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      />

      {/* Points sur le cercle */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const px = size / 2 + r * Math.cos(rad);
        const py = size / 2 + r * Math.sin(rad);
        return (
          <motion.circle
            key={i}
            cx={px} cy={py} r={2.5}
            fill={color}
            opacity={0.6}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
          />
        );
      })}

      {/* Lignes de réseau */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const px = size / 2 + (r + 20) * Math.cos(rad);
        const py = size / 2 + (r + 20) * Math.sin(rad);
        return (
          <motion.line
            key={i}
            x1={size / 2} y1={size / 2}
            x2={px} y2={py}
            stroke={color}
            strokeWidth={0.5}
            opacity={0.15}
            animate={{ opacity: [0.05, 0.2, 0.05] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        );
      })}
    </svg>
  );
}

// ─── VISAGE HUMANOÏDE SVG ─────────────────────────────────────────────────────

function HumanoidFace({
  state,
  faceColor,
  mouthOpen,
  size,
}: {
  state: OrbState;
  faceColor: string;
  mouthOpen: number; // 0→1 amplitude bouche
  size: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const sc = size / 320;

  // Bouche — courbe de Bézier qui s'ouvre
  const mouthY   = cy + 32 * sc;
  const mouthW   = 44 * sc;
  const openH    = mouthOpen * 18 * sc;
  const mouthTop = mouthY - openH * 0.3;
  const mouthBot = mouthY + openH * 0.7;

  // Yeux
  const eyeY   = cy - 20 * sc;
  const eyeLX  = cx - 24 * sc;
  const eyeRX  = cx + 24 * sc;
  const eyeRx  = 12 * sc;
  const eyeRy  = state === "thinking" ? 3 * sc : 7 * sc;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 pointer-events-none"
    >
      <defs>
        <filter id="face-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="face-grad" cx="45%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%"  stopColor={faceColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={faceColor} stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="iris-grad" cx="35%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor={faceColor} stopOpacity="0.8" />
        </radialGradient>
        <clipPath id="face-clip">
          <ellipse cx={cx} cy={cy - 5 * sc} rx={58 * sc} ry={72 * sc} />
        </clipPath>
      </defs>

      {/* ── BASE PIÉDESTAL ─────────────────────────────────────────── */}
      <ellipse cx={cx} cy={cy + 110 * sc} rx={60 * sc} ry={12 * sc}
        fill={faceColor} opacity={0.08} />
      <rect x={cx - 8 * sc} y={cy + 80 * sc} width={16 * sc} height={30 * sc}
        rx={4 * sc} fill={faceColor} opacity={0.15} />

      {/* ── COU ────────────────────────────────────────────────────── */}
      <rect x={cx - 14 * sc} y={cy + 52 * sc} width={28 * sc} height={30 * sc}
        rx={6 * sc} fill="url(#face-grad)" opacity={0.5} />

      {/* ── ÉPAULES ────────────────────────────────────────────────── */}
      <ellipse cx={cx} cy={cy + 80 * sc} rx={70 * sc} ry={20 * sc}
        fill="url(#face-grad)" opacity={0.4} />

      {/* ── VISAGE principal ───────────────────────────────────────── */}
      <ellipse
        cx={cx} cy={cy - 5 * sc}
        rx={58 * sc} ry={72 * sc}
        fill="url(#face-grad)"
        opacity={0.85}
        filter="url(#face-glow)"
      />

      {/* ── TEXTURE PIXEL (effet numérique) ───────────────────────── */}
      <g clipPath="url(#face-clip)" opacity={0.08}>
        {Array.from({ length: 12 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => (
            <rect
              key={`${row}-${col}`}
              x={cx - 56 * sc + col * 14 * sc}
              y={cy - 72 * sc + row * 12 * sc}
              width={12 * sc}
              height={10 * sc}
              fill={faceColor}
              opacity={Math.random() > 0.6 ? 0.4 : 0}
            />
          ))
        )}
      </g>

      {/* ── FRONT / CRÂNE (effet numérique haut droit) ────────────── */}
      <g clipPath="url(#face-clip)" opacity={0.12}>
        {Array.from({ length: 6 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => (
            col > 1 && row < 4 ? (
              <rect
                key={`px-${row}-${col}`}
                x={cx + 10 * sc + col * 10 * sc}
                y={cy - 68 * sc + row * 10 * sc}
                width={8 * sc}
                height={8 * sc}
                fill={faceColor}
                opacity={0.5}
              />
            ) : null
          ))
        )}
      </g>

      {/* ── SOURCILS ───────────────────────────────────────────────── */}
      <motion.path
        d={`M ${eyeLX - 14 * sc} ${eyeY - 16 * sc}
            Q ${eyeLX} ${eyeY - (state === "speaking" ? 22 : 18) * sc}
            ${eyeLX + 14 * sc} ${eyeY - 15 * sc}`}
        fill="none"
        stroke={faceColor}
        strokeWidth={2.5 * sc}
        strokeLinecap="round"
        opacity={0.7}
      />
      <motion.path
        d={`M ${eyeRX - 14 * sc} ${eyeY - 15 * sc}
            Q ${eyeRX} ${eyeY - (state === "speaking" ? 22 : 18) * sc}
            ${eyeRX + 14 * sc} ${eyeY - 16 * sc}`}
        fill="none"
        stroke={faceColor}
        strokeWidth={2.5 * sc}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* ── ŒIL GAUCHE ─────────────────────────────────────────────── */}
      <motion.ellipse
        cx={eyeLX} cy={eyeY}
        rx={eyeRx} ry={eyeRy}
        fill="rgba(0,0,30,0.9)"
        stroke={faceColor}
        strokeWidth={1.5 * sc}
        animate={{ ry: eyeRy }}
        transition={{ duration: 0.2 }}
      />
      <ellipse cx={eyeLX} cy={eyeY} rx={6 * sc} ry={6 * sc} fill="url(#iris-grad)" />
      <ellipse cx={eyeLX - 2 * sc} cy={eyeY - 2 * sc} rx={2 * sc} ry={2 * sc}
        fill="white" opacity={0.9} />

      {/* ── ŒIL DROIT ──────────────────────────────────────────────── */}
      <motion.ellipse
        cx={eyeRX} cy={eyeY}
        rx={eyeRx} ry={eyeRy}
        fill="rgba(0,0,30,0.9)"
        stroke={faceColor}
        strokeWidth={1.5 * sc}
        animate={{ ry: eyeRy }}
        transition={{ duration: 0.2 }}
      />
      <ellipse cx={eyeRX} cy={eyeY} rx={6 * sc} ry={6 * sc} fill="url(#iris-grad)" />
      <ellipse cx={eyeRX - 2 * sc} cy={eyeY - 2 * sc} rx={2 * sc} ry={2 * sc}
        fill="white" opacity={0.9} />

      {/* ── CLIGNEMENT ─────────────────────────────────────────────── */}
      {state === "idle" && (
        <>
          <motion.ellipse cx={eyeLX} cy={eyeY} rx={eyeRx}
            fill="url(#face-grad)" stroke={faceColor} strokeWidth={1.5 * sc}
            animate={{ ry: [0, eyeRy, 0] }}
            transition={{ duration: 0.12, delay: 3.5, repeat: Infinity, repeatDelay: 5 }}
          />
          <motion.ellipse cx={eyeRX} cy={eyeY} rx={eyeRx}
            fill="url(#face-grad)" stroke={faceColor} strokeWidth={1.5 * sc}
            animate={{ ry: [0, eyeRy, 0] }}
            transition={{ duration: 0.12, delay: 3.5, repeat: Infinity, repeatDelay: 5 }}
          />
        </>
      )}

      {/* ── NEZ ────────────────────────────────────────────────────── */}
      <motion.path
        d={`M ${cx} ${cy + 5 * sc}
            L ${cx - 6 * sc} ${cy + 20 * sc}
            Q ${cx} ${cy + 24 * sc}
            ${cx + 6 * sc} ${cy + 20 * sc}`}
        fill="none"
        stroke={faceColor}
        strokeWidth={1.5 * sc}
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* ── BOUCHE — s'ouvre comme un humain ───────────────────────── */}
      {/* Lèvre supérieure */}
      <motion.path
        d={`M ${cx - mouthW} ${mouthTop}
            Q ${cx - mouthW * 0.4} ${mouthTop - 5 * sc * (0.3 + mouthOpen * 0.3)}
              ${cx} ${mouthTop - 3 * sc * (0.2 + mouthOpen * 0.2)}
            Q ${cx + mouthW * 0.4} ${mouthTop - 5 * sc * (0.3 + mouthOpen * 0.3)}
              ${cx + mouthW} ${mouthTop}`}
        fill="none"
        stroke={faceColor}
        strokeWidth={2 * sc}
        strokeLinecap="round"
        opacity={0.8}
        animate={{ d: `M ${cx - mouthW} ${mouthTop}
            Q ${cx - mouthW * 0.4} ${mouthTop - 5 * sc * (0.3 + mouthOpen * 0.3)}
              ${cx} ${mouthTop - 3 * sc * (0.2 + mouthOpen * 0.2)}
            Q ${cx + mouthW * 0.4} ${mouthTop - 5 * sc * (0.3 + mouthOpen * 0.3)}
              ${cx + mouthW} ${mouthTop}` }}
        transition={{ duration: 0.05 }}
      />

      {/* Zone intérieure bouche */}
      {mouthOpen > 0.1 && (
        <motion.path
          d={`M ${cx - mouthW} ${mouthTop}
              Q ${cx} ${mouthTop + 2 * sc}
              ${cx + mouthW} ${mouthTop}
              Q ${cx} ${mouthBot + 2 * sc}
              ${cx - mouthW} ${mouthTop}`}
          fill="rgba(0,0,20,0.85)"
          opacity={Math.min(mouthOpen * 1.2, 0.9)}
        />
      )}

      {/* Lèvre inférieure */}
      <motion.path
        d={`M ${cx - mouthW} ${mouthBot}
            Q ${cx} ${mouthBot + 5 * sc * (0.4 + mouthOpen * 0.3)}
            ${cx + mouthW} ${mouthBot}`}
        fill="none"
        stroke={faceColor}
        strokeWidth={2 * sc}
        strokeLinecap="round"
        opacity={0.8}
        animate={{ d: `M ${cx - mouthW} ${mouthBot}
            Q ${cx} ${mouthBot + 5 * sc * (0.4 + mouthOpen * 0.3)}
            ${cx + mouthW} ${mouthBot}` }}
        transition={{ duration: 0.05 }}
      />

      {/* Dents quand bouche ouverte */}
      {mouthOpen > 0.3 && (
        <motion.rect
          x={cx - mouthW * 0.7}
          y={mouthTop + 1 * sc}
          width={mouthW * 1.4}
          height={(mouthBot - mouthTop) * 0.45}
          rx={2 * sc}
          fill="white"
          opacity={Math.min((mouthOpen - 0.3) * 0.8, 0.65)}
        />
      )}

      {/* ── SCAN LINE ──────────────────────────────────────────────── */}
      <motion.line
        x1={cx - 58 * sc} x2={cx + 58 * sc}
        stroke={faceColor}
        strokeWidth={0.8 * sc}
        opacity={0.2}
        animate={{ y1: [cy - 72 * sc, cy + 60 * sc], y2: [cy - 72 * sc, cy + 60 * sc] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
      />
    </svg>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function HolographicFace({
  orbState,
  onCall,
  onCancel,
  agentName = "Agent Commercial",
  isCallActive = false,
}: HolographicFaceProps) {
  const col       = PALETTE[orbState];
  const [mouthOpen, setMouthOpen] = useState(0);
  const mouthRef  = useRef<number>(0);
  const rafRef    = useRef<number>(0);

  // ── Simulation pseudo-sync bouche quand agent parle ────────────────────
  useEffect(() => {
    if (orbState === "speaking") {
      // Ondes de phonèmes simulées — naturel et varié
      const phonemeLoop = () => {
        const t     = Date.now() / 1000;
        const base  = Math.sin(t * 8) * 0.3 + 0.3;
        const vowel = Math.sin(t * 3.7) * 0.35;
        const burst = Math.max(0, Math.sin(t * 12) * 0.2);
        mouthRef.current = Math.max(0, Math.min(1, base + vowel + burst));
        setMouthOpen(mouthRef.current);
        rafRef.current = requestAnimationFrame(phonemeLoop);
      };
      rafRef.current = requestAnimationFrame(phonemeLoop);
    } else {
      cancelAnimationFrame(rafRef.current);
      // Fermeture douce
      const close = () => {
        mouthRef.current = Math.max(0, mouthRef.current - 0.08);
        setMouthOpen(mouthRef.current);
        if (mouthRef.current > 0) rafRef.current = requestAnimationFrame(close);
      };
      rafRef.current = requestAnimationFrame(close);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [orbState]);

  const SIZE = 300;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full py-10 px-6 select-none">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <motion.div
        className="w-full max-w-sm flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black"
            style={{
              background: `linear-gradient(135deg, ${col.ring}44, ${col.glow}66)`,
              border: `1px solid ${col.ring}44`,
              color: col.ring,
              fontFamily: "monospace",
            }}
          >
            AS
          </div>
          <div>
            <p className="text-white font-black text-xs uppercase tracking-widest"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {agentName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: col.ring }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: col.ring, fontFamily: "'DM Sans', sans-serif" }}>
                {orbState === "speaking"  ? "Parle..."    :
                 orbState === "listening" ? "Écoute..."   :
                 orbState === "thinking"  ? "Réfléchit..."  :
                 "En ligne"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── CENTRE — Visage + Anneau + Particules ───────────────────── */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: SIZE + 80, height: SIZE + 80 }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Particules de fond */}
        <ParticleCanvas color={col.particle} state={orbState} />

        {/* Glow central */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: SIZE * 0.9,
            height: SIZE * 0.9,
            background: `radial-gradient(circle, ${col.glow}30 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
          animate={orbState === "speaking" ? {
            scale: [1, 1.1, 0.97, 1.06, 1],
            opacity: [0.7, 1, 0.8, 1, 0.7],
          } : {
            scale: [1, 1.03, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: orbState === "speaking" ? 0.4 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Anneau holographique */}
        <HolographicRing color={col.ring} state={orbState} size={SIZE + 60} />

        {/* Visage */}
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <HumanoidFace
            state={orbState}
            faceColor={col.face}
            mouthOpen={mouthOpen}
            size={SIZE}
          />
        </div>
      </motion.div>

      {/* ── BOUTONS ─────────────────────────────────────────────────── */}
      <motion.div
        className="flex items-center justify-center gap-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        {/* Bouton annuler */}
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          {/* X custom — pas d'icône générique */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="4" y1="4" x2="16" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="4" x2="4" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.button>

        {/* Bouton appel principal */}
        <motion.button
          onClick={onCall}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isCallActive
              ? "rgba(239,68,68,0.9)"
              : "rgba(255,255,255,0.95)",
            boxShadow: isCallActive
              ? "0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)"
              : `0 0 40px ${col.ring}60, 0 0 80px ${col.ring}20`,
          }}
        >
          {/* Ondes autour du bouton quand appel actif */}
          {isCallActive && (
            <>
              {[0, 0.5, 1].map(delay => (
                <motion.div
                  key={delay}
                  className="absolute rounded-full border-2 border-red-400"
                  style={{ inset: -4 }}
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, delay, repeat: Infinity }}
                />
              ))}
            </>
          )}

          {/* Icône micro SVG custom */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            style={{ color: isCallActive ? "white" : "#111" }}
          >
            {/* Corps micro */}
            <rect x="12" y="4" width="8" height="14" rx="4"
              fill="currentColor" opacity={0.9} />
            {/* Bras micro */}
            <path d="M8 16 Q8 24 16 24 Q24 24 24 16"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" fill="none" />
            {/* Pied micro */}
            <line x1="16" y1="24" x2="16" y2="29"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="29" x2="21" y2="29"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.button>

        {/* Bouton muet */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Icône volume SVG custom */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 7H7L11 4V16L7 13H4V7Z"
              fill="rgba(255,255,255,0.4)" />
            <path d="M14 7C15.5 8 16 9 16 10C16 11 15.5 12 14 13"
              stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"
              strokeLinecap="round" fill="none" />
          </svg>
        </motion.button>
      </motion.div>

      {/* ── HINT ─────────────────────────────────────────────────────── */}
      <motion.p
        className="text-center text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {isCallActive
          ? "Appui long pour terminer l'appel"
          : "Cliquez sur le micro pour commencer"}
      </motion.p>

    </div>
  );
}
