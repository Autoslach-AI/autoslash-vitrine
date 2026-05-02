"use client";
import React from "react";
import { motion } from "motion/react";
import { PulseBeams } from "./ui/pulse-beams";
import { RainbowButton } from "./ui/rainbow-borders-button";
import { ArrowRight } from "lucide-react";

const beams = [
  {
    path: "M269 220.5H16.5C10.9772 220.5 6.5 224.977 6.5 230.5V398.5",
    gradientConfig: {
      initial: {
        x1: "0%",
        x2: "0%",
        y1: "80%",
        y2: "100%",
      },
      animate: {
        x1: ["0%", "0%", "200%"],
        x2: ["0%", "0%", "180%"],
        y1: ["80%", "0%", "0%"],
        y2: ["100%", "20%", "20%"],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 6.5, cy: 398.5, r: 6 },
      { cx: 269, cy: 220.5, r: 6 }
    ]
  },
  {
    path: "M568 200H841C846.523 200 851 195.523 851 190V40",
    gradientConfig: {
      initial: {
        x1: "0%",
        x2: "0%",
        y1: "80%",
        y2: "100%",
      },
      animate: {
        x1: ["20%", "100%", "100%"],
        x2: ["0%", "90%", "90%"],
        y1: ["80%", "80%", "-20%"],
        y2: ["100%", "100%", "0%"],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 851, cy: 34, r: 6.5 },
      { cx: 568, cy: 200, r: 6 }
    ]
  },
  {
    path: "M425.5 274V333C425.5 338.523 421.023 343 415.5 343H152C146.477 343 142 347.477 142 353V426.5",
    gradientConfig: {
      initial: {
        x1: "0%",
        x2: "0%",
        y1: "80%",
        y2: "100%",
      },
      animate: {
        x1: ["20%", "100%", "100%"],
        x2: ["0%", "90%", "90%"],
        y1: ["80%", "80%", "-20%"],
        y2: ["100%", "100%", "0%"],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 142, cy: 427, r: 6.5 },
      { cx: 425.5, cy: 274, r: 6 }
    ]
  },
  {
    path: "M493 274V333.226C493 338.749 497.477 343.226 503 343.226H760C765.523 343.226 770 347.703 770 353.226V427",
    gradientConfig: {
      initial: {
        x1: "40%",
        x2: "50%",
        y1: "160%",
        y2: "180%",
      },
      animate: {
        x1: "0%",
        x2: "10%",
        y1: "-40%",
        y2: "-20%",
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 770, cy: 427, r: 6.5 },
      { cx: 493, cy: 274, r: 6 }
    ]
  },
  {
    path: "M380 168V17C380 11.4772 384.477 7 390 7H414",
    gradientConfig: {
      initial: {
        x1: "-40%",
        x2: "-10%",
        y1: "0%",
        y2: "20%",
      },
      animate: {
        x1: ["40%", "0%", "0%"],
        x2: ["10%", "0%", "0%"],
        y1: ["0%", "0%", "180%"],
        y2: ["20%", "20%", "200%"],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 420.5, cy: 6.5, r: 6 },
      { cx: 380, cy: 168, r: 6 }
    ]
  }
];

const gradientColors = {
  start: "#18CCFC",
  middle: "#6344F5",
  end: "#AE48FF"
};

export default function DiscoverSection() {
  return (
    <section className="bg-brand-bg py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Passez à la vitesse supérieure
          </h2>
          <p className="max-w-2xl text-white/60 text-lg">
            Rejoignez l'élite technologique et transformez votre vision en réalité avec nos solutions d'IA sur-mesure.
          </p>
        </div>
        
        <div className="h-[450px] w-full flex items-center justify-center">
            <PulseBeams
              beams={beams}
              gradientColors={gradientColors}
              className="bg-transparent"
            >
              <motion.div
                animate={{
                  scale: [1, 1.08, 1, 1.08, 1],
                  boxShadow: [
                    "0 0 0px rgba(255,255,255,0)",
                    "0 0 25px rgba(255,255,255,0.4)",
                    "0 0 5px rgba(255,255,255,0.1)",
                    "0 0 25px rgba(255,255,255,0.4)",
                    "0 0 0px rgba(255,255,255,0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.15, 0.3, 0.45, 1],
                }}
                className="rounded-xl overflow-visible group"
              >
                <a href="/pricing" className="block outline-none">
                  <RainbowButton className="px-10 py-5">
                    <>
                      <span className="text-white text-xl md:text-2xl font-black tracking-tight">
                        Passer à l'action
                      </span>
                      <ArrowRight className="text-white w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  </RainbowButton>
                </a>
              </motion.div>
            </PulseBeams>
        </div>
      </div>
    </section>
  );
}
