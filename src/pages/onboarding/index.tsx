import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingStep1 from '../../components/onboarding/OnboardingStep1';
import OnboardingStep2 from '../../components/onboarding/OnboardingStep2';
import OnboardingStep3 from '../../components/onboarding/OnboardingStep3';
import OnboardingStep4 from '../../components/onboarding/OnboardingStep4';
import OnboardingStep5 from '../../components/onboarding/OnboardingStep5';
import ProgressBar from '../../components/onboarding/ProgressBar';
import { completeOnboarding } from '../../lib/supabase-onboarding';

export interface OnboardingData {
  intention: string;
  sector: string;
  need: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  recommendedPackage: 'STARTUP' | 'BUSINESS' | 'ENTERPRISE' | 'ELITE';
}

export default function OnboardingPage() {
  const hasClerkKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans p-10 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="text-3xl font-serif">Configuration Requise</h1>
          <p className="text-white/60">
            Le système d'authentification Clerk n'est pas encore configuré. 
            Veuillez ajouter <code>VITE_CLERK_PUBLISHABLE_KEY</code> dans vos variables d'environnement.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm"
          >
            RETOUR À L'ACCUEIL
          </button>
        </div>
      </div>
    );
  }

  return <OnboardingPageInternal />;
}

function OnboardingPageInternal() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    intention: '',
    sector: '',
    need: '',
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    recommendedPackage: 'STARTUP'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate session ID
  useEffect(() => {
    if (!sessionStorage.getItem('onboarding_session_id')) {
      sessionStorage.setItem('onboarding_session_id', crypto.randomUUID());
    }
  }, []);

  // Pre-fill email from Clerk
  useEffect(() => {
    if (user) {
      setData(prev => ({
        ...prev,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }));
    }
  }, [user]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (targetRoute?: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await completeOnboarding(user.id, data);
      if (targetRoute) {
        navigate(targetRoute);
      } else {
        const pkg = data.recommendedPackage;
        const defaultRoute = pkg === 'ELITE' ? '/elite-plan' : `/${pkg.toLowerCase()}-package`;
        navigate(defaultRoute);
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="loader"></div></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center px-6 pt-20 pb-32">
      <div className="max-w-3xl w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {step === 1 && (
              <OnboardingStep1 
                value={data.intention} 
                onChange={(val) => setData({ ...data, intention: val })} 
                onNext={handleNext} 
              />
            )}
            {step === 2 && (
              <OnboardingStep2 
                value={data.sector} 
                onChange={(val) => setData({ ...data, sector: val })} 
                onNext={handleNext} 
                onBack={handleBack}
                intention={data.intention}
              />
            )}
            {step === 3 && (
              <OnboardingStep3 
                value={data.need} 
                onChange={(val, pkg) => setData({ ...data, need: val, recommendedPackage: pkg })} 
                onNext={handleNext} 
                onBack={handleBack}
                sector={data.sector}
              />
            )}
            {step === 4 && (
              <OnboardingStep4 
                data={data} 
                onChange={(updated) => setData({ ...data, ...updated })} 
                onNext={handleNext} 
                onBack={handleBack}
              />
            )}
            {step === 5 && (
              <OnboardingStep5 
                data={data} 
                onSubmit={handleSubmit} 
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <ProgressBar step={step} totalSteps={5} />
      </div>
    </div>
  );
}
