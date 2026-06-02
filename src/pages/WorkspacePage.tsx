import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Home, 
  User, 
  MessageSquare, 
  FileText, 
  Users, 
  Clock, 
  LogOut, 
  Search, 
  Loader2, 
  LayoutGrid,
  MoreVertical 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function WorkspacePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [role, setRole] = useState<string>("VIEWER");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // User avatar state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoaded) return;
    if (!user) {
      navigate("/");
      return;
    }

    async function loadWorkspaceMember() {
      try {
        // Find member status ACTIVE belonging to user
        const { data: member, error: memberError } = await supabase
          .from("workspace_members")
          .select("enterprise_id, role")
          .eq("user_profile_id", user.id)
          .eq("status", "ACTIVE")
          .maybeSingle();

        if (memberError || !member) {
          console.error("No active workspace membership found.");
          navigate("/");
          return;
        }

        setRole(member.role || "VIEWER");

        // Fetch enterprise name
        const { data: enterprise, error: entError } = await supabase
          .from("enterprises")
          .select("name")
          .eq("enterprise_id", member.enterprise_id)
          .maybeSingle();

        if (!entError && enterprise) {
          setWorkspaceName(enterprise.name || "Workspace");
        } else {
          setWorkspaceName("Workspace");
        }

        // Load specific photo from profiles
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("photo_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.photo_url) {
          setPhotoUrl(profile.photo_url);
        }
      } catch (err) {
        console.error("Error loading workspace data:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaceMember();
  }, [user, isUserLoaded, navigate]);

  if (loading || !isUserLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-jakarta">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-sm text-neutral-500 font-medium font-jakarta">Chargement du workspace...</p>
        </div>
      </div>
    );
  }

  // Define avatar fallback & src safely
  const avatarSrc = photoUrl || user?.imageUrl;

  // Role Description
  let roleDescription = "Lecture seule — Vous pouvez consulter sans modifier";
  if (role === 'EDITOR') {
    roleDescription = "Éditeur — Vous pouvez modifier le contenu";
  } else if (role === 'ADMIN') {
    roleDescription = "Administrateur — Accès complet sauf suppression";
  }

  return (
    <div className="flex h-screen w-full bg-[#ffffff] text-black font-jakarta overflow-hidden">
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="w-64 border-r border-neutral-100 bg-white flex flex-col flex-shrink-0">
          {/* Logo Head */}
          <div className="h-14 flex items-center px-4 border-b border-neutral-100 gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-white">
              <LayoutGrid size={14} />
            </div>
            <span className="font-bold text-sm tracking-tight text-black font-jakarta">Autoslash AI</span>
          </div>

          {/* Navigation and other links */}
          <div className="px-4 py-4 flex flex-col gap-6 flex-1 overflow-y-auto">
            {/* Section: NAVIGATION */}
            <div className="flex flex-col gap-1">
              <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1 font-jakarta">
                Navigation
              </p>
              
              <Link to="/workspace">
                <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all bg-black/5 text-black font-semibold font-jakarta text-xs">
                  <Home size={14} />
                  <span className="flex-1">Accueil</span>
                </div>
              </Link>

              <Link to="/client-space/profil">
                <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all text-black/60 hover:bg-black/5 hover:text-black font-jakarta text-xs">
                  <User size={14} />
                  <span className="flex-1">Mon Profil</span>
                </div>
              </Link>
            </div>

            {/* Section: À VENIR */}
            <div className="flex flex-col gap-1">
              <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1 font-jakarta">
                À venir
              </p>
              
              <div className="flex items-center gap-3 px-3 py-2 rounded-md opacity-40 cursor-not-allowed text-black/60 select-none font-jakarta">
                <MessageSquare size={14} />
                <span className="text-xs flex-1">Messagerie</span>
                <span className="text-[10px] text-black/30 font-medium">Bientôt</span>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-md opacity-40 cursor-not-allowed text-black/60 select-none font-jakarta">
                <FileText size={14} />
                <span className="text-xs flex-1">Documents</span>
                <span className="text-[10px] text-black/30 font-medium">Bientôt</span>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-md opacity-40 cursor-not-allowed text-black/60 select-none font-jakarta">
                <Users size={14} />
                <span className="text-xs flex-1">Collaborateurs</span>
                <span className="text-[10px] text-black/30 font-medium">Bientôt</span>
              </div>
            </div>

            {/* Bottom Clerk user card */}
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
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex flex-1 max-w-md items-center group">
              <Search className="absolute left-3 h-3.5 w-3.5 text-black/40 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                placeholder="Search" 
                className="h-8 w-full rounded-md border border-black/10 bg-[#f9f9f9] pl-9 pr-12 text-sm outline-none focus:border-black/20 focus:bg-white transition-all font-jakarta"
              />
              <div className="absolute right-3 flex items-center gap-1">
                <kbd className="pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[9px] font-medium text-black/40">
                  <span className="text-xs">⌘</span>J
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => signOut(() => navigate("/"))}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4 text-black/60" />
            </button>
          </div>
        </header>

        {/* Core Workspace Message Content */}
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-[12px] shadow-sm p-8 flex flex-col items-center text-center">
            {/* Tag/Header */}
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 font-jakarta">
              Workspace
            </span>
            
            {/* Workspace Big Name */}
            <h1 className="text-2xl font-bold text-black mb-4 font-jakarta tracking-tight">
              {workspaceName}
            </h1>

            {/* Separator */}
            <Separator className="w-full bg-neutral-100 mb-6" />

            {/* Greeting */}
            <h3 className="text-lg font-semibold text-black mb-2 font-jakarta">
              Bienvenue, {user?.firstName || "Collaborateur"}
            </h3>

            {/* Role Box */}
            <div className="bg-neutral-50 border border-neutral-100 rounded-lg py-2 px-4 mb-6 text-center max-w-sm">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 font-jakarta">
                Votre Rôle : {role}
              </span>
              <span className="text-xs text-neutral-600 block leading-tight font-jakarta">
                {roleDescription}
              </span>
            </div>

            {/* Status explanation & Clock icon */}
            <p className="text-xs text-neutral-400 max-w-sm mb-6 leading-relaxed font-jakarta">
              Votre espace collaboratif est en cours de préparation. <br />
              Les fonctionnalités seront disponibles prochainement.
            </p>

            <Clock className="h-10 w-10 text-neutral-300" strokeWidth={1} />
          </div>
        </main>
      </div>
    </div>
  );
}
