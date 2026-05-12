import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingData } from '../../pages/onboarding';

interface Props {
  data: OnboardingData;
  onSubmit: (targetRoute?: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const packageDetails = {
  STARTUP: {
    title: "STARTUP",
    route: '/startup-package',
    points: [
      "Site web premium interactif et animé",
      "Formulaire de contact connecté à Supabase",
      "Déploiement Vercel avec URL live"
    ]
  },
  BUSINESS: {
    title: "BUSINESS",
    route: '/business-package',
    points: [
      "Agent Support WhatsApp entraîné sur vos données",
      "Automatisation réseaux sociaux & vidéos marketing",
      "1,000,000 tokens inclus par mois"
    ]
  },
  ENTERPRISE: {
    title: "ENTERPRISE",
    route: '/enterprise-package',
    points: [
      "Équipe de 3 à 5 agents IA experts dédiés",
      "Automatisation complète des processus via n8n",
      "Système d'acquisition client autonome"
    ]
  },
  ELITE: {
    title: "ELITE",
    route: '/elite-plan',
    points: [
      "Infrastructure IA scalable sur mesure",
      "Architecture technique & Sécurité avancée",
      "Support prioritaire & Ressources illimitées"
    ]
  }
};

export default function OnboardingStep5({ data, onSubmit, onBack, isSubmitting }: Props) {
  const details = packageDetails[data.recommendedPackage];
  const navigate = useNavigate();

  const handleDiscoverPackage = () => {
    onSubmit(details.route);
  };

  const handleGoToProfile = () => {
    onSubmit('/profile');
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-tight">
          Parfait, {data.firstName || 'bienvenue'}.
        </h2>
        <p className="text-white/60 font-jakarta text-lg">
          Basé sur votre secteur {data.sector} et votre besoin "{data.need}", nous recommandons :
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

      <div className="pt-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={handleDiscoverPackage}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-lg bg-white text-black font-jakarta font-bold text-[0.78rem] tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>DÉCOUVRIR MON PACKAGE <span className="group-hover:translate-x-1 transition-transform">→</span></>
          )}
        </button>

        <button
          onClick={handleGoToProfile}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-lg border border-white/20 text-white/70 font-jakarta font-bold text-[0.78rem] tracking-[0.2em] hover:bg-white/5 transition-all active:scale-[0.98]"
        >
          ACCÉDER À MON ESPACE →
        </button>
      </div>
    </div>
  );
}
