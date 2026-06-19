// src/pages/InterestAnalytics.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Users,
  Wallet,
  Search,
  Download,
  RefreshCw,
  ArrowUpDown,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "@/config/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Loan {
  _id: string;
  name: string;
  phone: string;
  joinDate: string;
  loanAmount: number;
  interestRate: number;
  term: "months" | "years";
  months?: number;
  years?: number;
  totalPayable: number;
  monthlyInstallment: number;
  status: "active" | "closed" | "defaulted" | "pending";
  idType: string;
  idNumber: string;
  customerImage?: {
    url: string;
    public_id: string;
  };
}

interface InterestCalculation {
  principal: number;
  totalInterest: number;
  monthlyInterest: number;
  totalMonths: number;
  totalPayable: number;
  monthlyInstallment: number;
  interestEarned: number;
  interestPending: number;
  monthsCompleted?: number;
  monthsRemaining?: number;
}

interface MonthlyInterestData {
  month: string;
  year: number;
  totalInterest: number;
  loanCount: number;
  customers: string[];
}

interface CustomerInterestData {
  customerId: string;
  name: string;
  phone: string;
  joinDate: string;
  loanAmount: number;
  interestRate: number;
  totalInterest: number;
  interestCollected?: number;
  interestPending?: number;
  status: string;
  tenureMonths: number;
  tenureDisplay: string;
}

export default function InterestAnalytics() {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"amount" | "rate" | "name">("amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // State for show all/less
  const [showAllCollected, setShowAllCollected] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/loans");
      if (response.data.success) {
        setLoans(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInterest = (loan: Loan): InterestCalculation => {
    const principal = loan.loanAmount;
    const rate = loan.interestRate;

    let totalMonths = 0;
    if (loan.term === "months") {
      totalMonths = loan.months || 0;
    } else {
      totalMonths = (loan.years || 0) * 12;
    }

    const monthlyInterest = (principal * rate) / 100;
    const totalInterest = monthlyInterest * totalMonths;
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = totalMonths > 0 ? totalPayable / totalMonths : 0;

    let monthsCompleted = 0;
    let monthsRemaining = 0;

    if (loan.status === "active" && loan.joinDate) {
      const startDate = new Date(loan.joinDate);
      const currentDate = new Date();
      const monthsDiff =
        (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
        (currentDate.getMonth() - startDate.getMonth());
      monthsCompleted = Math.min(monthsDiff, totalMonths);
      monthsRemaining = Math.max(0, totalMonths - monthsCompleted);
    }

    return {
      principal,
      totalInterest,
      monthlyInterest,
      totalMonths,
      totalPayable,
      monthlyInstallment,
      interestEarned: loan.status === "closed" ? totalInterest : 0,
      interestPending:
        loan.status === "active" || loan.status === "pending" || loan.status === "defaulted"
          ? totalInterest
          : 0,
      monthsCompleted,
      monthsRemaining,
    };
  };

  const closedLoans = loans.filter((loan) => loan.status === "closed");
  const totalInterestEarned = closedLoans.reduce((sum, loan) => {
    const calc = calculateInterest(loan);
    return sum + calc.totalInterest;
  }, 0);

  const activePendingDefaulted = loans.filter(
    (loan) => loan.status === "active" || loan.status === "pending" || loan.status === "defaulted"
  );
  const totalInterestExpected = activePendingDefaulted.reduce((sum, loan) => {
    const calc = calculateInterest(loan);
    return sum + calc.totalInterest;
  }, 0);

  const getMonthlyInterestData = (): MonthlyInterestData[] => {
    const monthlyMap = new Map<string, MonthlyInterestData>();

    loans.forEach((loan) => {
      if (loan.joinDate) {
        const date = new Date(loan.joinDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthName = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();

        const calc = calculateInterest(loan);
        const interest = loan.status === "closed" ? calc.totalInterest : 0;

        if (monthlyMap.has(monthKey)) {
          const existing = monthlyMap.get(monthKey)!;
          existing.totalInterest += interest;
          existing.loanCount += 1;
          if (!existing.customers.includes(loan.name)) {
            existing.customers.push(loan.name);
          }
        } else {
          monthlyMap.set(monthKey, {
            month: monthName,
            year: year,
            totalInterest: interest,
            loanCount: 1,
            customers: [loan.name],
          });
        }
      }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const monthOrder = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  };

 const getTenureDisplay = (loan: Loan): string => {
  let totalMonths = 0;
  if (loan.term === "months") {
    totalMonths = loan.months || 0;
  } else {
    totalMonths = (loan.years || 0) * 12;
  }
  
  if (totalMonths >= 12) {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (months > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    }
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
};

  const getCustomerInterestCollected = (): CustomerInterestData[] => {
    const customerMap = new Map<string, CustomerInterestData>();

    closedLoans.forEach((loan) => {
      const calc = calculateInterest(loan);
      const tenureDisplay = getTenureDisplay(loan);

      if (customerMap.has(loan._id)) {
        const existing = customerMap.get(loan._id)!;
        existing.totalInterest += calc.totalInterest;
        existing.interestCollected = (existing.interestCollected || 0) + calc.totalInterest;
      } else {
        customerMap.set(loan._id, {
          customerId: loan._id,
          name: loan.name,
          phone: loan.phone,
          joinDate: loan.joinDate,
          loanAmount: loan.loanAmount,
          interestRate: loan.interestRate,
          totalInterest: calc.totalInterest,
          interestCollected: calc.totalInterest,
          status: loan.status,
          tenureMonths: calc.totalMonths,
          tenureDisplay: tenureDisplay,
        });
      }
    });

    return Array.from(customerMap.values());
  };

  const getCustomerInterestPending = (): CustomerInterestData[] => {
    const customerMap = new Map<string, CustomerInterestData>();

    activePendingDefaulted.forEach((loan) => {
      const calc = calculateInterest(loan);
      const tenureDisplay = getTenureDisplay(loan);

      if (customerMap.has(loan._id)) {
        const existing = customerMap.get(loan._id)!;
        existing.totalInterest += calc.totalInterest;
        existing.interestPending = (existing.interestPending || 0) + calc.totalInterest;
      } else {
        customerMap.set(loan._id, {
          customerId: loan._id,
          name: loan.name,
          phone: loan.phone,
          joinDate: loan.joinDate,
          loanAmount: loan.loanAmount,
          interestRate: loan.interestRate,
          totalInterest: calc.totalInterest,
          interestPending: calc.totalInterest,
          status: loan.status,
          tenureMonths: calc.totalMonths,
          tenureDisplay: tenureDisplay,
        });
      }
    });

    return Array.from(customerMap.values());
  };

  const filterCustomerData = (data: CustomerInterestData[]) => {
    let filtered = data;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.phone.includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return sortOrder === "desc"
            ? b.totalInterest - a.totalInterest
            : a.totalInterest - b.totalInterest;
        case "rate":
          return sortOrder === "desc"
            ? b.interestRate - a.interestRate
            : a.interestRate - b.interestRate;
        case "name":
          return sortOrder === "desc"
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const monthlyData = getMonthlyInterestData();
  const customerCollected = getCustomerInterestCollected();
  const customerPending = getCustomerInterestPending();

  const filteredCollected = filterCustomerData(customerCollected);
  const filteredPending = filterCustomerData(customerPending);

  // Get displayed data based on show all/less
  const displayedCollected = showAllCollected ? filteredCollected : filteredCollected.slice(0, 10);
  const displayedPending = showAllPending ? filteredPending : filteredPending.slice(0, 10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₹", "₹ ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-blue-100 text-blue-800 border-blue-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      defaulted: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");
    let yPosition = 20;

    doc.setFillColor(22, 160, 133);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Interest Analytics Report", 14, 13);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(14);
    doc.text("Summary", 14, yPosition);
    yPosition += 10;

    const summaryData = [
      ["Total Interest Earned", formatCurrency(totalInterestEarned)],
      ["Total Interest Expected", formatCurrency(totalInterestExpected)],
      ["Total Customers (Closed)", closedLoans.length.toString()],
      ["Total Customers (Active/Pending)", activePendingDefaulted.length.toString()],
    ];

    autoTable(doc, {
      body: summaryData,
      startY: yPosition,
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { halign: "right", cellWidth: 50 },
      },
      theme: "plain",
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text("Monthly Interest Breakdown", 14, yPosition);
    yPosition += 10;

    const monthlyTableData = monthlyData.map((item) => [
      `${item.month} ${item.year}`,
      formatCurrency(item.totalInterest),
      item.loanCount.toString(),
      item.customers.join(", "),
    ]);

    autoTable(doc, {
      head: [["Month", "Interest Earned", "Loans", "Customers"]],
      body: monthlyTableData,
      startY: yPosition,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    if (yPosition > 150) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("Customer-wise Interest Collected", 14, yPosition);
    yPosition += 10;

    const collectedData = filteredCollected.slice(0, 20).map((item) => [
      item.name,
      item.phone,
      formatDate(item.joinDate),
      item.tenureDisplay,
      item.status.charAt(0).toUpperCase() + item.status.slice(1),
      formatCurrency(item.totalInterest),
      formatCurrency(item.loanAmount),
      `${item.interestRate}%`,
    ]);

    autoTable(doc, {
      head: [["Name", "Phone", "Join Date", "Tenure", "Status", "Interest", "Loan Amount", "Rate"]],
      body: collectedData,
      startY: yPosition,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    if (yPosition > 150) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("Customer-wise Pending Interest", 14, yPosition);
    yPosition += 10;

    const pendingData = filteredPending.slice(0, 20).map((item) => [
      item.name,
      item.phone,
      formatDate(item.joinDate),
      item.tenureDisplay,
      item.status.charAt(0).toUpperCase() + item.status.slice(1),
      formatCurrency(item.totalInterest),
      formatCurrency(item.loanAmount),
      `${item.interestRate}%`,
    ]);

    autoTable(doc, {
      head: [["Name", "Phone", "Join Date", "Tenure", "Status", "Pending Interest", "Loan Amount", "Rate"]],
      body: pendingData,
      startY: yPosition,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
    });

    doc.save(`Interest_Analytics_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // ✅ Handle customer click - redirect to customer detail page
  const handleCustomerClick = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Interest Analytics</h1>
            <p className="text-muted-foreground">
              Track interest earned and expected across all loans
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchLoans}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Interest Earned</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                    {formatCurrency(totalInterestEarned)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    From {closedLoans.length} closed loans
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Interest Expected</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
                    {formatCurrency(totalInterestExpected)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    From {activePendingDefaulted.length} active/pending loans
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Customers</p>
                  <h3 className="text-lg sm:text-2xl font-bold truncate">{loans.length}</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Active: {loans.filter(l => l.status === "active").length} | Closed: {closedLoans.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Monthly Average</p>
                  <h3 className="text-lg sm:text-2xl font-bold text-orange-600 truncate">
                    {monthlyData.length > 0
                      ? formatCurrency(
                          monthlyData.reduce((sum, m) => sum + m.totalInterest, 0) /
                            monthlyData.length
                        )
                      : formatCurrency(0)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Over {monthlyData.length} months
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Monthly Interest Earned</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="totalInterest" fill="#10b981" name="Interest Earned" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Breakdown Table - No Scroll */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Month</TableHead>
                      <TableHead className="w-1/3 text-right">Interest</TableHead>
                      <TableHead className="w-1/3 text-center">Loans</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.slice(0, 8).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-sm">
                          {item.month} {item.year}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-semibold text-sm">
                          {formatCurrency(item.totalInterest)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{item.loanCount}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {monthlyData.length > 8 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground text-sm">
                          + {monthlyData.length - 8} more months
                        </TableCell>
                      </TableRow>
                    )}
                    {monthlyData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer-wise Interest Collected - with Show All/Less */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                Interest Collected 
                <Badge variant="secondary" className="ml-2">
                  {filteredCollected.length}
                </Badge>
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-28 h-9 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="rate">Rate</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="h-9 w-9"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Join Date</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Tenure</TableHead>
                    <TableHead className="text-xs hidden xl:table-cell">Status</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Rate</TableHead>
                    <TableHead className="text-xs text-right">Interest</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedCollected.map((item) => (
                    <TableRow 
                      key={item.customerId}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleCustomerClick(item.customerId)}
                    >
                      <TableCell className="font-medium text-sm truncate max-w-[80px] sm:max-w-none hover:text-primary transition-colors">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">{item.phone}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{formatDate(item.joinDate)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {item.tenureDisplay}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge className={`${getStatusBadge(item.status)} text-xs`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">{formatCurrency(item.loanAmount)}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{item.interestRate}%</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold text-sm">
                        {formatCurrency(item.totalInterest)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCollected.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No closed loans found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Show All/Less Button */}
            {filteredCollected.length > 10 && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllCollected(!showAllCollected)}
                  className="gap-2"
                >
                  {showAllCollected ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less ({filteredCollected.length})
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show All ({filteredCollected.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer-wise Interest Pending - with Show All/Less */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                Interest Pending 
                <Badge variant="secondary" className="ml-2">
                  {filteredPending.length}
                </Badge>
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-28 h-9 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="h-9 w-9"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Join Date</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Tenure</TableHead>
                    <TableHead className="text-xs hidden xl:table-cell">Status</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Rate</TableHead>
                    <TableHead className="text-xs text-right">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedPending
                    .filter((item) => statusFilter === "all" || item.status === statusFilter)
                    .map((item) => (
                      <TableRow 
                        key={item.customerId}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleCustomerClick(item.customerId)}
                      >
                        <TableCell className="font-medium text-sm truncate max-w-[80px] sm:max-w-none hover:text-primary transition-colors">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">{item.phone}</TableCell>
                        <TableCell className="text-sm hidden md:table-cell">{formatDate(item.joinDate)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            {item.tenureDisplay}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Badge className={`${getStatusBadge(item.status)} text-xs`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">{formatCurrency(item.loanAmount)}</TableCell>
                        <TableCell className="text-sm hidden md:table-cell">{item.interestRate}%</TableCell>
                        <TableCell className="text-right text-blue-600 font-semibold text-sm">
                          {formatCurrency(item.totalInterest)}
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredPending.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No active/pending loans found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Show All/Less Button */}
            {filteredPending.length > 10 && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllPending(!showAllPending)}
                  className="gap-2"
                >
                  {showAllPending ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less ({filteredPending.length})
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show All ({filteredPending.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}