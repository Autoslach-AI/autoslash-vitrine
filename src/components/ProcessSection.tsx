import * as React from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";

/**
 * ProcessSection Component
 * A 4-stage narrative section tied to page scroll.
 * Features massive editorial typography and a "firm" sticky scroll behavior.
 */

const NARRATIVE_STEPS = [
  {
    id: "00",
    title: "Processus —",
    description: "Nous vous accompagnons pas à pas pour intégrer l'intelligence artificielle avec sérénité et clarté. Découvrez notre parcours structuré pour faire de votre transition numérique une réussite durable.",
    align: "start"
  },
  {
    id: "01",
    title: "Diagnostic —",
    description: "Diagnostic et Vision Stratégique. Nous plongeons dans votre écosystème pour identifier vos leviers de croissance. Cette phase d'analyse nous permet de définir ensemble les indicateurs de réussite (KPIs) et de tracer une feuille de route claire, alignée sur vos objectifs immédiats.",
    align: "end"
  },
  {
    id: "02",
    title: "Ingénierie —",
    description: "Ingénierie et Personnalisation. Nos experts développent votre solution IA sur-mesure. Nous ne faisons pas de l'intégration générique : chaque algorithme est affiné pour respecter votre identité de marque et s'adapter parfaitement à vos flux de données existants.",
    align: "start"
  },
  {
    id: "03",
    title: "Déploiement —",
    description: "Déploiement et Optimisation Continue. Mise en service de votre solution avec une surveillance constante. L'IA apprend en temps réel de chaque interaction, s'ajustant automatiquement pour garantir une avance technologique permanente et une efficacité redoutable.",
    align: "end"
  },
  {
    id: "04",
    title: "Livraison —",
    description: "Livraison et Garantie de Résultat. Livraison finale sous 15 à 20 jours. Nous nous engageons à vos côtés : nous peaufinons le système jusqu'à l'obtention des résultats voulus. En cas d'impossibilité technique ou d'insatisfaction, un remboursement total ou partiel est garanti contractuellement.",
    align: "start"
  }
];

export function ProcessSection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate which step is active based on 0-1 progress
  // We map 0-0.85 to 0-4 to ensure the last step is reached easily before the very end of the scroll
  const stepIndex = useTransform(scrollYProgress, [0, 0.85], [0, 4]);
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    return stepIndex.on("change", (v) => {
      // Use Math.round to have transitions happen in the middle of each segment
      const index = Math.min(Math.max(Math.round(v), 0), 4);
      if (index !== currentStep) {
        setCurrentStep(index);
      }
    });
  }, [stepIndex, currentStep]);

  return (
    <div ref={containerRef} className="relative w-full h-[500vh] bg-black">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center bg-black z-40 px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col gap-12 md:gap-16 pt-24"
          >
            {/* Title - Positioned with enough clearance for header */}
            <div className="title-wrapper overflow-hidden">
              <h2 className="font-sans font-black text-white leading-tight tracking-[-0.04em] text-[10vw] md:text-[8vw] uppercase select-none whitespace-nowrap">
                {NARRATIVE_STEPS[currentStep].title}
              </h2>
            </div>

            {/* Step Content / Description */}
            <div className={`flex w-full ${NARRATIVE_STEPS[currentStep].align === "end" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-2xl bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="flex items-start gap-6"
                >
                  <span className="font-mono text-[#F27D26] text-sm md:text-base font-bold tracking-widest mt-1.5 shrink-0">
                    {NARRATIVE_STEPS[currentStep].id}
                  </span>
                  <p className="font-sans text-lg md:text-xl text-white/95 leading-relaxed font-normal tracking-tight">
                    {NARRATIVE_STEPS[currentStep].description}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Micro-indicator - Simplified and pinned to bottom */}
        <div className="absolute left-1/2 bottom-12 -translate-x-1/2 flex gap-3">
          {NARRATIVE_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-[2px] transition-all duration-700 ${
                idx === currentStep ? "bg-[#F27D26] w-12" : "bg-white/20 w-8"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
