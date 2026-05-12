import React from 'react';
import { OnboardingData } from '../../pages/onboarding';

interface Props {
  data: OnboardingData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const packageDetails = {
  STARTUP: {
    title: "STARTUP",
    points: [
      "Site web premium interactif et animé",
      "Formulaire de contact connecté à Supabase",
      "Déploiement Vercel avec URL live"
    ]
  },
  BUSINESS: {
    title: "BUSINESS",
    points: [
      "Agent Support WhatsApp entraîné sur vos données",
      "Automatisation réseaux sociaux & vidéos marketing",
      "1,000,000 tokens inclus par mois"
    ]
  },
  ENTERPRISE: {
    title: "ENTERPRISE",
    points: [
      "Équipe de 3 à 5 agents IA experts dédiés",
      "Automatisation complète des processus via n8n",
      "Système d'acquisition client autonome"
    ]
  },
  ELITE: {
    title: "ELITE",
    points: [
      "Infrastructure IA scalable sur mesure",
      "Architecture technique & Sécurité avancée",
      "Support prioritaire & Ressources illimitées"
    ]
  }
};

export default function OnboardingStep5({ data, onSubmit, onBack, isSubmitting }: Props) {
  const details = packageDetails[data.recommendedPackage];

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-tight">
          Votre infrastructure est prête.
        </h2>
        <p className="text-white/60 font-jakarta text-lg">
          Basé sur vos réponses, nous recommandons :
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-10 space-y-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">PACKAGE RECOMMANDÉ</span>
          <h3 className="text-5xl font-serif font-bold text-white mt-2">{details.title}</h3>
        </div>

        <ul className="space-y-4">
          {details.points.map((point, i) => (
            <li key={i} className="flex items-start gap-4 text-white/80 font-jakarta">
              <span className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-8 flex flex-col gap-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-5 rounded-full bg-white text-black font-jakarta font-bold text-sm tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>VOIR MON PACKAGE <span className="group-hover:translate-x-1 transition-transform">→</span></>
          )}
        </button>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="w-full py-5 rounded-full border border-white/10 text-white/60 font-jakarta font-bold text-sm tracking-[0.2em] hover:text-white hover:border-white/40 transition-all active:scale-[0.98]"
        >
          EXPLORER LES AUTRES OPTIONS
        </button>
        <button
          onClick={onBack}
          className="text-white/40 hover:text-white transition-colors text-xs tracking-widest font-bold uppercase mt-4"
        >
          Revoir mes réponses
        </button>
      </div>
    </div>
  );
}
