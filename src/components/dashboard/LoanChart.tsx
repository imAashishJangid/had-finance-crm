// components/dashboard/LoanChart.tsx
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import api from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LoanChart() {
  const [data, setData] = useState<{ month: string; disbursed: number; collected: number; }[]>([]);
  const [timeframe, setTimeframe] = useState("6m");
  const [chartType, setChartType] = useState("area");

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
  }, [timeframe]);

  const formatValue = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const totalDisbursed = data.reduce((sum, item) => sum + item.disbursed, 0);
  const totalCollected = data.reduce((sum, item) => sum + item.collected, 0);
  const growthRate = totalCollected ? ((totalCollected - totalDisbursed) / totalDisbursed * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Loan Performance Overview
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Monthly disbursement vs collection analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={timeframe} onValueChange={setTimeframe} className="hidden sm:block">
                <TabsList>
                  <TabsTrigger value="1m">1M</TabsTrigger>
                  <TabsTrigger value="3m">3M</TabsTrigger>
                  <TabsTrigger value="6m">6M</TabsTrigger>
                  <TabsTrigger value="1y">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Disbursed</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatValue(totalDisbursed)}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/50 rounded-xl p-4">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatValue(totalCollected)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl p-4">
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Growth Rate</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{growthRate}%</p>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Disbursed Amount</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Collected Amount</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  tickFormatter={formatValue}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    padding: "8px 12px",
                  }}
                  formatter={(value: number) => [formatValue(value), ""]}
                  labelStyle={{ fontWeight: 600, color: "#111827", marginBottom: "4px" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="disbursed"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorDisbursed)"
                  name="Disbursed"
                  filter="url(#glow)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                  name="Collected"
                  filter="url(#glow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}