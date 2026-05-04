import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Globe, ShoppingCart, ChevronDown, Check, ArrowRight, Layout, Info, HelpCircle, Shield, X, Facebook, Linkedin, Instagram, MessageCircle, MoreHorizontal } from "lucide-react";
import { Template } from "../../types";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { ROSEHILL_DEMO_HTML } from "./DemoContent";
import { ArrowDotsButton } from "../ui/arrow-dots-button";

// --- Section 0: Global App Header (The Topmost Bar) ---
export const AppHeader = () => {
  return (
    <div className="w-full h-16 bg-transparent border-b border-white/5 flex items-center justify-between px-10">
      <div className="flex items-center gap-3">
        {/* Autoslash AI Logo - Gradient Circle + AI Text */}
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2a6df5] via-[#1a5de5] to-[#1e40af] opacity-80 blur-[1px]" />
          <div className="absolute inset-[3px] rounded-full border-2 border-white/40 flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-blue-500/20 backdrop-blur-sm" />
          </div>
        </div>
        <span className="text-[18px] font-black tracking-tighter text-[#2a6df5]">AI</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="w-8 h-[2px] bg-[#2a6df5] rounded-full" />
      </div>
    </div>
  );
};

// --- Section 1: Architecture Header ---
export const DetailHero = ({ template, onOrder }: { template: Template; onOrder?: () => void }) => {
  return (
    <div className="w-full bg-transparent relative pt-8 pb-12">
      <div className="max-w-[1700px] mx-auto px-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mt-10">
          {/* Title Section */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              {template.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.open(template.preview_url || "https://demo.autoslash.ai", "_blank")}
              className="px-3 py-1.5 bg-black border border-white/10 text-white text-[10px] font-bold rounded-lg shadow-sm hover:border-white/20 transition-all active:scale-95 whitespace-nowrap"
            >
              Aperçu
            </button>
            <button 
              onClick={onOrder}
              className="px-4 py-1.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#2a6df5] hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              ACTIVER STARTUP 150K
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Section 1.5: Interactive Showcase ---
export const DetailShowcase = ({ template }: { template: Template }) => {
  return (
    <div className="w-full bg-black py-20 flex justify-center">
      <div className="w-full max-w-[1100px] px-6 relative rounded-[2.5rem] overflow-hidden aspect-[4/3] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
        <img
          src={template.image}
          alt={template.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {template.preview_url ? (
            <a
              href={template.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-black font-black text-sm uppercase tracking-widest rounded-full hover:scale-105 transition-all"
            >
              Visiter le site →
            </a>
          ) : (
            <div className="px-8 py-4 bg-white/10 text-white/40 font-black text-sm uppercase tracking-widest rounded-full border border-white/10">
              Bientôt disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Section 2: Dynamic Description & Toggle (Screenshot 3 & 5 Structure - Light Mode) ---
export const DetailDescription = ({ template }: { template: Template }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mandatory features for Startup Package
  const startupFeatures = [
    {
      title: "Centre de Contrôle (Dashboard)",
      description: "Un tableau de bord complet pour piloter toute l'infrastructure et suivre vos indicateurs clés."
    },
    {
      title: "Base de Données Modifiable",
      description: "Une gestion de données intuitive et flexible (style Google Sheets) pour un contrôle total sur vos contenus."
    },
    ...template.features
  ];

  return (
    <div className="w-full py-32 bg-transparent">
      <div className="max-w-[1700px] mx-auto px-10">
        {/* Intro Message */}
        <div className="mb-24 max-w-5xl">
          <p className="text-2xl md:text-3xl text-white/50 leading-relaxed font-normal tracking-tight">
            Boostez votre communauté et vos services avec le modèle <span className="text-white font-bold">{template.title}</span>. Une architecture conçue pour une expérience utilisateur sans compromis, des temps de réponse ultra-rapides et une scalabilité totale.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 xl:gap-40">
          {/* Main Content (2/3 Column) */}
          <div className="lg:col-span-8">
            {/* Navigation Tabs */}
            <div className="flex gap-12 border-b border-white/[0.05] mb-16 overflow-x-auto no-scrollbar">
              {["Aperçu", "Licence", "Infra Technique", "FAQ"].map((tab, i) => (
                <button 
                   key={tab} 
                   className={cn(
                     "pb-6 text-[13px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                     i === 0 ? "text-white" : "text-white/30 hover:text-white"
                   )}
                 >
                   {tab}
                   {i === 0 && <motion.div layoutId="tabMarker" className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[#2a6df5]" />}
                 </button>
              ))}
            </div>

            <div className="flex flex-col gap-10 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              L'Infrastructure {template.category} : Une approche Haute-Fidélité
            </h2>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-light">
                <p>{template?.longDescription?.split('\n\n')[0] || ''}</p>
                <p>{template?.longDescription?.split('\n\n')[1] || ''}</p>
              </div>
            </div>

            {/* Expandable Technical Section */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden flex flex-col gap-20 pt-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {startupFeatures.map((feature, i) => (
                      <div key={i} className="flex flex-col gap-6 p-8 rounded-3xl bg-white/[0.03] border border-white/[0.03] hover:border-white/[0.08] transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-[#2a6df5]/10 flex items-center justify-center text-[#2a6df5]">
                          <Check size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                        <p className="text-white/50 text-[15px] leading-relaxed">{feature.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-10 bg-white/[0.03] border border-white/[0.03] rounded-[40px] p-12">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">Cartographie de l'Architecture</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                      {template?.pages?.map((page, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className="w-2 h-2 rounded-full bg-[#2a6df5]/40 group-hover:bg-[#2a6df5] transition-all" />
                          <span className="text-[15px] text-white/50 group-hover:text-white transition-colors">{page}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center mt-20 pb-20 border-b border-white/[0.05]">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-12 py-4 rounded-full border border-white/[0.08] bg-black text-white text-[12px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-sm"
              >
                {isExpanded ? "Afficher moins" : "Afficher plus"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-16">
            <div className="flex flex-col gap-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10">Sous-catégories</h3>
              <div className="flex flex-wrap gap-2.5">
                {template?.subCategories?.map(s => (
                  <span key={s} className="px-4 py-2 bg-white/5 text-[12px] text-white/50 font-semibold rounded-lg hover:bg-[#2a6df5] hover:text-black transition-all cursor-default uppercase">{s}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10">Esthétique</h3>
              <div className="flex flex-wrap gap-2.5">
                {template?.styles?.map(s => (
                  <span key={s} className="px-4 py-2 bg-white/5 text-[12px] text-white/50 font-semibold rounded-lg hover:bg-white hover:text-black transition-all cursor-default uppercase">{s}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10">Spécifications</h3>
              <div className="space-y-1">
                {["Polices Web optimisées", "Curseurs dynamiques", "Intégration n8n"].map(f => (
                  <div key={f} className="flex items-center justify-between py-5 border-b border-white/[0.05] group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-md bg-[#2a6df5]/20 flex items-center justify-center">
                        <Check size={12} className="text-[#2a6df5]" />
                      </div>
                      <span className="text-[15px] font-medium text-white/60 group-hover:text-[#2a6df5] transition-colors">{f}</span>
                    </div>
                    <ArrowRight size={14} className="text-white/10 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-[#2a6df5] flex flex-col gap-6 shadow-xl transform hover:scale-[1.02] transition-transform">
              <h3 className="text-black font-black uppercase text-[12px] tracking-[0.3em]">Besoin d'IA ?</h3>
              <p className="text-black/70 text-[14px] leading-relaxed font-medium">
                Cette architecture est compatible avec nos agents autonomes. Couplez-la à nos solutions Business pour une automatisation totale.
              </p>
              <Link to="/pricing" className="w-full py-4 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest text-center hover:opacity-90 transition-opacity">
                Explorer les Forfaits
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Section 3: Recommendations Grid ---
export const DetailRecommendations = ({ currentId, templates, category }: { currentId: string, templates: Template[], category: string }) => {
  const recommendations = templates
    .filter(t => t.id !== currentId && t.category === category)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  return (
    <div className="w-full py-40 bg-transparent border-t border-white/5">
      <div className="max-w-[1700px] mx-auto px-10">
        <div className="flex flex-row items-end justify-between mb-20">
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#2a6df5]">Bibliothèque</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-none">Architectures Similaires</h2>
          </div>
          <Link to="/startup-package" className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-[#2a6df5] transition-all group pb-2">
            Parcourir tout <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {recommendations.map((template) => (
            <Link 
              key={template.id} 
              to={`/architecture/${template.id}`}
              className="group flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1.5 ml-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 group-hover:text-white/30 transition-colors">{template.category}</span>
              </div>
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-neutral-100 border border-black/[0.03] shadow-md">
                <img 
                  src={template.image} 
                  alt={template.title}
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center p-8 bg-black/5 backdrop-blur-[1px]">
                  <ArrowDotsButton text="Voir Plus" />
                </div>
              </div>
              <div className="px-4">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#2a6df5] transition-colors">{template.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Section 5: Sticky CTA Bar ---
export const StickyBottomBar = ({ template, onOrder }: { template: Template; onOrder?: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Bar is visible after hero section
      setIsVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-none"
        >
          <div className="bg-zinc-900/70 backdrop-blur-md border-t border-white/5 w-full h-[88px] flex items-center justify-between px-12 pointer-events-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4">
              {/* Optional small thumbnail as seen in screenshot */}
              <div className="w-12 h-16 rounded border border-white/10 overflow-hidden hidden sm:block">
                <img src={template.image} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[18px] font-bold tracking-tight text-white">{template.title}</span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.open(template.preview_url || "https://demo.autoslash.ai", "_blank")}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-white hover:bg-white/5 transition-all whitespace-nowrap"
              >
                Aperçu
              </button>
              <button 
                onClick={onOrder}
                className="px-4 py-1.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#2a6df5] hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
              >
                ACTIVER STARTUP 150K
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
