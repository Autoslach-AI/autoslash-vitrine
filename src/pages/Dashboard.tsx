import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  MoreVertical
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-[#fbfbfb] text-black font-jakarta overflow-hidden">
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="w-64 border-r bg-white flex flex-col flex-shrink-0">
          <div className="h-14 flex items-center px-4 border-b gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-white">
              <LayoutGrid size={14} />
            </div>
            <span className="font-bold text-sm tracking-tight">Studio Admin</span>
          </div>

          <div className="px-4 py-4 flex flex-col gap-6 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center gap-2 bg-[#18181b] text-white rounded-md px-3 py-2 text-xs font-medium hover:bg-black/90 transition-colors">
                <Plus size={14} />
                Quick Create
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-black/5 transition-colors">
                <Mail size={14} className="text-black/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-2 mb-2">Dashboards</p>
                <div className="space-y-0.5">
                  <SidebarItem icon={<LayoutGrid size={16} />} label="Default" active />
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <Link to="/client-space/profil" className="flex items-center gap-2 px-2 py-3 border-t overflow-hidden hover:bg-black/5 transition-colors cursor-pointer group">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-black/5 flex-shrink-0 group-hover:ring-2 group-hover:ring-black/10 transition-all">
                  <img 
                    src={user?.imageUrl || "https://avatar.vercel.sh/arham"} 
                    alt="User" 
                    className="h-full w-full object-cover" 
                  />
                </div>
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
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5 transition-colors">
              <Settings className="h-4.5 w-4.5 text-black/60" />
            </button>
            

          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-full space-y-8 animate-in fade-in duration-500">
            <MetricCards />
            <PerformanceOverview />
          </div>
        </main>
      </div>
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

function Users({ size, className }: { size?: number, className?: string }) {
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
