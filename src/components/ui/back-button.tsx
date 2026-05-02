import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <AnimatePresence>
      {!isHome && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.6, x: 0 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0, x: -10 }}
          onClick={() => navigate(-1)}
          className="fixed top-24 left-4 md:left-6 z-[9999] flex items-center gap-3 text-white/40 transition-all group pointer-events-auto cursor-pointer"
          title="Retour"
        >
          <div className="w-10 h-10 rounded-full border border-white/5 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-white/20 transition-all pointer-events-none">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Retour</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
