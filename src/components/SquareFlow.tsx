"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionValue } from "motion/react";
import ShaderBackground from "./ui/shader-background";

import { MagicText } from "./ui/magic-text";

gsap.registerPlugin(ScrollTrigger);

export default function SquareFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const phraseRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<HTMLDivElement>(null);
  const automationTitleRef = useRef<HTMLDivElement>(null);
  const automationPhraseRef = useRef<HTMLDivElement>(null);
  const automationPhrase2Ref = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  const progress1 = useMotionValue(0);
  const progress2 = useMotionValue(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;
      if (!path) return;

      const length = path.getTotalLength();

      // Initial states
      gsap.set(path, { 
        strokeDasharray: length, 
        strokeDashoffset: length,
        opacity: 1
      });
      gsap.set(phraseRef.current, { opacity: 0, y: 30 });
      gsap.set(titleRef.current, { opacity: 1 });
      gsap.set(shaderRef.current, { opacity: 0 });
      gsap.set(automationTitleRef.current, { 
        opacity: 0, 
        scale: 0.2, 
        xPercent: -50, 
        yPercent: -50, 
        left: "50%", 
        top: "50%",
        y: 0 
      });
      gsap.set(automationPhraseRef.current, { opacity: 0, y: "100vh" });
      gsap.set(automationPhrase2Ref.current, { opacity: 0, y: "100vh" });
      gsap.set(curtainRef.current, { y: "100%" });
      gsap.set("#svg-stage", { transformOrigin: "center center" });

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=1700%", // Increased for the longer reveal durations
          pin: true,     // Pins the section
          scrub: 1.5,    // Smoother, more weighted scroll binding
        },
      });

      mainTl
        // 1. Initial square path draw + Left Title visible
        .to(path, { strokeDashoffset: 0, duration: 1, ease: "none" })
        
        // 2. Title disappears at 40% progress
        .to(titleRef.current, { opacity: 0, duration: 0.3, ease: "power2.inOut" }, 0.4)
        
        // 3. Phrase appears on the right at 60% progress
        .to(phraseRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.6)
        
        // 4. Final fade out of the phrase only
        .to(phraseRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.9)
        
        // 5. Zoom effect: The square grows to fill the screen
        .to("#svg-stage", { 
          scale: 12, 
          opacity: 0, 
          duration: 0.6, 
          ease: "power2.in" 
        }, 1.05)
        // SYNC: AUTOMATION Title zooms in from inside the square
        .to(automationTitleRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.in"
        }, 1.05)
        .to(shaderRef.current, {
          opacity: 1,
          duration: 0.4,
          ease: "power1.inOut"
        }, 1.7)
        
        // 6. After "hitting the screen", the title later sweeps up
        .to(automationTitleRef.current, {
          opacity: 0,
          y: "-100vh",
          duration: 2,
          ease: "none"
        }, 4.2)
        
        // 7. Automation Phrase 1
        .to(automationPhraseRef.current, {
          opacity: 1,
          y: "0vh",
          duration: 1.2,
          ease: "power2.out"
        }, 5.5) 
        .to({}, {
          duration: 2.5,
          onUpdate: function() {
            progress1.set(this.progress());
          }
        }, 6.2)
        .to(automationPhraseRef.current, {
          opacity: 0,
          y: "-100vh",
          duration: 1.2,
          ease: "power2.in"
        }, 8.7)
        
        // 8. Automation Phrase 2
        .to(automationPhrase2Ref.current, {
          opacity: 1,
          y: "0vh",
          duration: 1.2,
          ease: "power2.out"
        }, 10.0)
        .to({}, {
          duration: 2.5,
          onUpdate: function() {
            progress2.set(this.progress());
          }
        }, 10.7)
        .to(automationPhrase2Ref.current, {
          opacity: 0,
          y: "-100vh",
          duration: 1.2,
          ease: "power2.in"
        }, 13.2)
        
        // 9. Curtain Lift Reveal (Exit Section 3)
        .to(curtainRef.current, {
          y: "0%",
          duration: 2.5,
          ease: "power1.inOut"
        }, 14.5);

      // Mouse interaction for the Titles (Floating effect)
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;

        gsap.to(titleRef.current, {
          x: xPos,
          y: yPos,
          duration: 1,
          ease: "power2.out"
        });

        gsap.to(automationTitleRef.current, {
          x: xPos * 0.5,
          y: yPos * 0.5,
          duration: 1.2,
          ease: "power2.out"
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Shader Background - revealed at end of flow */}
      <div ref={shaderRef} className="absolute inset-0 z-0">
        <ShaderBackground />
        {/* Dimming overlay requested */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Curtain Reveal for next section */}
      <div ref={curtainRef} className="absolute inset-0 bg-black z-[30] translate-y-full" />

      {/* Left Side Title */}
      <div 
        ref={titleRef} 
        className="absolute left-[5%] text-left w-[300px] text-white font-sans pointer-events-none z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Éveil IA</h1>
      </div>

      {/* SVG Stage */}
      <svg 
        id="svg-stage" 
        className="z-[2] w-[50%] max-w-[400px] will-change-transform" 
        viewBox="-1 -1 103 103" 
        fill="none" 
        strokeWidth="1.2"
      >
        <defs>
          <linearGradient id="grad-1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0.2" stopColor="rgb(255, 135, 9)"></stop>
            <stop offset="0.8" stopColor="rgb(247, 189, 248)"></stop>
          </linearGradient>
        </defs>
        <path 
          ref={pathRef}
          stroke="url(#grad-1)" 
          d="M25 25 H 75 V 75 H 25 Z" 
          className="will-change-[stroke-dashoffset]"
        />
      </svg>

      {/* Right Side Phrase */}
      <div 
        ref={phraseRef} 
        className="absolute right-[5%] text-left w-[300px] text-white font-sans pointer-events-none leading-relaxed z-10"
      >
        <p className="text-lg md:text-xl text-white/80">
          Une architecture conçue pour l'élite.<br />
          Transformez chaque seconde en profit.<br />
          Le futur d'Autoslash commence ici.
        </p>
      </div>

      {/* NEW: Automation Title (Centered initially for zoom) */}
      <div 
        ref={automationTitleRef} 
        className="absolute text-center whitespace-nowrap text-white font-sans pointer-events-none z-10"
      >
        <h2 className="text-5xl md:text-[12vw] font-bold tracking-tighter uppercase leading-none">AUTOMATION</h2>
      </div>

      {/* NEW: Automation Phrase (Right) */}
      <div 
        ref={automationPhraseRef} 
        className="absolute right-[5%] text-right w-[40%] text-white font-sans pointer-events-none z-10"
      >
        <MagicText 
          text="En éliminant les actions chronophages, elle apporte un gain de temps précieux, permettant ainsi aux équipes de se concentrer sur des missions à plus forte valeur ajoutée." 
          progress={progress1}
        />
      </div>
 
      {/* NEW: Automation Phrase 2 (Left) */}
      <div 
        ref={automationPhrase2Ref} 
        className="absolute left-[5%] text-left w-[40%] text-white font-sans pointer-events-none z-10"
      >
        <MagicText 
          text="Ce temps libéré vous donne l'opportunité de se recentrer sur l'innovation, la stratégie et la relation client, propulsant ainsi vers un niveau supérieur." 
          progress={progress2}
        />
      </div>
    </div>
  );
}
