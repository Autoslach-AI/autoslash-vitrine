'use client'
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GradientCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const GradientCard = ({ title, description, icon, children }: GradientCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();

      // Calculate mouse position relative to card center
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Calculate rotation (limited range for subtle effect)
      const rotateX = -(y / rect.height) * 5; // Max 5 degrees rotation
      const rotateY = (x / rect.width) * 5; // Max 5 degrees rotation

      setRotation({ x: rotateX, y: rotateY });
    }
  };

  // Reset rotation when not hovering
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative rounded-[32px] overflow-hidden w-full max-w-[360px] h-[450px] mx-auto"
      style={{
        transformStyle: "preserve-3d",
        backgroundColor: "#000000",
        boxShadow: "0 -10px 100px 10px rgba(78, 99, 255, 0.15), 0 0 10px 0 rgba(0, 0, 0, 0.5)",
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered ? -5 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        perspective: 1000,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Subtle glass reflection overlay */}
      <motion.div
        className="absolute inset-0 z-35 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(1px)",
        }}
        animate={{
          opacity: isHovered ? 0.6 : 0.4,
          rotateX: -rotation.x * 0.2,
          rotateY: -rotation.y * 0.2,
          z: 1,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      />

      {/* Dark background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #000000 0%, #000000 100%)",
        }}
        animate={{
          z: -1
        }}
      />

      {/* Noise texture overlay */}
      <motion.div
        className="absolute inset-0 opacity-20 mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        animate={{
          z: -0.5
        }}
      />

      {/* Heartbeat Glow Effect (Internal) */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Purple/blue glow effect */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3"
          style={{
            background: `
              radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.3) -10%, rgba(79, 70, 229, 0) 70%),
              radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.3) -10%, rgba(79, 70, 229, 0) 70%)
            `,
            filter: "blur(60px)",
          }}
        />

        {/* Central purple glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3"
          style={{
            background: `
              radial-gradient(circle at bottom center, rgba(161, 58, 229, 0.3) -20%, rgba(79, 70, 229, 0) 60%)
            `,
            filter: "blur(70px)",
          }}
        />
      </motion.div>

      {/* Enhanced bottom border glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
        style={{
          background: "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)",
        }}
        animate={{
          boxShadow: isHovered
            ? "0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7), 0 0 40px 8px rgba(56, 189, 248, 0.5)"
            : "0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6), 0 0 35px 7px rgba(56, 189, 248, 0.4)",
          opacity: isHovered ? 1 : 0.9,
          z: 0.5
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      />

      {/* Card content */}
      <motion.div
        className="relative flex flex-col h-full p-8 z-40"
        animate={{
          z: 2
        }}
      >
        {/* Icon circle */}
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
            position: "relative",
            overflow: "hidden"
          }}
          animate={{
            boxShadow: isHovered
              ? "0 8px 16px -2px rgba(0, 0, 0, 0.3), 0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 2px 2px 5px rgba(255, 255, 255, 0.15), inset -2px -2px 5px rgba(0, 0, 0, 0.7)"
              : "0 6px 12px -2px rgba(0, 0, 0, 0.25), 0 3px 6px -1px rgba(0, 0, 0, 0.15), inset 1px 1px 3px rgba(255, 255, 255, 0.12), inset -2px -2px 4px rgba(0, 0, 0, 0.5)",
            z: isHovered ? 10 : 5,
            y: isHovered ? -2 : 0,
            rotateX: isHovered ? -rotation.x * 0.5 : 0,
            rotateY: isHovered ? -rotation.y * 0.5 : 0
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          <div className="flex items-center justify-center w-full h-full relative z-10">
            {icon || (
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 0L9.4 5.4L14.8 5.4L10.6 8.8L12 14.2L8 10.8L4 14.2L5.4 8.8L1.2 5.4L6.6 5.4L8 0Z"
                  fill="white"
                />
              </svg>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          animate={{
            z: isHovered ? 5 : 2,
            rotateX: isHovered ? -rotation.x * 0.3 : 0,
            rotateY: isHovered ? -rotation.y * 0.3 : 0
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          <h3 className="text-2xl font-medium text-white mb-3 tracking-tight leading-tight">
            {title}
          </h3>

          <p className="text-sm text-gray-300 leading-relaxed opacity-85 font-light">
            {description}
          </p>
        </motion.div>

        {children && (
          <motion.div
            className="mt-6"
            animate={{
              z: isHovered ? 8 : 4,
              rotateX: isHovered ? -rotation.x * 0.2 : 0,
              rotateY: isHovered ? -rotation.y * 0.2 : 0
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut"
            }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
