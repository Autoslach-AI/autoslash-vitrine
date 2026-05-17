// ─────────────────────────────────────────────────────────────────────────────
// ProfilePage — Vue d'ensemble COMPLÈTE
// PROSPECT : timeline parcours + échanges + bandeau déblocage
// CLIENT   : tokens jauge + agents live + activité + rapports
// Fonts : Playfair Display + Plus Jakarta Sans
// Fond : #FFFFFF — Monochrome noir/blanc/gris
// ─────────────────────────────────────────────────────────────────────────────
 
import React, { useState, useEffect, useRef } from 'react';
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
  photo_url?: string;
}
 
interface Enterprise {
  id: string;
  name: string;
  package_type: string;
  status: string;
  project_id: string;
  created_at: string;
  message?: string;
  activated_at?: string;
  token_budget?: number;
  total_tokens_consumed?: number;
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
type UserStatus = 'PROSPECT' | 'ACTIVE' | 'STABLE' | 'WARNING' | 'CRITICAL';
 
// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const statusConfig: Record<string, {
  label: string; bg: string; color: string; isClient: boolean;
}> = {
  PROSPECT: { label: 'Prospect',  bg: '#FFF8E7', color: '#B45309', isClient: false },
  ACTIVE:   { label: 'Client',    bg: '#F0FDF4', color: '#15803D', isClient: true  },
  STABLE:   { label: 'Client',    bg: '#F0FDF4', color: '#15803D', isClient: true  },
  WARNING:  { label: 'Attention', bg: '#FFF7ED', color: '#C2410C', isClient: true  },
  CRITICAL: { label: 'Critique',  bg: '#FEF2F2', color: '#B91C1C', isClient: true  },
};
 
// ─── PACKAGE CONFIG ───────────────────────────────────────────────────────────
const packageConfig: Record<string, { label: string; route: string }> = {
  STARTUP:    { label: 'Startup',    route: '/startup-package'    },
  BUSINESS:   { label: 'Business',   route: '/business-package'   },
  ENTERPRISE: { label: 'Enterprise', route: '/enterprise-package' },
  ELITE:      { label: 'Elite',      route: '/elite-plan'         },
};
 
// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const navItems: { id: ActivePage; label: string }[] = [
  { id: 'overview',  label: 'Vue d\'ensemble' },
  { id: 'package',   label: 'Mon Package'     },
  { id: 'favorites', label: 'Mes Favoris'     },
  { id: 'profile',   label: 'Mon Profil'      },
  { id: 'history',   label: 'Mes Échanges'    },
];
 
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
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
 
  // Determine user status from latest enterprise
  const latestEnterprise = enterprises[0];
  const currentStatus = (latestEnterprise?.status || 'PROSPECT') as UserStatus;
  const statusCfg = statusConfig[currentStatus] || statusConfig['PROSPECT'];
  const isClient = statusCfg.isClient;
  const firstName = profile?.full_name?.split(' ')[0] || user?.firstName || 'vous';
  const pkg = packageConfig[profile?.package_interest || 'STARTUP'];
 
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';
 
  const todayStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
 
  return (
    <div style={S.root}>
 
      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={S.sidebarLogo} onClick={() => navigate('/')}>
          <span style={S.logoText}>Autoslash AI</span>
          <span style={S.logoBack}>← Retour</span>
        </div>
 
        {/* User */}
        <div style={S.sidebarUser}>
          <div style={S.avatar}>
            {profile?.photo_url ? (
              <img 
                src={profile.photo_url}
                alt="avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              firstName.charAt(0).toUpperCase()
            )}
          </div>
          <div style={S.userInfo}>
            <p style={S.userName}>{profile?.full_name || firstName}</p>
            <p style={S.userEmail}>
              {profile?.email || user?.primaryEmailAddress?.emailAddress || ''}
            </p>
          </div>
        </div>
 
        {/* Status indicator */}
        <div style={S.statusIndicator}>
          <div style={{
            ...S.statusDot,
            background: statusCfg.color,
          }} />
          <span style={{ ...S.statusText, color: statusCfg.color }}>
            {statusCfg.label}
          </span>
        </div>
 
        {/* Nav */}
        <nav style={S.nav}>
          <p style={S.navSectionLabel}>NAVIGATION</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                ...S.navItem,
                ...(activePage === item.id ? S.navItemActive : {}),
              }}
            >
              {item.label}
              {activePage === item.id && <span style={S.navArrow}>→</span>}
            </button>
          ))}
        </nav>
 
        {/* Bottom */}
        <div style={S.sidebarBottom}>
          <button onClick={handleSignOut} style={S.signOutBtn}>
            <span>←</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
 
      {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
      <main style={S.main}>
 
        {/* Topbar */}
        <div style={S.topBar}>
          <span style={S.topBarTitle}>
            {navItems.find(n => n.id === activePage)?.label}
          </span>
          <div style={S.topBarRight}>
            <span style={S.topBarDate}>{todayStr}</span>
            <div style={{
              ...S.topBarStatus,
              background: statusCfg.bg,
              color: statusCfg.color,
            }}>
              {statusCfg.label}
            </div>
          </div>
        </div>
 
        {/* Content */}
        <div style={S.content}>
          {loading ? (
            <div style={S.loadingWrap}>
              <div style={S.spinner} />
              <p style={S.loadingText}>Chargement de votre espace...</p>
            </div>
          ) : (
            <>
              {activePage === 'overview' && (
                isClient
                  ? <ClientOverview
                      firstName={firstName}
                      joinDate={joinDate}
                      enterprise={latestEnterprise}
                      enterprises={enterprises}
                      profile={profile}
                      pkg={pkg}
                      statusCfg={statusCfg}
                      onContact={() => navigate('/contact')}
                    />
                  : <ProspectOverview
                      firstName={firstName}
                      joinDate={joinDate}
                      enterprise={latestEnterprise}
                      enterprises={enterprises}
                      profile={profile}
                      pkg={pkg}
                      statusCfg={statusCfg}
                      onContact={() => navigate('/contact')}
                    />
              )}
 
              {activePage === 'package' && (
                <PackagePage profile={profile} navigate={navigate} />
              )}
 
              {activePage === 'favorites' && (
                <FavoritesPage favorites={favorites} navigate={navigate} />
              )}
 
              {activePage === 'profile' && (
                <ProfileEditPage
                  profile={profile}
                  onSave={fetchData}
                  userId={user?.id || ''}
                />
              )}
 
              {activePage === 'history' && (
                <HistoryPage enterprises={enterprises} navigate={navigate} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
 
// ─── PROSPECT OVERVIEW ────────────────────────────────────────────────────────
function ProspectOverview({
  firstName, joinDate, enterprise, enterprises, profile, pkg, statusCfg, onContact
}: any) {
 
  const timelineSteps = [
    {
      label: 'Inscription',
      sub: enterprise?.created_at
        ? new Date(enterprise.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
          })
        : joinDate,
      done: true,
    },
    {
      label: 'Dossier soumis',
      sub: enterprise?.project_id || '—',
      done: !!enterprise,
    },
    {
      label: 'Analyse en cours',
      sub: 'Notre équipe examine votre demande',
      done: false,
      active: true,
    },
    {
      label: 'Appel avec Amadou',
      sub: 'Consultation stratégique',
      done: false,
      locked: true,
    },
    {
      label: 'Livraison du projet',
      sub: 'Votre infrastructure est prête',
      done: false,
      locked: true,
    },
  ];
 
  return (
    <div style={S.pageWrap}>
      {/* Greeting */}
      <div style={S.greetingRow}>
        <div>
          <h1 style={S.greeting}>Bonjour, {firstName}.</h1>
          <p style={S.greetingSub}>Membre depuis le {joinDate}</p>
        </div>
        <button style={S.ctaBtn} onClick={onContact}>
          Nous contacter →
        </button>
      </div>
 
      {/* Info Cards Row */}
      <div style={S.infoCardsRow}>
        {[
          {
            label: 'MON DOSSIER',
            value: enterprise?.project_id || '—',
            sub: enterprise?.package_type || profile?.package_interest || '—',
          },
          {
            label: 'MON SECTEUR',
            value: profile?.sector || '—',
            sub: profile?.intention || 'Non renseigné',
          },
          {
            label: 'DATE D\'INSCRIPTION',
            value: joinDate,
            sub: 'Dossier en traitement',
          },
        ].map((card) => (
          <div key={card.label} style={S.infoCard}>
            <span style={S.infoCardLabel}>{card.label}</span>
            <span style={S.infoCardValue}>{card.value}</span>
            <span style={S.infoCardSub}>{card.sub}</span>
          </div>
        ))}
      </div>
 
      {/* Two columns */}
      <div style={S.twoCol}>
 
        {/* Timeline */}
        <div style={S.card}>
          <div style={S.cardHeaderRow}>
            <span style={S.cardLabel}>MON PARCOURS</span>
          </div>
          <div style={S.timeline}>
            {timelineSteps.map((step, i) => (
              <div key={i} style={S.timelineItem}>
                {/* Line */}
                {i < timelineSteps.length - 1 && (
                  <div style={{
                    ...S.timelineLine,
                    background: step.done ? '#0A0A0A' : '#EBEBEB',
                  }} />
                )}
                {/* Dot */}
                <div style={{
                  ...S.timelineDot,
                  background: step.done
                    ? '#0A0A0A'
                    : step.active
                      ? '#B45309'
                      : '#E5E5E5',
                  border: step.active ? '2px solid #B45309' : 'none',
                }}>
                  {step.done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {step.active && (
                    <div style={S.timelinePulse} />
                  )}
                  {step.locked && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <rect x="1" y="3.5" width="6" height="4" rx="1"
                        stroke="#AAAAAA" strokeWidth="1"/>
                      <path d="M2.5 3.5V2.5C2.5 1.4 5.5 1.4 5.5 2.5V3.5"
                        stroke="#AAAAAA" strokeWidth="1"/>
                    </svg>
                  )}
                </div>
                {/* Content */}
                <div style={S.timelineContent}>
                  <p style={{
                    ...S.timelineLabel,
                    color: step.locked ? '#BBBBBB' : '#0A0A0A',
                  }}>
                    {step.label}
                  </p>
                  <p style={{
                    ...S.timelineSub,
                    color: step.locked ? '#D0D0D0' : '#AAAAAA',
                  }}>
                    {step.sub}
                  </p>
                </div>
                {/* Badge */}
                {step.done && (
                  <span style={S.timelineBadgeDone}>Complété</span>
                )}
                {step.active && (
                  <span style={S.timelineBadgeActive}>En cours</span>
                )}
                {step.locked && (
                  <span style={S.timelineBadgeLocked}>À venir</span>
                )}
              </div>
            ))}
          </div>
        </div>
 
        {/* Recent exchanges */}
        <div style={S.card}>
          <div style={S.cardHeaderRow}>
            <span style={S.cardLabel}>MES ÉCHANGES RÉCENTS</span>
          </div>
          {enterprises.length === 0 ? (
            <div style={S.emptySmall}>Aucun échange pour le moment</div>
          ) : (
            <div style={S.exchangeList}>
              {enterprises.slice(0, 5).map((e: any) => (
                <div key={e.id} style={S.exchangeRow}>
                  <div>
                    <p style={S.exchangeRef}>{e.project_id}</p>
                    <p style={S.exchangeDate}>
                      {new Date(e.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div style={S.exchangeRight}>
                    <span style={S.exchangePkg}>{e.package_type}</span>
                    <span style={{
                      ...S.exchangeStatus,
                      background: (statusConfig[e.status] || statusConfig['PROSPECT']).bg,
                      color: (statusConfig[e.status] || statusConfig['PROSPECT']).color,
                    }}>
                      {(statusConfig[e.status] || statusConfig['PROSPECT']).label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
 
      {/* Unlock Banner */}
      <div style={S.unlockBanner}>
        <div style={S.unlockIcon}>🔒</div>
        <div style={S.unlockContent}>
          <p style={S.unlockTitle}>Devenez client Autoslash AI</p>
          <p style={S.unlockDesc}>
            Déverrouillez vos agents IA en temps réel, votre jauge de tokens,
            vos rapports mensuels, votre tableau de bord projet et bien plus encore.
          </p>
        </div>
        <button style={S.unlockBtn} onClick={onContact}>
          Démarrer →
        </button>
      </div>
    </div>
  );
}
 
// ─── CLIENT OVERVIEW ──────────────────────────────────────────────────────────
function ClientOverview({
  firstName, joinDate, enterprise, enterprises, profile, pkg, statusCfg, onContact
}: any) {
 
  const tokenBudget = enterprise?.token_budget || 5000000;
  const tokensUsed = enterprise?.total_tokens_consumed || 0;
  const tokenPercent = Math.min((tokensUsed / tokenBudget) * 100, 100);
  const tokenColor = tokenPercent > 80 ? '#B91C1C' : tokenPercent > 60 ? '#B45309' : '#15803D';
 
  // Mock agents — dans la vraie version, vient de Supabase
  const agents = [
    { name: 'Agent Commercial', status: 'online', lastActive: 'Il y a 2 min' },
    { name: 'Agent Contenu',    status: 'online', lastActive: 'Il y a 8 min' },
    { name: 'Agent RAG',        status: 'standby', lastActive: 'Il y a 1h' },
  ];
 
  return (
    <div style={S.pageWrap}>
      {/* Greeting */}
      <div style={S.greetingRow}>
        <div>
          <h1 style={S.greeting}>Bonjour, {firstName}.</h1>
          <p style={S.greetingSub}>
            Client depuis le {enterprise?.activated_at
              ? new Date(enterprise.activated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
              : joinDate}
          </p>
        </div>
        <button style={S.ctaBtn} onClick={onContact}>
          Contacter le support →
        </button>
      </div>
 
      {/* Stat Cards */}
      <div style={S.statsRow}>
        {[
          {
            label: 'TOKENS UTILISÉS',
            value: `${(tokensUsed / 1000000).toFixed(1)}M`,
            sub: `sur ${(tokenBudget / 1000000).toFixed(0)}M disponibles`,
            valueColor: tokenColor,
          },
          {
            label: 'AGENTS ACTIFS',
            value: `${agents.filter(a => a.status === 'online').length}`,
            sub: `sur ${agents.length} agents configurés`,
            valueColor: '#15803D',
          },
          {
            label: 'PROCHAIN RAPPORT',
            value: 'J−12',
            sub: 'Rapport mensuel automatique',
            valueColor: '#0A0A0A',
          },
        ].map((card) => (
          <div key={card.label} style={S.statCard}>
            <span style={S.statLabel}>{card.label}</span>
            <span style={{ ...S.statValue, color: card.valueColor }}>
              {card.value}
            </span>
            <span style={S.statSub}>{card.sub}</span>
          </div>
        ))}
      </div>
 
      {/* Token gauge */}
      <div style={S.gaugeCard}>
        <div style={S.gaugeHeader}>
          <span style={S.cardLabel}>CONSOMMATION TOKENS</span>
          <span style={{ ...S.gaugePercent, color: tokenColor }}>
            {tokenPercent.toFixed(0)}% utilisé
          </span>
        </div>
        <div style={S.gaugeTrack}>
          <div style={{
            ...S.gaugeFill,
            width: `${tokenPercent}%`,
            background: tokenColor,
          }} />
        </div>
        <div style={S.gaugeFooter}>
          <span style={S.gaugeUsed}>
            {tokensUsed.toLocaleString('fr-FR')} tokens consommés
          </span>
          <span style={S.gaugeRemain}>
            {(tokenBudget - tokensUsed).toLocaleString('fr-FR')} restants
          </span>
        </div>
      </div>
 
      {/* Two columns */}
      <div style={S.twoCol}>
 
        {/* Agents */}
        <div style={S.card}>
          <div style={S.cardHeaderRow}>
            <span style={S.cardLabel}>MES AGENTS IA</span>
            <span style={S.cardSub}>Mis à jour en temps réel</span>
          </div>
          <div style={S.agentList}>
            {agents.map((agent) => (
              <div key={agent.name} style={S.agentRow}>
                <div style={S.agentLeft}>
                  <div style={{
                    ...S.agentStatusDot,
                    background: agent.status === 'online' ? '#22C55E' : '#D0D0D0',
                    boxShadow: agent.status === 'online'
                      ? '0 0 0 3px rgba(34, 197, 94, 0.15)'
                      : 'none',
                  }} />
                  <div>
                    <p style={S.agentName}>{agent.name}</p>
                    <p style={S.agentMeta}>{agent.lastActive}</p>
                  </div>
                </div>
                <span style={{
                  ...S.agentBadge,
                  background: agent.status === 'online' ? '#F0FDF4' : '#F5F5F5',
                  color: agent.status === 'online' ? '#15803D' : '#888888',
                }}>
                  {agent.status === 'online' ? 'En ligne' : 'En veille'}
                </span>
              </div>
            ))}
          </div>
        </div>
 
        {/* Recent activity */}
        <div style={S.card}>
          <div style={S.cardHeaderRow}>
            <span style={S.cardLabel}>ACTIVITÉ RÉCENTE</span>
          </div>
          {enterprises.length === 0 ? (
            <div style={S.emptySmall}>Aucune activité</div>
          ) : (
            <div style={S.exchangeList}>
              {enterprises.slice(0, 4).map((e: any) => (
                <div key={e.id} style={S.exchangeRow}>
                  <div>
                    <p style={S.exchangeRef}>{e.project_id}</p>
                    <p style={S.exchangeDate}>
                      {new Date(e.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span style={{
                    ...S.exchangeStatus,
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
      </div>
    </div>
  );
}

// ─── PACKAGE PAGE ─────────────────────────────────────────────────────────────
function PackagePage({ profile, navigate }: any) {
  const pkg = packageConfig[profile?.package_interest || 'STARTUP'];
  const fullPkg = {
    STARTUP: {
      features: [
        'Site web premium interactif et animé',
        'Design Figma-level avec animations',
        'Formulaire connecté à Supabase',
        'Déploiement Vercel avec URL live',
      ],
      price: '150 000 – 200 000 FCFA',
      maintenance: '25 000 FCFA / mois',
    },
    BUSINESS: {
      features: [
        '2 agents IA spécialistes entraînés',
        'Automatisation réseaux sociaux',
        'Vidéos marketing courtes incluses',
        '1 000 000 tokens / mois',
      ],
      price: '300 000 – 350 000 FCFA',
      maintenance: '50 000 FCFA / mois',
    },
    ENTERPRISE: {
      features: [
        '3 à 5 agents IA experts dédiés',
        'Agent Commercial + Agent Contenu + Agent RAG',
        'Automatisation complète via n8n',
        'Acquisition client autonome 24h/24',
      ],
      price: '450 000 – 500 000 FCFA',
      maintenance: '100 000 FCFA / mois',
    },
    ELITE: {
      features: [
        'Infrastructure IA sur mesure',
        'Équipe humaine + agents dédiés',
        'Accompagnement jusqu\'aux résultats',
        'Support prioritaire & SLA garanti',
      ],
      price: 'Sur mesure',
      maintenance: 'SLA garanti',
    },
  }[profile?.package_interest || 'STARTUP'];
 
  return (
    <div style={S.pageWrap}>
      <div style={S.pageIntro}>
        <h1 style={S.pageTitle}>Mon Package</h1>
        <p style={S.pageDesc}>Recommandé selon votre profil et vos besoins</p>
      </div>
      <div style={S.packageCard}>
        <div style={S.packageCardTop}>
          <div>
            <span style={S.pkgTag}>PACKAGE RECOMMANDÉ</span>
            <h2 style={S.pkgName}>{pkg?.label}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={S.pkgPrice}>{fullPkg?.price}</p>
            <p style={S.pkgMaintenance}>Maintenance : {fullPkg?.maintenance}</p>
          </div>
        </div>
        <div style={S.packageCardBody}>
          <p style={S.cardLabel}>CE QUI EST INCLUS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
            {fullPkg?.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={S.checkCircle}>✓</div>
                <span style={{ fontSize: '0.9rem', color: '#3A3A3A' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={S.packageCardFooter}>
          <button style={S.btnDark} onClick={() => navigate(pkg?.route)}>
            Démarrer ce package →
          </button>
          <button style={S.btnLight} onClick={() => navigate('/pricing')}>
            Comparer les options
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── FAVORITES PAGE ───────────────────────────────────────────────────────────
function FavoritesPage({ favorites, navigate }: any) {
  return (
    <div style={S.pageWrap}>
      <div style={S.pageIntro}>
        <h1 style={S.pageTitle}>Mes Favoris</h1>
        <p style={S.pageDesc}>
          {favorites.length} template{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>
      {favorites.length === 0 ? (
        <div style={S.emptyState}>
          <p style={S.emptyTitle}>Aucun favori pour l'instant</p>
          <p style={S.emptySub}>
            Parcourez nos templates et cliquez sur ★ pour les sauvegarder
          </p>
          <button style={S.btnDark} onClick={() => navigate('/pricing')}>
            Explorer les templates →
          </button>
        </div>
      ) : (
        <div style={S.favGrid}>
          {favorites.map((fav: any) => (
            <div key={fav.id} style={S.favCard}>
              <div style={S.favImageWrap}>
                {fav.templates?.image_url
                  ? <img src={fav.templates.image_url} alt={fav.templates.title} style={S.favImage} />
                  : <div style={S.favPlaceholder} />
                }
                <span style={S.favPkgBadge}>{fav.templates?.package_type}</span>
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
  );
}
 
// ─── PROFILE EDIT PAGE ────────────────────────────────────────────────────────
function ProfileEditPage({ profile, onSave, userId }: any) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
    sector: profile?.sector || '',
    photo_url: profile?.photo_url || '',
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
    <div style={S.pageWrap}>
      <div style={S.pageIntro}>
        <h1 style={S.pageTitle}>Mon Profil</h1>
        <p style={S.pageDesc}>Modifiez vos informations personnelles</p>
      </div>
      <div style={S.profileCard}>
        <div style={S.profileGrid}>
          {[
            { label: 'Nom complet',            key: 'full_name', type: 'text',  span: 1 },
            { label: 'Email professionnel',     key: 'email',     type: 'email', span: 1 },
            { label: 'Téléphone',               key: 'phone',     type: 'tel',   span: 1 },
            { label: 'Entreprise',              key: 'company',   type: 'text',  span: 1 },
            { label: 'Secteur d\'activité',     key: 'sector',    type: 'text',  span: 2 },
          ].map(({ label, key, type, span }) => (
            <div key={key} style={{ ...S.formGroup, gridColumn: `span ${span}` }}>
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

          {/* Photo de profil */}
          <div style={{ ...S.formGroup, gridColumn: 'span 2' }}>
            <label style={S.formLabel}>PHOTO DE PROFIL</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              paddingTop: '0.5rem'
            }}>
              {form.photo_url ? (
                <img 
                  src={form.photo_url}
                  alt="Photo de profil"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid #E5E5E5'
                  }}
                />
              ) : (
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: '#F0F0F0',
                  border: '1px solid #E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: '#AAAAAA'
                }}>
                  {form.full_name?.charAt(0) || '?'}
                </div>
              )}
              <input
                type="url"
                placeholder="https://... (URL de votre photo)"
                value={form.photo_url || ''}
                onChange={(e) => setForm({ 
                  ...form, 
                  photo_url: e.target.value 
                })}
                style={S.formInput}
              />
            </div>
          </div>
        </div>
        <div style={S.profileFormFooter}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...S.btnDark, opacity: saving ? 0.6 : 1 }}
          >
            {saved ? '✓ Sauvegardé' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── HISTORY PAGE ─────────────────────────────────────────────────────────────
function HistoryPage({ enterprises, navigate }: any) {
  return (
    <div style={S.pageWrap}>
      <div style={S.pageIntro}>
        <h1 style={S.pageTitle}>Mes Échanges</h1>
        <p style={S.pageDesc}>Historique de vos contacts avec Autoslash AI</p>
      </div>
      {enterprises.length === 0 ? (
        <div style={S.emptyState}>
          <p style={S.emptyTitle}>Aucun échange pour le moment</p>
          <button style={S.btnDark} onClick={() => navigate('/contact')}>
            Nous contacter →
          </button>
        </div>
      ) : (
        <div style={S.historyTable}>
          <div style={S.historyHead}>
            <span>DATE</span>
            <span>RÉFÉRENCE</span>
            <span>PACKAGE</span>
            <span>STATUT</span>
          </div>
          {enterprises.map((e: any) => (
            <div key={e.id} style={S.historyRow}>
              <span style={S.histDate}>
                {new Date(e.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
              <span style={S.histRef}>{e.project_id}</span>
              <span style={S.histPkg}>{e.package_type}</span>
              <span style={{
                ...S.histStatus,
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
  );
}
 
// ─── STYLES ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F5F5F5',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
 
  // SIDEBAR
  sidebar: {
    width: 220,
    minWidth: 220,
    background: '#FFFFFF',
    borderRight: '1px solid #EBEBEB',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    flexShrink: 0,
  },
  sidebarLogo: {
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid #F0F0F0',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#0A0A0A',
    letterSpacing: '-0.02em',
  },
  logoBack: {
    fontSize: '0.68rem',
    color: '#AAAAAA',
    letterSpacing: '0.02em',
  },
  sidebarUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #F0F0F0',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: '#0A0A0A',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  userInfo: { overflow: 'hidden', flex: 1 },
  userName: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.68rem',
    color: '#AAAAAA',
    margin: '0.1rem 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.25rem',
    background: '#FAFAFA',
    borderBottom: '1px solid #F0F0F0',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusText: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  nav: {
    flex: 1,
    padding: '1rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navSectionLabel: {
    fontSize: '0.58rem',
    letterSpacing: '0.2em',
    color: '#C0C0C0',
    fontWeight: 700,
    margin: '0 0 0.5rem 0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#888888',
    textAlign: 'left',
    transition: 'all 0.15s',
    width: '100%',
  },
  navItemActive: {
    background: '#0A0A0A',
    color: '#FFFFFF',
  },
  navArrow: {
    fontSize: '0.75rem',
    opacity: 0.6,
  },
  sidebarBottom: {
    padding: '1rem 0.75rem',
    borderTop: '1px solid #F0F0F0',
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.6rem 0.85rem',
    border: '1px solid #EBEBEB',
    borderRadius: '8px',
    background: 'transparent',
    color: '#999999',
    fontSize: '0.78rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'pointer',
  },
 
  // MAIN
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
    height: 56,
    background: '#FFFFFF',
    borderBottom: '1px solid #EBEBEB',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  topBarTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#0A0A0A',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  topBarDate: {
    fontSize: '0.75rem',
    color: '#AAAAAA',
    textTransform: 'capitalize',
  },
  topBarStatus: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.2rem 0.7rem',
    borderRadius: '20px',
    letterSpacing: '0.05em',
  },
 
  content: {
    padding: '2rem',
    flex: 1,
  },
 
  // LOADING
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '1rem',
  },
  spinner: {
    width: 28,
    height: 28,
    border: '2px solid #EBEBEB',
    borderTop: '2px solid #0A0A0A',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '0.82rem',
    color: '#AAAAAA',
    margin: 0,
  },
 
  // PAGE WRAP
  pageWrap: {
    maxWidth: 900,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
 
  // GREETING
  greetingRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
  },
  greeting: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.4rem',
    fontWeight: 700,
    color: '#0A0A0A',
    margin: 0,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },
  greetingSub: {
    fontSize: '0.8rem',
    color: '#AAAAAA',
    margin: '0.35rem 0 0',
  },
  ctaBtn: {
    padding: '0.65rem 1.5rem',
    background: '#0A0A0A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
 
  // INFO CARDS
  infoCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  infoCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  infoCardLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.18em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  infoCardValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0A0A0A',
    letterSpacing: '-0.01em',
  },
  infoCardSub: {
    fontSize: '0.72rem',
    color: '#AAAAAA',
  },
 
  // STAT CARDS (CLIENT)
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  statLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.18em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  statValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  statSub: {
    fontSize: '0.73rem',
    color: '#AAAAAA',
  },
 
  // GAUGE
  gaugeCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  gaugeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  gaugePercent: {
    fontSize: '0.8rem',
    fontWeight: 700,
  },
  gaugeTrack: {
    height: 6,
    background: '#F0F0F0',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 1s ease',
  },
  gaugeFooter: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  gaugeUsed: {
    fontSize: '0.73rem',
    color: '#AAAAAA',
  },
  gaugeRemain: {
    fontSize: '0.73rem',
    color: '#AAAAAA',
  },
 
  // TWO COL
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem 0',
    marginBottom: '1rem',
  },
  cardLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  cardSub: {
    fontSize: '0.68rem',
    color: '#CCCCCC',
  },
 
  // TIMELINE
  timeline: {
    padding: '0 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    position: 'relative',
    paddingBottom: '1.5rem',
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 28,
    width: 1,
    height: 'calc(100% - 4px)',
  },
  timelineDot: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  timelinePulse: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#B45309',
  },
  timelineContent: { flex: 1, paddingTop: '0.35rem' },
  timelineLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    margin: 0,
  },
  timelineSub: {
    fontSize: '0.72rem',
    margin: '0.2rem 0 0',
  },
  timelineBadgeDone: {
    fontSize: '0.62rem',
    letterSpacing: '0.1em',
    fontWeight: 700,
    color: '#15803D',
    background: '#F0FDF4',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    marginTop: '0.35rem',
    whiteSpace: 'nowrap',
    height: 'fit-content',
  },
  timelineBadgeActive: {
    fontSize: '0.62rem',
    letterSpacing: '0.1em',
    fontWeight: 700,
    color: '#B45309',
    background: '#FFF8E7',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    marginTop: '0.35rem',
    whiteSpace: 'nowrap',
    height: 'fit-content',
  },
  timelineBadgeLocked: {
    fontSize: '0.62rem',
    letterSpacing: '0.1em',
    fontWeight: 700,
    color: '#CCCCCC',
    background: '#F5F5F5',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    marginTop: '0.35rem',
    whiteSpace: 'nowrap',
    height: 'fit-content',
  },
 
  // EMPTY
  emptySmall: {
    padding: '2rem 1.5rem',
    fontSize: '0.82rem',
    color: '#AAAAAA',
    textAlign: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '0.75rem',
    textAlign: 'center',
    background: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #EBEBEB',
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: 0,
  },
  emptySub: {
    fontSize: '0.82rem',
    color: '#AAAAAA',
    margin: 0,
    maxWidth: 320,
  },
 
  // PACKAGE PAGE
  pageIntro: { marginBottom: '0.5rem' },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
    fontWeight: 700,
    color: '#0A0A0A',
    margin: 0,
    letterSpacing: '-0.03em',
  },
  pageDesc: {
    fontSize: '0.82rem',
    color: '#AAAAAA',
    margin: '0.4rem 0 0',
  },
  packageCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  packageCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '2.5rem',
    background: '#0A0A0A',
  },
  pkgTag: {
    fontSize: '0.6rem',
    letterSpacing: '0.25em',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 700,
    display: 'block',
    marginBottom: '0.5rem',
  },
  pkgName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.8rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: '-0.03em',
  },
  pkgPrice: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 0 0.2rem',
    textAlign: 'right',
  },
  pkgMaintenance: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
    textAlign: 'right',
  },
  packageCardBody: {
    padding: '2rem 2.5rem',
    background: '#FAFAFA',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: '1.5px solid #0A0A0A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#0A0A0A',
    flexShrink: 0,
  },
  packageCardFooter: {
    padding: '1.5rem 2.5rem',
    borderTop: '1px solid #EBEBEB',
    display: 'flex',
    gap: '1rem',
    background: '#FFFFFF',
  },
 
  // FAVORITES
  favGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  favCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  favImageWrap: {
    position: 'relative',
    height: 150,
    background: '#F5F5F5',
    overflow: 'hidden',
  },
  favImage: { width: '100%', height: '100%', objectFit: 'cover' },
  favPlaceholder: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg, #F0F0F0, #E5E5E5)',
  },
  favPkgBadge: {
    position: 'absolute',
    top: '0.65rem', left: '0.65rem',
    fontSize: '0.58rem',
    letterSpacing: '0.15em',
    fontWeight: 700,
    background: '#0A0A0A',
    color: '#fff',
    padding: '0.18rem 0.5rem',
    borderRadius: '4px',
  },
  favBody: { padding: '1.1rem' },
  favTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#0A0A0A',
    margin: '0 0 0.2rem',
  },
  favSector: { fontSize: '0.75rem', color: '#AAAAAA', margin: 0 },
  favCta: {
    marginTop: '0.85rem',
    padding: 0,
    border: 'none',
    background: 'none',
    color: '#0A0A0A',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '0.02em',
    display: 'block',
  },
 
  // PROFILE FORM
  profileCard: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '16px',
    padding: '2.5rem',
    maxWidth: 640,
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem 2.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formLabel: {
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    color: '#AAAAAA',
    fontWeight: 700,
  },
  formInput: {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #E5E5E5',
    padding: '0.6rem 0',
    fontSize: '0.92rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#0A0A0A',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  profileFormFooter: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #F0F0F0',
  },
 
  // HISTORY
  historyTable: {
    background: '#FFFFFF',
    border: '1px solid #EBEBEB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  historyHead: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
    padding: '0.85rem 1.5rem',
    borderBottom: '1px solid #F0F0F0',
    gap: '1rem',
    fontSize: '0.6rem',
    letterSpacing: '0.18em',
    fontWeight: 700,
    color: '#AAAAAA',
  },
  historyRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #F8F8F8',
    gap: '1rem',
    alignItems: 'center',
  },
  histDate: { fontSize: '0.83rem', color: '#0A0A0A', fontWeight: 500 },
  histRef: { fontSize: '0.78rem', color: '#888', fontFamily: 'monospace' },
  histPkg: { fontSize: '0.72rem', color: '#555', fontWeight: 600, letterSpacing: '0.05em' },
  histStatus: {
    display: 'inline-block',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    letterSpacing: '0.05em',
  },
 
  // BUTTONS
  btnDark: {
    padding: '0.75rem 1.75rem',
    background: '#0A0A0A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.04em',
    cursor: 'pointer',
  },
  btnLight: {
    padding: '0.75rem 1.75rem',
    background: 'transparent',
    color: '#0A0A0A',
    border: '1px solid #EBEBEB',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.04em',
    cursor: 'pointer',
  },
  exchangeList: { padding: '0 0.5rem 0.75rem', display: 'flex', flexDirection: 'column' },
  exchangeRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '8px', gap: '1rem' },
  exchangeRef: { fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A', margin: 0, fontFamily: 'monospace' },
  exchangeDate: { fontSize: '0.7rem', color: '#AAAAAA', margin: '0.15rem 0 0' },
  exchangeRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' },
  exchangePkg: { fontSize: '0.62rem', letterSpacing: '0.1em', color: '#CCCCCC', fontWeight: 700 },
  exchangeStatus: { fontSize: '0.68rem', fontWeight: 700, padding: '0.18rem 0.55rem', borderRadius: '20px', letterSpacing: '0.05em' },
  agentList: { padding: '0 0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' },
  agentRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '8px' },
  agentLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  agentStatusDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, transition: 'box-shadow 0.3s' },
  agentName: { fontSize: '0.85rem', fontWeight: 600, color: '#0A0A0A', margin: 0 },
  agentMeta: { fontSize: '0.7rem', color: '#AAAAAA', margin: '0.15rem 0 0' },
  agentBadge: { fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', letterSpacing: '0.05em' },
  unlockBanner: { display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '12px', borderLeft: '3px solid #0A0A0A' },
  unlockIcon: { fontSize: '1.5rem', flexShrink: 0 },
  unlockContent: { flex: 1 },
  unlockTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#0A0A0A', margin: '0 0 0.3rem' },
  unlockDesc: { fontSize: '0.8rem', color: '#888888', margin: 0, lineHeight: 1.5 },
  unlockBtn: { padding: '0.65rem 1.5rem', background: '#0A0A0A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.02em' },
};

