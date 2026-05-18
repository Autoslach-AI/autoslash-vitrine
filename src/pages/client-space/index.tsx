import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function ClientSpacePage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [enterprise, setEnterprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, isLoaded]);

  const fetchData = async () => {
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    const { data: ent } = await supabase
      .from('enterprises')
      .select('*')
      .eq('email', user!.primaryEmailAddress?.emailAddress)
      .eq('status', 'PROSPECT')
      .maybeSingle();

    setProfile(prof);
    setEnterprise(ent);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em]">
            Espace Client — PROSPECT
          </p>
          <h1 className="text-4xl font-serif font-medium">
            Bonjour, {profile?.full_name?.split(' ')[0] || 'bienvenue'}.
          </h1>
          <p className="text-white/50 font-jakarta text-sm">
            Votre dossier est en cours d'analyse. 
            Un expert Autoslash vous contactera sous 24h.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-widest">Package</p>
            <p className="text-2xl font-serif font-bold">
              {enterprise?.package_type || profile?.package_interest || '—'}
            </p>
            <p className="text-white/40 text-xs">Recommandé pour vous</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-widest">Dossier</p>
            <p className="text-2xl font-serif font-bold">
              {enterprise?.project_id || '—'}
            </p>
            <p className="text-white/40 text-xs">Votre référence unique</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-widest">Statut</p>
            <p className="text-2xl font-serif font-bold">
              {enterprise?.status || 'PROSPECT'}
            </p>
            <p className="text-white/40 text-xs">En attente d'analyse</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-widest">Tokens</p>
            <p className="text-2xl font-serif font-bold text-white/30">
              🔒 Verrouillé
            </p>
            <p className="text-white/40 text-xs">Disponible après activation</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Votre parcours
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            {[
              { label: 'Inscription', done: true },
              { label: 'Analyse', done: false },
              { label: 'Appel Expert', done: false },
              { label: 'Livraison', done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 flex-1">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  step.done ? 'bg-white' : 'bg-white/20'
                }`} />
                <span className={`text-sm font-jakarta ${
                  step.done ? 'text-white' : 'text-white/30'
                }`}>
                  {step.label}
                </span>
                {i < 3 && <div className="flex-1 h-px bg-white/10 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bandeau */}
        <div className="bg-white/5 border border-white/20 rounded-2xl p-8 
                        flex flex-col md:flex-row items-center 
                        justify-between gap-6">
          <div className="space-y-1">
            <p className="text-white font-serif text-xl font-medium">
              Devenez client — déverrouillez tout.
            </p>
            <p className="text-white/40 text-sm font-jakarta">
              Agents IA, tokens, rapports mensuels et support dédié.
            </p>
          </div>
          <button
            onClick={() => navigate(`/${(enterprise?.package_type || 'startup').toLowerCase()}-package`)}
            className="px-8 py-3 bg-white text-black font-jakarta font-bold 
                       text-xs tracking-[0.2em] rounded-lg hover:scale-[1.02] 
                       transition-all whitespace-nowrap"
          >
            VOIR MON PACKAGE →
          </button>
        </div>

      </div>
    </div>
  );
}
