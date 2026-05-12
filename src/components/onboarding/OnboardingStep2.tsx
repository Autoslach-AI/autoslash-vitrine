import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
  intention?: string;
}

const options = [
  "Commerce & Retail",
  "Santé & Bien-être",
  "Finance & Conseil",
  "Éducation & Formation",
  "Immobilier",
  "Tech & SaaS",
  "Création & Médias",
  "Autre"
];

export default function OnboardingStep2({ value, onChange, onNext, onBack, intention }: Props) {
  const [isOther, setIsOther] = useState(value && !options.includes(value));
  const [otherText, setOtherText] = useState(isOther ? value : '');

  const handleSelect = (option: string) => {
    if (option === 'Autre') {
      setIsOther(true);
      onChange('');
    } else {
      setIsOther(false);
      onChange(option);
    }
  };

  const isNextDisabled = !value && (!isOther || !otherText.trim());

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-tight">
          Votre domaine d'activité ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          {intention && `Pour : "${intention}"`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className={`px-6 py-3 rounded-full border transition-all duration-300 font-jakarta text-sm ${
              (value === opt || (opt === 'Autre' && isOther))
                ? 'bg-white text-black border-white'
                : 'bg-black text-white border-white/20 hover:border-white/50'
            }`}
          >
            {opt}
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
              placeholder="Précisez votre secteur..."
              className="w-full bg-transparent border-b border-white/20 py-4 font-jakarta text-xl focus:border-white outline-none transition-colors"
              value={otherText}
              onChange={(e) => {
                setOtherText(e.target.value);
                onChange(e.target.value);
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
