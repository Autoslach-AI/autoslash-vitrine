"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  FileUp,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  Code2,
  Palette,
  Layers,
  Rocket,
} from "lucide-react";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`; // reset first
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface RuixenMoonChatProps {
  onSendMessage?: (message: string) => void;
}

export default function RuixenMoonChat({ onSendMessage }: RuixenMoonChatProps) {
  const [message, setMessage] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex flex-col items-center"
      style={{
        backgroundImage:
          "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Centered AI Title */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg tracking-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Autoslash AI
          </h1>
          <p className="text-xl text-white/80 max-w-lg mx-auto font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Prêt à transformer votre vision en réalité ?
            <br />
            Posez votre première question.
          </p>
        </div>
      </div>

      {/* Input Box Section */}
      <div className="relative z-10 w-full max-w-3xl mb-[15vh] px-4">
        <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl transition-all hover:border-white/20">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez votre projet ou votre besoin..."
            className={cn(
              "w-full px-6 py-5 resize-none border-none",
              "bg-transparent text-white text-lg placeholder:text-white/20",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "min-h-[60px]"
            )}
            style={{ overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}
          />

          {/* Footer Buttons */}
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest hidden sm:block">
                Appuyez sur Entrée
              </span>
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl transition-all",
                  message.trim() 
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                )}
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">Envoyer</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-8">
          <QuickAction icon={<Code2 className="w-4 h-4" />} label="Générer du Code" onClick={() => setMessage("Aide-moi à coder mon site mobile")} />
          <QuickAction icon={<Rocket className="w-4 h-4" />} label="Lancer un Projet" onClick={() => setMessage("Comment lancer un business en 1 semaine ?")} />
          <QuickAction icon={<Layers className="w-4 h-4" />} label="Interface UI" onClick={() => setMessage("Design-moi un dashboard moderne")} />
          <QuickAction icon={<Palette className="w-4 h-4" />} label="Identité Visuelle" onClick={() => setMessage("Idées de charte graphique tech")} />
          <QuickAction icon={<CircleUserRound className="w-4 h-4" />} label="User Experience" onClick={() => setMessage("Optimiser mon parcours client")} />
          <QuickAction icon={<MonitorIcon className="w-4 h-4" />} label="Landing Page" onClick={() => setMessage("Structure d'une landing page qui convertit")} />
          <QuickAction icon={<FileUp className="w-4 h-4" />} label="Analyse Doc" onClick={() => setMessage("Analyse ce document stratégique")} />
          <QuickAction icon={<ImageIcon className="w-4 h-4" />} label="Génération Image" onClick={() => setMessage("Génère une image de couverture futuriste")} />
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-white/10 bg-black/40 text-white/50 backdrop-blur-md hover:text-white hover:bg-white/10 hover:border-white/30 transition-all font-medium py-1 px-4 h-auto"
    >
      <span className="text-blue-400/60">{icon}</span>
      <span className="text-[11px] uppercase tracking-wider">{label}</span>
    </Button>
  );
}
