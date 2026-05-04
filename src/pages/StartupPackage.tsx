import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GridBackground } from "../components/ui/GridBackground";
import { IndustryFilters } from "../components/startup/IndustryFilters";
import { TemplateCard, SkeletonCard } from "../components/startup/TemplateCard";
import { ChevronUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getStartupTemplates, Template } from "../data/startupTemplates";

export default function StartupPackagePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sectorFromUrl = searchParams.get('sector');

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [visibleCount, setVisibleCount] = useState(40);
  const [activeFilter, setActiveFilter] = useState<string | null>(sectorFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const blocksRef = useRef<(HTMLDivElement | null)[]>([]);

  // Shuffle logic on load
  const shuffle = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    let mounted = true;

    getStartupTemplates()
      .then((data) => {
        if (!mounted) return;
        setTemplates(shuffle(data));
      })
      .catch((err) => {
        console.error("Error fetching templates:", err);
        if (!mounted) return;
        setTemplates([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      mounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (sectorFromUrl) {
      setActiveFilter(sectorFromUrl);
    }
  }, [sectorFromUrl]);

  const filteredTemplates = templates.filter(t => {
    const matchesFilter = activeFilter ? t.category === activeFilter : true;
    const matchesSearch = searchQuery.trim() === "" || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const currentTemplates = filteredTemplates.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prev => prev + 40);
  };

  const jumpBack = () => {
    // Find the previous block start
    const blockIndex = Math.max(0, Math.floor((visibleCount - 41) / 40));
    const targetBlock = blocksRef.current[blockIndex];
    if (targetBlock) {
      targetBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans selection:bg-[#2a6df5]/30 selection:text-white relative overflow-hidden isolate">
      <GridBackground />
      <main className="w-full relative z-10">
        <div className="px-10 pt-32 pb-20 max-w-[1700px] mx-auto w-full">
          {/* Header Identity (Now at the very top) */}
          <div className="flex flex-col gap-2 mb-10">
            <div className="flex items-end gap-5">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90">STARTUP D'ARCHITECTURE</h1>
              <div className="px-5 py-1.5 rounded-full bg-[#2a6df5]/10 border border-[#2a6df5]/20 text-[#2a6df5] text-[11px] font-black uppercase tracking-[0.2em] mb-1 ring-8 ring-[#2a6df5]/5">
                À partir de 150K
              </div>
            </div>
            <p className="text-white/40 text-lg max-w-4xl font-medium mt-4">
              Propulsez votre vision avec une infrastructure Haute-Fidélité. 
              Accédez à <span className="text-white/60 italic font-black text-xl">500+ architectures</span> conçues pour convertir vos premiers visiteurs en clients fidèles.
            </p>
          </div>

          {/* Filters + Integrated Compact Search */}
          <IndustryFilters 
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              if (filter === null) {
                navigate('/startup-package');
              }
              setActiveFilter(filter);
              setVisibleCount(40); // Reset pagination on filter change
            }}
            searchQuery={searchQuery}
            onSearchChange={(query) => {
              setSearchQuery(query);
              setVisibleCount(40); // Reset pagination on search change
            }}
          />

          {/* Grid Layout (4 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {loading ? (
              Array.from({ length: 40 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : templates.length === 0 ? (
              <div className="col-span-full" style={{ textAlign: 'center', padding: '80px 20px' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                  Nos templates arrivent bientôt
                </p>
                <p style={{ color: '#888', marginTop: '12px' }}>
                  Revenez nous voir très prochainement
                </p>
              </div>
            ) : (
              currentTemplates.map((template, idx) => (
                <div 
                  key={template.id}
                  ref={(el) => {
                    if (idx % 40 === 0) blocksRef.current[idx / 40] = el;
                  }}
                >
                  <TemplateCard template={template} index={idx} packageType="STARTUP" />
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && currentTemplates.length < filteredTemplates.length && (
            <div className="mt-20 flex justify-center border-t border-white/5 pt-10">
              <button 
                onClick={loadMore}
                className="px-8 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-white/40 hover:text-white rounded-md text-[11px] font-bold uppercase tracking-widest transition-all"
              >
                Voir plus
              </button>
            </div>
          )}

          {/* Floating Jump Back Button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                onClick={() => {
                  if (visibleCount > 40) {
                    const newCount = visibleCount - 40;
                    const blockIndex = Math.max(0, Math.floor((newCount - 1) / 40));
                    const targetBlock = blocksRef.current[blockIndex];
                    
                    if (targetBlock) {
                      targetBlock.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                    setVisibleCount(newCount);
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="fixed bottom-10 right-10 z-[100] w-14 h-14 bg-[#2a6df5] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#2a6df5]/40 hover:scale-110 active:scale-90 transition-all border border-white/20"
              >
                <ChevronUp size={24} strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #000000;
        }
        ::-webkit-scrollbar-thumb {
          background: #1b1b1b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2a6df5;
        }
      `}</style>
    </div>
  );
}
