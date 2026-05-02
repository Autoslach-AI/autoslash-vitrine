"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useInView, animate } from "framer-motion";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({
  from,
  to,
  duration = 2,
  suffix = "",
  className,
}: AnimatedCounterProps) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      count.set(from);
      const controls = animate(count, to, {
        duration: duration,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [isInView, from, to, duration, count]);

  return (
    <div ref={ref} className={className}>
      <motion.div className="flex items-baseline justify-center">
        <motion.span className="bg-gradient-to-br from-sky-400 via-white to-white bg-clip-text text-transparent font-bold tracking-tighter">
          {rounded}
        </motion.span>
        <span className="bg-gradient-to-br from-sky-400 via-white to-white bg-clip-text text-transparent font-bold tracking-tighter ml-1">
          {suffix}
        </span>
      </motion.div>
    </div>
  );
};
