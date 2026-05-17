/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  LayoutDashboard, 
  User as UserIcon, 
  Package, 
  Heart, 
  History, 
  ChevronRight,
  Camera,
  CheckCircle2
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { checkOnboardingStatus } from "../../lib/supabase-onboarding";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('profile');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) fetchData();
  }, [isLoaded, user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!isLoaded || loading) {
    return <div style={{background:'#000', width:'100vw', height:'100vh'}} />;
  }

  const firstName = user?.firstName || profile?.full_name?.split(' ')[0] || "User";

  return (
    <div style={S.container}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo} onClick={() => navigate('/')}>
          <span style={S.logoText}>Autoslash AI</span>
          <span style={{ fontSize: '0.62rem', color: '#CCCCCC', letterSpacing: '0.03em' }}>
            ← Accueil
          </span>
        </div>

        <div style={S.sidebarUser}>
          <div
            onClick={() => setActivePage('profile')}
            style={S.avatarContainer}
          >
            {(profile?.photo_url || user?.imageUrl) ? (
              <img
                src={profile?.photo_url || user?.imageUrl}
                alt="avatar"
                style={S.avatarImg}
              />
            ) : (
              firstName.charAt(0).toUpperCase()
            )}
          </div>
          <div style={S.userInfo}>
            <div style={S.userName}>{profile?.full_name || user?.fullName}</div>
            <div style={S.userEmail}>{profile?.email || user?.primaryEmailAddress?.emailAddress}</div>
          </div>
          <div style={S.statusBadge}>
            <div style={S.statusDot} />
            Prospect
          </div>
        </div>

        <nav style={S.nav}>
          <div style={S.navSection}>NAVIGATION</div>
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Vue d'ensemble" 
            active={activePage === 'overview'} 
            onClick={() => setActivePage('overview')} 
          />
          <NavItem 
            icon={<Package size={18} />} 
            label="Mon Package" 
            active={activePage === 'package'} 
            onClick={() => setActivePage('package')} 
          />
          <NavItem 
            icon={<Heart size={18} />} 
            label="Mes Favoris" 
            active={activePage === 'favorites'} 
            onClick={() => setActivePage('favorites')} 
          />
          <NavItem 
            icon={<UserIcon size={18} />} 
            label="Mon Profil" 
            active={activePage === 'profile'} 
            onClick={() => setActivePage('profile')} 
            showArrow
          />
          <NavItem 
            icon={<History size={18} />} 
            label="Mes Échanges" 
            active={activePage === 'history'} 
            onClick={() => setActivePage('history')} 
          />
        </nav>

        <button style={S.logoutBtn} onClick={handleLogout}>
          <span style={{marginRight: '0.5rem'}}>←</span> Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main style={S.main}>
        <header style={S.header}>
          <h1 style={S.pageTitle}>Mon Profil</h1>
          <div style={S.headerRight}>
            <span style={S.dateText}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span style={S.prospectChip}>Prospect</span>
          </div>
        </header>

        <div style={S.content}>
          {activePage === 'profile' && (
            <ProfileEditPage 
              profile={profile} 
              onSave={fetchData} 
              userId={user?.id || ''} 
              userImageUrl={user?.imageUrl || ''}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, showArrow }: any) {
  return (
    <div 
      onClick={onClick}
      style={{
        ...S.navItem,
        ...(active ? S.navItemActive : {})
      }}
    >
      <div style={S.navItemLeft}>
        <span style={{color: active ? '#fff' : '#888'}}>{icon}</span>
        <span style={{marginLeft: '0.75rem'}}>{label}</span>
      </div>
      {showArrow && <ChevronRight size={14} style={{opacity: 0.5}} />}
    </div>
  );
}

function ProfileEditPage({ profile, onSave, userId, userImageUrl }: any) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
    sector: profile?.sector || ''
  });
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600',
        });
      
      if (uploadError) {
        console.error('Upload:', uploadError);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;
      
      await supabase
        .from('user_profiles')
        .update({ photo_url: publicUrl })
        .eq('id', userId);
      
      onSave();
    } catch (err) {
      console.error('Photo error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .update(form)
      .eq('id', userId);
    
    if (!error) onSave();
  };

  return (
    <div style={S.editPage}>
      <div style={S.formGrid}>
        <div style={S.inputGroup}>
          <label style={S.label}>NOM COMPLET</label>
          <input 
            style={S.input} 
            value={form.full_name} 
            onChange={e => setForm({...form, full_name: e.target.value})} 
          />
        </div>
        <div style={S.inputGroup}>
          <label style={S.label}>EMAIL PROFESSIONNEL</label>
          <input 
            style={S.input} 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
          />
        </div>
        <div style={S.inputGroup}>
          <label style={S.label}>TÉLÉPHONE</label>
          <input 
            style={S.input} 
            value={form.phone} 
            onChange={e => setForm({...form, phone: e.target.value})} 
          />
        </div>
        <div style={S.inputGroup}>
          <label style={S.label}>ENTREPRISE</label>
          <input 
            style={S.input} 
            value={form.company} 
            onChange={e => setForm({...form, company: e.target.value})} 
          />
        </div>
        <div style={S.inputGroup}>
          <label style={S.label}>SECTEUR D'ACTIVITÉ</label>
          <input 
            style={S.input} 
            value={form.sector} 
            onChange={e => setForm({...form, sector: e.target.value})} 
          />
        </div>
      </div>

      <div style={{marginTop: '2rem'}}>
        <label style={S.label}>PHOTO DE PROFIL</label>
        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem'}}>
          <div style={S.photoPreview}>
            {(profile?.photo_url || userImageUrl) ? (
              <img
                src={profile?.photo_url || userImageUrl}
                alt="aperçu"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              form.full_name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <div>
            <label style={S.uploadBtn}>
              {uploading ? 'Envoi...' : 'Choisir une photo'}
              <input type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
            </label>
            <p style={{fontSize: '0.7rem', color: '#888', marginTop: '0.5rem'}}>JPG, PNG ou WEBP · Max 2MB</p>
          </div>
        </div>
      </div>

      <button style={S.saveBtn} onClick={handleSave}>Sauvegarder</button>
    </div>
  );
}

const S: any = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#F9F9F9',
    color: '#000',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden',
  },
  sidebar: {
    width: 260,
    background: '#FFF',
    borderRight: '1px solid #F0F0F0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarLogo: {
    padding: '1rem 1.25rem 0.75rem',
    borderBottom: '1px solid #F0F0F0',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    flexShrink: 0,
    minHeight: 'auto',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 900,
    fontSize: '1.2rem',
    color: '#000',
  },
  sidebarUser: {
    padding: '1.5rem 1.25rem',
    borderBottom: '1px solid #F0F0F0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#000',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 700,
    fontFamily: "'Playfair Display', serif",
    cursor: 'pointer',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 700,
    fontSize: '0.9rem',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.1rem',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#E67E22',
    marginTop: '0.2rem',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#E67E22',
  },
  nav: {
    flexGrow: 1,
    padding: '1.5rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  navSection: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#BBB',
    letterSpacing: '0.1em',
    padding: '0 0.5rem',
    marginBottom: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#555',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: '#000',
    color: '#FFF',
  },
  navItemLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: '1.5rem',
    borderTop: '1px solid #F0F0F0',
    fontSize: '0.85rem',
    color: '#888',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  main: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    padding: '1.5rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#FFF',
    borderBottom: '1px solid #F0F0F0',
  },
  pageTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  dateText: {
    fontSize: '0.8rem',
    color: '#BBB',
  },
  prospectChip: {
    background: '#FFF5EB',
    color: '#E67E22',
    padding: '0.3rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  content: {
    padding: '2.5rem',
    maxWidth: 900,
  },
  editPage: {
    background: '#FFF',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#BBB',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '0.75rem 0',
    border: 'none',
    borderBottom: '1px solid #EEE',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  photoPreview: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: '#F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: "'Playfair Display', serif",
    overflow: 'hidden',
  },
  uploadBtn: {
    background: '#000',
    color: '#FFF',
    padding: '0.6rem 1.25rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-block',
  },
  saveBtn: {
    marginTop: '3rem',
    background: '#000',
    color: '#FFF',
    padding: '0.8rem 2.5rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
  }
};
