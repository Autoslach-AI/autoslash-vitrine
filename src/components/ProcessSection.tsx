import * as React from "react";
import FlowArt, { FlowSection } from "./ui/story-scroll";

/**
 * ProcessSection Component
 * A multi-stage narrative section using the FlowArt scroll mechanism.
 */

const NARRATIVE_STEPS = [
  {
    id: "00",
    label: "Processus",
    title: "Accompagnement ",
    description: "Nous vous accompagnons pas à pas pour intégrer l'intelligence artificielle avec sérénité et clarté. Découvrez notre parcours structuré pour faire de votre transition numérique une réussite durable.",
    bg: "#fd5200",
    color: "#fff"
  },
  {
    id: "01",
    label: "Diagnostic",
    title: "Vision - Stratégique",
    description: "Diagnostic et Vision Stratégique. Nous plongeons dans votre écosystème pour identifier vos leviers de croissance. Cette phase d'analyse nous permet de définir ensemble les indicateurs de réussite (KPIs) et de tracer une feuille de route claire, alignée sur vos objectifs immédiats.",
    bg: "#0086AD",
    color: "#fff"
  },
  {
    id: "02",
    label: "Ingénierie",
    title: "Solution ",
    description: "Ingénierie et Personnalisation. Nos experts développent votre solution IA sur-mesure. Nous ne faisons pas de l'intégration générique : chaque algorithme est affiné pour respecter votre identité de marque et s'adapter parfaitement à vos flux de données existants.",
    bg: "#F5F0E8",
    color: "#000"
  },
  {
    id: "03",
    label: "Déploiement",
    title: "Optimisation - Continue",
    description: "Déploiement et Optimisation Continue. Mise en service de votre solution avec une surveillance constante. L'IA apprend en temps réel de chaque interaction, s'ajustant automatiquement pour garantir une avance technologique permanente et une efficacité redoutable.",
    bg: "#1A3DE8",
    color: "#fff"
  },
  {
    id: "04",
    label: "Livraison",
    title: "Garantie - Résultat",
    description: "Livraison et Garantie de Résultat. Livraison finale sous 15 à 20 jours. Nous nous engageons à vos côtés : nous peaufinons le système jusqu'à l'obtention des résultats voulus. En cas d'impossibilité technique ou d'insatisfaction, un remboursement total ou partiel est garanti contractuellement.",
    bg: "#000",
    color: "#fff"
  }
];

export function ProcessSection() {
  return (
    <FlowArt aria-label="Processus Autoslash AI">
      {NARRATIVE_STEPS.map((step, index) => (
        <FlowSection 
          key={step.id} 
          aria-label={step.label} 
          style={{ backgroundColor: step.bg, color: step.color }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            {step.id} — {step.label}
          </p>
          <hr className={`my-[2vw] border-none border-t ${step.color === "#fff" ? "border-white/20" : "border-black/20"}`} />
          <div>
            <h2 className="text-[clamp(2.5rem,7vw,7rem)] font-bold leading-tight uppercase tracking-tight whitespace-nowrap">
              {step.title}
            </h2>
          </div>
          <hr className={`my-[2vw] border-none border-t ${step.color === "#fff" ? "border-white/20" : "border-black/20"}`} />
          <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.2vw,1.8rem)] font-normal leading-relaxed">
            {step.description}
          </p>
        </FlowSection>
      ))}
    </FlowArt>
  );
}
