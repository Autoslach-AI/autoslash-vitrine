"use client";

import { useEffect, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Area, CartesianGrid, ComposedChart, Line, XAxis } from "recharts";
import { Card, CardAction, CardContent, CardDescription, 
         CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig, ChartContainer, ChartLegend,
  ChartLegendContent, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";

type ViewType = 'prospects' | 'clients' | 'parrainage' | 'packages';
type PeriodType = '30' | '60' | '90';

interface ChartPoint {
  date: string;
  prospects?: number;
  clients?: number;
  revenus?: number;
  STARTUP?: number;
  BUSINESS?: number;
  ENTERPRISE?: number;
  ELITE?: number;
}

export function PerformanceOverview({ userId }: { userId?: string }) {
  const [view, setView] = useState<ViewType>('prospects');
  const [period, setPeriod] = useState<PeriodType>('30');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [view, period]);

  const fetchData = async () => {
    setLoading(true);
    const days = parseInt(period);
    const startDate = subDays(new Date(), days);

    const { data } = await supabase
      .from('enterprises')
      .select('created_at, status, package_type, activated_at')
      .eq('is_test', false)
      .gte('created_at', startDate.toISOString());

    if (!data) { setLoading(false); return; }

    // Générer les dates
    const dateMap: Record<string, ChartPoint> = {};
    for (let i = 0; i < days; i++) {
      const d = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
      dateMap[d] = { 
        date: d, 
        prospects: 0, clients: 0, revenus: 0,
        STARTUP: 0, BUSINESS: 0, ENTERPRISE: 0, ELITE: 0 
      };
    }

    // Remplir avec les vraies données
    for (const item of data) {
      const day = item.created_at.split('T')[0];
      if (!dateMap[day]) continue;

      if (view === 'prospects') {
        dateMap[day].prospects = 
          (dateMap[day].prospects || 0) + 1;
      }

      if (view === 'clients' && item.status === 'ACTIVE') {
        const activeDay = item.activated_at?.split('T')[0];
        if (activeDay && dateMap[activeDay]) {
          dateMap[activeDay].clients = 
            (dateMap[activeDay].clients || 0) + 1;
        }
      }

      if (view === 'parrainage' && userId) {
        const { data: refCode } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('user_id', userId)
          .maybeSingle();

        if (refCode?.code) {
          const { data: referrals } = await supabase
            .from('referrals')
            .select('created_at, commission_fcfa, status')
            .eq('referral_code', refCode.code)
            .eq('status', 'PAID')
            .gte('created_at', startDate.toISOString());

          if (referrals) {
            referrals.forEach(ref => {
              const day = ref.created_at.split('T')[0];
              if (dateMap[day]) {
                dateMap[day].revenus = 
                  (dateMap[day].revenus || 0) + 
                  (ref.commission_fcfa || 0);
              }
            });
          }
        }
        setChartData(Object.values(dateMap));
        setLoading(false);
        return;
      }

      if (view === 'packages') {
        const pkg = item.package_type;
        if (pkg && dateMap[day][pkg] !== undefined) {
          (dateMap[day] as any)[pkg] = 
            ((dateMap[day] as any)[pkg] || 0) + 1;
        }
      }
    }

    setChartData(Object.values(dateMap));
    setLoading(false);
  };

  const chartConfig: ChartConfig = 
    view === 'prospects' ? {
      prospects: { label: "Prospects", color: "var(--chart-1)" },
    } : view === 'clients' ? {
      clients: { label: "Clients", color: "var(--chart-2)" },
    } : view === 'parrainage' ? {
      revenus: { 
        label: "Gains FCFA", 
        color: "var(--chart-3)" 
      },
    } : {
      STARTUP: { label: "Startup", color: "var(--chart-1)" },
      BUSINESS: { label: "Business", color: "var(--chart-2)" },
      ENTERPRISE: { label: "Enterprise", color: "var(--chart-3)" },
      ELITE: { label: "Elite", color: "var(--chart-4)" },
    };

  const viewLabels: Record<ViewType, string> = {
    prospects: "Nouveaux prospects",
    clients: "Clients actifs",
    parrainage: "Mes gains parrainage",
    packages: "Répartition packages",
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">
          Activité Autoslash
        </CardTitle>
        <CardDescription>
          {viewLabels[view]} — {period} derniers jours
        </CardDescription>
        <CardAction className="flex items-center gap-2">

          {/* Filtre Vue */}
          <Select 
            value={view} 
            onValueChange={(v) => setView(v as ViewType)}
          >
            <SelectTrigger size="sm" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Vue</SelectLabel>
                <SelectItem value="prospects">Prospects</SelectItem>
                <SelectItem value="clients">Clients actifs</SelectItem>
                <SelectItem value="parrainage">Mes gains parrainage</SelectItem>
                <SelectItem value="packages">Répartition packages</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Filtre Période */}
          <Select 
            value={period} 
            onValueChange={(v) => setPeriod(v as PeriodType)}
          >
            <SelectTrigger size="sm" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Période</SelectLabel>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

        </CardAction>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black/10 
                           border-t-black rounded-full animate-spin" />
          </div>
        ) : (
          <ChartContainer 
            config={chartConfig} 
            className="aspect-auto h-80 w-full"
          >
            <ComposedChart data={chartData} margin={{ top: 0 }}>
              <defs>
                <linearGradient 
                  id="fillMain" x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="5%" 
                    stopColor="var(--chart-1)" stopOpacity={0.36} />
                  <stop offset="95%" 
                    stopColor="var(--chart-1)" stopOpacity={0.04} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeOpacity={0.5} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={48}
                tickFormatter={(value) =>
                  format(parseISO(value), "d MMM", { locale: fr })
                }
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-50"
                    indicator="line"
                    labelFormatter={(value) =>
                      format(parseISO(value), "d MMMM yyyy", 
                        { locale: fr })
                    }
                  />
                }
              />

              <ChartLegend 
                verticalAlign="top" 
                content={
                  <ChartLegendContent 
                    className="mb-5 justify-end" 
                  />
                } 
              />

              {view === 'prospects' &&
                <Area dataKey="prospects" type="monotone"
                  fill="url(#fillMain)"
                  stroke="var(--color-prospects)"
                  strokeWidth={1.25} dot={false} fillOpacity={1}
                />
              }
              {view === 'clients' &&
                <Area dataKey="clients" type="monotone"
                  fill="url(#fillMain)"
                  stroke="var(--color-clients)"
                  strokeWidth={1.25} dot={false} fillOpacity={1}
                />
              }
              {view === 'parrainage' &&
                <Area dataKey="revenus" type="monotone"
                  fill="url(#fillMain)"
                  stroke="var(--color-revenus)"
                  strokeWidth={1.25} dot={false} fillOpacity={1}
                />
              }
              {view === 'packages' && <>
                <Line dataKey="STARTUP" type="monotone"
                  stroke="var(--color-STARTUP)" 
                  strokeWidth={1.4} dot={false} />
                <Line dataKey="BUSINESS" type="monotone"
                  stroke="var(--color-BUSINESS)" 
                  strokeWidth={1.4} dot={false} />
                <Line dataKey="ENTERPRISE" type="monotone"
                  stroke="var(--color-ENTERPRISE)" 
                  strokeWidth={1.4} dot={false} />
                <Line dataKey="ELITE" type="monotone"
                  stroke="var(--color-ELITE)" 
                  strokeWidth={1.4} dot={false} />
              </>}

            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
