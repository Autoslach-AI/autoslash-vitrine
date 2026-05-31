import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { 
  Search, 
  Settings, 
  PanelLeft, 
  LayoutGrid, 
  Plus, 
  Mail, 
  ChevronRight,
  Database,
  BarChart3,
  Clock,
  ShoppingBag,
  GraduationCap,
  Truck,
  MessageSquare,
  MoreVertical,
  LogOut,
  Home,
  User,
  Star,
  Gift,
  Users
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Separator } from "@/components/ui/separator";
import { checkOnboardingStatus } from "../lib/supabase-onboarding";
import { supabase } from '../lib/supabaseClient';
import InviteCollaboratorModal from "@/components/dashboard/InviteCollaboratorModal";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [enterprise, setEnterprise] = useState<{ enterprise_id: string; package_type: string; status?: string } | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate('/');
      return;
    }
    
    checkOnboardingStatus(user.id).then((completed) => {
      if (!completed) {
        navigate('/onboarding');
      }
    });
  }, [user, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    
    supabase
      .from('enterprises')
      .select('enterprise_id, package_type, status')
      .eq('email', user.primaryEmailAddress?.emailAddress)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEnterprise(data);
        }
      });
  }, [user, isLoaded]);

  function UserAvatar() {
    const { user } = useUser();
    const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (!user?.id) return;
      supabase
        .from('user_profiles')
        .select('photo_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.photo_url) setPhotoUrl(data.photo_url);
        });
    }, [user?.id]);

    const src = photoUrl || user?.imageUrl;

    return (
      <div className="h-7 w-7 overflow-hidden rounded-full 
                      border border-black/5 flex-shrink-0">
        {src ? (
          <img 
            src={src} 
            alt="Avatar" 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="flex h-full w-full items-center 
                          justify-center bg-black text-[10px] 
                          font-bold text-white uppercase">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#fbfbfb] text-black font-jakarta overflow-hidden">
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="w-64 border-r bg-white flex flex-col flex-shrink-0">
          <div className="h-14 flex items-center px-4 border-b gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-white">
              <LayoutGrid size={14} />
            </div>
            <span className="font-bold text-sm tracking-tight">Autoslash AI</span>
          </div>

          <div className="px-4 py-4 flex flex-col gap-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowInviteModal(true)} 
                className="flex-1 flex items-center justify-center bg-[#18181b] text-white rounded-md px-3 py-2 text-xs font-medium hover:bg-black/90 transition-colors"
              >
                + Inviter un collaborateur
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-black/5 transition-colors">
                <Mail size={14} className="text-black/60" />
              </button>
            </div>

            {/* NAVIGATION SECTION */}
            <div className="flex flex-col gap-1">
              <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">
                Navigation
              </p>
              <Link to="/dashboard">
                <SidebarItem icon={<Home size={14} />} label="Accueil" active={true} />
              </Link>
              <Link to="/client-space/profil">
                <SidebarItem icon={<User size={14} />} label="Mon Profil" active={false} />
              </Link>
            </div>

            {/* À VENIR SECTION */}
            <div className="flex flex-col gap-1">
              <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">
                À venir
              </p>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md opacity-40 cursor-not-allowed text-black/60 select-none">
                <Star size={14} />
                <span className="text-xs flex-1">Mes Favoris</span>
                <span className="text-[10px] text-black/30 font-medium">Bientôt</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md opacity-40 cursor-not-allowed text-black/60 select-none">
                <Gift size={14} />
                <span className="text-xs flex-1">Parrainage</span>
                <span className="text-[10px] text-black/30 font-medium">Bientôt</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md opacity-40 cursor-not-allowed text-black/60 select-none">
                <Users size={14} />
                <span className="text-xs flex-1">Collaborateurs</span>
                <span className="text-[10px] text-black/30 font-medium">Bientôt</span>
              </div>
            </div>

            <div className="mt-auto">
              <Link to="/client-space/profil" className="flex items-center gap-2 px-2 py-3 border-t overflow-hidden hover:bg-black/5 transition-colors cursor-pointer group">
                <UserAvatar />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold truncate">{user?.fullName || "User"}</p>
                  <p className="text-[9px] text-black/40 truncate">{user?.primaryEmailAddress?.emailAddress || ""}</p>
                </div>
                <MoreVertical size={14} className="text-black/40" />
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Ribbon */}
        <header className="h-14 flex items-center justify-between px-6 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center justify-center rounded-md p-1.5 hover:bg-black/5 transition-colors"
            >
              <PanelLeft className="h-4.5 w-4.5 text-black/60" />
            </button>
            
            <Separator orientation="vertical" className="h-4" />

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
              onClick={() => signOut(() => navigate('/'))}
              className="flex h-8 w-8 items-center justify-center 
                         rounded-md hover:bg-black/5 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4 text-black/60" />
            </button>

          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-full space-y-8 animate-in fade-in duration-500">
            <MetricCards userId={user?.id} />
            <PerformanceOverview userId={user?.id} />
          </div>
        </main>
      </div>

      {showInviteModal && (
        <InviteCollaboratorModal 
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          enterprise_id={enterprise?.enterprise_id}
          package_type={enterprise?.package_type}
          user_profile_id={user?.id}
          userStatus={enterprise?.status}
        />
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`
      flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all
      ${active ? 'bg-black/5 text-black font-semibold' : 'text-black/60 hover:bg-black/5 hover:text-black'}
    `}>
      {icon}
      <span className="text-xs flex-1">{label}</span>
    </div>
  );
}

function UsersCustomIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
