import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";

const topics = ["Tous", "Innovation", "Actualités", "Études de Cas"];

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 4;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!error && data) {
        setBlogPosts(data);
        setFilteredPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...blogPosts];

    // Filtre par topic (Top Nav)
    if (activeFilter !== "Tous") {
      result = result.filter(post => post.category === activeFilter || post.type === activeFilter);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(result);
    setCurrentPage(1);
  }, [activeFilter, searchQuery, blogPosts]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-white pt-24 font-['DM_Sans'] text-neutral-900">
      {/* Hero Section / Title Area */}
      <div className="bg-neutral-50 border-b border-neutral-200 py-12 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
            <div>
               <h1 
                 className="text-6xl md:text-8xl font-black text-neutral-900 uppercase tracking-tighter mb-2"
                 style={{ fontFamily: "'Playfair Display', serif" }}
               >
                 NEWS
               </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-[#CC0000] transition-colors">
                <span className="text-[#CC0000]">✉</span> SUBSCRIBE
              </button>
              
              <div className="flex border border-neutral-300 rounded-sm">
                <button className="flex items-center gap-2 px-6 py-3 border-r border-neutral-300 bg-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-50">
                  <ChevronDown className="w-4 h-4" /> BROWSE
                </button>
                <div className="flex items-center px-4 bg-white min-w-[300px]">
                  <input 
                    type="text" 
                    placeholder="SEARCH NEWS" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs font-bold uppercase tracking-widest placeholder:text-neutral-400"
                  />
                  <Search className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            </div>
          </div>
          
          <nav className="flex flex-wrap gap-x-8 gap-y-2 mt-8">
            {topics.map((topic) => (
              <button 
                key={topic} 
                onClick={() => setActiveFilter(topic)}
                className={activeFilter === topic 
                  ? "text-[13px] font-bold uppercase tracking-wide border-b-2 border-[#CC0000] pb-1 text-[#CC0000]" 
                  : "text-[13px] font-bold uppercase tracking-wide hover:text-[#CC0000] transition-colors"
                }
              >
                {topic}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-neutral-400 font-medium mb-12">
          <Link to="/blog" className="hover:text-[#CC0000]">Autoslash News</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-[#CC0000]">Topics</Link>
          <span>/</span>
          <span className="text-neutral-900">{activeFilter === "Tous" ? "Blog" : activeFilter}</span>
        </div>

        <h2 
          className="text-5xl md:text-7xl font-bold text-neutral-900 mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {activeFilter === "Tous" ? "Toute l'actualité" : activeFilter}
        </h2>

        {/* Blog entries list */}
        <div className="relative min-h-[600px]">
          {isLoading ? (
            <div className="grid gap-16">
              {[1,2,3].map(i => (
                <div key={i} className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 aspect-[4/3] bg-neutral-100 animate-pulse rounded" />
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="h-4 bg-neutral-100 animate-pulse rounded w-1/4" />
                    <div className="h-8 bg-neutral-100 animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-neutral-100 animate-pulse rounded w-full" />
                    <div className="h-4 bg-neutral-100 animate-pulse rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="border-t border-neutral-200 mt-8 flex flex-col items-center justify-center py-32 text-center">
              <p 
                className="text-5xl font-black text-neutral-100 uppercase tracking-tighter mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Aucun article
              </p>
              <p className="text-sm text-neutral-400">
                {searchQuery 
                  ? `Aucun résultat pour "${searchQuery}"` 
                  : "Aucun article publié dans cette catégorie"}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentPage + activeFilter}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="grid gap-16"
              >
                {paginatedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col md:flex-row gap-8 group cursor-pointer"
                  >
                    <div className="w-full md:w-1/3 aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                            Autoslash AI
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-2/3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#CC0000]">
                          {post.type || post.category}
                        </span>
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                          {new Date(post.published_at || post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 
                        className="text-2xl md:text-4xl font-bold text-neutral-900 mb-4 group-hover:text-[#CC0000] transition-colors leading-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {post.title}
                      </h3>
                      
                      <p className="text-neutral-600 leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <Link to={`/blog/${post.slug || post.id}`}>
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-900 transition-colors">
                          READ FULL ARTICLE <span>→</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        
        {/* Pagination Bar — TOUJOURS VISIBLE */}
        <div className="mt-20 border border-neutral-200 flex items-stretch h-16 bg-white">
          <div className="flex-1 flex items-center px-8 border-r border-neutral-200">
            <span className="text-base font-medium text-neutral-900">
              Page {currentPage} / {totalPages || 1}
            </span>
          </div>
          <div className="flex divide-x border-neutral-200">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-6 flex items-center justify-center hover:bg-neutral-50 transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-8 h-8 text-[#CC0000] group-hover:scale-110 transition-transform" 
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-6 flex items-center justify-center hover:bg-neutral-50 transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-8 h-8 text-[#CC0000] group-hover:scale-110 transition-transform" 
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

