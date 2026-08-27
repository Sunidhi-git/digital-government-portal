import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success" | "warning" | "destructive";
}

const tones = {
  primary: "from-primary/15 to-primary/5 text-primary",
  accent: "from-accent/15 to-accent/5 text-accent",
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/15 to-warning/5 text-warning",
  destructive: "from-destructive/15 to-destructive/5 text-destructive",
};

export function StatCard({ label, value, delta, trend = "up", icon: Icon, tone = "primary" }: Props) {
  return (
    <Card className="p-5 shadow-card hover:shadow-elegant transition-smooth border-border/60 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl lg:text-3xl font-display font-bold text-foreground">{value}</p>
          {delta && (
            <p className={`text-xs flex items-center gap-1 font-medium ${trend === "up" ? "text-success" : "text-destructive"}`}>
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {delta}
            </p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tones[tone]} grid place-items-center group-hover:scale-110 transition-smooth`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}