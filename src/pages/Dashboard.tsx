// pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Add this import
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentLoans from "@/components/dashboard/RecentLoans";
import LoanChart from "@/components/dashboard/LoanChart";
import OverdueAlerts from "@/components/dashboard/OverdueAlerts";
import QuickActions from "@/components/dashboard/QuickActions";
import { Users, CreditCard, CheckCircle, AlertTriangle, TrendingUp, IndianRupee, Clock } from "lucide-react";
import api from "@/config/api";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/loan/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Page Header with Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back! Here's what's happening with your lending operations today.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh Data
          </Button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-950 p-1 rounded-lg border border-gray-200 dark:border-gray-800 w-fit">
          {["Today", "This Month", "Custom"].map((filter) => (
            <Button
              key={filter}
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm",
                filter === "This Month" && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50"
              )}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Total Customers"
            value={stats ? stats.totalCustomers?.toLocaleString() : "..."}
            change="+12.3% from last month"
            changeType="positive"
            icon={Users}
            iconColor="primary"
            delay={0}
            trend={12.3}
            subtitle="Active customers"
          />
          <StatsCard
            title="Active Loans"
            value={stats ? `₹${(stats.activeLoans / 1e7).toFixed(2)}Cr` : "..."}
            change="+8.5% from last month"
            changeType="positive"
            icon={CreditCard}
            iconColor="accent"
            delay={100}
            trend={8.5}
            subtitle="Total portfolio"
          />
          <StatsCard
            title="Approved This Month"
            value={stats ? stats.approvedThisMonth : "..."}
            change="+15.2% from last month"
            changeType="positive"
            icon={CheckCircle}
            iconColor="success"
            delay={200}
            trend={15.2}
            subtitle="Applications"
          />
          <StatsCard
            title="Overdue EMIs"
            value={stats ? `₹${(stats.overdueEMIs / 1e5).toFixed(2)}L` : "..."}
            change={`${stats?.overdueCustomers || 0} customers affected`}
            changeType="negative"
            icon={AlertTriangle}
            iconColor="destructive"
            delay={300}
            trend={-5.2}
            subtitle="Requires attention"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatsCard
            title="EMI Collected (This Month)"
            value={stats ? `₹${(stats.emiCollectedThisMonth / 1e7).toFixed(2)}Cr` : "..."}
            change="+5.2% vs target"
            changeType="positive"
            icon={IndianRupee}
            iconColor="success"
            delay={400}
            trend={5.2}
            subtitle="Collection efficiency"
          />
          <StatsCard
            title="Recovery Rate"
            value={stats ? `${stats.recoveryRate}%` : "..."}
            change="+2.1% improvement"
            changeType="positive"
            icon={TrendingUp}
            iconColor="accent"
            delay={500}
            trend={2.1}
            subtitle="On-time payments"
          />
          <StatsCard
            title="Pending Applications"
            value={stats ? stats.pendingApplications : "..."}
            change="Requires immediate review"
            changeType="neutral"
            icon={Clock}
            iconColor="warning"
            delay={600}
            trend={0}
            subtitle="Awaiting processing"
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoanChart />
          </div>
          <div>
            <OverdueAlerts />
          </div>
        </div>

        {/* Recent Loans */}
        <RecentLoans />

        {/* Quick Actions */}
        <QuickActions />
      </motion.div>
    </DashboardLayout>
  );
}