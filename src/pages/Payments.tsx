// src/pages/Payments.tsx - FULLY RESPONSIVE WITH SINGLE ROW DATA
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  Calendar,
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

interface PaymentRecord {
  id: string;
  customerId: string;
  customer: string;
  initials: string;
  phone: string;
  joinDate: string;
  loanAmount: number;
  interestRate: number;
  totalInterest: number;
  totalPayable: number;
  status: "paid" | "upcoming" | "overdue";
  loanId: string;
  tenureDisplay: string;
}

const statusStyles = {
  paid: "bg-green-100 text-green-700 border-green-200",
  upcoming: "bg-yellow-100 text-yellow-700 border-yellow-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
};

const statusIcons = {
  paid: CheckCircle,
  upcoming: Clock,
  overdue: AlertTriangle,
};

export default function Payments() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);

  useEffect(() => {
    fetchLoans();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (loans.length > 0) {
      generatePaymentData();
    }
  }, [loans]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/loans");
      if (response.data.success) {
        setLoans(response.data.data);
        console.log("📊 Total Loans Fetched:", response.data.data.length);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTenureMonths = (loan: Loan): number => {
    if (loan.term === "months") {
      return loan.months || 0;
    } else {
      return (loan.years || 0) * 12;
    }
  };

  const calculateDirectInterest = (loan: Loan) => {
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

    return {
      totalPayable,
      monthlyInstallment,
      totalInterest,
      totalMonths,
      monthlyInterest,
    };
  };

  const getLoanEndDate = (loan: Loan): Date | null => {
    if (!loan.joinDate) return null;

    const startDate = new Date(loan.joinDate);

    let totalMonths = 0;
    if (loan.term === "months") {
      totalMonths = loan.months || 0;
    } else {
      totalMonths = (loan.years || 0) * 12;
    }

    if (totalMonths === 0) return null;

    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + totalMonths);
    endDate.setHours(23, 59, 59, 999);

    return endDate;
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

  const generatePaymentData = () => {
    const currentDate = new Date();
    const today = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const paymentData: PaymentRecord[] = [];

    loans.forEach((loan) => {
      const calc = calculateDirectInterest(loan);
      const endDate = getLoanEndDate(loan);
      const tenureDisplay = getTenureDisplay(loan);

      let status: "paid" | "upcoming" | "overdue" = "upcoming";

      if (loan.status === "closed") {
        status = "paid";
      } else if (loan.status === "active" && endDate && endDate < today) {
        status = "overdue";
      } else if (loan.status === "active" && endDate && endDate >= today) {
        status = "upcoming";
      } else if (loan.status === "pending") {
        status = "upcoming";
      } else if (loan.status === "defaulted") {
        status = "overdue";
      } else {
        status = "upcoming";
      }

      paymentData.push({
        id: loan._id,
        customerId: loan._id,
        customer: loan.name,
        initials: getInitials(loan.name),
        phone: loan.phone,
        joinDate: loan.joinDate,
        loanAmount: loan.loanAmount,
        interestRate: loan.interestRate,
        totalInterest: calc.totalInterest,
        totalPayable: calc.totalPayable,
        status: status,
        loanId: loan._id.slice(-8).toUpperCase(),
        tenureDisplay: tenureDisplay,
      });
    });

    paymentData.sort((a, b) => 
      new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
    );
    
    setPayments(paymentData);
  };

  const calculateStats = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const today = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const collectedThisMonth = loans
      .filter((loan) => {
        if (loan.status !== "closed") return false;
        const endDate = getLoanEndDate(loan);
        if (!endDate) return false;
        return endDate.getMonth() === currentMonth && 
               endDate.getFullYear() === currentYear;
      })
      .reduce((sum, loan) => {
        const calc = calculateDirectInterest(loan);
        return sum + calc.totalPayable;
      }, 0);

    const pendingCollection = loans
      .filter((loan) => {
        if (loan.status === "closed") return false;
        if (loan.status === "defaulted") return false;
        const endDate = getLoanEndDate(loan);
        if (!endDate) return false;
        return endDate >= today;
      })
      .reduce((sum, loan) => {
        const calc = calculateDirectInterest(loan);
        return sum + calc.totalPayable;
      }, 0);

    const overdueAmount = loans
      .filter((loan) => {
        if (loan.status === "closed") return false;
        const endDate = getLoanEndDate(loan);
        if (!endDate) return false;
        return endDate < today;
      })
      .reduce((sum, loan) => {
        const calc = calculateDirectInterest(loan);
        return sum + calc.totalPayable;
      }, 0);

    const overdueCustomers = new Set(
      loans
        .filter((loan) => {
          if (loan.status === "closed") return false;
          const endDate = getLoanEndDate(loan);
          if (!endDate) return false;
          return endDate < today;
        })
        .map((loan) => loan._id)
    ).size;

    const upcomingCount = loans
      .filter((loan) => {
        if (loan.status === "closed") return false;
        if (loan.status === "defaulted") return false;
        const endDate = getLoanEndDate(loan);
        if (!endDate) return false;
        return endDate >= today;
      })
      .length;

    const closedCount = loans.filter((loan) => loan.status === "closed").length;

    return {
      collectedThisMonth,
      pendingCollection,
      overdueAmount,
      overdueCustomers,
      upcomingCount,
      closedCount,
    };
  };

  const stats = calculateStats();

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.loanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.phone.includes(searchQuery);

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && payment.status === activeTab;
  });

  const displayedPayments = showAll ? filteredPayments : filteredPayments.slice(0, 10);

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

  const handleCustomerClick = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");
    let yPosition = 20;

    doc.setFillColor(22, 160, 133);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Report", 14, 13);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(14);
    doc.text("Summary", 14, yPosition);
    yPosition += 10;

    const summaryData = [
      ["Collected This Month", formatCurrency(stats.collectedThisMonth)],
      ["Pending Collection", formatCurrency(stats.pendingCollection)],
      ["Overdue Amount", formatCurrency(stats.overdueAmount)],
      ["Closed Loans", stats.closedCount.toString()],
      ["Overdue Customers", stats.overdueCustomers.toString()],
      ["Upcoming Loans", stats.upcomingCount.toString()],
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
    doc.text("Payment Details", 14, yPosition);
    yPosition += 10;

    const tableData = filteredPayments.slice(0, 50).map((p) => [
      p.customer,
      p.phone,
      p.loanId,
      formatDate(p.joinDate),
      p.tenureDisplay,
      formatCurrency(p.loanAmount),
      `${p.interestRate}%`,
      formatCurrency(p.totalInterest),
      formatCurrency(p.totalPayable),
      p.status.charAt(0).toUpperCase() + p.status.slice(1),
    ]);

    autoTable(doc, {
      head: [["Customer", "Phone", "Loan ID", "Join Date", "Tenure", "Principal", "Rate", "Interest", "Total", "Status"]],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 6, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
    });

    doc.save(`Payment_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Mobile Card View
  const MobilePaymentCard = ({ payment }: { payment: PaymentRecord }) => {
    const StatusIcon = statusIcons[payment.status];
    return (
      <div 
        className="bg-card rounded-xl border border-border/50 p-4 mb-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleCustomerClick(payment.customerId)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {payment.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{payment.customer}</p>
              <p className="text-sm text-muted-foreground">{payment.phone}</p>
            </div>
          </div>
          <Badge className={statusStyles[payment.status]}>
            <StatusIcon className="w-3.5 h-3.5 mr-1" />
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Principal</p>
            <p className="font-semibold">{formatCurrency(payment.loanAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest</p>
            <p className="font-semibold text-green-600">{formatCurrency(payment.totalInterest)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Payable</p>
            <p className="font-bold text-primary">{formatCurrency(payment.totalPayable)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Join Date</p>
            <p className="text-sm">{formatDate(payment.joinDate)}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {payment.tenureDisplay}
          </Badge>
          <p className="text-xs text-muted-foreground">{payment.loanId}</p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Payment Tracking</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track loan collections, payment status, and total amounts.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchLoans} size="sm" className="h-9">
              <Bell className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={exportPDF} size="sm" className="h-9">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-card rounded-xl border border-border/50 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Collected This Month</p>
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-green-600 truncate">
                  {formatCurrency(stats.collectedThisMonth)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.closedCount} loans closed
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border/50 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Pending Collection</p>
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-yellow-600 truncate">
                  {formatCurrency(stats.pendingCollection)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.upcomingCount} upcoming loans
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border/50 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Overdue Amount</p>
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-red-600 truncate">
                  {formatCurrency(stats.overdueAmount)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.overdueCustomers} customers
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 w-full sm:w-auto flex-wrap h-auto p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3 py-1">All ({payments.length})</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm px-2 sm:px-3 py-1">Upcoming ({payments.filter(p => p.status === "upcoming").length})</TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm px-2 sm:px-3 py-1">Overdue ({payments.filter(p => p.status === "overdue").length})</TabsTrigger>
            <TabsTrigger value="paid" className="text-xs sm:text-sm px-2 sm:px-3 py-1">Paid ({payments.filter(p => p.status === "paid").length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, loan ID, or phone..."
              className="pl-9 h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        {/* Mobile Card View */}
        {isMobile ? (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
            ) : displayedPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No payments found</div>
            ) : (
              <>
                {displayedPayments.map((payment) => (
                  <MobilePaymentCard key={payment.id} payment={payment} />
                ))}
                {filteredPayments.length > 10 && (
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => setShowAll(!showAll)} className="gap-2">
                      {showAll ? (
                        <><ChevronUp className="w-4 h-4" /> Show Less ({filteredPayments.length})</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> Show All ({filteredPayments.length})</>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Desktop Table View - Single Row Data */
          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-xs whitespace-nowrap">Customer</TableHead>
                    <TableHead className="font-semibold text-xs whitespace-nowrap hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="font-semibold text-xs whitespace-nowrap hidden md:table-cell">Join Date</TableHead>
                    <TableHead className="font-semibold text-xs whitespace-nowrap hidden lg:table-cell">Tenure</TableHead>
                    <TableHead className="font-semibold text-xs whitespace-nowrap hidden sm:table-cell">Principal</TableHead>
                    <TableHead className="font-semibold text-xs whitespace-nowrap hidden lg:table-cell">Interest</TableHead>
                    <TableHead className="font-semibold text-xs whitespace-nowrap hidden sm:table-cell">Total</TableHead>
                    <TableHead className="font-semibold text-xs whitespace-nowrap hidden sm:table-cell">Status</TableHead>
                    <TableHead className="font-semibold text-xs whitespace-nowrap text-right hidden sm:table-cell">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading payments...</TableCell>
                    </TableRow>
                  ) : displayedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No payments found</TableCell>
                    </TableRow>
                  ) : (
                    displayedPayments.map((payment) => {
                      const StatusIcon = statusIcons[payment.status];
                      return (
                        <TableRow 
                          key={payment.id} 
                          className="hover:bg-muted/20 cursor-pointer transition-colors"
                          onClick={() => handleCustomerClick(payment.customerId)}
                        >
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="hidden sm:flex w-8 h-8">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                  {payment.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate max-w-[120px] sm:max-w-none hover:text-primary transition-colors">
                                  {payment.customer}
                                </p>
                                <p className="text-xs text-muted-foreground sm:hidden">{payment.phone}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-sm hidden sm:table-cell">{payment.phone}</TableCell>
                          <TableCell className="text-sm hidden md:table-cell whitespace-nowrap">{formatDate(payment.joinDate)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs whitespace-nowrap">
                              {payment.tenureDisplay}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-sm hidden sm:table-cell whitespace-nowrap">
                            {formatCurrency(payment.loanAmount)}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium text-sm hidden lg:table-cell whitespace-nowrap">
                            {formatCurrency(payment.totalInterest)}
                          </TableCell>
                          <TableCell className="font-bold text-sm hidden sm:table-cell whitespace-nowrap">
                            {formatCurrency(payment.totalPayable)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className={`${statusStyles[payment.status]} text-xs whitespace-nowrap`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            <div className="flex items-center justify-end gap-1">
                              {payment.status === "overdue" && (
                                <>
                                  <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                                    <Phone className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                              {payment.status === "upcoming" && (
                                <Button variant="default" size="sm" className="h-7 text-xs">Record</Button>
                              )}
                              {payment.status === "paid" && (
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  <Eye className="w-3.5 h-3.5 mr-1" /> View
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredPayments.length > 10 && !isMobile && (
              <div className="flex justify-center py-4 border-t">
                <Button variant="outline" onClick={() => setShowAll(!showAll)} className="gap-2">
                  {showAll ? (
                    <><ChevronUp className="w-4 h-4" /> Show Less ({filteredPayments.length})</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show All ({filteredPayments.length})</>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}