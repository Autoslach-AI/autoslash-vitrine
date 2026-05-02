"use client"

import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "../../lib/utils"

export interface AutoslashLogoProps {
  className?: string
  isProcessing?: boolean
  invert?: boolean
}

/**
 * Autoslash Logo Component
 * 
 * Refined Visual Identity:
 * - Geometric DNA Double-Helix structure (Interwoven loops)
 * - Sharp central vertical slash piercing the intersection
 * - Gradient: #2EB9DF (Electric Cyan) to #9E00FF (Deep Violet)
 * - 12-second Respiration animation (Luminance/Opacity pulse)
 * - High-speed data flow particles in processing state
 */
export function AutoslashLogo({ className, isProcessing = false, invert = false }: AutoslashLogoProps) {
  // Sinusoidal breathing pulse - subtle luminance and light pulse
  const respirationVariants = {
    resting: {
      filter: [
        `brightness(${invert ? 0.8 : 0.9}) drop-shadow(0 0 3px rgba(46, 185, 223, ${invert ? 0.4 : 0.3}))`,
        `brightness(${invert ? 1.0 : 1.1}) drop-shadow(0 0 8px rgba(46, 185, 223, ${invert ? 0.6 : 0.5}))`,
        `brightness(${invert ? 0.8 : 0.9}) drop-shadow(0 0 3px rgba(46, 185, 223, ${invert ? 0.4 : 0.3}))`
      ],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    processing: {
      filter: `brightness(${invert ? 1.1 : 1.2}) drop-shadow(0 0 12px rgba(46, 185, 223, 0.8))`,
      transition: { duration: 0.3 }
    }
  }

  // High-precision Biological DNA Helix Geometry
  // Strand A: Winding helical path
  const loop1 = "M80,40 C140,40 140,160 80,160 C20,160 20,40 80,40"
  // Strand B: Mirrored helical path offset for interweaving
  const loop2 = "M120,40 C60,40 60,160 120,160 C180,160 180,40 120,40"
  // Sharp central vertical razor slash piercing the intersection
  const slashPath = "M100,20 L100,180"

  return (
    <div className={cn("relative flex items-center justify-center p-1", className)}>
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto overflow-visible"
        initial="resting"
        animate={isProcessing ? "processing" : "resting"}
        variants={respirationVariants}
      >
        <defs>
          <linearGradient id="helix-linear-gradient" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2EB9DF">
              <motion.animate 
                attributeName="stop-opacity" 
                values="0.8;1;0.8" 
                dur="12s" 
                repeatCount="indefinite" 
              />
            </stop>
            <stop offset="1" stopColor="#9E00FF">
              <motion.animate 
                attributeName="stop-opacity" 
                values="0.8;1;0.8" 
                dur="12s" 
                repeatCount="indefinite" 
              />
            </stop>
          </linearGradient>

          {/* Mask for true interwoven logic - strands passing over/under each other */}
          <mask id="helix-interweave-mask">
            <rect width="200" height="200" fill="white" />
            {/* Cut holes where loop1 should appear BEHIND loop2 and the slash */}
            <path d="M100,80 L100,120" stroke="black" strokeWidth="20" />
            <path d="M70,100 L130,100" stroke="black" strokeWidth="20" />
          </mask>
          
          <filter id="sharp-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* DNA Helix Structure - Interwoven volumetric strands */}
        <g filter="url(#sharp-neon-glow)">
          <motion.path
            d={loop1}
            stroke="url(#helix-linear-gradient)"
            strokeWidth="15"
            strokeLinecap="round"
            className="opacity-90"
          />
          <motion.path
            d={loop2}
            stroke="url(#helix-linear-gradient)"
            strokeWidth="15"
            strokeLinecap="round"
            mask="url(#helix-interweave-mask)"
            style={{ mixBlendMode: 'screen' }}
            className="opacity-95"
          />
        </g>

        {/* Sharp Vertical Slash - Piercing the structure */}
        <motion.path
          d={slashPath}
          stroke="url(#helix-linear-gradient)"
          strokeWidth="11"
          strokeLinecap="butt"
          filter="url(#sharp-neon-glow)"
          className="opacity-100"
        />

        {/* Processing State: Rapid Particle Flow winding through complexity */}
        <AnimatePresence>
          {isProcessing && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Particles winding through the intricate DNA curves */}
              <motion.path
                d={loop1}
                stroke="white"
                strokeWidth="4"
                strokeDasharray="4 60"
                strokeLinecap="round"
                animate={{ strokeDashoffset: [400, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="opacity-80"
              />
              <motion.path
                d={loop2}
                stroke="white"
                strokeWidth="4"
                strokeDasharray="4 60"
                strokeLinecap="round"
                animate={{ strokeDashoffset: [-400, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="opacity-80"
              />
              
              {/* High-speed data bursts along the central slash */}
              <motion.path
                d={slashPath}
                stroke="white"
                strokeWidth="5"
                strokeDasharray="20 80"
                strokeLinecap="round"
                animate={{ strokeDashoffset: [600, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                className="opacity-100"
              />
            </motion.g>
          )}
        </AnimatePresence>
      </motion.svg>
    </div>
  )
}
