import { useEffect, useRef } from "react";
import { motion } from "motion/react";

export const GridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      const h = Math.max(1, Math.floor(rect?.height ?? window.innerHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let parts: P[] = [];
    let raf = 0;

    const make = (): P => ({
      x: Math.random() * (canvas.width / (window.devicePixelRatio || 1)),
      y: Math.random() * (canvas.height / (window.devicePixelRatio || 1)),
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      parts = [];
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const count = Math.floor((w * h) / 12000);
      for (let i = 0; i < count; i++) parts.push(make());
    };

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * w;
          p.y = h + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas.parentElement || document.body);

    init();
    raf = requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    >
      <style>{`
        .accent-lines-bg { position: absolute; inset: 0; pointer-events: none; opacity: .4 }
        .grid-hline, .grid-vline { position: absolute; background: rgba(255, 255, 255, 0.05) }
        .grid-hline { left: 0; right: 0; height: 1px; transform: scaleX(0); transform-origin: 50% 50%; animation: drawGridX .8s ease forwards }
        .grid-vline { top: 0; bottom: 0; width: 1px; transform: scaleY(0); transform-origin: 50% 0%; animation: drawGridY .9s ease forwards }
        .grid-hline:nth-child(1) { top: 18%; animation-delay: .1s }
        .grid-hline:nth-child(2) { top: 50%; animation-delay: .2s }
        .grid-hline:nth-child(3) { top: 82%; animation-delay: .3s }
        .grid-vline:nth-child(4) { left: 18%; animation-delay: .25s }
        .grid-vline:nth-child(5) { left: 50%; animation-delay: .35s }
        .grid-vline:nth-child(6) { left: 82%; animation-delay: .45s }
        @keyframes drawGridX { to { transform: scaleX(1) } }
        @keyframes drawGridY { to { transform: scaleY(1) } }
      `}</style>

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_15%,rgba(255,255,255,0.05),transparent_60%)]" />

      {/* Animated accent lines */}
      <div aria-hidden className="accent-lines-bg">
        <div className="grid-hline" />
        <div className="grid-hline" />
        <div className="grid-hline" />
        <div className="grid-vline" />
        <div className="grid-vline" />
        <div className="grid-vline" />
      </div>

      {/* Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      />
    </motion.div>
  );
};
