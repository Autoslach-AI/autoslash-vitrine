import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser, useClerk } from "@clerk/clerk-react";
import { useSectionTransitions } from "../hooks/useSectionTransitions";
import Hero from "../components/Hero";
import Quote from "../components/Quote";
import Benefits from "../components/Benefits";
import SquareFlow from "../components/SquareFlow";
import CinematicVideo from "../components/CinematicVideo";
import ProductsPlatform from "../components/ProductsPlatform";
import ProjectShowcase from "../components/ProjectShowcase";
import { ProcessSection } from "../components/ProcessSection";
import DiscoverSection from "../components/DiscoverSection";
import { checkOnboardingStatus } from "../lib/supabase-onboarding";

export default function Home() {
  const { openSignIn } = useClerk();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { containerRef } = useSectionTransitions();

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
    <div ref={containerRef}>
      <Hero onCTAClick={handleCTAClick} />
      
      <div className="st-type-a">
        <Quote onCTAClick={handleCTAClick} />
      </div>
      
      <div className="st-type-a">
        <Benefits />
      </div>
      
      <div className="st-type-b">
        <SquareFlow />
      </div>
      
      <div className="st-type-c">
        <CinematicVideo />
      </div>
      
      <div className="st-type-c">
        <ProductsPlatform onCTAClick={handleCTAClick} />
      </div>
      
      <div className="st-type-b">
        <ProjectShowcase onCTAClick={handleCTAClick} />
      </div>
      
      <div className="st-type-a">
        <ProcessSection onCTAClick={handleCTAClick} />
      </div>
      
      <DiscoverSection onCTAClick={handleCTAClick} />
    </div>
  );
}
