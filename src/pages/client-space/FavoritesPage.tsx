import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabaseClient";
import { 
  User, 
  Star, 
  Gift, 
  LayoutGrid, 
  Loader2, 
  MoreVertical,
  LogOut 
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  category: string;
  sector: string;
  package_type: 'STARTUP' | 'BUSINESS' | 'ENTERPRISE';
  image_url: string;
  description: string;
  preview_url: string;
  is_published: boolean;
}

export default function FavoritesPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Template[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const searchQuery = searchParams.get('q') || '';
  const filteredTemplates = searchQuery
    ? favorites.filter(t =>
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sector?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : favorites;

  useEffect(() => {
    if (!isUserLoaded) return;
    if (!user) {
      navigate("/");
      return;
    }

    async function fetchData() {
      try {
        // 1. Fetch user photo
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("photo_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.photo_url) {
          setPhotoUrl(profile.photo_url);
        }

        // 2. Fetch user favorites
        const { data, error } = await supabase
          .from("user_favorites")
          .select("template_id, templates(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          const loadedTemplates = data
            .map((f: any) => f.templates)
            .filter(Boolean) as Template[];
          setFavorites(loadedTemplates);
        }
      } catch (err) {
        console.error("Error loading favorites:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, isUserLoaded, navigate]);

  const handleRemoveFavorite = async (templateId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;
    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("template_id", templateId);
      
      if (!error) {
        setFavorites(prev => prev.filter(item => item.id !== templateId));
      } else {
        console.error("Error removing favorite:", error);
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  if (loading || !isUserLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-jakarta">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-sm text-neutral-500 font-medium font-jakarta">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  const avatarSrc = photoUrl || user?.imageUrl;

  return (
    <div className="flex h-screen w-full bg-[#ffffff] text-black font-jakarta overflow-hidden">
      {/* Sidebar */}
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
            
            <Link to="/client-space/profil">
              <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all text-black/60 hover:bg-black/5 hover:text-black font-jakarta text-xs">
                <User size={14} />
                <span className="flex-1">Mon Profil</span>
              </div>
            </Link>

            <Link to="/client-space/favoris">
              <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all bg-black/5 text-black font-semibold font-jakarta text-xs">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="flex-1">Mes Favoris</span>
              </div>
            </Link>
          </div>

          {/* Section À VENIR */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1 font-jakarta">
              À venir
            </p>
            
            <Link to="/client-space/parrainage">
              <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all text-black/60 hover:bg-black/5 hover:text-black font-jakarta text-xs">
                <Gift size={14} />
                <span className="flex-1">Parrainage</span>
              </div>
            </Link>
          </div>

          {/* Clerk user card */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <h2 className="font-bold text-sm tracking-tight text-black font-jakarta">
            Mes Favoris
          </h2>

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

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <Star size={32} className="text-black/20 mb-4" />
              <p className="text-sm font-semibold text-black/60">
                Vous n'avez pas encore de favoris
              </p>
              <p className="text-xs text-black/40 mt-1 font-jakarta">
                Explorez nos templates et ajoutez-les à vos favoris
              </p>
              <a href="/startup-package" 
                 className="mt-4 inline-block text-xs font-bold 
                            text-black underline hover:opacity-75 font-jakarta transition-all">
                Explorer les templates →
              </a>
            </div>
          ) : (
            <div>
              {searchQuery && (
                <p className="text-xs text-black/40 mb-4 font-jakarta">
                  Résultats pour "{searchQuery}" — {filteredTemplates.length} template(s)
                </p>
              )}
              
              {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[40vh] text-center">
                  <p className="text-sm font-semibold text-black/60 font-jakarta">
                    Aucun favori ne correspond à votre recherche
                  </p>
                  <p className="text-xs text-black/40 mt-1 font-jakarta">
                    Essayez de rechercher un autre mot-clé ou effacez la recherche
                  </p>
                  <Link to="/client-space/favoris" className="mt-4 inline-block text-xs font-bold text-black underline font-jakarta">
                    Effacer la recherche
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((item) => (
                    <div key={item.id} className="border border-[#e5e7eb] rounded-[12px] overflow-hidden flex flex-col hover:shadow-sm transition-shadow bg-white font-jakarta">
                      {/* Image Container */}
                      <div className="relative aspect-[3/2] bg-neutral-100 overflow-hidden">
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";
                          }}
                        />
                        
                        {/* Package type badge */}
                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded leading-none uppercase">
                          {item.package_type}
                        </span>

                        {/* Star Button */}
                        <button
                          onClick={(e) => handleRemoveFavorite(item.id, e)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 backdrop-blur-md border border-white/10 hover:opacity-60 transition-all"
                          title="Retirer des favoris"
                        >
                          <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        </button>
                      </div>

                      {/* Text Container */}
                      <div className="p-3 flex flex-col flex-grow">
                        <h4 className="font-bold text-sm text-black mb-1 line-clamp-1">{item.title}</h4>
                        <span className="text-[10px] text-black/50 font-bold uppercase tracking-wider mb-2 block font-jakarta">
                          {item.category} • {item.sector}
                        </span>
                        <p className="text-xs text-black/60 line-clamp-2 leading-relaxed mb-4">
                          {item.description || "Aucune description disponible pour ce template."}
                        </p>

                        {/* Footer elements */}
                        <div className="mt-auto pt-2 border-t border-neutral-100 flex items-center justify-between">
                          <a 
                            href={item.preview_url || "#"} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-black/40 underline font-jakarta transition-all"
                          >
                            Voir le template
                          </a>
                          <Link 
                            to={`/architecture/${item.id}`}
                            className="text-xs font-bold text-black hover:opacity-75 font-jakarta transition-all"
                          >
                            Démarrer mon projet →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
