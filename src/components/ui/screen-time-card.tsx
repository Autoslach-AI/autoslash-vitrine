"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface AppUsage {
  icon: React.ReactNode;
  name: string;
  duration: string;
  color?: string;
}

interface ScreenTimeCardProps {
  totalHours: number;
  totalMinutes: number;
  barData: number[];
  timeLabels?: string[];
  topApps: AppUsage[];
  className?: string;
}

export const ScreenTimeCard = ({
  totalHours,
  totalMinutes,
  barData,
  timeLabels = ["5 AM", "11 AM", "5 PM"],
  topApps,
  className,
}: ScreenTimeCardProps) => {
  const maxValue = Math.max(...barData);
  const normalizedData = barData.map((value) => value / maxValue);

  const barVariants = {
    hidden: { scaleY: 0 },
    visible: (i: number) => ({
      scaleY: 1,
      transition: {
        delay: i * 0.02,
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    }),
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black text-card-foreground px-5 py-4 backdrop-blur-sm shadow-2xl",
        className
      )}
    >
      <div className="flex gap-6 items-center">
        <div className="flex-1">
          <div className="mb-3 text-xl font-semibold text-white tracking-tight">
            {totalHours}h {totalMinutes}m
          </div>

          <div className="relative">
            <div className="absolute -right-6 top-0 flex h-16 flex-col justify-between text-[8px] text-white/30 font-medium">
              <span>2h</span>
              <span>1h</span>
              <span>0</span>
            </div>

            <div className="mb-1.5 flex h-16 items-end gap-[2px] relative z-10">
              {normalizedData.map((height, index) => {
                const isHighlighted = height > 0.6;
                const barColor = isHighlighted
                  ? "bg-gradient-to-t from-blue-600 to-purple-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                  : "bg-white/10";

                return (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={barVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.3 }}
                    className={cn("flex-1 rounded-t-[1px] origin-bottom", barColor)}
                    style={{ height: `${height * 100}%` }}
                  />
                );
              })}
            </div>

            <div className="flex justify-between text-[8px] text-white/30 font-medium">
              {timeLabels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-px bg-white/10 self-stretch my-1" />

        <div className="flex flex-col gap-2.5 justify-center">
          {topApps.map((app, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex items-center gap-2"
            >
              <div className="text-white/80 scale-75 origin-center">{app.icon}</div>
              <span className="text-[10px] text-white/90 font-medium whitespace-nowrap">{app.duration}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
