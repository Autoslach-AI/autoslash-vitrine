import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, TrendingUp, Bot } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const CATEGORIES = ["TOUS", "STARTUP", "BUSINESS", "ENTERPRISE", "ELITE"];
const SECTORS = ["Tous", "Santé", "Finance", "Immobilier", "E-commerce", "Éducation", "Technologie"];

export default function ClientProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState("TOUS");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("Tous");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let result = [...projects];

    if (filter !== "TOUS") {
      result = result.filter(p => p.package_type === filter);
    }
    if (sectorFilter !== "Tous") {
      result = result.filter(p => p.sector === sectorFilter);
    }
    if (searchQuery.trim()) {
      result = result.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProjects(result);
  }, [filter, sectorFilter, searchQuery, projects]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("v_projects_all")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data);
        setFilteredProjects(data);
      } else if (error) {
        console.error("Error fetching projects:", error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black overflow-hidden relative">
      
      {/* Fond subtil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="mb-16 pt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-white/20" />
            <span className="text-white/30 text-[10px] font-bold tracking-[0.4em] uppercase">
              Projets Livrés
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            NOTRE IMPACT
            <br />
            <span className="text-white/15">EN TEMPS RÉEL.</span>
          </motion.h1>

          {/* Barre recherche + filtre secteur — alignée header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-8">
            
            {/* Sous-titre existant — à gauche */}
            <p className="max-w-lg text-white/40 text-sm leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Chaque déploiement Autoslash AI est une réponse chirurgicale à un problème métier réel.
            </p>

            {/* Barre filtre — à droite */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Filtre secteur */}
              <div className="relative">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest rounded-full px-4 py-2 outline-none hover:border-white/20 transition-colors cursor-pointer appearance-none"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {SECTORS.map(s => (
                    <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>
                  ))}
                </select>
              </div>

              {/* Recherche par nom */}
              <motion.div 
                animate={{ 
                  borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0.1)"],
                  boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 10px rgba(255,255,255,0.05)", "0 0 0px rgba(255,255,255,0)"]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:border-white/20 transition-colors"
              >
                <svg className="w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-white/50 text-[10px] font-bold uppercase tracking-widest placeholder:text-white/20 w-40"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-white/30 hover:text-white transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </motion.div>

            </div>
          </div>
        </div>

        {/* FILTRES PAR PACKAGE */}
        <div className="flex flex-wrap gap-2 mb-16 border-b border-white/5 pb-8">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 ${
                filter === cat
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </motion.button>
          ))}
          
          {/* Compteur */}
          <div className="ml-auto flex items-center">
            <span className="text-white/20 text-[10px] font-bold tracking-widest uppercase">
              {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ÉTAT LOADING */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-white/5" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-5 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ÉTAT VIDE */}
        {!isLoading && filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-white/5 rounded-2xl">
            <p
              className="text-5xl font-black text-white/10 uppercase tracking-tighter mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Bientôt disponible
            </p>
            <p className="text-sm text-white/20" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {filter !== "TOUS"
                ? `Aucun projet ${filter} publié pour le moment`
                : "Aucun projet publié pour le moment"}
            </p>
          </div>
        )}

        {/* GRILLE PROJETS */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <ProjectCard key={project.enterprise_id || idx} project={project} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}

function ProjectCard({ project, index }: any) {
  
  const packageColors: Record<string, string> = {
    STARTUP: "border-white/20 text-white/60",
    BUSINESS: "border-white/20 text-white/60",
    ENTERPRISE: "border-white/20 text-white/60",
    ELITE: "border-white/40 text-white",
  };

  const stack = Array.isArray(project.stack) ? project.stack : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group cursor-pointer"
    >
      <div className="relative bg-neutral-950 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col h-full">
        
        {/* IMAGE */}
        <div className="h-44 relative overflow-hidden bg-neutral-900">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">
                Autoslash AI
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
          
          {/* Badge package */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 border rounded-full text-[9px] font-black tracking-widest uppercase bg-black/50 backdrop-blur-sm ${packageColors[project.package_type] || "border-white/10 text-white/40"}`}>
              {project.package_type}
            </span>
          </div>

          {/* Nom client */}
          {project.client_name && (
            <div className="absolute bottom-4 left-4">
              <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest block mb-0.5">Client</span>
              <span className="text-white font-bold text-xs">{project.client_name}</span>
            </div>
          )}
        </div>

        {/* CONTENU */}
        <div className="p-6 flex flex-col flex-1">
          
          {/* Titre */}
          <h3
            className="text-base font-black text-white uppercase tracking-tight mb-3 group-hover:text-white/70 transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {project.title}
          </h3>

          {/* Description */}
          <p
            className="text-white/30 text-xs leading-relaxed mb-5 line-clamp-2 flex-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {project.description}
          </p>

          {/* Stack agents */}
          {stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {stack.slice(0, 3).map((tech: string, i: number) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white/[0.04] rounded border border-white/[0.06]">
                  <Bot size={8} className="text-white/40" />
                  <span className="text-white/40 text-[9px] font-medium">{tech}</span>
                </div>
              ))}
            </div>
          )}

          {/* Impact + Flèche */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            {project.outcome && (
              <div className="flex items-center gap-2">
                <TrendingUp size={12} className="text-white/40" />
                <span className="text-white/60 text-[11px] font-bold">{project.outcome}</span>
              </div>
            )}
            <motion.div
              whileHover={{ x: 4 }}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300"
            >
              <ArrowRight size={14} className="text-white group-hover:text-black transition-colors" />
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
