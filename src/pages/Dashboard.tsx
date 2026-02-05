// Dashboard.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentLoans from "@/components/dashboard/RecentLoans";
import LoanChart from "@/components/dashboard/LoanChart";
import OverdueAlerts from "@/components/dashboard/OverdueAlerts";
import { Users, CreditCard, CheckCircle, AlertTriangle, TrendingUp, IndianRupee } from "lucide-react";
import api from "@/config/api";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/loan/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your lending operations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Total Customers"
            value={stats ? stats.totalCustomers.toLocaleString() : "..."}
            change="+12% from last month"
            changeType="positive"
            icon={Users}
            iconColor="primary"
            delay={0}
          />
          <StatsCard
            title="Active Loans"
            value={stats ? `₹${(stats.activeLoans / 1e7).toFixed(1)}Cr` : "..."}
            change="+8.5% from last month"
            changeType="positive"
            icon={CreditCard}
            iconColor="accent"
            delay={100}
          />
          <StatsCard
            title="Approved This Month"
            value={stats ? stats.approvedThisMonth : "..."}
            change="+15% from last month"
            changeType="positive"
            icon={CheckCircle}
            iconColor="success"
            delay={200}
          />
          <StatsCard
            title="Overdue EMIs"
            value={stats ? `₹${(stats.overdueEMIs / 1e5).toFixed(1)}L` : "..."}
            change={`${stats?.overdueCustomers || 0} customers`}
            changeType="negative"
            icon={AlertTriangle}
            iconColor="destructive"
            delay={300}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatsCard
            title="EMI Collected (This Month)"
            value={stats ? `₹${(stats.emiCollectedThisMonth / 1e7).toFixed(1)}Cr` : "..."}
            change="+5.2% vs target"
            changeType="positive"
            icon={IndianRupee}
            iconColor="success"
            delay={400}
          />
          <StatsCard
            title="Recovery Rate"
            value={stats ? `${stats.recoveryRate}%` : "..."}
            change="+2.1% improvement"
            changeType="positive"
            icon={TrendingUp}
            iconColor="accent"
            delay={500}
          />
          <StatsCard
            title="Pending Applications"
            value={stats ? stats.pendingApplications : "..."}
            change="Requires review"
            changeType="neutral"
            icon={CreditCard}
            iconColor="warning"
            delay={600}
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoanChart /> {/* LoanChart fetches its own backend data */}
          </div>
          <div>
            <OverdueAlerts /> {/* OverdueAlerts fetches its own backend data */}
          </div>
        </div>

        {/* Recent Loans */}
        <RecentLoans /> {/* RecentLoans fetches its own backend data */}
      </div>
    </DashboardLayout>
  );
}