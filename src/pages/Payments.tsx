// --- SAME IMPORTS AS YOUR FILE ---
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Phone,
  MessageSquare,
  Bell,
  IndianRupee,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

const payments = [ { id: "EMI-001", loanId: "LN-2024-001", customer: "Rajesh Kumar", initials: "RK", emiNo: "12/48", amount: "₹12,500", dueDate: "Dec 15, 2024", status: "upcoming", phone: "+91 98765 43210", }, { id: "EMI-002", loanId: "LN-2024-003", customer: "Amit Patel", initials: "AP", emiNo: "9/120", amount: "₹18,500", dueDate: "Dec 5, 2024", status: "paid", phone: "+91 76543 21098", paidDate: "Dec 3, 2024", }, { id: "EMI-003", loanId: "LN-2024-006", customer: "Mohan Verma", initials: "MV", emiNo: "6/36", amount: "₹25,000", dueDate: "Nov 20, 2024", status: "overdue", phone: "+91 54321 09876", daysOverdue: 12, }, { id: "EMI-004", loanId: "LN-2024-007", customer: "Geeta Devi", initials: "GD", emiNo: "3/24", amount: "₹8,500", dueDate: "Nov 25, 2024", status: "overdue", phone: "+91 43210 98765", daysOverdue: 7, }, { id: "EMI-005", loanId: "LN-2024-008", customer: "Sanjay Mehta", initials: "SM", emiNo: "15/60", amount: "₹15,200", dueDate: "Dec 1, 2024", status: "paid", phone: "+91 32109 87654", paidDate: "Nov 30, 2024", }, ];

const statusStyles = {
  paid: "bg-success/10 text-success border-success/20",
  upcoming: "bg-accent/10 text-accent border-accent/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons = {
  paid: CheckCircle,
  upcoming: Clock,
  overdue: AlertTriangle,
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.loanId.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && payment.status === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Payment Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track EMI collections, payment status, and send reminders.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard title="Collected This Month" value="₹8.5Cr" change="+12% vs target" changeType="positive" icon={IndianRupee} iconColor="success" delay={0}/>
          <StatsCard title="Pending Collection" value="₹1.2Cr" change="156 EMIs" changeType="neutral" icon={Clock} iconColor="accent" delay={100}/>
          <StatsCard title="Overdue Amount" value="₹24.5L" change="23 customers" changeType="negative" icon={AlertTriangle} iconColor="destructive" delay={200}/>
          <StatsCard title="Collection Rate" value="94.5%" change="+2.1% this month" changeType="positive" icon={CheckCircle} iconColor="success" delay={300}/>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All EMIs</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or loan ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-20">
            <Button variant="outline" className="ml-11">
              <Filter className="w-4 h-4 mr-2 " /> Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>

          <Table>
           <TableHeader>
  <TableRow className="bg-muted/30 hover:bg-muted/30">
    <TableHead className="font-semibold">Customer</TableHead>

    {/* Loan ID only on md+ */}
    <TableHead className="font-semibold hidden md:table-cell">Loan ID</TableHead>

    {/* EMI No. → show on mobile, hide on lg */}
    <TableHead className="font-semibold lg:table-cell sm:hidden">EMI No.</TableHead>

    {/* Amount only sm+ */}
    <TableHead className="font-semibold hidden sm:table-cell">Amount</TableHead>

    {/* Due Date → show on mobile */}
    <TableHead className="font-semibold lg:table-cell sm:hidden">Due Date</TableHead>

    {/* Status hide on mobile */}
    <TableHead className="font-semibold hidden sm:table-cell">Status</TableHead>

    {/* Actions hide on mobile */}
    <TableHead className="text-right font-semibold hidden sm:table-cell">Actions</TableHead>
  </TableRow>
</TableHeader>


            <TableBody>
              {filteredPayments.map((payment) => {
                const StatusIcon = statusIcons[payment.status];

                return (
                  <TableRow key={payment.id} className="hover:bg-muted/20">

                    {/* CUSTOMER */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden sm:flex w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {payment.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="font-medium">{payment.customer}</p>
                          <p className="text-sm text-muted-foreground">{payment.phone}</p>

                          {/* MOBILE ONLY — AMOUNT */}
                          <p className="text-sm font-medium text-foreground sm:hidden">
                            {payment.amount}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* HIDDEN ON MOBILE */}
                    <TableCell className="font-medium text-accent hidden md:table-cell">
                      {payment.loanId}
                    </TableCell>

                    <TableCell className="text-muted-foreground lg:table-cell sm:hidden">
  {payment.emiNo}
</TableCell>


                    <TableCell className="font-semibold text-foreground hidden sm:table-cell">
                      {payment.amount}
                    </TableCell>

                   <TableCell className="text-muted-foreground lg:table-cell sm:hidden">
  {payment.dueDate}
</TableCell>


                    {/* STATUS */}
                   <TableCell className="hidden sm:table-cell">
  <div className="flex items-center gap-2">
    <Badge className={statusStyles[payment.status]}>
      <StatusIcon className="w-3.5 h-3.5 mr-1" />
      {payment.status}
    </Badge>
    {payment.status === "overdue" && payment.daysOverdue && (
      <span className="text-xs text-destructive font-medium">{payment.daysOverdue}d</span>
    )}
  </div>
</TableCell>


                    {/* ACTIONS */}
                   <TableCell className="text-right hidden sm:table-cell">
  <div className="flex items-center justify-end gap-2">
    {payment.status === "overdue" && (
      <>
        <Button variant="outline" size="sm">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </>
    )}

    {payment.status === "upcoming" && (
      <Button variant="success" size="sm">Record Payment</Button>
    )}

    {payment.status === "paid" && (
      <Button variant="outline" size="sm">View Receipt</Button>
    )}
  </div>
</TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

      </div>
    </DashboardLayout>
  );
}
