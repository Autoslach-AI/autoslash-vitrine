import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  sector?: string;
  intention?: string;
  package_interest?: string;
  onboarding_completed?: boolean;
  created_at?: string;
}

interface Enterprise {
  id: string;
  name: string;
  package_type: string;
  status: string;
  project_id: string;
  created_at: string;
  message?: string;
}

interface FavoriteTemplate {
  id: string;
  template_id: string;
  templates: {
    title: string;
    sector: string;
    package_type: string;
    image_url: string;
    price_fcfa: number;
  };
}

type ActivePage = 'overview' | 'package' | 'favorites' | 'profile' | 'history';

// ─── PACKAGE CONFIG ───────────────────────────────────────────────────────────
const packageConfig: Record<string, { label: string; features: string[]; price: string; route: string }> = {
  STARTUP: {
    label: 'Startup',
    features: ['Site web premium interactif', 'Design Figma-level avec animations', 'Formulaire connecté à Supabase'],
    price: '150 000 – 200 000 FCFA',
    route: '/startup-package'
  },
  BUSINESS: {
    label: 'Business',
    features: ['2 agents IA spécialistes entraînés', 'Automatisation réseaux sociaux', '1 000 000 tokens/mois inclus'],
    price: '300 000 – 350 000 FCFA',
    route: '/business-package'
  },
  ENTERPRISE: {
    label: 'Enterprise',
    features: ['3 à 5 agents IA experts dédiés', 'Automatisation complète via n8n', 'Acquisition client autonome 24h/24'],
    price: '450 000 – 500 000 FCFA',
    route: '/enterprise-package'
  },
  ELITE: {
    label: 'Elite',
    features: ['Infrastructure IA sur mesure', 'Équipe humaine + agents dédiés', 'Accompagnement jusqu\'aux résultats'],
    price: 'Sur mesure',
    route: '/elite-plan'
  }
};

const statusLabel: Record<string, { text: string; color: string }> = {
  PROSPECT: { text: 'Prospect', color: '#D4A017' },
  ACTIVE: { text: 'Actif', color: '#22C55E' },
  STABLE: { text: 'Stable', color: '#22C55E' },
  WARNING: { text: 'Attention', color: '#EF4444' },
  CRITICAL: { text: 'Critique', color: '#DC2626' },
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const navItems: { id: ActivePage; label: string; icon: string }[] = [
  { id: 'overview',  label: 'Vue d\'ensemble', icon: '◈' },
  { id: 'package',   label: 'Mon Package',     icon: '◇' },
  { id: 'favorites', label: 'Mes Favoris',     icon: '◆' },
  { id: 'profile',   label: 'Mon Profil',      icon: '○' },
  { id: 'history',   label: 'Mes Échanges',    icon: '◉' },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [favorites, setFavorites] = useState<FavoriteTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, enterprisesRes, favoritesRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('enterprises').select('*').eq('email', user.primaryEmailAddress?.emailAddress).order('created_at', { ascending: false }),
        supabase.from('user_favorites').select('*, templates(title, sector, package_type, image_url, price_fcfa)').eq('user_id', user.id)
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (enterprisesRes.data) setEnterprises(enterprisesRes.data);
      if (favoritesRes.data) setFavorites(favoritesRes.data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const pkg = packageConfig[profile?.package_interest || 'STARTUP'];
  const firstName = profile?.full_name?.split(' ')[0] || user?.firstName || 'vous';
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div style={styles.root}>
      {/* ── SIDEBAR ── */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo} onClick={() => navigate('/')}>
          <span style={styles.logoText}>Autoslash AI</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                ...styles.navItem,
                ...(activePage === item.id ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.sidebarPackageBadge}>
            <span style={styles.sidebarPackageLabel}>Package</span>
            <span style={styles.sidebarPackageValue}>{pkg?.label || '—'}</span>
          </div>
          <button onClick={handleSignOut} style={styles.signOutBtn}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={styles.main}>
        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.loader} />
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {activePage === 'overview' && (
              <div style={styles.pageWrap}>
                <div style={styles.pageHeader}>
                  <h1 style={styles.greeting}>Bonjour, {firstName}.</h1>
                  <p style={styles.subGreeting}>Membre depuis le {joinDate}</p>
                </div>

                <div style={styles.statsGrid}>
                  <div style={styles.statCard} onClick={() => setActivePage('package')}>
                    <span style={styles.statLabel}>MON PACKAGE</span>
                    <span style={styles.statValue}>{pkg?.label || '—'}</span>
                    <span style={styles.statAction}>Voir le détail →</span>
                  </div>
                  <div style={styles.statCard} onClick={() => setActivePage('favorites')}>
                    <span style={styles.statLabel}>MES FAVORIS</span>
                    <span style={styles.statValue}>{favorites.length}</span>
                    <span style={styles.statAction}>{favorites.length > 0 ? 'Voir mes templates →' : 'Aucun pour l\'instant'}</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statLabel}>MON STATUT</span>
                    <span style={{ ...styles.statValue, color: statusLabel[enterprises[0]?.status]?.color || '#000' }}>
                      {statusLabel[enterprises[0]?.status]?.text || 'Prospect'}
                    </span>
                    <span style={styles.statAction}>En cours de traitement</span>
                  </div>
                </div>

                {enterprises.length > 0 && (
                  <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Dernière activité</h2>
                    <div style={styles.activityItem}>
                      <div style={styles.activityDot} />
                      <div>
                        <p style={styles.activityText}>
                          Vous avez contacté Autoslash AI le{' '}
                          <strong>
                            {new Date(enterprises[0].created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </strong>
                        </p>
                        <p style={styles.activitySub}>
                          Référence : {enterprises[0].project_id} · Package {enterprises[0].package_type}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PACKAGE ── */}
            {activePage === 'package' && (
              <div style={styles.pageWrap}>
                <div style={styles.pageHeader}>
                  <h1 style={styles.pageTitle}>Mon Package</h1>
                  <p style={styles.subGreeting}>Recommandé selon votre profil</p>
                </div>
                <div style={styles.packageCard}>
                  <div style={styles.packageCardHeader}>
                    <span style={styles.packageTag}>RECOMMANDÉ</span>
                    <h2 style={styles.packageName}>{pkg?.label}</h2>
                    <p style={styles.packagePrice}>{pkg?.price}</p>
                  </div>
                  <ul style={styles.packageFeatures}>
                    {pkg?.features.map((f, i) => (
                      <li key={i} style={styles.packageFeature}>
                        <span style={styles.featureDot}>·</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div style={styles.packageActions}>
                    <button style={styles.btnPrimary} onClick={() => navigate(pkg?.route)}>
                      Démarrer ce package →
                    </button>
                    <button style={styles.btnSecondary} onClick={() => navigate('/pricing')}>
                      Voir les autres options
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── FAVORITES ── */}
            {activePage === 'favorites' && (
              <div style={styles.pageWrap}>
                <div style={styles.pageHeader}>
                  <h1 style={styles.pageTitle}>Mes Favoris</h1>
                  <p style={styles.subGreeting}>{favorites.length} template{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}</p>
                </div>
                {favorites.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>◆</span>
                    <p style={styles.emptyText}>Aucun favori pour l'instant</p>
                    <p style={styles.emptySub}>Parcourez nos templates et sauvegardez vos préférés</p>
                    <button style={styles.btnPrimary} onClick={() => navigate('/pricing')}>
                      Explorer les templates →
                    </button>
                  </div>
                ) : (
                  <div style={styles.favGrid}>
                    {favorites.map((fav) => (
                      <div key={fav.id} style={styles.favCard}>
                        {fav.templates?.image_url && (
                          <div style={styles.favImageWrap}>
                            <img src={fav.templates.image_url} alt={fav.templates.title} style={styles.favImage} />
                          </div>
                        )}
                        <div style={styles.favContent}>
                          <span style={styles.favPackage}>{fav.templates?.package_type}</span>
                          <h3 style={styles.favTitle}>{fav.templates?.title}</h3>
                          <p style={styles.favSector}>{fav.templates?.sector}</p>
                          <button style={styles.favBtn} onClick={() => navigate('/contact')}>
                            Demander ce template →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE EDIT ── */}
            {activePage === 'profile' && (
              <ProfileEditPage profile={profile} onSave={fetchData} userId={user?.id || ''} />
            )}

            {/* ── HISTORY ── */}
            {activePage === 'history' && (
              <div style={styles.pageWrap}>
                <div style={styles.pageHeader}>
                  <h1 style={styles.pageTitle}>Mes Échanges</h1>
                  <p style={styles.subGreeting}>Historique de vos contacts avec Autoslash AI</p>
                </div>
                {enterprises.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>◉</span>
                    <p style={styles.emptyText}>Aucun échange pour le moment</p>
                    <button style={styles.btnPrimary} onClick={() => navigate('/contact')}>
                      Nous contacter →
                    </button>
                  </div>
                ) : (
                  <div style={styles.historyList}>
                    {enterprises.map((e) => (
                      <div key={e.id} style={styles.historyItem}>
                        <div style={styles.historyLeft}>
                          <div style={styles.historyDot} />
                          <div>
                            <p style={styles.historyDate}>
                              {new Date(e.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric'
                              })}
                            </p>
                            <p style={styles.historyRef}>Réf. {e.project_id}</p>
                          </div>
                        </div>
                        <div style={styles.historyRight}>
                          <span style={styles.historyPackage}>{e.package_type}</span>
                          <span style={{
                            ...styles.historyStatus,
                            color: statusLabel[e.status]?.color || '#000',
                            borderColor: statusLabel[e.status]?.color || '#000',
                          }}>
                            {statusLabel[e.status]?.text || e.status}
                          </span>
                        </div>
                        {e.message && (
                          <p style={styles.historyMessage}>"{e.message}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─── PROFILE EDIT ─────────────────────────────────────────────────────────────
function ProfileEditPage({ profile, onSave, userId }: { profile: UserProfile | null; onSave: () => void; userId: string }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
    sector: profile?.sector || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('user_profiles')
      .update(form)
      .eq('id', userId);
    setSaving(false);
    if (!error) {
      setSaved(true);
      onSave();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div style={styles.pageWrap}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Mon Profil</h1>
        <p style={styles.subGreeting}>Modifiez vos informations personnelles</p>
      </div>

      <div style={styles.profileForm}>
        {[
          { label: 'Nom complet', key: 'full_name', type: 'text' },
          { label: 'Email professionnel', key: 'email', type: 'email' },
          { label: 'Téléphone', key: 'phone', type: 'tel' },
          { label: 'Entreprise', key: 'company', type: 'text' },
          { label: 'Secteur', key: 'sector', type: 'text' },
        ].map(({ label, key, type }) => (
          <div key={key} style={styles.formGroup}>
            <label style={styles.formLabel}>{label.toUpperCase()}</label>
            <input
              type={type}
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={styles.formInput}
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ ...styles.btnPrimary, marginTop: '2rem', opacity: saving ? 0.6 : 1 }}
        >
          {saved ? '✓ Sauvegardé' : saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  // SIDEBAR
  sidebar: {
    width: '260px',
    minWidth: '260px',
    background: '#FAFAFA',
    borderRight: '1px solid #EBEBEB',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarLogo: {
    padding: '2rem 2rem 1.5rem',
    borderBottom: '1px solid #EBEBEB',
    cursor: 'pointer',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0A0A0A',
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    gap: '0.25rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#6B6B6B',
    fontSize: '0.85rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    letterSpacing: '0.01em',
  },
  navItemActive: {
    background: '#0A0A0A',
    color: '#FFFFFF',
  },
  navIcon: {
    fontSize: '0.9rem',
    opacity: 0.7,
  },
  sidebarBottom: {
    padding: '1.5rem',
    borderTop: '1px solid #EBEBEB',
  },
  sidebarPackageBadge: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginBottom: '1rem',
  },
  sidebarPackageLabel: {
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  sidebarPackageValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0A0A0A',
  },
  signOutBtn: {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #EBEBEB',
    borderRadius: '6px',
    background: 'transparent',
    color: '#6B6B6B',
    fontSize: '0.8rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },

  // MAIN
  main: {
    flex: 1,
    overflowY: 'auto',
  },
  loadingWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  loader: {
    width: '32px',
    height: '32px',
    border: '2px solid #EBEBEB',
    borderTop: '2px solid #0A0A0A',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  // PAGE WRAP
  pageWrap: {
    maxWidth: '780px',
    margin: '0 auto',
    padding: '3rem 2rem 6rem',
  },
  pageHeader: {
    marginBottom: '3rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #EBEBEB',
  },
  greeting: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.8rem',
    fontWeight: 700,
    color: '#0A0A0A',
    margin: 0,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.4rem',
    fontWeight: 700,
    color: '#0A0A0A',
    margin: 0,
    letterSpacing: '-0.03em',
  },
  subGreeting: {
    color: '#AAAAAA',
    fontSize: '0.85rem',
    margin: '0.5rem 0 0',
    fontWeight: 400,
    letterSpacing: '0.02em',
  },

  // STATS GRID
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '3rem',
  },
  statCard: {
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#FAFAFA',
  },
  statLabel: {
    fontSize: '0.62rem',
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  statValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#0A0A0A',
    letterSpacing: '-0.02em',
  },
  statAction: {
    fontSize: '0.75rem',
    color: '#AAAAAA',
  },

  // SECTION
  section: {
    marginTop: '2rem',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#0A0A0A',
    marginBottom: '1rem',
    letterSpacing: '-0.01em',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.25rem',
    border: '1px solid #EBEBEB',
    borderRadius: '10px',
    background: '#FAFAFA',
  },
  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#0A0A0A',
    marginTop: '5px',
    flexShrink: 0,
  },
  activityText: {
    fontSize: '0.9rem',
    color: '#0A0A0A',
    margin: 0,
  },
  activitySub: {
    fontSize: '0.78rem',
    color: '#AAAAAA',
    margin: '0.25rem 0 0',
  },

  // PACKAGE CARD
  packageCard: {
    border: '1px solid #EBEBEB',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  packageCardHeader: {
    padding: '2.5rem',
    borderBottom: '1px solid #EBEBEB',
    background: '#0A0A0A',
    color: '#FFFFFF',
  },
  packageTag: {
    fontSize: '0.62rem',
    letterSpacing: '0.25em',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 700,
  },
  packageName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0.5rem 0 0.25rem',
    letterSpacing: '-0.03em',
  },
  packagePrice: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  packageFeatures: {
    listStyle: 'none',
    padding: '2rem 2.5rem',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    background: '#FAFAFA',
  },
  packageFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    color: '#3A3A3A',
  },
  featureDot: {
    fontSize: '1.2rem',
    color: '#0A0A0A',
    fontWeight: 700,
  },
  packageActions: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem 2.5rem',
    borderTop: '1px solid #EBEBEB',
    background: '#FFFFFF',
  },

  // FAVORITES
  favGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.25rem',
  },
  favCard: {
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#FAFAFA',
  },
  favImageWrap: {
    height: '140px',
    overflow: 'hidden',
    background: '#F0F0F0',
  },
  favImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  favContent: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  favPackage: {
    fontSize: '0.62rem',
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  favTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: 0,
  },
  favSector: {
    fontSize: '0.78rem',
    color: '#AAAAAA',
  },
  favBtn: {
    marginTop: '0.75rem',
    padding: '0.5rem 0',
    border: 'none',
    background: 'none',
    color: '#0A0A0A',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '0.03em',
  },

  // EMPTY STATE
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    gap: '1rem',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '2rem',
    color: '#D0D0D0',
  },
  emptyText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.3rem',
    color: '#0A0A0A',
    margin: 0,
  },
  emptySub: {
    fontSize: '0.85rem',
    color: '#AAAAAA',
    margin: 0,
    maxWidth: '320px',
  },

  // HISTORY
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  historyItem: {
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.5rem',
    background: '#FAFAFA',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '1rem',
    alignItems: 'center',
  },
  historyLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  historyDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#0A0A0A',
    marginTop: '5px',
    flexShrink: 0,
  },
  historyDate: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: 0,
  },
  historyRef: {
    fontSize: '0.75rem',
    color: '#AAAAAA',
    margin: '0.2rem 0 0',
  },
  historyRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.4rem',
  },
  historyPackage: {
    fontSize: '0.65rem',
    letterSpacing: '1.5em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  historyStatus: {
    fontSize: '0.72rem',
    fontWeight: 700,
    border: '1px solid',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    letterSpacing: '0.05em',
  },
  historyMessage: {
    fontSize: '0.82rem',
    color: '#6B6B6B',
    margin: 0,
    gridColumn: '1 / -1',
    fontStyle: 'italic',
    paddingLeft: '1.5rem',
    borderLeft: '2px solid #EBEBEB',
  },

  // PROFILE FORM
  profileForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '500px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formLabel: {
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  formInput: {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #EBEBEB',
    padding: '0.75rem 0',
    fontSize: '1rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#0A0A0A',
    outline: 'none',
    transition: 'border-color 0.2s',
  },

  // BUTTONS
  btnPrimary: {
    padding: '0.85rem 2rem',
    background: '#0A0A0A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSecondary: {
    padding: '0.85rem 2rem',
    background: 'transparent',
    color: '#0A0A0A',
    border: '1px solid #EBEBEB',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
