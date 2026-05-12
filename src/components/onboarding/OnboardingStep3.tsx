import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  value: string;
  onChange: (val: string, pkg: 'STARTUP' | 'BUSINESS' | 'ENTERPRISE' | 'ELITE') => void;
  onNext: () => void;
  onBack: () => void;
}

const options = [
  { label: "Une présence en ligne professionnelle", package: 'STARTUP' },
  { label: "Des agents IA qui travaillent pour moi 24h/24", package: 'BUSINESS' },
  { label: "Automatiser mon acquisition client", package: 'ENTERPRISE' },
  { label: "Un système complet clé en main", package: 'ELITE' },
  { label: "Autre", package: 'STARTUP' }
] as const;

export default function OnboardingStep3({ value, onChange, onNext, onBack }: Props) {
  const [isOther, setIsOther] = useState(value && !options.slice(0, 4).some(o => o.label === value));
  const [otherText, setOtherText] = useState(isOther ? value : '');

  const handleSelect = (option: typeof options[number]) => {
    if (option.label === 'Autre') {
      setIsOther(true);
      onChange('', 'STARTUP');
    } else {
      setIsOther(false);
      onChange(option.label, option.package as any);
    }
  };

  const isNextDisabled = !value && (!isOther || !otherText.trim());

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-tight">
          Ce qui vous manque le plus aujourd'hui ?
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleSelect(opt)}
            className={`w-full text-left px-8 py-5 rounded-2xl border transition-all duration-300 font-jakarta text-lg ${
              (value === opt.label || (opt.label === 'Autre' && isOther))
                ? 'bg-white text-black border-white'
                : 'bg-black text-white border-white/20 hover:border-white/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isOther && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              placeholder="Précisez votre besoin..."
              className="w-full bg-transparent border-b border-white/20 py-4 font-jakarta text-xl focus:border-white outline-none transition-colors"
              value={otherText}
              onChange={(e) => {
                setOtherText(e.target.value);
                onChange(e.target.value, 'STARTUP');
              }}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

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
