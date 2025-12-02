import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users, CreditCard, IndianRupee, Target, Percent } from "lucide-react";

const monthlyData = [
  { month: "Jan", disbursed: 45, collected: 32, newCustomers: 120 },
  { month: "Feb", disbursed: 52, collected: 38, newCustomers: 145 },
  { month: "Mar", disbursed: 48, collected: 41, newCustomers: 132 },
  { month: "Apr", disbursed: 61, collected: 45, newCustomers: 178 },
  { month: "May", disbursed: 55, collected: 48, newCustomers: 156 },
  { month: "Jun", disbursed: 72, collected: 52, newCustomers: 198 },
  { month: "Jul", disbursed: 68, collected: 56, newCustomers: 185 },
];

const loanTypeData = [
  { name: "Personal Loan", value: 35, color: "hsl(220, 85%, 55%)" },
  { name: "Business Loan", value: 25, color: "hsl(145, 70%, 40%)" },
  { name: "Home Loan", value: 20, color: "hsl(38, 95%, 50%)" },
  { name: "Vehicle Loan", value: 15, color: "hsl(280, 70%, 50%)" },
  { name: "Education Loan", value: 5, color: "hsl(0, 75%, 55%)" },
];

const emiPerformance = [
  { month: "Jan", onTime: 92, late: 6, default: 2 },
  { month: "Feb", onTime: 91, late: 7, default: 2 },
  { month: "Mar", onTime: 93, late: 5, default: 2 },
  { month: "Apr", onTime: 94, late: 4, default: 2 },
  { month: "May", onTime: 93, late: 5, default: 2 },
  { month: "Jun", onTime: 95, late: 4, default: 1 },
  { month: "Jul", onTime: 94, late: 5, default: 1 },
];

const formatLakhs = (value: number) => `₹${value}L`;

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your lending operations and customer metrics.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Total AUM"
            value="₹45.2Cr"
            change="+18% vs last quarter"
            changeType="positive"
            icon={IndianRupee}
            iconColor="accent"
            delay={0}
          />
          <StatsCard
            title="Monthly Growth"
            value="12.5%"
            change="+3.2% improvement"
            changeType="positive"
            icon={TrendingUp}
            iconColor="success"
            delay={100}
          />
          <StatsCard
            title="Customer Acquisition"
            value="198"
            change="This month"
            changeType="neutral"
            icon={Users}
            iconColor="primary"
            delay={200}
          />
          <StatsCard
            title="NPA Rate"
            value="1.8%"
            change="-0.4% vs target"
            changeType="positive"
            icon={Target}
            iconColor="warning"
            delay={300}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Disbursement vs Collection */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Disbursement vs Collection</h3>
              <p className="text-sm text-muted-foreground mt-1">Monthly comparison (in Lakhs)</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 20%, 45%)", fontSize: 12 }} tickFormatter={formatLakhs} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 25%, 90%)", borderRadius: "12px" }}
                    formatter={(value: number) => [formatLakhs(value), ""]}
                  />
                  <Area type="monotone" dataKey="disbursed" stroke="hsl(220, 85%, 55%)" strokeWidth={2} fill="url(#colorDisbursed)" name="Disbursed" />
                  <Area type="monotone" dataKey="collected" stroke="hsl(145, 70%, 40%)" strokeWidth={2} fill="url(#colorCollected)" name="Collected" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loan Distribution */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Loan Type Distribution</h3>
              <p className="text-sm text-muted-foreground mt-1">Portfolio breakdown by loan type</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loanTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                    labelLine={false}
                  >
                    {loanTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 25%, 90%)", borderRadius: "12px" }}
                    formatter={(value: number) => [`${value}%`, "Share"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* EMI Performance */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">EMI Collection Performance</h3>
              <p className="text-sm text-muted-foreground mt-1">On-time vs delayed payments (%)</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emiPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 25%, 90%)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 20%, 45%)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 20%, 45%)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 25%, 90%)", borderRadius: "12px" }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                  <Bar dataKey="onTime" stackId="a" fill="hsl(145, 70%, 40%)" radius={[0, 0, 0, 0]} name="On Time" />
                  <Bar dataKey="late" stackId="a" fill="hsl(38, 95%, 50%)" radius={[0, 0, 0, 0]} name="Late" />
                  <Bar dataKey="default" stackId="a" fill="hsl(0, 75%, 55%)" radius={[4, 4, 0, 0]} name="Default" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Growth */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Customer Acquisition</h3>
              <p className="text-sm text-muted-foreground mt-1">New customers per month</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 25%, 90%)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 20%, 45%)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 20%, 45%)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 25%, 90%)", borderRadius: "12px" }}
                  />
                  <Bar dataKey="newCustomers" fill="hsl(220, 85%, 55%)" radius={[4, 4, 0, 0]} name="New Customers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
