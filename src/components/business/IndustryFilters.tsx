import React, { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "motion/react";

const ALL_INDUSTRIES = [
  "SaaS", "E-commerce", "Immobilier", "Santé", "Finance", "Juridique", "Éducation", "Logistique", "Marketing", "RH", "Sécurité",
  "Mode", "À propos", "Page d'accueil", "Barre latérale", "Assistant virtuel", 
  "Tableaux de bord", "Événement", "Restaurant", "Profil utilisateur", "Menu", 
  "E-learning", "Simple", "Design d'intérieur", "Mariage", "CRM", "Site personnel", 
  "Voyage", "Entreprise", "Photographie", "S'inscrire", "Marketplace", 
  "Connexion", "Blog", "Portfolio", "Barre de navigation", "CMS", 
  "Bâtiment", "Technologie", "Art", "Musique", "Cinéma",
  "Sport", "Automobile", "Mode de vie", "Voyages", "Actualités", 
  "Social", "Jeux vidéo", "Cryptomonnaie", "IA"
];

interface IndustryFiltersProps {
  onFilterChange: (id: string | null) => void;
  activeFilter: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const IndustryFilters = ({ onFilterChange, activeFilter, searchQuery, onSearchChange }: IndustryFiltersProps) => {
  const [expansionStep, setExpansionStep] = useState(0); 
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
                  ? "bg-[#2a6df5] text-white border-[#2a6df5]"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-[#2a6df5]/30 hover:text-white"
              }`}
            >
              {industry}
            </button>
          ))}
          
          <button 
            onClick={toggleExpansion}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-[#2a6df5]/20 text-[11px] font-medium transition-all"
          >
            {expansionStep < COUNTS.length - 1 ? "Voir plus" : "Voir moins"}
          </button>
        </div>
      </div>

      <div className="shrink-0 w-full lg:w-64">
        <div className="relative group">
          <motion.div
            className="absolute -inset-px rounded-lg border border-[#2a6df5]/60 pointer-events-none"
            animate={{
              opacity: [0.1, 1, 0.1],
              boxShadow: [
                "0 0 0px 0px rgba(42,109,245,0)",
                "0 0 15px 2px rgba(42,109,245,0.4)",
                "0 0 0px 0px rgba(42,109,245,0)"
              ]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-[#2a6df5]/60 transition-colors z-10" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher Business..."
            className="w-full bg-black border border-white/10 rounded-lg py-2 pl-9 pr-4 text-[11px] text-white placeholder:text-white/20 focus:ring-1 focus:ring-[#2a6df5]/20 outline-none transition-all relative z-0"
          />
        </div>
      </div>
    </div>
  );
};
