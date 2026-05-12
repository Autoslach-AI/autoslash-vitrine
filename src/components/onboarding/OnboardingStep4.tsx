import React from 'react';
import { OnboardingData } from '../../pages/onboarding';

interface Props {
  data: OnboardingData;
  onChange: (updated: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStep4({ data, onChange, onNext, onBack }: Props) {
  const isNextDisabled = !data.firstName.trim() || !data.lastName.trim() || !data.email.trim();

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-tight">
          Comment vous appelle-t-on ?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Prénom *</label>
          <input
            type="text"
            placeholder="Ex: Amadou"
            className="w-full bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Nom *</label>
          <input
            type="text"
            placeholder="Ex: Mbaye"
            className="w-full bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Email professionnel *</label>
          <input
            type="email"
            placeholder="votre@email.com"
            className="w-full bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Entreprise (optionnel)</label>
          <input
            type="text"
            placeholder="Nom de votre société"
            className="w-full bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
            value={data.company}
            onChange={(e) => onChange({ company: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-8 flex gap-4">
        <button
          onClick={onBack}
          className="px-10 py-4 rounded-full font-jakarta font-bold text-sm tracking-widest border border-white/20 text-white hover:border-white/50 transition-all active:scale-95"
        >
          ← RETOUR
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`px-10 py-4 rounded-full font-jakarta font-bold text-sm tracking-widest transition-all duration-300 ${
            isNextDisabled 
              ? 'bg-white/10 text-white/40 cursor-not-allowed' 
              : 'bg-white text-black hover:scale-105 active:scale-95'
          }`}
        >
          SUIVANT →
        </button>
      </div>
    </div>
  );
}
