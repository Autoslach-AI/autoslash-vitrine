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

type ViewType = 'prospects_vs_clients' | 'revenus' | 'packages';
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

const PACKAGE_PRICES: Record<string, number> = {
  STARTUP: 150000,
  BUSINESS: 300000,
  ENTERPRISE: 450000,
  ELITE: 500000,
};

export function PerformanceOverview() {
  const [view, setView] = useState<ViewType>('prospects_vs_clients');
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
    data.forEach(item => {
      const day = item.created_at.split('T')[0];
      if (!dateMap[day]) return;

      if (view === 'prospects_vs_clients') {
        dateMap[day].prospects = (dateMap[day].prospects || 0) + 1;
        if (item.status === 'ACTIVE') {
          const activeDay = item.activated_at?.split('T')[0];
          if (activeDay && dateMap[activeDay]) {
            dateMap[activeDay].clients = 
              (dateMap[activeDay].clients || 0) + 1;
          }
        }
      }

      if (view === 'revenus' && item.status === 'ACTIVE') {
        const activeDay = item.activated_at?.split('T')[0];
        if (activeDay && dateMap[activeDay]) {
          dateMap[activeDay].revenus = 
            (dateMap[activeDay].revenus || 0) + 
            (PACKAGE_PRICES[item.package_type] || 0);
        }
      }

      if (view === 'packages') {
        const pkg = item.package_type as keyof typeof dateMap[string];
        if (pkg && dateMap[day][pkg] !== undefined) {
          (dateMap[day] as any)[pkg] = 
            ((dateMap[day] as any)[pkg] || 0) + 1;
        }
      }
    });

    setChartData(Object.values(dateMap));
    setLoading(false);
  };

  const chartConfig: ChartConfig = 
    view === 'prospects_vs_clients' ? {
      prospects: { label: "Prospects", color: "var(--chart-1)" },
      clients: { label: "Clients", color: "var(--chart-2)" },
    } : view === 'revenus' ? {
      revenus: { label: "Revenus (FCFA)", color: "var(--chart-1)" },
    } : {
      STARTUP: { label: "Startup", color: "var(--chart-1)" },
      BUSINESS: { label: "Business", color: "var(--chart-2)" },
      ENTERPRISE: { label: "Enterprise", color: "var(--chart-3)" },
      ELITE: { label: "Elite", color: "var(--chart-4)" },
    };

  const viewLabels: Record<ViewType, string> = {
    prospects_vs_clients: "Prospects vs Clients",
    revenus: "Revenus mensuels",
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
                <SelectItem value="prospects_vs_clients">
                  Prospects vs Clients
                </SelectItem>
                <SelectItem value="revenus">
                  Revenus mensuels
                </SelectItem>
                <SelectItem value="packages">
                  Répartition packages
                </SelectItem>
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

              {view === 'prospects_vs_clients' && <>
                <Area
                  dataKey="prospects"
                  type="monotone"
                  fill="url(#fillMain)"
                  stroke="var(--color-prospects)"
                  strokeWidth={1.25}
                  dot={false}
                  fillOpacity={1}
                />
                <Line
                  dataKey="clients"
                  type="monotone"
                  stroke="var(--color-clients)"
                  strokeWidth={1.4}
                  dot={false}
                />
              </>}

              {view === 'revenus' &&
                <Area
                  dataKey="revenus"
                  type="monotone"
                  fill="url(#fillMain)"
                  stroke="var(--color-revenus)"
                  strokeWidth={1.25}
                  dot={false}
                  fillOpacity={1}
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
