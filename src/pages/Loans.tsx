// src/pages/Loans.tsx - With Colors and Enhanced UI
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
import {
  Search,
  Filter,
  Download,
  Users,
  ChevronDown,
  ChevronUp,
  Calendar,
  IndianRupee,
  TrendingUp,
  Wallet,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

interface CustomerLoanSummary {
  customerId: string;
  name: string;
  phone: string;
  initials: string;
  joinDate: string;
  totalLoanAmount: number;
  totalInterest: number;
  totalPayable: number;
  activeLoans: number;
  closedLoans: number;
  pendingLoans: number;
  defaultedLoans: number;
  loans: Loan[];
  status: "active" | "closed" | "defaulted" | "pending" | "mixed";
  loanCount: number;
}

const statusStyles = {
  active: "bg-green-500 text-white border-green-600",
  pending: "bg-yellow-500 text-white border-yellow-600",
  defaulted: "bg-red-500 text-white border-red-600",
  closed: "bg-blue-500 text-white border-blue-600",
  mixed: "bg-purple-500 text-white border-purple-600",
};

// Status background colors for cards
const statusBgColors = {
  active: "bg-green-50 border-green-200",
  pending: "bg-yellow-50 border-yellow-200",
  defaulted: "bg-red-50 border-red-200",
  closed: "bg-blue-50 border-blue-200",
  mixed: "bg-purple-50 border-purple-200",
};

// Status text colors
const statusTextColors = {
  active: "text-green-700",
  pending: "text-yellow-700",
  defaulted: "text-red-700",
  closed: "text-blue-700",
  mixed: "text-purple-700",
};

export default function Loans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerSummaries, setCustomerSummaries] = useState<CustomerLoanSummary[]>([]);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchLoans();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/loans");
      if (response.data.success) {
        setLoans(response.data.data);
        groupLoansByCustomer(response.data.data);
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

    return {
      totalPayable,
      totalInterest,
      totalMonths,
      monthlyInterest,
    };
  };

  const getCustomerStatus = (loans: Loan[]): "active" | "closed" | "defaulted" | "pending" | "mixed" => {
    const statuses = loans.map(l => l.status);
    const uniqueStatuses = [...new Set(statuses)];
    
    if (uniqueStatuses.length === 1) {
      return uniqueStatuses[0] as "active" | "closed" | "defaulted" | "pending";
    }
    return "mixed";
  };

  const groupLoansByCustomer = (loanData: Loan[]) => {
    const customerMap = new Map<string, CustomerLoanSummary>();

    loanData.forEach((loan) => {
      const key = loan.name.trim().toLowerCase();
      
      if (customerMap.has(key)) {
        const existing = customerMap.get(key)!;
        existing.loans.push(loan);
        existing.totalLoanAmount += loan.loanAmount;
        const calc = calculateDirectInterest(loan);
        existing.totalInterest += calc.totalInterest;
        existing.totalPayable += calc.totalPayable;
        existing.loanCount = existing.loans.length;
        
        if (loan.status === "active") existing.activeLoans++;
        else if (loan.status === "closed") existing.closedLoans++;
        else if (loan.status === "pending") existing.pendingLoans++;
        else if (loan.status === "defaulted") existing.defaultedLoans++;
        
        existing.status = getCustomerStatus(existing.loans);
        
        if (loan.phone) {
          existing.phone = loan.phone;
        }
      } else {
        const calc = calculateDirectInterest(loan);
        customerMap.set(key, {
          customerId: loan._id,
          name: loan.name,
          phone: loan.phone || "",
          initials: getInitials(loan.name),
          joinDate: loan.joinDate,
          totalLoanAmount: loan.loanAmount,
          totalInterest: calc.totalInterest,
          totalPayable: calc.totalPayable,
          activeLoans: loan.status === "active" ? 1 : 0,
          closedLoans: loan.status === "closed" ? 1 : 0,
          pendingLoans: loan.status === "pending" ? 1 : 0,
          defaultedLoans: loan.status === "defaulted" ? 1 : 0,
          loans: [loan],
          status: loan.status as "active" | "closed" | "defaulted" | "pending" | "mixed",
          loanCount: 1,
        });
      }
    });

    const sorted = Array.from(customerMap.values()).sort((a, b) => 
      new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
    );
    
    setCustomerSummaries(sorted);
  };

  const toggleExpand = (customerId: string) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

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

  const filteredCustomers = customerSummaries.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  });

  const displayedCustomers = showAll ? filteredCustomers : filteredCustomers.slice(0, 10);

  const totalCustomers = customerSummaries.length;
  const totalLoanAmount = customerSummaries.reduce((sum, c) => sum + c.totalLoanAmount, 0);
  const totalInterest = customerSummaries.reduce((sum, c) => sum + c.totalInterest, 0);
  const totalPayable = customerSummaries.reduce((sum, c) => sum + c.totalPayable, 0);

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
    doc.text("Loan Summary Report", 14, 13);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(14);
    doc.text("Summary", 14, yPosition);
    yPosition += 10;

    const summaryData = [
      ["Total Customers", totalCustomers.toString()],
      ["Total Loan Amount", formatCurrency(totalLoanAmount)],
      ["Total Interest", formatCurrency(totalInterest)],
      ["Total Payable", formatCurrency(totalPayable)],
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
    doc.text("Customer-wise Loan Details", 14, yPosition);
    yPosition += 10;

    const tableData = filteredCustomers.slice(0, 30).map((c) => [
      c.name,
      c.phone,
      c.loanCount.toString(),
      formatCurrency(c.totalLoanAmount),
      formatCurrency(c.totalInterest),
      formatCurrency(c.totalPayable),
      `${c.activeLoans} Active, ${c.closedLoans} Closed`,
    ]);

    autoTable(doc, {
      head: [["Customer", "Phone", "Loans", "Total Principal", "Total Interest", "Total Payable", "Status"]],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
    });

    doc.save(`Loan_Summary_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Mobile Card View with Colors
  const MobileCustomerCard = ({ customer }: { customer: CustomerLoanSummary }) => {
    const isExpanded = expandedCustomer === customer.customerId;
    const statusKey = customer.status as keyof typeof statusStyles;
    const bgColor = statusBgColors[statusKey];
    const textColor = statusTextColors[statusKey];

    return (
      <Card className={`mb-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${statusKey === 'active' ? 'border-l-green-500' : statusKey === 'closed' ? 'border-l-blue-500' : statusKey === 'pending' ? 'border-l-yellow-500' : statusKey === 'defaulted' ? 'border-l-red-500' : 'border-l-purple-500'}`} onClick={() => toggleExpand(customer.customerId)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {customer.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              </div>
            </div>
            <Badge className={statusStyles[statusKey]}>
              {customer.status === "mixed" ? "Mixed" : customer.status}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Loans</p>
              <p className="font-semibold text-lg">{customer.loanCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Principal</p>
              <p className="font-semibold text-sm text-blue-600">{formatCurrency(customer.totalLoanAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Payable</p>
              <p className="font-semibold text-sm text-purple-600">{formatCurrency(customer.totalPayable)}</p>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t">
              <div className={`rounded-lg p-3 ${bgColor} border`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-semibold ${textColor}`}>
                    <Wallet className="w-4 h-4 inline mr-1" />
                    All Loans ({customer.loanCount})
                  </p>
                  <p className={`text-sm font-semibold ${textColor}`}>
                    Total: {formatCurrency(customer.totalPayable)}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {customer.loans.map((loan, index) => {
                    const calc = calculateDirectInterest(loan);
                    return (
                      <div 
                        key={loan._id} 
                        className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomerClick(customer.customerId);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                            <span className="font-semibold text-sm">{formatCurrency(loan.loanAmount)}</span>
                          </div>
                          <Badge variant="outline" className={`text-xs ${
                            loan.status === 'active' ? 'border-green-500 text-green-600' :
                            loan.status === 'closed' ? 'border-blue-500 text-blue-600' :
                            loan.status === 'pending' ? 'border-yellow-500 text-yellow-600' :
                            'border-red-500 text-red-600'
                          }`}>
                            {loan.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(loan.joinDate)}
                          </span>
                          <span>Rate: <span className="font-medium">{loan.interestRate}%</span></span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
                          <span>Interest: <span className="text-green-600 font-medium">{formatCurrency(calc.totalInterest)}</span></span>
                          <span>Payable: <span className="text-purple-600 font-medium">{formatCurrency(calc.totalPayable)}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            {customer.activeLoans > 0 && <span className="text-green-600 font-medium">{customer.activeLoans} Active</span>}
            {customer.closedLoans > 0 && <span className="text-blue-600 font-medium">{customer.closedLoans} Closed</span>}
            {customer.pendingLoans > 0 && <span className="text-yellow-600 font-medium">{customer.pendingLoans} Pending</span>}
            {customer.defaultedLoans > 0 && <span className="text-red-600 font-medium">{customer.defaultedLoans} Defaulted</span>}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Loan Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and track all customer loans
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchLoans} size="sm" className="h-9">
              <Users className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={exportPDF} size="sm" className="h-9">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">Total Customers</p>
            <p className="text-lg font-bold">{totalCustomers}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">Total Principal</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(totalLoanAmount)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">Total Interest</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">Total Payable</p>
            <p className="text-lg font-bold text-purple-600">{formatCurrency(totalPayable)}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name or phone..."
              className="pl-9 h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No customers found</div>
        ) : isMobile ? (
          <div className="space-y-3">
            {displayedCustomers.map((customer) => (
              <MobileCustomerCard key={customer.customerId} customer={customer} />
            ))}
            {filteredCustomers.length > 10 && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={() => setShowAll(!showAll)} className="gap-2">
                  {showAll ? (
                    <><ChevronUp className="w-4 h-4" /> Show Less ({filteredCustomers.length})</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show All ({filteredCustomers.length})</>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold text-xs">Customer</TableHead>
                    <TableHead className="font-semibold text-xs hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Join Date</TableHead>
                    <TableHead className="font-semibold text-xs">Loans</TableHead>
                    <TableHead className="font-semibold text-xs hidden sm:table-cell">Total Principal</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Total Interest</TableHead>
                    <TableHead className="font-semibold text-xs hidden sm:table-cell">Total Payable</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right hidden sm:table-cell">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedCustomers.map((customer) => {
                    const statusKey = customer.status as keyof typeof statusStyles;
                    const isExpanded = expandedCustomer === customer.customerId;
                    
                    return (
                      <>
                        <TableRow 
                          key={customer.customerId}
                          className="hover:bg-muted/20 cursor-pointer transition-colors"
                          onClick={() => toggleExpand(customer.customerId)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="hidden sm:flex w-8 h-8">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                  {customer.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm truncate max-w-[100px] sm:max-w-none">
                                  {customer.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">{customer.phone}</TableCell>
                          <TableCell className="text-sm hidden md:table-cell whitespace-nowrap">{formatDate(customer.joinDate)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {customer.loanCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-sm hidden sm:table-cell whitespace-nowrap text-blue-600">
                            {formatCurrency(customer.totalLoanAmount)}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium text-sm hidden lg:table-cell whitespace-nowrap">
                            {formatCurrency(customer.totalInterest)}
                          </TableCell>
                          <TableCell className="font-bold text-sm hidden sm:table-cell whitespace-nowrap text-purple-600">
                            {formatCurrency(customer.totalPayable)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge className={`${statusStyles[statusKey]} text-xs whitespace-nowrap`}>
                              {customer.status === "mixed" ? "Mixed" : customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Row with Gradient Background */}
                        {isExpanded && (
                          <TableRow className="bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
                            <TableCell colSpan={9} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-purple-600" />
                                    <p className="text-sm font-semibold text-purple-700">
                                      All Loans ({customer.loanCount})
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                    <p className="text-sm font-semibold text-purple-700">
                                      Total: {formatCurrency(customer.totalPayable)}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {customer.loans.map((loan, index) => {
                                    const calc = calculateDirectInterest(loan);
                                    return (
                                      <div 
                                        key={loan._id} 
                                        className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCustomerClick(customer.customerId);
                                        }}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{index + 1}</span>
                                            <span className="font-bold text-sm text-blue-600">{formatCurrency(loan.loanAmount)}</span>
                                          </div>
                                          <Badge className={`text-xs ${
                                            loan.status === 'active' ? 'bg-green-500 text-white' :
                                            loan.status === 'closed' ? 'bg-blue-500 text-white' :
                                            loan.status === 'pending' ? 'bg-yellow-500 text-white' :
                                            'bg-red-500 text-white'
                                          }`}>
                                            {loan.status}
                                          </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                          <div className="flex items-center gap-1 text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(loan.joinDate)}
                                          </div>
                                          <div className="flex items-center gap-1 text-muted-foreground justify-end">
                                            Rate: <span className="font-medium text-orange-600">{loan.interestRate}%</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-muted-foreground">
                                            Interest: <span className="font-medium text-green-600">{formatCurrency(calc.totalInterest)}</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-muted-foreground justify-end">
                                            Payable: <span className="font-medium text-purple-600">{formatCurrency(calc.totalPayable)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredCustomers.length > 10 && (
              <div className="flex justify-center py-4 border-t">
                <Button variant="outline" onClick={() => setShowAll(!showAll)} className="gap-2">
                  {showAll ? (
                    <><ChevronUp className="w-4 h-4" /> Show Less ({filteredCustomers.length})</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show All ({filteredCustomers.length})</>
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