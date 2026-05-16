"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SquareFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const phraseRef = useRef<HTMLDivElement>(null);

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
      gsap.set("#svg-stage", { transformOrigin: "center center" });

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=350%", // Increased scroll duration to slow down the animation
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
        }, 1.05);

      // Mouse interaction for the Title (Floating effect)
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
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
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
    </div>
  );
}
