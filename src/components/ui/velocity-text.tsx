"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { cn } from "../../lib/utils";
import { LampContainer } from "./lamp";

export const VelocityText = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 60,
    stiffness: 300
  });

  const skewVelocity = useTransform(smoothVelocity, [-1, 1], ["15deg", "-15deg"]);

  const translateX = useTransform(scrollYProgress, [0, 1], ["100%", "-100%"]);
  const smoothTranslateX = useSpring(translateX, {
    mass: 2,
    stiffness: 100,
    damping: 50
  });

  return (
    <section 
      ref={containerRef} 
      className={cn(
        "relative h-[1000vh] bg-slate-950 text-white",
        "transition-colors duration-300"
      )}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden z-10">
        <LampContainer className="h-full">
          <motion.p
            style={{
              skewX: skewVelocity,
              x: smoothTranslateX
            }}
            className={cn(
              "whitespace-nowrap text-7xl font-black uppercase leading-none md:text-9xl",
              "text-white/90"
            )}
          >
            VOICI VOTRE NOUVELLE RÉALITÉ - DÉCOUVREZ L'ÈRE OÙ L'IA REDÉFINIT VOTRE QUOTIDIEN - VOICI VOTRE NOUVELLE RÉALITÉ - DÉCOUVREZ L'ÈRE OÙ L'IA REDÉFINIT VOTRE QUOTIDIEN
          </motion.p>
        </LampContainer>
      </div>
    </section>
  );
};
