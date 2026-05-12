import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser, useClerk } from "@clerk/clerk-react";
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
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    navigate(destination);
  };

  return (
    <>
      <Hero onCTAClick={handleCTAClick} />
      <Quote onCTAClick={handleCTAClick} />
      <Benefits />
      <SquareFlow />
      <CinematicVideo />
      <ProductsPlatform onCTAClick={handleCTAClick} />
      <ProjectShowcase onCTAClick={handleCTAClick} />
      <ProcessSection onCTAClick={handleCTAClick} />
      <DiscoverSection onCTAClick={handleCTAClick} />
    </>
  );
}
