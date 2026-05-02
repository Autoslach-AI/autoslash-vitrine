import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { GradientCard } from "./ui/gradient-card";
import { Zap, TrendingUp, Shield, Instagram, MessageCircle, Youtube } from "lucide-react";
import { ScreenTimeCard } from "./ui/screen-time-card";
import { AnimatedCounter } from "./ui/animated-counter";
import SecurityCard from "./ui/security-card";

const benefits = [
  {
    title: "90% d'Automatisation",
    description: "L'IA travaille pour vous pendant que vous dormez. Propulsez votre croissance.",
    icon: <Zap className="w-6 h-6 text-white" />,
    children: (
      <ScreenTimeCard
        totalHours={6}
        totalMinutes={42}
        barData={[20, 45, 30, 80, 50, 90, 40, 60, 25, 75, 55, 85]}
        topApps={[
          { icon: <Instagram className="w-4 h-4" />, name: "Instagram", duration: "2h 15m" },
          { icon: <MessageCircle className="w-4 h-4" />, name: "WhatsApp", duration: "1h 45m" },
          { icon: <Youtube className="w-4 h-4" />, name: "YouTube", duration: "1h 12m" },
        ]}
      />
    )
  },
  {
    title: "Multiply Your Revenue",
    description: "Instant responsiveness, 24/7. Turn every interaction into an opportunity without lifting a finger. Scale without limits.",
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    children: (
      <div className="mt-12 flex justify-center">
        <AnimatedCounter 
          from={1} 
          to={700} 
          suffix="K" 
          className="text-6xl md:text-7xl lg:text-8xl"
        />
      </div>
    )
  },
  {
    title: "Grade-S Infrastructure",
    description: "Sécurité maximale. Nous protégeons vos données en continu.",
    icon: <Shield className="w-6 h-6 text-white" />,
    children: (
      <div className="mt-4">
        <SecurityCard 
          name="Liam Parker"
          email="liam.parker@autoslash.ai"
          delay={6000}
        />
      </div>
    )
  }
];

export default function Benefits() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const springConfig = { stiffness: 80, damping: 25, restDelta: 0.001 };

  // Unified Scroll Animation: Entry [0, 0.3], Stable [0.3, 0.7], Exit [0.7, 1]
  // Card 1 (Left): Slight expansion from center + entry/exit
  const x1Raw = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [-60, 0, 0, -40]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const rotate1 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [-5, 0, 0, -2]);

  // Card 2 (Center): Vertical float + entry/exit
  const y2Raw = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [100, 0, 0, -100]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale2 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.95]);

  // Card 3 (Right): Slight expansion from center + entry/exit
  const x3Raw = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [60, 0, 0, 40]);
  const opacity3 = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const rotate3 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [5, 0, 0, 2]);

  const x1 = useSpring(x1Raw, springConfig);
  const y2 = useSpring(y2Raw, springConfig);
  const x3 = useSpring(x3Raw, springConfig);

  const cardAnims = [
    { x: x1, y: 0, opacity: opacity1, rotate: rotate1, scale: 1 },
    { x: 0, y: y2, opacity: opacity2, rotate: 0, scale: scale2 },
    { x: x3, y: 0, opacity: opacity3, rotate: rotate3, scale: 1 }
  ];

  return (
    <section ref={containerRef} className="py-48 px-6 relative bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/50 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            AVANTAGES
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-white max-w-4xl mx-auto leading-[1.1]"
          >
            Dominez votre marché avec une infrastructure intelligente.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-light"
          >
            Ne soyez pas seulement un utilisateur d'IA. Soyez le propriétaire de votre propre système.
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row gap-0 mt-24 relative">
          {benefits.map((benefit, index) => (
            <React.Fragment key={benefit.title}>
              {index > 0 && (
                <div className="hidden md:block w-10 bg-black z-10 self-stretch" />
              )}
              <motion.div
                style={{
                  x: cardAnims[index].x,
                  y: cardAnims[index].y,
                  opacity: cardAnims[index].opacity,
                  rotateZ: cardAnims[index].rotate,
                  scale: cardAnims[index].scale,
                  perspective: 1000,
                  translateZ: 0 
                }}
                className="flex-1 relative py-20"
              >
                {/* Background Heartbeat Glow */}
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none"
                  animate={{
                    opacity: [0.1, 0.4, 0.1],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at center, rgba(78, 99, 255, 0.15) 0%, transparent 70%)`,
                      filter: "blur(80px)",
                    }}
                  />
                </motion.div>

                <div className="relative z-10">
                  <GradientCard
                    title={benefit.title}
                    description={benefit.description}
                    icon={benefit.icon}
                  >
                    {benefit.children}
                  </GradientCard>
                </div>
              </motion.div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

