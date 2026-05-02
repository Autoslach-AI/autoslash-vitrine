import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Zap, TrendingUp, Filter, ArrowRight, ExternalLink } from 'lucide-react';

const CATEGORIES = ["Tous", "Santé", "Finance", "Immobilier", "E-commerce", "Éducation"];

const PROJECTS = [
  {
    id: 1,
    title: "EcoPulse Health",
    category: "Santé",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    client: "Clinique Dakar",
    aiStack: ["Assistant Diagnostic", "Rappel WhatsApp", "Gestion de Planning"],
    outcome: "+35% de rendez-vous honorés",
    description: "Automatisation complète du parcours patient, de la prise de rendez-vous au suivi post-opératoire."
  },
  {
    id: 2,
    title: "FinTrack AI",
    category: "Finance",
    image: "https://images.unsplash.com/photo-1551288049-bbda646ff4ad?auto=format&fit=crop&q=80&w=800",
    client: "Bourse de l'Ouest",
    aiStack: ["Analyse de Risque", "Support Client 24/7", "Fraude Detection"],
    outcome: "Support assuré à 100% sans intervention humaine",
    description: "Système de monitoring en temps réel des transactions et assistant intelligent de support financier."
  },
  {
    id: 3,
    title: "ImmoVision 360",
    category: "Immobilier",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    client: "Agence Teranga",
    aiStack: ["Qualification de Leads", "Assistant Visite Virtuelle", "CRM Intelligent"],
    outcome: "x3 de leads qualifiés par mois",
    description: "Déploiement d'un agent conversationnel capable de qualifier les prospects et d'organiser les visites."
  },
  {
    id: 4,
    title: "LuxShop Global",
    category: "E-commerce",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
    client: "Lux Boutique",
    aiStack: ["Agent de Vente Sociale", "Inventaire Prédictif", "Marketing Automatisé"],
    outcome: "Réduction des stocks morts de 25%",
    description: "Intégration d'un agent de vente sur WhatsApp et Facebook gérant les commandes et les stocks."
  },
  {
    id: 5,
    title: "EduLink Pro",
    category: "Éducation",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
    client: "Institut Sahel",
    aiStack: ["Correction Automatisée", "Tuteur IA Personnalisé", "Portail Parents"],
    outcome: "Engagement étudiant augmenté de 50%",
    description: "Plateforme IA assistant les professeurs dans la correction et offrant un soutien 24/7 aux étudiants."
  },
  {
    id: 6,
    title: "AquaTech Solutions",
    category: "Santé",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    client: "SenEau Partenaire",
    aiStack: ["Détection de Fuites", "Alertes Automatiques", "Facturation IA"],
    outcome: "Réduction des pertes d'eau de 18%",
    description: "Système d'intelligence distribuée pour la surveillance des infrastructures hydrauliques."
  }
];

export default function ClientProjects() {
  const [filter, setFilter] = useState("Tous");
  
  const filteredProjects = filter === "Tous" 
    ? PROJECTS 
    : PROJECTS.filter(p => p.category === filter);

  return (
    <div className="pt-24 min-h-screen bg-black overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-white/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase">Missions Accomplies</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8"
          >
            NOTRE IMPACT <br /> <span className="text-white/20">EN TEMPS RÉEL.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl text-white/50 text-base leading-relaxed"
          >
            Chaque déploiement Autoslash AI est une réponse chirurgicale à un problème métier. 
            Découvrez comment nos agents transforment les opérations.
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-16">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full border text-[11px] font-bold tracking-widest transition-all duration-300 ${
                filter === cat 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: any; index: number; [key: string]: any }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group"
    >
      <div className="relative bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500">
        {/* Media Zone */}
        <div className="h-56 relative overflow-hidden">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white text-[9px] font-bold tracking-widest uppercase">
              {project.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4">
            <span className="text-white/40 text-[10px] font-medium tracking-wider uppercase mb-1 block">Client</span>
            <div className="text-white font-bold text-sm">{project.client}</div>
          </div>
        </div>

        {/* Content Zone */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
            {project.title}
          </h3>
          
          <p className="text-white/40 text-sm leading-relaxed mb-8 h-12 line-clamp-2">
            {project.description}
          </p>

          {/* AI Stack Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {project.aiStack.map((tech: string) => (
              <div key={tech} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-md border border-white/5">
                <Bot size={10} className="text-blue-400" />
                <span className="text-white/60 text-[9px] font-medium">{tech}</span>
              </div>
            ))}
          </div>

          {/* Outcome Metric */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <TrendingUp size={16} className="text-blue-500" />
              </div>
              <div>
                <div className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-none mb-1">Impact Mesuré</div>
                <div className="text-white font-bold text-[13px]">{project.outcome}</div>
              </div>
            </div>
            
            <motion.div
              whileHover={{ x: 5 }}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white group-hover:text-black transition-all duration-300"
            >
              <ArrowRight size={18} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
