import React from "react";
import { Link } from "react-router-dom";
import { 
  LayoutGrid, 
  LayoutDashboard, 
  User, 
  Star, 
  Gift, 
  MoreVertical 
} from "lucide-react";

interface ClientSidebarProps {
  activePage: "profil" | "favoris" | "parrainage";
  user: any;
  photoUrl?: string | null;
}

export default function ClientSidebar({ activePage, user, photoUrl }: ClientSidebarProps) {
  const avatarSrc = photoUrl || user?.imageUrl;

  return (
    <aside className="w-64 border-r border-neutral-100 bg-white flex flex-col flex-shrink-0">
      {/* Logo Head */}
      <div className="h-14 flex items-center px-4 border-b border-neutral-100 gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-white">
          <LayoutGrid size={14} />
        </div>
        <span className="font-bold text-sm tracking-tight text-black font-jakarta">Autoslash AI</span>
      </div>

      {/* Navigation Section */}
      <div className="px-4 py-4 flex flex-col gap-6 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1 font-jakarta">
            Navigation
          </p>
          
          <Link to="/dashboard">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all text-black/60 hover:bg-black/5 hover:text-black font-jakarta text-xs">
              <LayoutDashboard size={14} />
              <span className="flex-1">Dashboard</span>
            </div>
          </Link>

          <Link to="/client-space/profil">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all font-jakarta text-xs ${
              activePage === "profil"
                ? "bg-black/5 text-black font-semibold"
                : "text-black/60 hover:bg-black/5 hover:text-black"
            }`}>
              <User size={14} />
              <span className="flex-1">Mon Profil</span>
            </div>
          </Link>

          <Link to="/client-space/favoris">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all font-jakarta text-xs ${
              activePage === "favoris"
                ? "bg-black/5 text-black font-semibold"
                : "text-black/60 hover:bg-black/5 hover:text-black"
            }`}>
              <Star size={14} className={activePage === "favoris" ? "fill-yellow-400 text-yellow-400" : ""} />
              <span className="flex-1">Mes Favoris</span>
            </div>
          </Link>

          <Link to="/client-space/parrainage">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all font-jakarta text-xs ${
              activePage === "parrainage"
                ? "bg-black/5 text-black font-semibold"
                : "text-black/60 hover:bg-black/5 hover:text-black"
            }`}>
              <Gift size={14} />
              <span className="flex-1">Parrainage</span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="mt-auto">
          <Link to="/client-space/profil" className="flex items-center gap-2 px-2 py-3 border-t border-neutral-100 overflow-hidden hover:bg-black/5 transition-colors cursor-pointer group">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-black/5 flex-shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black text-[10px] font-bold text-white uppercase font-jakarta">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold truncate font-jakarta">{user?.fullName || "Collaborateur"}</p>
              <p className="text-[9px] text-black/40 truncate font-jakarta">{user?.primaryEmailAddress?.emailAddress || ""}</p>
            </div>
            <MoreVertical size={14} className="text-black/40 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
