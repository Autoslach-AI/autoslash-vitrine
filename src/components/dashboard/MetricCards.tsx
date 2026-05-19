import { useEffect, useState } from "react";
import { Users, TrendingUp, Eye, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

export function MetricCards() {
  const [prospectsToday, setProspectsToday] = useState(0);
  const [prospectsTotal, setProspectsTotal] = useState(0);
  const [clientsActifs, setClientsActifs] = useState(0);
  const [clientsCeMois, setClientsCeMois] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const moisDebut = new Date();
    moisDebut.setDate(1);
    moisDebut.setHours(0,0,0,0);

    const { count: todayCount } = await supabase
      .from('enterprises')
      .select('*', { count: 'exact', head: true })
      .eq('is_test', false)
      .gte('created_at', today);

    const { count: totalCount } = await supabase
      .from('enterprises')
      .select('*', { count: 'exact', head: true })
      .eq('is_test', false);

    const { count: actifsCount } = await supabase
      .from('enterprises')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE')
      .eq('is_test', false);

    const { count: moisCount } = await supabase
      .from('enterprises')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE')
      .eq('is_test', false)
      .gte('activated_at', moisDebut.toISOString());

    setProspectsToday(todayCount || 0);
    setProspectsTotal(totalCount || 0);
    setClientsActifs(actifsCount || 0);
    setClientsCeMois(moisCount || 0);
    setLastUpdated(new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 
      *:data-[slot=card]:bg-linear-to-t 
      *:data-[slot=card]:from-primary/5 
      *:data-[slot=card]:to-card 
      *:data-[slot=card]:shadow-xs 
      xl:grid-cols-4 
      dark:*:data-[slot=card]:bg-card">

      {/* Carte 1 — Activité en direct */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center 
                            rounded-lg border bg-muted text-muted-foreground">
              <Eye className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>
            <span className="flex items-center gap-2">
              Activité en direct
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 
                                 animate-pulse" />
                <span className="text-[10px] text-green-600">LIVE</span>
              </span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums 
                            leading-none tracking-tight">
              {prospectsToday}
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              Aujourd'hui
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Nouveaux prospects
          </p>
          <p className="text-muted-foreground text-xs mt-1 font-mono">
            Mis à jour {lastUpdated}
          </p>
        </CardContent>
      </Card>

      {/* Carte 2 — Clients actifs */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center 
                            rounded-lg border bg-muted text-muted-foreground">
              <Users className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Clients actifs</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums 
                            leading-none tracking-tight">
              {clientsActifs}
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

      {/* Carte 3 — Total prospects */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center 
                            rounded-lg border bg-muted text-muted-foreground">
              <Activity className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Total prospects</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums 
                            leading-none tracking-tight">
              {prospectsTotal}
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              Pipeline
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {prospectsTotal - clientsActifs} en attente de conversion
          </p>
        </CardContent>
      </Card>

      {/* Carte 4 — Taux de conversion */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center 
                            rounded-lg border bg-muted text-muted-foreground">
              <TrendingUp className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>Taux de conversion</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums 
                            leading-none tracking-tight">
              {prospectsTotal > 0 
                ? Math.round((clientsActifs / prospectsTotal) * 100) 
                : 0}%
            </div>
            <Badge>
              <TrendingUp className="size-3" />
              Global
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Prospects convertis en clients
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
