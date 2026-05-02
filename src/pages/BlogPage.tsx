import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, Rss } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "L'IA au service des entreprises sénégalaises",
    excerpt: "Comment l'intelligence artificielle transforme le paysage entrepreneurial à Dakar et au-delà.",
    date: "1 Mai 2024",
    category: "Stratégie",
    type: "News Articles"
  },
  {
    id: 2,
    title: "Automatisation WhatsApp : Le guide complet",
    excerpt: "Boostez votre service client avec des agents conversationnels intelligents sur WhatsApp.",
    date: "25 Avril 2024",
    category: "Technologie",
    type: "In the Media"
  },
  {
    id: 3,
    title: "Pourquoi choisir Autoslash AI ?",
    excerpt: "Découvrez notre mission et comment nous créons des solutions sur mesure pour nos clients.",
    date: "15 Avril 2024",
    category: "Entreprise",
    type: "Audio"
  },
  {
    id: 4,
    title: "Comment l'IA générative transforme le service client",
    excerpt: "L'émergence des agents LLM change radicalement la manière dont les entreprises interagissent avec leurs prospects.",
    date: "10 Avril 2024",
    category: "Innovation",
    type: "News Articles"
  },
  {
    id: 5,
    title: "Le futur de n8n dans l'automatisation d'entreprise",
    excerpt: "Pourquoi le low-code est devenu le pilier central de l'efficacité opérationnelle moderne.",
    date: "5 Avril 2024",
    category: "Technologie",
    type: "In the Media"
  },
  {
    id: 6,
    title: "Ethique et IA : Les défis du continent Africain",
    excerpt: "Assurer un développement technologique responsable qui respecte les valeurs locales.",
    date: "2 Avril 2024",
    category: "Stratégie",
    type: "News Articles"
  }
];

const topics = [
  "Innovation", "Actualités", "Model IA"
];

export default function BlogPage() {
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-white pt-24 font-sans text-neutral-900">
      {/* Top Branding Section */}
      <div className="border-b border-neutral-200 py-6 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter leading-none">AUTOSLASH <span className="text-cyan-500">AI</span></span>
             </div>
          </div>
          
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {topics.map((topic) => (
              <a 
                key={topic} 
                href="#" 
                className={topic === "Actualités" ? "text-[13px] font-bold uppercase tracking-wide border-b-2 border-red-500 pb-1 text-red-500" : "text-[13px] font-bold uppercase tracking-wide hover:text-red-500 transition-colors"}
              >
                {topic}
              </a>
            ))}
            <button className="text-neutral-900 ml-4">
              <Search className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>

      {/* Hero Section / Title Area */}
      <div className="bg-neutral-50 border-b border-neutral-200 py-12 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
            <div>
               <h1 className="text-6xl md:text-8xl font-black text-neutral-900 uppercase tracking-tighter mb-2">
                 NEWS
               </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-red-500 transition-colors">
                <span className="text-red-500">✉</span> SUBSCRIBE
              </button>
              
              <div className="flex border border-neutral-300 rounded-sm">
                <button className="flex items-center gap-2 px-6 py-3 border-r border-neutral-300 bg-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-50">
                  <ChevronDown className="w-4 h-4" /> BROWSE
                </button>
                <div className="flex items-center px-4 bg-white min-w-[300px]">
                  <input 
                    type="text" 
                    placeholder="SEARCH NEWS" 
                    className="w-full bg-transparent outline-none text-xs font-bold uppercase tracking-widest placeholder:text-neutral-400"
                  />
                  <Search className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-neutral-400 font-medium mb-12">
          <Link to="/blog" className="hover:text-red-500">Autoslash News</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-red-500">Topics</Link>
          <span>/</span>
          <span className="text-neutral-900">Intelligence Artificielle</span>
        </div>

        <h2 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-8">
          Intelligence Artificielle
        </h2>



        {/* Filter Bar */}
        <div className="border-t border-neutral-200 pt-8 mt-12 mb-12">
           <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
              
              <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-wider">
                <span className="text-neutral-400">Show:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="display" defaultChecked className="accent-blue-600" />
                  News Articles
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="display" className="accent-blue-600" />
                  In the Media
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="display" className="accent-blue-600" />
                  Audio
                </label>
              </div>
           </div>
        </div>

        {/* Blog Entries List with Page Transition */}
        <div className="relative overflow-hidden min-h-[600px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="grid gap-16"
            >
              {blogPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex flex-col md:flex-row gap-8 group cursor-pointer"
                >
                  <div className="w-full md:w-1/3 aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                    <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-transparent transition-colors" />
                    <div className="w-full h-full bg-neutral-200 animate-pulse" />
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-black uppercase tracking-widest text-red-500">
                        {post.type}
                      </span>
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                        {post.date}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl md:text-4xl font-bold text-neutral-900 mb-4 group-hover:text-red-500 transition-colors leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-neutral-600 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-900 transition-colors">
                       READ FULL ARTICLE <span>→</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Pagination bar matching the provided image */}
        <div className="mt-20 border border-neutral-200 flex items-stretch h-16 bg-white">
          <div className="flex-1 flex items-center px-8 border-r border-neutral-200">
            <span className="text-base font-medium text-neutral-900">Page {currentPage}</span>
          </div>
          <div className="flex divide-x border-neutral-200">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-6 flex items-center justify-center hover:bg-neutral-50 transition-colors group"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-6 flex items-center justify-center hover:bg-neutral-50 transition-colors group"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="w-16 h-full flex items-center justify-center border-l border-neutral-200" />
        </div>
      </div>
    </div>
  );
}
