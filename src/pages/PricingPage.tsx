"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";

interface PricingFeature {
  text: string;
}
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
  };
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const heading = "L'Architecture du Futur";
  const description = "Du design agile à l'automatisation totale par l'IA. Sélectionnez le forfait conçu pour vous faire gagner un temps d'avance sur la concurrence.";
  
  const plans = [
    {
      id: "startup",
      name: "STARTUP",
      description: "Site web premium interactif et design haute qualité.",
      setupPrice: "150K",
      monthlyFee: "25K",
      features: [
        { text: "Design Haute Qualité avec animations" },
        { text: "Formulaire de contact connecté" },
        { text: "Déploiement Vercel avec URL live" },
        { text: "Maintenance et Hébergement" },
        { text: "Support : email uniquement" },
        { text: "Limite fichiers : 10 Mo" },
      ],
      button: {
        text: "Choisir Startup",
        url: "/startup-package",
      },
    },
    {
      id: "business",
      name: "BUSINESS",
      description: "Solution IA intermédiaire pour booster votre visibilité et votre support.",
      setupPrice: "300K",
      monthlyFee: "50K",
      features: [
        { text: "Agent Support WhatsApp entraîné sur vos données" },
        { text: "Automatisation réseaux sociaux et vidéos marketing" },
        { text: "Tokens IA : 1.000.000/mois" },
        { text: "Maintenance et Hébergement" },
        { text: "Support : WhatsApp + Email" },
        { text: "Limite fichiers : 25 Mo" },
      ],
      button: {
        text: "Choisir Business",
        url: "/business-package",
      },
    },
    {
        id: "enterprise",
        name: "ENTERPRISE",
        description: "Automatisation totale avec une équipe d'agents IA experts.",
        setupPrice: "450K",
        monthlyFee: "100K",
        features: [
          { text: "Équipe de 3 à 5 agents experts dédiés" },
          { text: "Agent Commercial (suivi automatique des leads)" },
          { text: "Agent Contenu (création et publication auto)" },
          { text: "Agent Support 24h/24 (WhatsApp + Web + Email)" },
          { text: "Automatisation complète via n8n" },
          { text: "Rapport mensuel intelligent généré par IA" },
          { text: "Tokens IA : 5.000.000/mois" },
          { text: "Maintenance et Hébergement" },
          { text: "Support : WhatsApp + Email + Appel mensuel" },
          { text: "Limite fichiers : 50 Mo" },
        ],
        button: {
          text: "Choisir Enterprise",
          url: "/enterprise-package",
        },
      },
  ];

  // --- minimal hero particles ---
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
    <section
      id="pricing"
      data-locked
      className="relative min-h-screen py-24 md:py-32 bg-zinc-950 text-zinc-50 overflow-hidden isolate"
    >
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-0"
        >
            <style>{`
                section[data-locked]{ color:#f6f7f8; color-scheme:dark }
                .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
                .hline,.vline{position:absolute;background:#27272a}
                .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .6s ease forwards}
                .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .7s ease forwards}
                .hline:nth-child(1){top:18%;animation-delay:.08s}
                .hline:nth-child(2){top:50%;animation-delay:.16s}
                .hline:nth-child(3){top:82%;animation-delay:.24s}
                .vline:nth-child(4){left:18%;animation-delay:.20s}
                .vline:nth-child(5){left:50%;animation-delay:.28s}
                .vline:nth-child(6){left:82%;animation-delay:.36s}
                @keyframes drawX{to{transform:scaleX(1)}}
                @keyframes drawY{to{transform:scaleY(1)}}
                .card-animate{opacity:0;transform:translateY(12px);animation:fadeUp .6s ease .25s forwards}
                @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
            `}</style>

            {/* Subtle vignette */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_15%,rgba(255,255,255,0.06),transparent_60%)]" />

            {/* Animated accent lines */}
            <div aria-hidden className="accent-lines">
                <div className="hline" />
                <div className="hline" />
                <div className="hline" />
                <div className="vline" />
                <div className="vline" />
                <div className="vline" />
            </div>

            {/* Particles */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
            />
        </motion.div>

      {/* Content */}
      <div className="relative container mx-auto px-4 z-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
            
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-pretty text-4xl font-bold lg:text-6xl mb-6">{heading}</h2>
            <p className="text-zinc-400 lg:text-xl max-w-2xl mx-auto">{description}</p>
          </motion.div>

          {/* PLAN ELITE Button */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Button
              asChild
              className="bg-[#2a6df5] hover:bg-[#2a6df5]/90 text-white rounded-full px-8 py-4 text-xs font-black tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(42,109,245,0.3)] group overflow-hidden relative"
            >
              <Link to="/elite-plan">
                <span className="relative z-10 flex items-center gap-2 uppercase">
                  PLAN ELITE
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </Button>
          </motion.div>

          {/* Features cards */}
          <div className="mt-12 flex flex-col items-stretch gap-6 md:flex-row justify-center w-full">
            {plans.map((plan, i) => {
              const baseFee = parseInt(plan.monthlyFee.replace("K", ""));
              const displayFee = isYearly 
                ? (baseFee * 10) + "K" // 2 months free
                : plan.monthlyFee;
              const interval = isYearly ? "/an" : "/mois";

              return (
                <Card
                  key={plan.id}
                  className={`card-animate flex w-full md:w-96 flex-col justify-between text-left border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 transition-all duration-500 ${
                    i === 1 ? "md:translate-y-2 border-white/20 shadow-2xl shadow-white/5" : ""
                  }`}
                  style={{ animationDelay: `${0.25 + i * 0.08}s` }}
                >
                  <CardHeader className="flex-col items-start space-y-2">
                    <CardTitle>
                      <p className="text-zinc-50">{plan.name}</p>
                    </CardTitle>
                    <p className="text-sm text-zinc-400 mt-2 min-h-10">{plan.description}</p>
                    <div className="mt-4 flex flex-col items-start gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                            {plan.setupPrice}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Setup</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#2a6df5]">
                            {displayFee}
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                             {interval} de maintenance et hébergement
                        </span>
                      </div>
                    </div>
                      <p className="text-[10px] text-zinc-600 mt-4 leading-tight">
                        Infrastructure sur mesure + Maintenance et Hébergement {isYearly ? "facturée annuellement" : "facturée au mois"}.
                      </p>
                  </CardHeader>

                <CardContent>
                  <Separator className="mb-6 bg-zinc-800" />
                  {plan.id === "business" && (
                    <p className="mb-3 font-semibold text-zinc-200 text-sm">
                      Tout ce qui est dans Startup, plus :
                    </p>
                  )}
                  {plan.id === "enterprise" && (
                     <p className="mb-3 font-semibold text-zinc-200 text-sm">
                        Tout Business, plus :
                    </p>
                  )}
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-zinc-200 text-sm">
                        <CircleCheck className="size-4 text-zinc-400 mt-0.5 shrink-0" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto pt-6">
                  <Button
                    asChild
                    className={`w-fit mx-auto px-8 py-2 h-9 rounded-lg text-xs font-bold transition-all ${i === 1 ? 'bg-white text-black hover:bg-neutral-200' : 'bg-transparent border border-white/10 text-white hover:bg-white/5'}`}
                  >
                    <Link to={plan.button.url}>
                      {plan.button.text}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
