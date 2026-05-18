import React from "react";
import { cn } from "@/lib/utils";
import { 
  Database, 
  Bot, 
  MessageSquare, 
  LineChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  description: string;
  color: string;
  key?: string;
}

function MetricCard({ title, value, change, trend, icon: Icon, description, color }: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 transition-all hover:border-white/20 hover:bg-black/60">
      <div className="flex items-start justify-between">
        <div className={cn("rounded-xl p-2.5", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend === "up" ? "bg-emerald-500/10 text-emerald-500" : 
            trend === "down" ? "bg-rose-500/10 text-rose-500" : 
            "bg-zinc-500/10 text-zinc-400"
          )}>
            {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
            {change}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        <p className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>

      {/* Decorative gradient */}
      <div className={cn(
        "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl transition-opacity opacity-10 group-hover:opacity-20",
        color
      )} />
    </div>
  );
}

export function MetricCards() {
  const metrics: MetricCardProps[] = [
    {
      title: "Tokens Consommés",
      value: "842,500 / 1M",
      change: "+12.5%",
      trend: "up",
      icon: Database,
      description: "Utilisation du quota mensuel (Package Business)",
      color: "bg-blue-500",
    },
    {
      title: "Agents IA Actifs",
      value: "3 / 5",
      icon: Bot,
      description: "Agents déployés sur WhatsApp et Web",
      color: "bg-purple-500",
    },
    {
      title: "Leads Qualifiés",
      value: "156",
      change: "+22",
      trend: "up",
      icon: MessageSquare,
      description: "Prospects capturés par les agents ce mois",
      color: "bg-emerald-500",
    },
    {
      title: "Performance Moyenne",
      value: "98.2%",
      change: "-0.4%",
      trend: "down",
      icon: LineChart,
      description: "Taux de réponse correcte des agents",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard 
          key={metric.title}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          trend={metric.trend}
          icon={metric.icon}
          description={metric.description}
          color={metric.color}
        />
      ))}
    </div>
  );
}
