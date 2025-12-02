import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentLoans from "@/components/dashboard/RecentLoans";
import LoanChart from "@/components/dashboard/LoanChart";
import OverdueAlerts from "@/components/dashboard/OverdueAlerts";
import { Users, CreditCard, CheckCircle, AlertTriangle, TrendingUp, IndianRupee } from "lucide-react";

export default function Dashboard() {
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
            value="12,847"
            change="+12% from last month"
            changeType="positive"
            icon={Users}
            iconColor="primary"
            delay={0}
          />
          <StatsCard
            title="Active Loans"
            value="₹45.2Cr"
            change="+8.5% from last month"
            changeType="positive"
            icon={CreditCard}
            iconColor="accent"
            delay={100}
          />
          <StatsCard
            title="Approved This Month"
            value="238"
            change="+15% from last month"
            changeType="positive"
            icon={CheckCircle}
            iconColor="success"
            delay={200}
          />
          <StatsCard
            title="Overdue EMIs"
            value="₹24.5L"
            change="23 customers"
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
            value="₹8.5Cr"
            change="+5.2% vs target"
            changeType="positive"
            icon={IndianRupee}
            iconColor="success"
            delay={400}
          />
          <StatsCard
            title="Recovery Rate"
            value="94.5%"
            change="+2.1% improvement"
            changeType="positive"
            icon={TrendingUp}
            iconColor="accent"
            delay={500}
          />
          <StatsCard
            title="Pending Applications"
            value="47"
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
            <LoanChart />
          </div>
          <div>
            <OverdueAlerts />
          </div>
        </div>

        {/* Recent Loans */}
        <RecentLoans />
      </div>
    </DashboardLayout>
  );
}
