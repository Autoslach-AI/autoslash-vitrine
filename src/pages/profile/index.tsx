import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

// ─── TYPES ────────────────────────────────────────────────────────────────────
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
const packageConfig: Record<string, {
  label: string; features: string[]; price: string; route: string; maintenance: string;
}> = {
  STARTUP: {
    label: 'Startup',
    features: [
      'Site web premium interactif et animé',
      'Design Figma-level avec animations',
      'Formulaire connecté à Supabase',
      'Déploiement Vercel avec URL live',
    ],
    price: '150 000 – 200 000 FCFA',
    maintenance: '25 000 FCFA / mois',
    route: '/startup-package',
  },
  BUSINESS: {
    label: 'Business',
    features: [
      '2 agents IA spécialistes entraînés',
      'Automatisation réseaux sociaux',
      'Vidéos marketing courtes incluses',
      '1 000 000 tokens / mois',
    ],
    price: '300 000 – 350 000 FCFA',
    maintenance: '50 000 FCFA / mois',
    route: '/business-package',
  },
  ENTERPRISE: {
    label: 'Enterprise',
    features: [
      '3 à 5 agents IA experts dédiés',
      'Agent Commercial + Agent Contenu + Agent RAG',
      'Automatisation complète via n8n',
      'Acquisition client autonome 24h/24',
    ],
    price: '450 000 – 500 000 FCFA',
    maintenance: '100 000 FCFA / mois',
    route: '/enterprise-package',
  },
  ELITE: {
    label: 'Elite',
    features: [
      'Infrastructure IA sur mesure',
      'Équipe humaine + agents dédiés',
      'Accompagnement jusqu\'aux résultats',
      'Support prioritaire & SLA garanti',
    ],
    price: 'Sur mesure',
    maintenance: 'SLA garanti',
    route: '/elite-plan',
  },
};

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  PROSPECT:  { label: 'Prospect',  bg: '#FFF8E7', color: '#B45309' },
  ACTIVE:    { label: 'Actif',     bg: '#F0FDF4', color: '#15803D' },
  STABLE:    { label: 'Stable',    bg: '#F0FDF4', color: '#15803D' },
  WARNING:   { label: 'Attention', bg: '#FFF7ED', color: '#C2410C' },
  CRITICAL:  { label: 'Critique',  bg: '#FEF2F2', color: '#B91C1C' },
};

const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: 'Vue d\'ensemble', icon: <OverviewIcon /> },
  { id: 'package',   label: 'Mon Package',     icon: <PackageIcon /> },
  { id: 'favorites', label: 'Mes Favoris',     icon: <FavIcon /> },
  { id: 'profile',   label: 'Mon Profil',      icon: <ProfileIcon /> },
  { id: 'history',   label: 'Mes Échanges',    icon: <HistoryIcon /> },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
function OverviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function PackageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13 5.5L8 2.5L3 5.5V10.5L8 13.5L13 10.5V5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M3 5.5L8 8.5L13 5.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 8.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function FavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5L9.545 5.636L13 6.127L10.5 8.562L11.09 12L8 10.386L4.91 12L5.5 8.562L3 6.127L6.455 5.636L8 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2.5 13.5C2.5 11.015 5.015 9 8 9C10.985 9 13.5 11.015 13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 5V8.5L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M6 2H3C2.448 2 2 2.448 2 3V12C2 12.552 2.448 13 3 13H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M10 10L13 7.5L10 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 7.5H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        supabase.from('enterprises').select('*')
          .eq('email', user.primaryEmailAddress?.emailAddress)
          .order('created_at', { ascending: false }),
        supabase.from('user_favorites')
          .select('*, templates(title, sector, package_type, image_url, price_fcfa)')
          .eq('user_id', user.id),
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
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';
  const latestEnterprise = enterprises[0];
  const statusCfg = statusConfig[latestEnterprise?.status] || statusConfig['PROSPECT'];

  return (
    <div style={S.root}>
      {/* ── SIDEBAR ── */}
      <aside style={{ ...S.sidebar, width: sidebarCollapsed ? 72 : 240 }}>
        {/* Logo */}
        <div style={S.sidebarHeader}>
          {!sidebarCollapsed && (
            <span style={S.logoText} onClick={() => navigate('/')}>
              Autoslash AI
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={S.collapseBtn}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d={sidebarCollapsed ? "M6 4L10 8L6 12" : "M10 4L6 8L10 12"}
                stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* User card */}
        {!sidebarCollapsed && (
          <div style={S.userCard}>
            <div style={S.userAvatar}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div style={S.userInfo}>
              <p style={S.userName}>{profile?.full_name || firstName}</p>
              <p style={S.userEmail}>{profile?.email || user?.primaryEmailAddress?.emailAddress || ''}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={S.nav}>
          {!sidebarCollapsed && (
            <p style={S.navSectionLabel}>NAVIGATION</p>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                ...S.navItem,
                ...(activePage === item.id ? S.navItemActive : {}),
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                padding: sidebarCollapsed ? '0.65rem' : '0.65rem 0.85rem',
              }}
            >
              <span style={{ ...S.navIcon, color: activePage === item.id ? '#fff' : '#888' }}>
                {item.icon}
              </span>
              {!sidebarCollapsed && <span style={S.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={S.sidebarBottom}>
          {!sidebarCollapsed && (
            <div style={S.packageBadge}>
              <span style={S.packageBadgeLabel}>Package actuel</span>
              <div style={S.packageBadgeValue}>
                <span style={S.packageBadgeDot} />
                {pkg?.label}
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            title="Déconnexion"
            style={{
              ...S.signOutBtn,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <LogoutIcon />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <main style={S.main}>
        {/* Top bar */}
        <div style={S.topBar}>
          <div style={S.topBarLeft}>
            <h2 style={S.topBarTitle}>
              {navItems.find(n => n.id === activePage)?.label}
            </h2>
          </div>
          <div style={S.topBarRight}>
            <span style={S.topBarDate}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
            <div style={{
              ...statusConfig[latestEnterprise?.status]
                ? { background: statusCfg.bg, color: statusCfg.color }
                : { background: '#F5F5F5', color: '#888' },
              ...S.statusBadge,
            }}>
              {statusCfg.label}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={S.pageContent}>
          {loading ? (
            <div style={S.loadingWrap}>
              <div style={S.spinner} />
              <p style={{ color: '#AAA', fontSize: '0.85rem', marginTop: '1rem' }}>
                Chargement de votre espace...
              </p>
            </div>
          ) : (
            <>
              {/* ── OVERVIEW ── */}
              {activePage === 'overview' && (
                <div style={S.fadeIn}>
                  {/* Greeting */}
                  <div style={S.greetingWrap}>
                    <div>
                      <h1 style={S.greeting}>Bonjour, {firstName}.</h1>
                      <p style={S.greetingSub}>Membre depuis le {joinDate}</p>
                    </div>
                    <button
                      style={S.ctaBtn}
                      onClick={() => navigate('/contact')}
                    >
                      Nous contacter →
                    </button>
                  </div>

                  {/* Stats row */}
                  <div style={S.statsRow}>
                    {[
                      {
                        label: 'MON PACKAGE',
                        value: pkg?.label,
                        sub: 'Recommandé pour vous',
                        action: () => setActivePage('package'),
                        accent: false,
                      },
                      {
                        label: 'MES FAVORIS',
                        value: String(favorites.length),
                        sub: favorites.length > 0 ? 'Templates sauvegardés' : 'Aucun pour l\'instant',
                        action: () => setActivePage('favorites'),
                        accent: false,
                      },
                      {
                        label: 'MON STATUT',
                        value: statusCfg.label,
                        sub: 'En cours de traitement',
                        action: () => setActivePage('history'),
                        accent: true,
                        accentColor: statusCfg.color,
                        accentBg: statusCfg.bg,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        onClick={s.action}
                        style={S.statCard}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)';
                          (e.currentTarget as HTMLElement).style.borderColor = '#D0D0D0';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                          (e.currentTarget as HTMLElement).style.borderColor = '#EBEBEB';
                        }}
                      >
                        <span style={S.statLabel}>{s.label}</span>
                        <span style={{
                          ...S.statValue,
                          ...(s.accent ? { color: s.accentColor } : {}),
                        }}>
                          {s.value}
                        </span>
                        <span style={S.statSub}>{s.sub}</span>
                        <span style={S.statArrow}>→</span>
                      </div>
                    ))}
                  </div>

                  {/* Two columns */}
                  <div style={S.twoCol}>
                    {/* Activity feed */}
                    <div style={S.card}>
                      <div style={S.cardHeader}>
                        <h3 style={S.cardTitle}>Activité récente</h3>
                      </div>
                      {enterprises.length === 0 ? (
                        <div style={S.emptySmall}>
                          Aucune activité pour le moment
                        </div>
                      ) : (
                        <div style={S.activityList}>
                          {enterprises.slice(0, 4).map((e) => (
                            <div key={e.id} style={S.activityRow}>
                              <div style={S.activityBullet} />
                              <div style={S.activityContent}>
                                <p style={S.activityTitle}>
                                  Contact Autoslash AI
                                </p>
                                <p style={S.activityMeta}>
                                  {new Date(e.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                  })} · {e.project_id}
                                </p>
                              </div>
                              <div style={{
                                ...S.activityStatus,
                                background: (statusConfig[e.status] || statusConfig['PROSPECT']).bg,
                                color: (statusConfig[e.status] || statusConfig['PROSPECT']).color,
                              }}>
                                {(statusConfig[e.status] || statusConfig['PROSPECT']).label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Package snapshot */}
                    <div style={{ ...S.card, background: '#0A0A0A', border: 'none' }}>
                      <div style={S.cardHeader}>
                        <h3 style={{ ...S.cardTitle, color: 'rgba(255,255,255,0.5)' }}>
                          MON PACKAGE
                        </h3>
                      </div>
                      <p style={S.packageSnapshotName}>{pkg?.label}</p>
                      <p style={S.packageSnapshotPrice}>{pkg?.price}</p>
                      <div style={S.packageSnapshotDivider} />
                      <ul style={S.packageSnapshotList}>
                        {pkg?.features.slice(0, 3).map((f, i) => (
                          <li key={i} style={S.packageSnapshotItem}>
                            <span style={S.packageSnapshotDot}>·</span>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        style={S.packageSnapshotBtn}
                        onClick={() => navigate(pkg?.route)}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                      >
                        Voir le package complet →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PACKAGE ── */}
              {activePage === 'package' && (
                <div style={S.fadeIn}>
                  <div style={S.pageIntro}>
                    <h1 style={S.pageTitle}>Mon Package</h1>
                    <p style={S.pageDesc}>Recommandé selon votre profil et vos besoins</p>
                  </div>
                  <div style={S.packageDetailCard}>
                    <div style={S.packageDetailHeader}>
                      <div>
                        <span style={S.packageDetailTag}>PACKAGE RECOMMANDÉ</span>
                        <h2 style={S.packageDetailName}>{pkg?.label}</h2>
                      </div>
                      <div style={S.packageDetailPriceBox}>
                        <span style={S.packageDetailPriceLabel}>À partir de</span>
                        <span style={S.packageDetailPrice}>{pkg?.price}</span>
                        <span style={S.packageDetailMaintenance}>Maintenance : {pkg?.maintenance}</span>
                      </div>
                    </div>
                    <div style={S.packageDetailBody}>
                      <h4 style={S.packageDetailFeaturesTitle}>CE QUI EST INCLUS</h4>
                      <div style={S.packageDetailFeatures}>
                        {pkg?.features.map((f, i) => (
                          <div key={i} style={S.packageDetailFeature}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="7" stroke="#0A0A0A" strokeWidth="1"/>
                              <path d="M5 8L7 10L11 6" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '0.9rem', color: '#3A3A3A' }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={S.packageDetailFooter}>
                      <button
                        style={S.btnDark}
                        onClick={() => navigate(pkg?.route)}
                      >
                        Démarrer ce package →
                      </button>
                      <button
                        style={S.btnLight}
                        onClick={() => navigate('/pricing')}
                      >
                        Comparer les options
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── FAVORITES ── */}
              {activePage === 'favorites' && (
                <div style={S.fadeIn}>
                  <div style={S.pageIntro}>
                    <h1 style={S.pageTitle}>Mes Favoris</h1>
                    <p style={S.pageDesc}>
                      {favorites.length} template{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  {favorites.length === 0 ? (
                    <div style={S.emptyState}>
                      <div style={S.emptyIcon}>◆</div>
                      <h3 style={S.emptyTitle}>Aucun favori pour l'instant</h3>
                      <p style={S.emptySub}>
                        Parcourez nos templates et sauvegardez ceux qui vous inspirent
                      </p>
                      <button style={S.btnDark} onClick={() => navigate('/pricing')}>
                        Explorer les templates →
                      </button>
                    </div>
                  ) : (
                    <div style={S.favGrid}>
                      {favorites.map((fav) => (
                        <div key={fav.id} style={S.favCard}>
                          <div style={S.favImageWrap}>
                            {fav.templates?.image_url
                              ? <img src={fav.templates.image_url} alt={fav.templates.title} style={S.favImage} />
                              : <div style={S.favImagePlaceholder} />
                            }
                            <span style={S.favPackageTag}>{fav.templates?.package_type}</span>
                          </div>
                          <div style={S.favBody}>
                            <h3 style={S.favTitle}>{fav.templates?.title}</h3>
                            <p style={S.favSector}>{fav.templates?.sector}</p>
                            <button style={S.favCta} onClick={() => navigate('/contact')}>
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
                <ProfileEditSection
                  profile={profile}
                  onSave={fetchData}
                  userId={user?.id || ''}
                />
              )}

              {/* ── HISTORY ── */}
              {activePage === 'history' && (
                <div style={S.fadeIn}>
                  <div style={S.pageIntro}>
                    <h1 style={S.pageTitle}>Mes Échanges</h1>
                    <p style={S.pageDesc}>Historique de vos contacts avec Autoslash AI</p>
                  </div>
                  {enterprises.length === 0 ? (
                    <div style={S.emptyState}>
                      <div style={S.emptyIcon}>◉</div>
                      <h3 style={S.emptyTitle}>Aucun échange pour le moment</h3>
                      <button style={S.btnDark} onClick={() => navigate('/contact')}>
                        Nous contacter →
                      </button>
                    </div>
                  ) : (
                    <div style={S.historyTable}>
                      <div style={S.historyTableHead}>
                        <span>DATE</span>
                        <span>RÉFÉRENCE</span>
                        <span>PACKAGE</span>
                        <span>STATUT</span>
                      </div>
                      {enterprises.map((e) => (
                        <div key={e.id} style={S.historyTableRow}>
                          <span style={S.historyDate}>
                            {new Date(e.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </span>
                          <span style={S.historyRef}>{e.project_id}</span>
                          <span style={S.historyPkg}>{e.package_type}</span>
                          <span style={{
                            ...S.historyStatusBadge,
                            background: (statusConfig[e.status] || statusConfig['PROSPECT']).bg,
                            color: (statusConfig[e.status] || statusConfig['PROSPECT']).color,
                          }}>
                            {(statusConfig[e.status] || statusConfig['PROSPECT']).label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── PROFILE EDIT SECTION ─────────────────────────────────────────────────────
function ProfileEditSection({
  profile, onSave, userId,
}: { profile: UserProfile | null; onSave: () => void; userId: string }) {
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
    const { error } = await supabase.from('user_profiles').update(form).eq('id', userId);
    setSaving(false);
    if (!error) {
      setSaved(true);
      onSave();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div style={S.fadeIn}>
      <div style={S.pageIntro}>
        <h1 style={S.pageTitle}>Mon Profil</h1>
        <p style={S.pageDesc}>Modifiez vos informations personnelles</p>
      </div>
      <div style={S.profileCard}>
        <div style={S.profileFormGrid}>
          {[
            { label: 'Nom complet', key: 'full_name', type: 'text' },
            { label: 'Email professionnel', key: 'email', type: 'email' },
            { label: 'Téléphone', key: 'phone', type: 'tel' },
            { label: 'Entreprise', key: 'company', type: 'text' },
            { label: 'Secteur d\'activité', key: 'sector', type: 'text' },
          ].map(({ label, key, type }) => (
            <div
              key={key}
              style={{
                ...S.formGroup,
                gridColumn: key === 'sector' || key === 'company' ? 'span 2' : 'span 1',
              }}
            >
              <label style={S.formLabel}>{label.toUpperCase()}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={S.formInput}
                onFocus={e => (e.target.style.borderBottomColor = '#0A0A0A')}
                onBlur={e => (e.target.style.borderBottomColor = '#E5E5E5')}
              />
            </div>
          ))}
        </div>
        <div style={S.profileFormFooter}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...S.btnDark, opacity: saving ? 0.6 : 1 }}
          >
            {saved ? '✓ Modifications sauvegardées' : saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F7F7F7',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  // ── SIDEBAR
  sidebar: {
    background: '#FFFFFF',
    borderRight: '1px solid #EBEBEB',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    transition: 'width 0.25s ease',
    overflow: 'hidden',
    flexShrink: 0,
    zIndex: 10,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1rem 1.25rem 1.25rem',
    borderBottom: '1px solid #F0F0F0',
    minHeight: 60,
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0A0A0A',
    letterSpacing: '-0.02em',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  collapseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #F0F0F0',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#0A0A0A',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
    flexShrink: 0,
    fontFamily: "'Playfair Display', serif",
  },
  userInfo: { overflow: 'hidden' },
  userName: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.72rem',
    color: '#AAAAAA',
    margin: '0.1rem 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nav: {
    flex: 1,
    padding: '1rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflowY: 'auto',
  },
  navSectionLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    color: '#C0C0C0',
    fontWeight: 700,
    margin: '0 0 0.5rem 0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  navItemActive: {
    background: '#0A0A0A',
  },
  navIcon: {
    flexShrink: 0,
    display: 'flex',
  },
  navLabel: {
    fontSize: '0.83rem',
    fontWeight: 500,
    color: 'inherit',
  },
  sidebarBottom: {
    padding: '1rem 0.75rem',
    borderTop: '1px solid #F0F0F0',
  },
  packageBadge: {
    padding: '0.75rem',
    background: '#F7F7F7',
    borderRadius: '8px',
    marginBottom: '0.75rem',
  },
  packageBadgeLabel: {
    fontSize: '0.62rem',
    letterSpacing: '0.15em',
    color: '#AAAAAA',
    fontWeight: 700,
    display: 'block',
    marginBottom: '0.3rem',
  },
  packageBadgeValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Playfair Display', serif",
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#0A0A0A',
  },
  packageBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22C55E',
    flexShrink: 0,
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid #EBEBEB',
    borderRadius: '8px',
    background: 'transparent',
    color: '#888',
    fontSize: '0.8rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  // ── MAIN
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: 60,
    background: '#FFFFFF',
    borderBottom: '1px solid #EBEBEB',
    position: 'sticky',
    top: 0,
    zIndex: 5,
  },
  topBarLeft: {},
  topBarTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: 0,
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  topBarDate: {
    fontSize: '0.78rem',
    color: '#AAAAAA',
    textTransform: 'capitalize',
  },
  statusBadge: {
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    letterSpacing: '0.05em',
  },

  // ── PAGE CONTENT
  pageContent: {
    padding: '2.5rem 2rem',
    flex: 1,
  },
  fadeIn: {
    animation: 'fadeIn 0.3s ease',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '2px solid #EBEBEB',
    borderTop: '2px solid #0A0A0A',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  // ── OVERVIEW
  greetingWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  greeting: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#0A0A0A',
    margin: 0,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },
  greetingSub: {
    fontSize: '0.82rem',
    color: '#AAAAAA',
    margin: '0.4rem 0 0',
  },
  ctaBtn: {
    padding: '0.65rem 1.5rem',
    background: '#0A0A0A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
  },

  // ── STATS
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    position: 'relative',
  },
  statLabel: {
    fontSize: '0.62rem',
    letterSpacing: '0.18em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  statValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
    fontWeight: 700,
    color: '#0A0A0A',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  statSub: {
    fontSize: '0.75rem',
    color: '#AAAAAA',
  },
  statArrow: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    color: '#D0D0D0',
    fontSize: '1rem',
  },

  // ── TWO COL
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '1rem',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '1.25rem 1.5rem 0',
  },
  cardTitle: {
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    fontWeight: 700,
    color: '#AAAAAA',
    margin: '0 0 1rem',
  },
  emptySmall: {
    padding: '2rem 1.5rem',
    fontSize: '0.82rem',
    color: '#AAAAAA',
    textAlign: 'center',
  },
  activityList: {
    padding: '0 0.5rem 0.75rem',
  },
  activityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    transition: 'background 0.15s',
  },
  activityBullet: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#0A0A0A',
    flexShrink: 0,
  },
  activityContent: { flex: 1 },
  activityTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: 0,
  },
  activityMeta: {
    fontSize: '0.73rem',
    color: '#AAAAAA',
    margin: '0.2rem 0 0',
  },
  activityStatus: {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  },

  // Package snapshot
  packageSnapshotName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.2rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 1.5rem 0.25rem',
    letterSpacing: '-0.02em',
  },
  packageSnapshotPrice: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    margin: '0 1.5rem 1rem',
  },
  packageSnapshotDivider: {
    height: 1,
    background: 'rgba(255,255,255,0.08)',
    margin: '0 1.5rem 1rem',
  },
  packageSnapshotList: {
    listStyle: 'none',
    padding: '0 1.5rem',
    margin: '0 0 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  packageSnapshotItem: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  packageSnapshotDot: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '1.1rem',
    lineHeight: 1,
    marginTop: 2,
  },
  packageSnapshotBtn: {
    display: 'block',
    margin: '0 1.5rem 1.5rem',
    padding: '0.7rem 1.25rem',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '0.03em',
    width: 'calc(100% - 3rem)',
    textAlign: 'left',
    transition: 'background 0.15s',
  },

  // ── PAGE INTRO
  pageIntro: {
    marginBottom: '2rem',
  },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.2rem',
    fontWeight: 700,
    color: '#0A0A0A',
    margin: 0,
    letterSpacing: '-0.03em',
  },
  pageDesc: {
    fontSize: '0.83rem',
    color: '#AAAAAA',
    margin: '0.4rem 0 0',
  },

  // ── PACKAGE DETAIL
  packageDetailCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  packageDetailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '2.5rem',
    background: '#0A0A0A',
  },
  packageDetailTag: {
    fontSize: '0.62rem',
    letterSpacing: '0.25em',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 700,
    display: 'block',
    marginBottom: '0.5rem',
  },
  packageDetailName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: '-0.03em',
  },
  packageDetailPriceBox: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  packageDetailPriceLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.1em',
  },
  packageDetailPrice: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  packageDetailMaintenance: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  packageDetailBody: {
    padding: '2rem 2.5rem',
  },
  packageDetailFeaturesTitle: {
    fontSize: '0.62rem',
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    fontWeight: 700,
    marginBottom: '1.25rem',
  },
  packageDetailFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  packageDetailFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  packageDetailFooter: {
    padding: '1.5rem 2.5rem',
    borderTop: '1px solid #EBEBEB',
    display: 'flex',
    gap: '1rem',
  },

  // ── FAVORITES
  favGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  favCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  },
  favImageWrap: {
    position: 'relative',
    height: 160,
    background: '#F5F5F5',
    overflow: 'hidden',
  },
  favImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  favImagePlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #F0F0F0, #E5E5E5)',
  },
  favPackageTag: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    fontWeight: 700,
    background: '#0A0A0A',
    color: '#fff',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  favBody: {
    padding: '1.25rem',
  },
  favTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: '0 0 0.25rem',
  },
  favSector: {
    fontSize: '0.78rem',
    color: '#AAAAAA',
    margin: 0,
  },
  favCta: {
    marginTop: '1rem',
    padding: 0,
    border: 'none',
    background: 'none',
    color: '#0A0A0A',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '0.02em',
  },

  // ── EMPTY STATE
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    gap: '1rem',
    textAlign: 'center',
    background: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #EBEBEB',
  },
  emptyIcon: {
    fontSize: '1.8rem',
    color: '#D5D5D5',
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: 0,
  },
  emptySub: {
    fontSize: '0.85rem',
    color: '#AAAAAA',
    margin: 0,
    maxWidth: 320,
  },

  // ── HISTORY TABLE
  historyTable: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  historyTableHead: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
    padding: '0.85rem 1.5rem',
    borderBottom: '1px solid #EBEBEB',
    gap: '1rem',
    fontSize: '0.62rem',
    letterSpacing: '0.18em',
    fontWeight: 700,
    color: '#AAAAAA',
  },
  historyTableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #F5F5F5',
    gap: '1rem',
    alignItems: 'center',
    transition: 'background 0.15s',
  },
  historyDate: {
    fontSize: '0.85rem',
    color: '#0A0A0A',
    fontWeight: 500,
  },
  historyRef: {
    fontSize: '0.8rem',
    color: '#888',
    fontFamily: 'monospace',
  },
  historyPkg: {
    fontSize: '0.75rem',
    color: '#555',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  historyStatusBadge: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '0.25rem 0.65rem',
    borderRadius: '20px',
    letterSpacing: '0.05em',
  },

  // ── PROFILE FORM
  profileCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '16px',
    padding: '2.5rem',
    maxWidth: 680,
  },
  profileFormGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem 3rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formLabel: {
    fontSize: '0.62rem',
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  formInput: {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #E5E5E5',
    padding: '0.65rem 0',
    fontSize: '0.95rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#0A0A0A',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  profileFormFooter: {
    marginTop: '2.5rem',
    paddingTop: '2rem',
    borderTop: '1px solid #F0F0F0',
  },

  // ── BUTTONS
  btnDark: {
    padding: '0.8rem 2rem',
    background: '#0A0A0A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnLight: {
    padding: '0.8rem 2rem',
    background: 'transparent',
    color: '#0A0A0A',
    border: '1px solid #EBEBEB',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
};
