import React from "react";
import { 
  BarChart3, 
  Trash2, 
  Folders, 
  BookOpen, 
  Layout,
  PlusCircle,
  Bell,
  Search,
  ChevronDown
} from "lucide-react";

export const Sidebar = () => {
  const menuItems = [
    { icon: FolderIcon, label: "Brouillons" },
    { icon: Layout, label: "Tous les projets", active: true },
    { icon: BookOpen, label: "Ressources" },
    { icon: Trash2, label: "Corbeille" },
  ];

  return (
    <aside className="w-64 bg-transparent border-r border-white/5 h-screen flex flex-col sticky top-0 shrink-0 select-none">
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#2a6df5] flex items-center justify-center text-xs font-bold text-white">
          A
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Amadou mbaye</span>
        </div>
        <Bell className="w-4 h-4 ml-auto text-white/40" />
      </div>

      <div className="px-2 py-4 flex flex-col gap-1">
        <div className="px-4 py-2 flex items-center gap-3 text-white/60 hover:text-white transition-colors cursor-pointer group">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all font-bold text-[10px]">
            J
          </div>
          <span className="text-xs font-medium">JAFA web</span>
          <div className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-[8px] font-bold uppercase tracking-wider">
            Gratuit
          </div>
          <ChevronDown className="w-3 h-3 text-white/20" />
        </div>

        {menuItems.map((item, i) => (
          <div 
            key={i}
            className={`px-4 py-2 flex items-center gap-3 rounded-md transition-all cursor-pointer group ${item.active ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 flex flex-col gap-4 border-t border-white/5">
        <div className="bg-[#000000] p-4 rounded-lg border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Voir ce qui est inclus</h4>
            <p className="text-[10px] text-white/40 mb-3 leading-relaxed">Votre forfait et votre utilisation</p>
            <button className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-bold text-white transition-all">
              Voir tout
            </button>
          </div>
        </div>

        <div className="bg-[#000000] p-4 rounded-lg border border-white/10 flex flex-col items-center text-center gap-2 relative">
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 mb-1">
            <PlusCircle className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-white leading-relaxed font-medium">
            Êtes-vous prêt à aller au-delà de ce forfait gratuit ? Mettre à niveau pour accéder aux fonctionnalités premium.
          </p>
          <button className="w-full py-2 bg-[#0095ff] hover:bg-[#0081db] rounded-md text-[10px] font-bold text-white shadow-lg transition-all mt-2">
            Voir les forfaits
          </button>
        </div>
      </div>
    </aside>
  );
};

const FolderIcon = ({ className }: { className?: string }) => (
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
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);
