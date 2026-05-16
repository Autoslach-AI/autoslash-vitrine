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
    <>
      {/* 1 Hero : L'entrée principale avec l'appel à l'action. */}
      <Hero onCTAClick={handleCTAClick} />

      {/* 2 A propos : presentation d'autoslach */}
      <Quote onCTAClick={handleCTAClick} />

      {/* 3 Benefits : Présentation des avantages. */}
      <Benefits />

      {/* 4 SquareFlow : Un flux visuel/animé. */}
      <SquareFlow />

      {/* 5 presentation service : Une section vidéo de prestation de service */}
      <CinematicVideo />

      {/* 6 partenaire : scroll chaque carte un témoignage client */}
      <ProductsPlatform onCTAClick={handleCTAClick} />

      {/* 7 ProjectShowcase : Vitrine des projets livré */}
      <ProjectShowcase onCTAClick={handleCTAClick} />

      {/* 8 ProcessSection : Détail du processus ("The Path to Automation"). */}
      <ProcessSection onCTAClick={handleCTAClick} />

      {/* 9 Conclusion sur le potentiel humain (CTA) */}
      <DiscoverSection onCTAClick={handleCTAClick} />
    </>
  );
}
