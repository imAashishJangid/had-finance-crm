// components/dashboard/StatsCard.tsx
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "success" | "warning" | "destructive" | "accent" | "info" | "purple";
  delay?: number;
  trend?: number;
  subtitle?: string;
}

const iconColorClasses = {
  primary: "bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 dark:from-blue-400/20 dark:to-blue-500/20 dark:text-blue-400",
  success: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-emerald-600 dark:from-emerald-400/20 dark:to-emerald-500/20 dark:text-emerald-400",
  warning: "bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-amber-600 dark:from-amber-400/20 dark:to-amber-500/20 dark:text-amber-400",
  destructive: "bg-gradient-to-br from-rose-500/20 to-rose-600/20 text-rose-600 dark:from-rose-400/20 dark:to-rose-500/20 dark:text-rose-400",
  accent: "bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-600 dark:from-purple-400/20 dark:to-purple-500/20 dark:text-purple-400",
  info: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 text-cyan-600 dark:from-cyan-400/20 dark:to-cyan-500/20 dark:text-cyan-400",
  purple: "bg-gradient-to-br from-violet-500/20 to-violet-600/20 text-violet-600 dark:from-violet-400/20 dark:to-violet-500/20 dark:text-violet-400",
};

const changeClasses = {
  positive: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  negative: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10",
  neutral: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10",
};

const trendIcons = {
  positive: "↑",
  negative: "↓",
  neutral: "→",
};

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "primary",
  delay = 0,
  trend,
  subtitle,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
                {trend !== undefined && (
                  <span className={cn(
                    "text-sm font-medium px-1.5 py-0.5 rounded",
                    changeClasses[changeType]
                  )}>
                    {trendIcons[changeType]} {Math.abs(trend)}%
                  </span>
                )}
              </div>
              {change && (
                <p className={cn(
                  "text-xs font-medium inline-flex items-center gap-1 px-2 py-1 rounded-full",
                  changeClasses[changeType]
                )}>
                  {change}
                </p>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <div className={cn(
              "p-3.5 rounded-2xl shadow-lg",
              iconColorClasses[iconColor]
            )}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          
          {/* Mini progress bar for visual interest */}
          <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "65%" }}
              transition={{ duration: 1, delay: 0.2 + delay / 1000 }}
              className={cn(
                "h-full rounded-full",
                changeType === "positive" ? "bg-emerald-500" : 
                changeType === "negative" ? "bg-rose-500" : "bg-gray-400"
              )}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}