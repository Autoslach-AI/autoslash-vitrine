"use client"

import { cn } from "@/lib/utils";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Settings, Mic, X, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";
import HolographicFace from "@/components/ui/HolographicFace";

// --- Minimal Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "candy" | "default"
  size?: "sm" | "md"
}
const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
  const variants: Record<string, string> = {
    default:
      "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    candy: "bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500",
  }
  const sizes: Record<string, string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
  }
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

// --- Vocal Agent Config (Easy to modify later) ---
const VOCAL_CONFIG = {
  greeting: "Je suis prêt. Cliquez sur l'icône micro pour lancer l'appel avec moi.",
  listening: "Je vous écoute...",
  hint: "Cliquez pour commencer",
  hintActive: "Parlez maintenant"
};

// --- Scene4Vocal (The Commercial Agent Interface) ---
export default function Scene4Vocal() {
  const [orbState, setOrbState] = useState<"idle" | "speaking" | "listening" | "thinking">("idle");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState(VOCAL_CONFIG.greeting);
  
  const recognitionRef = useRef<any>(null);
  const conversationRef = useRef<{role: string; parts: {text: string}[]}[]>([]);
  const aiRef = useRef<any>(null);

  useEffect(() => {
    // Initialisation Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiRef.current = new GoogleGenAI({ apiKey });
    }
    
    // Charger les voix au montage
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const agentSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setOrbState("speaking");
    setStatus(text);

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.9;
    u.pitch = 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    // Priorité aux voix françaises de qualité
    const fr = voices.find(v => v.lang.startsWith("fr") && (v.name.includes("Google") || v.name.includes("Enhanced"))) || 
               voices.find(v => v.lang.startsWith("fr")) || 
               voices[0];
    
    if (fr) u.voice = fr;

    u.onend = () => startListening();
    u.onerror = () => startListening();
    window.speechSynthesis.speak(u);

    conversationRef.current.push({ role: "model", parts: [{ text }] });
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setIsListening(false);
      setOrbState("idle");
      return;
    }

    setOrbState("listening");
    setIsListening(true);
    setStatus(VOCAL_CONFIG.listening);

    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      conversationRef.current.push({ role: "user", parts: [{ text }] });
      callAI(text);
    };

    rec.onerror = () => {
      setOrbState("idle");
      setIsListening(false);
      setStatus(VOCAL_CONFIG.greeting);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const callAI = async (userText: string) => {
    setOrbState("thinking");
    setStatus("Je réfléchis...");

    if (!aiRef.current) {
      agentSpeak("Désolé, ma connexion à l'intelligence artificielle est interrompue.");
      return;
    }

    try {
      const response = await aiRef.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: conversationRef.current,
        config: {
          systemInstruction: `Tu es l'Agent Commercial d'Autoslash AI. Tu es en appel vocal avec un prospect.
Réponds en 2-3 phrases maximum — tu parles à voix haute.
Pose des questions pour comprendre : secteur d'activité, volume de prospects, et objectifs de vente.
Sois direct, énergique, professionnel et persuasif. Parle exclusivement en français.`,
          temperature: 0.8,
          maxOutputTokens: 150,
        },
      });

      const reply = response.text || "Pouvez-vous répéter ?";
      agentSpeak(reply);
    } catch (error) {
      console.error("AI Error:", error);
      agentSpeak("Une erreur technique est survenue. Pouvez-vous répéter votre demande ?");
    }
  };

  const toggleCall = () => {
    if (!isListening && orbState === "idle") {
      // Premier appel
      agentSpeak("Bonjour. Je suis votre Agent Commercial Autoslash AI. Parlez-moi de votre activité et de vos objectifs de vente.");
    } else {
      // Arrêt complet
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setOrbState("idle");
      setStatus(VOCAL_CONFIG.greeting);
      conversationRef.current = [];
    }
  };

  const handleCancel = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setOrbState("idle");
    setStatus(VOCAL_CONFIG.greeting);
    conversationRef.current = [];
  };

  return (
    <div className="fixed inset-0 bg-black">
      <HolographicFace 
        orbState={orbState}
        onCall={toggleCall}
        onCancel={handleCancel}
        isCallActive={isListening}
        agentName="Agent Commercial"
      />
    </div>
  );
}
