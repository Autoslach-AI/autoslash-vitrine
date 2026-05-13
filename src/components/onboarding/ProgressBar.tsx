import React from 'react';

interface Props {
  step: number;
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: Props) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed bottom-0 left-0 w-full p-8 flex flex-col items-center pointer-events-none" style={{ zIndex: 10 }}>
      <div className="w-full max-w-3xl space-y-4 pointer-events-auto">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            Progression
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            ÉTAPE {step} SUR {totalSteps}
          </span>
        </div>
        <div className="h-[2px] w-full bg-white/10 overflow-hidden rounded-full">
          <div 
            className="h-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
