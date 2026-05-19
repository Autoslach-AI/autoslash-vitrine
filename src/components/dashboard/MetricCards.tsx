import { useEffect, useState } from "react";
import { Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, 
         CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

export function MetricCards() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [prospects, setProspects] = useState(0);
  const [clients, setClients] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');

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

    </div>
  );
}
