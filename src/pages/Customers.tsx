import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/config/api";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  Eye,
  Edit,
  MoreHorizontal,
  Phone,
  User,
  Calendar,
  CreditCard,
  IndianRupee,
  ChevronRight,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const statusStyles = {
  active:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  closed:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  defaulted:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  pending:
    "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
};

const idTypeStyles = {
  Aadhaar:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  PAN: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
  "Voter ID":
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  "Driving License":
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800",
  Passport:
    "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800",
};

interface Loan {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  joinDate: string;
  idType: "Aadhaar" | "PAN" | "Voter ID" | "Driving License" | "Passport";
  idNumber: string;
  loanAmount: number;
  interestRate: number;
  term: "months" | "years";
  months?: number;
  years?: number;
  totalPayable: number;
  monthlyInstallment: number;
  status: "active" | "closed" | "defaulted" | "pending";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customerImage?: {
    url: string;
    public_id: string;
  };
}

export default function Customers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Loan[]>([]);
  const searchQuery = searchParams.get("search") || "";
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  const statusFilter = searchParams.get("status") || "all";
  const activeTab = searchParams.get("tab") || "all";
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Direct Interest Calculation Function
  const calculateDirectInterest = (customer: Loan) => {
    const principal = customer.loanAmount;
    const rate = customer.interestRate;

    // Calculate total months
    let totalMonths = 0;
    if (customer.term === "months") {
      totalMonths = customer.months || 0;
    } else {
      totalMonths = (customer.years || 0) * 12;
    }

    // Direct Interest Calculation Formula:
    // Monthly Interest = (Principal × Rate) / 100
    const monthlyInterest = (principal * rate) / 100;

    // Total Interest = Monthly Interest × Total Months
    const totalInterest = monthlyInterest * totalMonths;

    // Total Payable = Principal + Total Interest
    const totalPayable = principal + totalInterest;

    // Monthly Installment = Total Payable / Total Months
    const monthlyInstallment = totalMonths > 0 ? totalPayable / totalMonths : 0;

    return {
      totalPayable,
      monthlyInstallment,
      totalInterest,
      totalMonths,
      monthlyInterest,
    };
  };

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "all" || value === "") {
      params.delete(key); // clean URL
    } else {
      params.set(key, value);
    }

    setSearchParams(params);
  };

  useEffect(() => {
    fetchCustomers();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
      if (window.innerWidth >= 768) {
        setShowMobileFilters(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Scroll position restore
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("customersScroll");

    if (savedScroll) {
      window.scrollTo(0, Number(savedScroll));
    }

    return () => {
      sessionStorage.setItem("customersScroll", String(window.scrollY));
    };
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/loans");
      if (response.data.success) {
        const sorted = response.data.data.sort(
          (a: Loan, b: Loan) =>
            new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
        );
        setCustomers(sorted);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Customer & Loan Report", 14, 20);

    const tableColumn = [
      "Name",
      "Phone",
      "ID Type",
      "ID Number",
      "Loan Amount",
      "Interest Rate",
      "Term",
      "Duration",
      "Status",
      "Monthly EMI",
      "Total Payable",
    ];

    const tableRows: any[] = [];
    customers.forEach((c) => {
      const calc = calculateDirectInterest(c);
      const duration =
        c.term === "months"
          ? `${c.months} months`
          : c.years
            ? `${c.years} years`
            : "-";
      
      tableRows.push([
        c.name,
        c.phone,
        c.idType,
        c.idNumber,
        `₹${c.loanAmount.toLocaleString()}`,
        `${c.interestRate}%`,
        c.term,
        duration,
        c.status,
        `₹${calc.monthlyInstallment.toFixed(0)}`,
        `₹${calc.totalPayable.toFixed(0)}`,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("Customer_Loan_Report.pdf");
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.idNumber?.toLowerCase().includes(query) ||
      customer._id?.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;
    const matchesTab = activeTab === "all" || customer.status === activeTab;

    return matchesSearch && matchesStatus && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Statistics Calculations
  const activeCustomers = customers.filter((c) => c.status === "active");
  const closedCustomers = customers.filter((c) => c.status === "closed");
  const pendingCustomers = customers.filter((c) => c.status === "pending");
  const defaultedCustomers = customers.filter((c) => c.status === "defaulted");
  const totalCustomers = customers.length;

  const activeAmount = activeCustomers.reduce(
    (sum, c) => sum + c.loanAmount,
    0,
  );
  const closedAmount = closedCustomers.reduce(
    (sum, c) => sum + c.loanAmount,
    0,
  );
  const pendingAmount = pendingCustomers.reduce(
    (sum, c) => sum + c.loanAmount,
    0,
  );
  const defaultedAmount = defaultedCustomers.reduce(
    (sum, c) => sum + c.loanAmount,
    0,
  );
  const totalAmount = customers.reduce((sum, c) => sum + c.loanAmount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "defaulted":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTermDuration = (customer: Loan) => {
    if (customer.term === "months" && customer.months) {
      return `${customer.months} months`;
    } else if (customer.term === "years" && customer.years) {
      return `${customer.years} years`;
    }
    return "N/A";
  };

  // Mobile Filters Sheet Component
  const MobileFiltersSheet = () => (
    <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>
          Filter customers by status and other criteria
        </SheetDescription>

        <div className="mt-6 space-y-6">
          {/* Search Input in Mobile Sheet */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => updateParams("search", e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {["all", "active", "pending", "closed", "defaulted"].map(
                (status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateParams("status", status)}
                    className="capitalize justify-start"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        status === "active"
                          ? "bg-green-500"
                          : status === "pending"
                            ? "bg-yellow-500"
                            : status === "closed"
                              ? "bg-blue-500"
                              : status === "defaulted"
                                ? "bg-red-500"
                                : "bg-gray-500"
                      }`}
                    />
                    {status === "all" ? "All" : status}
                  </Button>
                ),
              )}
            </div>
          </div>

          {/* Tabs Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Quick View</label>
            <Tabs
              value={activeTab}
              onValueChange={(val) => updateParams("tab", val)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 h-auto">
                <TabsTrigger value="all" className="text-xs py-2">
                  All
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs py-2">
                  Active
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs py-2">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="closed" className="text-xs py-2">
                  Closed
                </TabsTrigger>
                <TabsTrigger
                  value="defaulted"
                  className="text-xs py-2 col-span-2"
                >
                  Defaulted
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSearchParams({})}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Responsive Tabs Component
  const ResponsiveTabs = () => {
    if (isMobile) {
      return (
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {["all", "active", "pending", "closed", "defaulted"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => updateParams("tab", tab)}
                className="whitespace-nowrap capitalize text-xs sm:text-sm"
              >
                {tab === "all" ? "All" : tab}
                {tab !== "all" && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-[10px] px-1.5 py-0.5"
                  >
                    {{
                      active: activeCustomers.length,
                      pending: pendingCustomers.length,
                      closed: closedCustomers.length,
                      defaulted: defaultedCustomers.length,
                    }[tab] || 0}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Tabs
        value={activeTab}
        onValueChange={(val) => updateParams("tab", val)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 h-11">
          <TabsTrigger value="all" className="text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="text-sm">
            Active
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-sm">
            Pending
          </TabsTrigger>
          <TabsTrigger value="closed" className="text-sm">
            Closed
          </TabsTrigger>
          <TabsTrigger value="defaulted" className="text-sm">
            Defaulted
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  };

  // Loading Skeletons
  const StatCardSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );

  const TableRowSkeleton = () => (
    <TableRow>
      {[...Array(7)].map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );

  // Mobile Card View
  const MobileCustomerCard = ({ customer }: { customer: Loan }) => {
    const calc = calculateDirectInterest(customer);

    return (
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-300 border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {customer.customerImage?.url ? (
                <img
                  src={customer.customerImage.url}
                  alt={customer.name}
                  className="h-12 w-12 rounded-xl object-cover border-2 border-border"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone}
                    </p>
                  </div>
                  <Badge
                    className={`flex items-center gap-1 px-2 py-1 text-xs ${statusStyles[customer.status]}`}
                    variant="outline"
                  >
                    {getStatusIcon(customer.status)}
                    <span className="capitalize">
                      {customer.status.charAt(0)}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Amount और EMI */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
              <div className="flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                <span className="font-bold text-base">
                  {formatCurrency(customer.loanAmount)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Monthly EMI</p>
              <div className="flex items-center">
                <IndianRupee className="w-4 h-4 mr-1 text-green-600" />
                <span className="font-bold text-base text-green-600">
                  {formatCurrency(calc.monthlyInstallment)}
                </span>
              </div>
            </div>
          </div>

          {/* Total Payable और Interest */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Total Payable
              </p>
              <div className="flex items-center">
                <IndianRupee className="w-4 h-4 mr-1 text-blue-600" />
                <span className="font-bold text-base text-blue-600">
                  {formatCurrency(calc.totalPayable)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interest</p>
              <div className="flex items-center">
                <IndianRupee className="w-4 h-4 mr-1 text-purple-600" />
                <span className="font-bold text-base text-purple-600">
                  {formatCurrency(calc.totalInterest)}
                </span>
              </div>
            </div>
          </div>

          {/* Term और Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{getTermDuration(customer)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(customer.joinDate)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/customers/${customer._id}`)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/customer-form/${customer._id}`)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="w-full min-w-0">
        <div className="space-y-6 p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Mobile Filters Sheet */}
          <MobileFiltersSheet />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                  Loan Management
                </h1>
              </div>
              <p className="text-muted-foreground truncate">
                Manage {totalCustomers} customers and their loan portfolios
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={fetchCustomers}
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportPDF}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download PDF report</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link to="/customer-form">
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary whitespace-nowrap">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Customer</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {loading ? (
              [...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 text-xs"
                      >
                        +
                        {(
                          (activeCustomers.length / totalCustomers) *
                          100
                        ).toFixed(1)}
                        %
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Active Loans
                    </p>
                    <div className="flex items-end justify-between mt-2">
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {activeCustomers.length}
                      </h3>
                      <p className="text-xs sm:text-sm text-green-600 font-medium truncate ml-2">
                        {formatCurrency(activeAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Closed Loans
                    </p>
                    <div className="flex items-end justify-between mt-2">
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {closedCustomers.length}
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-600 font-medium truncate ml-2">
                        {formatCurrency(closedAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Pending Loans
                    </p>
                    <div className="flex items-end justify-between mt-2">
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {pendingCustomers.length}
                      </h3>
                      <p className="text-xs sm:text-sm text-yellow-600 font-medium truncate ml-2">
                        {formatCurrency(pendingAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 text-xs"
                      >
                        Alert
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Defaulted Loans
                    </p>
                    <div className="flex items-end justify-between mt-2">
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {defaultedCustomers.length}
                      </h3>
                      <p className="text-xs sm:text-sm text-red-600 font-medium truncate ml-2">
                        {formatCurrency(defaultedAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Total Portfolio
                    </p>
                    <div className="flex items-end justify-between mt-2">
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {totalCustomers}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium truncate ml-2">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Search and Filters - Responsive */}
          <Card className="w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Desktop Layout */}
                {!isMobile ? (
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Search customers by name, phone, ID number..."
                          className="pl-10 h-11 text-base w-full"
                          value={searchQuery}
                          onChange={(e) => updateParams("search", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 flex-shrink-0">
                      <div className="min-w-0">
                        <ResponsiveTabs />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11"
                          >
                            <Filter className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {[
                            "all",
                            "active",
                            "pending",
                            "closed",
                            "defaulted",
                          ].map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => updateParams("status", status)}
                              className="capitalize"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    status === "active"
                                      ? "bg-green-500"
                                      : status === "pending"
                                        ? "bg-yellow-500"
                                        : status === "closed"
                                          ? "bg-blue-500"
                                          : status === "defaulted"
                                            ? "bg-red-500"
                                            : "bg-gray-500"
                                  }`}
                                />
                                {status === "all" ? "All Status" : status}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ) : (
                  /* Mobile Layout */
                  <div className="space-y-4">
                    {/* Search Bar with Filter Button */}
                    <div className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search customers..."
                          className="pl-9 h-11 text-sm w-full"
                          value={searchQuery}
                          onChange={(e) => updateParams("search", e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 flex-shrink-0"
                        onClick={() => setShowMobileFilters(true)}
                      >
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Responsive Tabs for Mobile */}
                    <ResponsiveTabs />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredCustomers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalCustomers}
                </span>{" "}
                customers
              </span>
            </div>
            {filteredCustomers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={exportPDF}
                className="gap-2 text-sm flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                Export All
              </Button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : filteredCustomers.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="mx-auto w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search or filter"
                    : "Get started by adding your first customer"}
                </p>
                <Link to="/customer-form">
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Add First Customer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : isMobile ? (
            // Mobile Card View
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <MobileCustomerCard key={customer._id} customer={customer} />
              ))}
            </div>
          ) : (
            // ✅ FIXED: Desktop Table View - Fully Responsive with NO horizontal scroll
            <Card className="overflow-hidden border-border/50 shadow-sm w-full">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold whitespace-nowrap">Customer</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">Contact & ID</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">Loan Details</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">Financials</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">Status</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">Date</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => {
                      const calc = calculateDirectInterest(customer);
                      
                      return (
                        <TableRow
                          key={customer._id}
                          className="hover:bg-muted/10 border-border/50 group cursor-pointer transition-colors"
                          onClick={() => navigate(`/customers/${customer._id}`)}
                        >
                          {/* Customer Info */}
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {customer.customerImage?.url ? (
                                <img
                                  src={customer.customerImage.url}
                                  alt={customer.name}
                                  className="h-12 w-12 rounded-xl object-cover border-2 border-border group-hover:border-primary/50 transition-colors flex-shrink-0"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/50 transition-colors flex-shrink-0">
                                  <User className="w-6 h-6 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {customer._id.substring(-8)}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Contact & ID */}
                          <TableCell className="whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium">
                                  {customer.phone}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={`text-xs px-2 py-1 ${idTypeStyles[customer.idType]} flex-shrink-0`}
                                  variant="outline"
                                >
                                  {customer.idType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {customer.idNumber}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Loan Details */}
                          <TableCell className="whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <IndianRupee className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="font-bold text-lg">
                                  {formatCurrency(customer.loanAmount)}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {customer.interestRate}% Interest
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getTermDuration(customer)}
                                </div>
                                <div className="text-sm font-medium text-blue-600">
                                  {formatCurrency(calc.monthlyInterest)}/month
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Financials - Direct Interest Method */}
                          <TableCell className="whitespace-nowrap">
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Total Payable
                                </p>
                                <div className="flex items-center gap-2">
                                  <IndianRupee className="w-4 h-4 flex-shrink-0" />
                                  <p className="font-semibold">
                                    {formatCurrency(calc.totalPayable)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Monthly EMI
                                </p>
                                <div className="flex items-center gap-2">
                                  <IndianRupee className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <p className="font-semibold text-green-600">
                                    {formatCurrency(calc.monthlyInstallment)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>Interest:</span>
                                <span className="font-medium">
                                  {formatCurrency(calc.totalInterest)}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              className={`flex items-center gap-1.5 px-3 py-1.5 capitalize font-medium ${statusStyles[customer.status]} w-fit`}
                              variant="outline"
                            >
                              {getStatusIcon(customer.status)}
                              <span>{customer.status}</span>
                            </Badge>
                          </TableCell>

                          {/* Date */}
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium">
                                {formatDate(customer.joinDate)}
                              </span>
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 hover:bg-primary/10 flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/customers/${customer._id}`);
                                      }}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 hover:bg-primary/10 flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/customer-form/${customer._id}`);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit Customer</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-primary/10 flex-shrink-0"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(`/customers/${customer._id}`)
                                    }
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(`/customer-form/${customer._id}`)
                                    }
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Create Another Loan
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Mark as Defaulted
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Table Footer */}
              {filteredCustomers.length > 10 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t px-6 py-4 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing 1-10 of {filteredCustomers.length} customers
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
