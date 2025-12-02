import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "success" | "warning" | "destructive" | "accent";
  delay?: number;
}

const iconColorClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  accent: "bg-accent/10 text-accent",
};

const changeClasses = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "primary",
  delay = 0,
}: StatsCardProps) {
  return (
    <div
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-lg transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={cn("text-sm font-medium mt-2", changeClasses[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconColorClasses[iconColor])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
