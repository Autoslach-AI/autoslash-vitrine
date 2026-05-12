import React, { useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabaseClient";

import { ArrowDotsButton } from "../ui/arrow-dots-button";

interface TemplateCardProps {
  template: {
    id: string | number;
    title: string;
    author: string;
    category: string;
    likes: string;
    views: string;
    image: string;
    price: number;
  };
  index: number;
  packageType: 'STARTUP' | 'BUSINESS' | 'ENTERPRISE';
}

export const TemplateCard = ({ template, index, packageType }: TemplateCardProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfFavorite();
    }
  }, [user, template.id]);

  const checkIfFavorite = async () => {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user?.id)
      .eq('template_id', template.id)
      .maybeSingle();
    
    if (data) setIsFavorite(true);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/onboarding');
      return;
    }

    setLoadingFav(true);
    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('template_id', template.id);
      
      if (!error) setIsFavorite(false);
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          template_id: template.id
        });
      
      if (!error) setIsFavorite(true);
    }
    setLoadingFav(false);
  };

  const saveContext = () => {
    sessionStorage.setItem('autoslash_selection', JSON.stringify({
      template_id: String(template.id),
      template_sector: template.category,
      template_name: template.title,
      package_type: packageType
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: (index % 4) * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      className="group flex flex-col gap-5 relative"
    >
      <Link 
        to={`/enterprise-details/${template.id}`}
        onClick={saveContext}
        className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/5 cursor-pointer block"
      >
        <img 
          src={template.image} 
          alt=""
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          disabled={loadingFav}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 active:scale-90"
        >
          <Star 
            size={18} 
            fill={isFavorite ? "#FFD700" : "none"} 
            className={isFavorite ? "text-[#FFD700]" : "text-white"}
          />
        </button>

        {/* Hover Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center p-8 bg-[#2a6df5]/5 backdrop-blur-[1px]">
          <div className="text-white text-[11px] font-black uppercase tracking-widest bg-[#2a6df5]/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
            {template.price ? `${template.price.toLocaleString('fr-FR')} FCFA` : 'Sur devis'}
          </div>
        </div>
      </Link>

      <div className="flex items-start justify-between px-1">
        <div className="flex flex-col gap-0.5 max-w-[80%]">
          <h3 className="text-[13px] font-black text-white truncate leading-tight uppercase tracking-tight group-hover:text-[#2a6df5] transition-colors">{template.title}</h3>
        </div>
        
        <div className="flex items-center gap-2.5 text-white/20">
          <div className="flex items-center gap-1 group/like cursor-pointer">
            <Heart className="w-3.5 h-3.5 group-hover/like:text-[#2a6df5] transition-colors" />
            <span className="text-[10px] group-hover/like:text-white transition-colors">{template.likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SkeletonCard = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="aspect-[4/3] rounded-xl bg-white/5 border border-white/5" />
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-2 w-full pr-8">
        <div className="h-2 bg-white/5 rounded w-3/4" />
        <div className="h-1.5 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  </div>
);
