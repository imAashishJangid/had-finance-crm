import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/config/api"; // axios instance

export default function LoanChart() {
  const [data, setData] = useState<{ month: string; disbursed: number; collected: number; }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/loan-stats");
        setData(response.data);
      } catch (err) {
        console.error("Error fetching loan stats:", err);
      }
    };
    fetchData();
  }, []);

  const formatValue = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value}`;
  };

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Loan Performance</h3>
        <p className="text-sm text-muted-foreground mt-1">Monthly disbursement vs collection</p>
      </div>
      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Disbursed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Collected</span>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220, 85%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(220, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(145, 70%, 40%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(145, 70%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 25%, 90%)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 20%, 45%)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 20%, 45%)", fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 25%, 90%)", borderRadius: "12px", boxShadow: "0 4px 20px -4px hsl(220, 70%, 25%, 0.12)" }} formatter={(value: number) => [formatValue(value), ""]} labelStyle={{ fontWeight: 600, color: "hsl(220, 50%, 15%)" }} />
            <Area type="monotone" dataKey="disbursed" stroke="hsl(220, 85%, 55%)" strokeWidth={2} fillOpacity={1} fill="url(#colorDisbursed)" name="Disbursed" />
            <Area type="monotone" dataKey="collected" stroke="hsl(145, 70%, 40%)" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" name="Collected" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}