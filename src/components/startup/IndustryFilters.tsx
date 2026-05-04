import React, { useState } from "react";
import { SlidersHorizontal, ChevronDown, Search } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

const ALL_INDUSTRIES = [
  "Restaurant", "Immobilier", "E-commerce", "SaaS", "Portfolio", "Fitness", "Juridique", "Santé", "Éducation", "Voyage",
  "Mode", "À propos", "Page d'accueil", "Barre latérale", "Assistant virtuel", 
  "Tableaux de bord", "Événement", "Profil utilisateur", "Menu", 
  "E-learning", "Simple", "Design d'intérieur", "Mariage", "CRM", "Site personnel", 
  "Entreprise", "Photographie", "S'inscrire", "Marketplace", 
  "Connexion", "Blog", "Barre de navigation", "CMS", "Finance", 
  "Bâtiment", "Technologie", "Art", "Musique", "Cinéma",
  "Sport", "Automobile", "Mode de vie", "Voyages", "Actualités", 
  "Social", "Jeux vidéo", "Cryptomonnaie", "IA", "Marketing", "RH"
];

interface IndustryFiltersProps {
  onFilterChange: (id: string | null) => void;
  activeFilter: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const IndustryFilters = ({ onFilterChange, activeFilter, searchQuery, onSearchChange }: IndustryFiltersProps) => {
  const [expansionStep, setExpansionStep] = useState(0); // 0: 8, 1: 13, 2: 16
  const COUNTS = [8, 13, 16];

  const visibleCount = COUNTS[expansionStep];

  const toggleExpansion = () => {
    if (expansionStep < COUNTS.length - 1) {
      setExpansionStep(expansionStep + 1);
    } else {
      setExpansionStep(0);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-10">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {ALL_INDUSTRIES.slice(0, visibleCount).map((industry) => (
            <button
              key={industry}
              onClick={() => onFilterChange(activeFilter === industry ? null : industry)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                activeFilter === industry
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              {industry}
            </button>
          ))}
          
          <button 
            onClick={toggleExpansion}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/20 text-[11px] font-medium transition-all"
          >
            {expansionStep < COUNTS.length - 1 ? "Voir plus" : "Voir moins"}
          </button>
        </div>
      </div>

      <div className="shrink-0 w-full lg:w-64">
        <div className="relative group">
          <motion.div
            className="absolute -inset-px rounded-lg border border-white/40 pointer-events-none"
            animate={{
              opacity: [0.1, 1, 0.1],
              boxShadow: [
                "0 0 0px 0px rgba(255,255,255,0)",
                "0 0 15px 2px rgba(255,255,255,0.4)",
                "0 0 0px 0px rgba(255,255,255,0)"
              ]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-white/40 transition-colors z-10" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[11px] text-white placeholder:text-white/20 focus:ring-1 focus:ring-white/20 outline-none transition-all relative z-0"
          />
        </div>
      </div>
    </div>
  );
};

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m3 16 5 2 8-2 5 2V4l-5-2-8 2-5-2z" />
    <path d="M8 6v12" />
    <path d="M16 6v12" />
  </svg>
);
