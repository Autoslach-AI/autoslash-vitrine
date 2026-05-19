import { useEffect, useState } from "react";
import { Users, TrendingUp, Gift, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, 
         CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

export function MetricCards({ userId }: { userId?: string }) {
  const [totalUsers, setTotalUsers] = useState(0);
  const [prospects, setProspects] = useState(0);
  const [clients, setClients] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [clientsCeMois, setClientsCeMois] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [totalGains, setTotalGains] = useState(0);
  const [totalFilleuls, setTotalFilleuls] = useState(0);
  const [copied, setCopied] = useState(false);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('enterprises')
      .select('status')
      .eq('is_test', false);

    if (data) {
      setTotalUsers(data.length);
      setProspects(data.filter(e => e.status === 'PROSPECT').length);
      setClients(data.filter(e => e.status === 'ACTIVE').length);
    }

    const moisDebut = new Date();
    moisDebut.setDate(1);
    moisDebut.setHours(0,0,0,0);

    const { count: moisCount } = await supabase
      .from('enterprises')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE')
      .eq('is_test', false)
      .gte('activated_at', moisDebut.toISOString());

    setClientsCeMois(moisCount || 0);

    setLastUpdated(new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
  };

  const generateCode = (userId: string) => {
    const suffix = userId.slice(-6).toUpperCase();
    return `AS-REF-${suffix}`;
  };

  const fetchReferral = async (userId: string) => {
    const code = generateCode(userId);
    
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      await supabase
        .from('referral_codes')
        .insert({
          user_id: userId,
          code: code,
          total_gains: 0,
          total_filleuls: 0
        });
      setReferralCode(code);
      setTotalGains(0);
      setTotalFilleuls(0);
    } else {
      setReferralCode(existing.code);
      setTotalGains(existing.total_gains || 0);
      setTotalFilleuls(existing.total_filleuls || 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchStats();
    if (userId) fetchReferral(userId);
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="grid grid-cols-1 gap-4 
      *:data-[slot=card]:bg-linear-to-t 
      *:data-[slot=card]:from-primary/5 
      *:data-[slot=card]:to-card 
      *:data-[slot=card]:shadow-xs 
      xl:grid-cols-4 
      dark:*:data-[slot=card]:bg-card">

      {/* Carte 1 — Utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center 
                            rounded-lg border bg-muted 
                            text-muted-foreground">
              <Users className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>
            <span className="flex items-center gap-2">
              Utilisateurs
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full 
                                 bg-green-500 animate-pulse" />
                <span className="text-[10px] text-green-600">
                  LIVE
                </span>
              </span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums 
                            leading-none tracking-tight">
              {totalUsers}
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              {prospects} prospects · {clients} clients
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Inscrits sur Autoslash
          </p>
          <p className="text-muted-foreground text-xs mt-1 font-mono">
            Mis à jour {lastUpdated}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center 
                            rounded-lg border bg-muted 
                            text-muted-foreground">
              <TrendingUp className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Clients actifs</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums 
                            leading-none tracking-tight">
              {clients}
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              +{clientsCeMois} ce mois
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Projets en production
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center 
                            rounded-lg border bg-muted 
                            text-muted-foreground">
              <TrendingUp className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Taux de conversion</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums 
                            leading-none tracking-tight">
              {totalUsers > 0 
                ? Math.round((clients / totalUsers) * 100) 
                : 0}%
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              En hausse
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Prospects convertis en clients
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center 
                            rounded-lg border bg-muted 
                            text-muted-foreground">
              <Gift className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Mon code parrainage</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          
          <div className="flex items-center gap-2">
            <div className="font-medium text-3xl tabular-nums 
                            leading-none tracking-tight">
              {totalGains.toLocaleString('fr-FR')}
            </div>
            <span className="text-sm text-muted-foreground">FCFA</span>
          </div>

          <p className="text-muted-foreground text-sm">
            {totalFilleuls} filleul{totalFilleuls > 1 ? 's' : ''} actif{totalFilleuls > 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-2 mt-1 
                          bg-black/5 rounded-lg px-3 py-2">
            <span className="text-xs font-mono font-bold flex-1">
              {referralCode || '...'}
            </span>
            <button
              onClick={handleCopy}
              className="text-black/40 hover:text-black transition-colors pointer-events-auto cursor-pointer"
            >
              {copied 
                ? <Check className="size-3.5 text-green-500" /> 
                : <Copy className="size-3.5" />
              }
            </button>
          </div>

          <p className="text-muted-foreground text-xs">
            Parrainez → jusqu'à 25,000 FCFA/vente
          </p>

        </CardContent>
      </Card>

    </div>
  );
}
