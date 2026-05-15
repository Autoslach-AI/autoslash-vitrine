import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { motion } from "motion/react";
import Hero from "../components/Hero";
import Quote from "../components/Quote";
import Benefits from "../components/Benefits";
import SquareFlow from "../components/SquareFlow";
import CinematicVideo from "../components/CinematicVideo";
import ProductsPlatform from "../components/ProductsPlatform";
import ProjectShowcase from "../components/ProjectShowcase";
import { ProcessSection } from "../components/ProcessSection";
import DiscoverSection from "../components/DiscoverSection";

interface SectionRevealProps {
  children: React.ReactNode;
  delay?: number;
}

const SectionReveal = ({ children, delay = 0 }: SectionRevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const { openSignIn } = useClerk();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Trigger A — Timer automatique
  useEffect(() => {
    if (isSignedIn) return;
    const timer = setTimeout(() => {
      openSignIn();
    }, 15000);
    return () => clearTimeout(timer);
  }, [isSignedIn]);

  // Trigger B — Clic sur n'importe quel bouton de la page Home
  const handleCTAClick = (destination: string) => {
    if (destination === "/pricing") {
      navigate(destination);
      return;
    }
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    navigate(destination);
  };

  return (
    <div className="overflow-x-hidden">
      <SectionReveal>
        <Hero onCTAClick={handleCTAClick} />
      </SectionReveal>
      
      <SectionReveal>
        <Quote onCTAClick={handleCTAClick} />
      </SectionReveal>
      
      <SectionReveal>
        <Benefits />
      </SectionReveal>
      
      <SectionReveal>
        <SquareFlow />
      </SectionReveal>
      
      <SectionReveal>
        <CinematicVideo />
      </SectionReveal>
      
      <SectionReveal>
        <ProductsPlatform onCTAClick={handleCTAClick} />
      </SectionReveal>
      
      <SectionReveal>
        <ProjectShowcase onCTAClick={handleCTAClick} />
      </SectionReveal>
      
      <SectionReveal>
        <ProcessSection onCTAClick={handleCTAClick} />
      </SectionReveal>
      
      <SectionReveal>
        <DiscoverSection onCTAClick={handleCTAClick} />
      </SectionReveal>
    </div>
  );
}
