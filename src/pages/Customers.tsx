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
  SlidersHorizontal,
  XCircle as XCircleIcon,
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
  SheetHeader,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [tempFilters, setTempFilters] = useState({
    status: statusFilter,
    tab: activeTab,
  });
  const [showSearchClear, setShowSearchClear] = useState(false);

  // Direct Interest Calculation Function
  const calculateDirectInterest = (customer: Loan) => {
    const principal = customer.loanAmount;
    const rate = customer.interestRate;

    let totalMonths = 0;
    if (customer.term === "months") {
      totalMonths = customer.months || 0;
    } else {
      totalMonths = (customer.years || 0) * 12;
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

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    setSearchParams(params);
  };

  const clearSearch = () => {
    updateParams("search", "");
    setShowSearchClear(false);
  };

  const applyMobileFilters = () => {
    updateParams("status", tempFilters.status);
    updateParams("tab", tempFilters.tab);
    setShowMobileFilters(false);
  };

  const resetMobileFilters = () => {
    setTempFilters({
      status: "all",
      tab: "all",
    });
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

  useEffect(() => {
    setShowSearchClear(searchQuery.length > 0);
  }, [searchQuery]);

  // Scroll position restore
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

  // Updated exportPDF function to respect filters and improve UI
  const exportPDF = () => {
    // Use filtered customers instead of all customers
    const dataToExport = filteredCustomers;
    
    if (dataToExport.length === 0) {
      alert("No data to export based on current filters");
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape', // Better for tables with many columns
      unit: 'mm',
      format: 'a4'
    });

    // Add company header
    doc.setFillColor(22, 160, 133);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Loan Management System", 14, 13);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, doc.internal.pageSize.width - 50, 13);
    
    // Reset text color for main content
    doc.setTextColor(0, 0, 0);
    
    // Title with filter context
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Customer & Loan Report", 14, 30);
    
    // Add filter information
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    let filterText = "Filters Applied: ";
    if (statusFilter !== "all") filterText += `Status = ${statusFilter} `;
    if (activeTab !== "all") filterText += `| View = ${activeTab} `;
    if (searchQuery) filterText += `| Search = "${searchQuery}" `;
    if (filterText === "Filters Applied: ") filterText = "No filters applied - Showing all customers";
    doc.text(filterText, 14, 37);
    
    // Add summary statistics
    const totalLoanAmount = dataToExport.reduce((sum, c) => sum + c.loanAmount, 0);
    const avgLoanAmount = totalLoanAmount / dataToExport.length;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Records: ${dataToExport.length}`, 14, 44);
    doc.text(`Total Portfolio: ${formatCurrency(totalLoanAmount)}`, 70, 44);
    doc.text(`Average Loan: ${formatCurrency(avgLoanAmount)}`, 130, 44);
    
    // Table columns
    const tableColumn = [
      "S.No",
      "Name",
      "Phone",
      "ID Type",
      "ID Number",
      "Loan Amount",
      "Interest",
      "Term",
      "Duration",
      "Status",
      "Monthly EMI",
      "Total Payable",
      "Join Date",
    ];

    const tableRows: any[] = [];
    dataToExport.forEach((c, index) => {
      const calc = calculateDirectInterest(c);
      const duration =
        c.term === "months"
          ? `${c.months} months`
          : c.years
            ? `${c.years} years`
            : "-";
      
      tableRows.push([
        index + 1,
        c.name,
        c.phone,
         c.idType,
          c.idNumber,
        `Rs. ${c.loanAmount.toLocaleString("en-IN")}`,
        `${c.interestRate}%`,
         c.term,
        duration,
        c.status,
        `Rs. ${Math.round(calc.monthlyInstallment).toLocaleString("en-IN")}`,
        `Rs. ${Math.round(calc.totalPayable).toLocaleString("en-IN")}`,
         formatDate(c.joinDate),
       ]);


      
    });

    // Generate table with improved styling
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 48,
      styles: { 
        fontSize: 7,
        cellPadding: 2,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // S.No
        5: { halign: 'right' }, // Loan Amount
        10: { halign: 'right' }, // Monthly EMI
        11: { halign: 'right' }, // Total Payable
      },
      didDrawPage: (data) => {
        // Add footer on each page
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          "Confidential - For Internal Use Only",
          14,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Add summary page at the end
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Summary Statistics", 14, 20);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const summaryData = [
      ["Total Customers", dataToExport.length.toString()],
      ["Total Loan Portfolio", formatCurrency(totalLoanAmount)],
      ["Average Loan Amount", formatCurrency(avgLoanAmount)],
      ["Active Loans", dataToExport.filter(c => c.status === 'active').length.toString()],
      ["Pending Loans", dataToExport.filter(c => c.status === 'pending').length.toString()],
      ["Closed Loans", dataToExport.filter(c => c.status === 'closed').length.toString()],
      ["Defaulted Loans", dataToExport.filter(c => c.status === 'defaulted').length.toString()],
    ];
    
    autoTable(doc, {
      body: summaryData,
      startY: 30,
      styles: { 
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 60 },
      },
      theme: 'plain',
    });

    // Generate filename with filter context
    let filename = "Loan_Report";
    if (statusFilter !== "all") filename += `_${statusFilter}`;
    if (activeTab !== "all") filename += `_${activeTab}`;
    filename += `_${new Date().toISOString().split('T')[0]}.pdf`;
    
    doc.save(filename);
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
    }).format(amount).replace('₹', '₹ '); // Add space after rupee symbol
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

  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (activeTab !== "all") count++;
    if (searchQuery) count++;
    return count;
  };

  // Mobile Filters Sheet Component - Enhanced
  const MobileFiltersSheet = () => (
    <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </SheetTitle>
          <SheetDescription>
            Apply filters to narrow down customers
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["all", "active", "pending", "closed", "defaulted"].map(
                  (status) => (
                    <Button
                      key={status}
                      variant={tempFilters.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTempFilters(prev => ({ ...prev, status }))}
                      className={`capitalize justify-start ${tempFilters.status === status ? 'ring-2 ring-primary ring-offset-2' : ''}`}
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
                      {status === "all" ? "All Status" : status}
                    </Button>
                  ),
                )}
              </div>
            </div>

            <Separator />

            {/* Quick View Tabs */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Quick View
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "all", label: "All Customers" },
                  { value: "active", label: "Active Only" },
                  { value: "pending", label: "Pending" },
                  { value: "closed", label: "Closed" },
                  { value: "defaulted", label: "Defaulted" },
                ].map((tab) => (
                  <Button
                    key={tab.value}
                    variant={tempFilters.tab === tab.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTempFilters(prev => ({ ...prev, tab: tab.value }))}
                    className={`justify-start ${tempFilters.tab === tab.value ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {(tempFilters.status !== "all" || tempFilters.tab !== "all") && (
              <>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Active Filters</label>
                  <div className="flex flex-wrap gap-2">
                    {tempFilters.status !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Status: {tempFilters.status}
                        <button
                          onClick={() => setTempFilters(prev => ({ ...prev, status: "all" }))}
                          className="ml-1 hover:text-destructive"
                        >
                          <XCircleIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {tempFilters.tab !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        View: {tempFilters.tab}
                        <button
                          onClick={() => setTempFilters(prev => ({ ...prev, tab: "all" }))}
                          className="ml-1 hover:text-destructive"
                        >
                          <XCircleIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={resetMobileFilters}
          >
            Reset All
          </Button>
          <Button className="flex-1" onClick={applyMobileFilters}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  // Desktop Filter Popover
  const DesktopFilterPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-11 w-11 relative ${getActiveFilterCount() > 0 ? 'border-primary' : ''}`}
        >
          <Filter className="w-4 h-4" />
          {getActiveFilterCount() > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Filter Customers</h4>
          <p className="text-xs text-muted-foreground">Apply filters to refine your list</p>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Status Filter */}
          <div className="space-y-2">
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

          {/* Quick View */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick View</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "closed", label: "Closed" },
                { value: "defaulted", label: "Defaulted" },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateParams("tab", tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/50 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              updateParams("status", "all");
              updateParams("tab", "all");
              updateParams("search", "");
            }}
          >
            Clear all
          </Button>
          <Badge variant="outline">
            {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
          </Badge>
        </div>
      </PopoverContent>
    </Popover>
  );

  // Responsive Search Component
  const ResponsiveSearch = () => {
    if (isMobile) {
      return (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, ID..."
            className="pl-9 pr-10 h-11 text-sm w-full"
            value={searchQuery}
            onChange={(e) => updateParams("search", e.target.value)}
          />
          {showSearchClear && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search customers by name, phone, ID number..."
          className="pl-10 pr-10 h-11 text-base w-full"
          value={searchQuery}
          onChange={(e) => updateParams("search", e.target.value)}
        />
        {showSearchClear && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XCircleIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  // Responsive Tabs Component
  const ResponsiveTabs = () => {
    if (isMobile) {
      return (
        <ScrollArea className="w-full pb-2">
          <div className="flex space-x-2 min-w-max px-1">
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
        </ScrollArea>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={fetchCustomers}
                      size="icon"
                      className="h-11 w-11"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={exportPDF}
                      className="h-11 w-11"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download filtered report</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Link to="/customer-form">
                <Button className="gap-2 h-11">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Customer</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
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

          {/* Search and Filters Section - Now Separated */}
          <Card className="w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Search Bar - Always at top */}
                <div className="flex gap-2">
                  <ResponsiveSearch />
                  
                  {/* Filter Button - Separated from Search */}
                  {isMobile ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-11 w-11 flex-shrink-0 ${getActiveFilterCount() > 0 ? 'border-primary' : ''}`}
                      onClick={() => setShowMobileFilters(true)}
                    >
                      <Filter className="w-4 h-4" />
                      {getActiveFilterCount() > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </Button>
                  ) : (
                    <DesktopFilterPopover />
                  )}
                </div>

                {/* Tabs - Below Search on mobile, inline on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <ResponsiveTabs />
                  </div>
                  
                  {/* Quick Stats Badge - Optional */}
                  {!isMobile && getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Active Filters Display - Mobile */}
                {isMobile && getActiveFilterCount() > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">Active filters:</span>
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Status: {statusFilter}
                        <button
                          onClick={() => updateParams("status", "all")}
                          className="ml-1 hover:text-destructive"
                        >
                          <XCircleIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {activeTab !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        View: {activeTab}
                        <button
                          onClick={() => updateParams("tab", "all")}
                          className="ml-1 hover:text-destructive"
                        >
                          <XCircleIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        Search: "{searchQuery}"
                        <button
                          onClick={clearSearch}
                          className="ml-1 hover:text-destructive"
                        >
                          <XCircleIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        updateParams("status", "all");
                        updateParams("tab", "all");
                        updateParams("search", "");
                      }}
                    >
                      Clear all
                    </Button>
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
                Export Filtered ({filteredCustomers.length})
              </Button>
            )}
          </div>

          {/* Content - Rest of your code remains same */}
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
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <MobileCustomerCard key={customer._id} customer={customer} />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden border-border/50 shadow-sm w-full">
              <div className="overflow-x-auto">
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold w-[200px]">Customer</TableHead>
                        <TableHead className="font-semibold w-[180px]">
                          Contact & ID
                        </TableHead>
                        <TableHead className="font-semibold w-[180px]">
                          Loan Details
                        </TableHead>
                        <TableHead className="font-semibold w-[180px]">Financials</TableHead>
                        <TableHead className="font-semibold w-[120px]">Status</TableHead>
                        <TableHead className="font-semibold w-[140px]">Date</TableHead>
                        <TableHead className="font-semibold w-[100px] text-right">
                          Actions
                        </TableHead>
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
                            <TableCell className="w-[200px]">
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
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {customer.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    ID: {customer._id.substring(-8)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Contact & ID */}
                            <TableCell className="w-[180px]">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 truncate">
                                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="font-medium truncate">
                                    {customer.phone}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 truncate">
                                  <Badge
                                    className={`text-xs px-2 py-1 ${idTypeStyles[customer.idType]} flex-shrink-0`}
                                    variant="outline"
                                  >
                                    {customer.idType}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {customer.idNumber}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Loan Details */}
                            <TableCell className="w-[180px]">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <IndianRupee className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <span className="font-bold text-lg truncate">
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

                            {/* Financials */}
                            <TableCell className="w-[180px]">
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Total Payable
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4 flex-shrink-0" />
                                    <p className="font-semibold truncate">
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
                                    <p className="font-semibold text-green-600 truncate">
                                      {formatCurrency(calc.monthlyInstallment)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>Interest:</span>
                                  <span className="font-medium truncate">
                                    {formatCurrency(calc.totalInterest)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell className="w-[120px]">
                              <Badge
                                className={`flex items-center gap-1.5 px-3 py-1.5 capitalize font-medium ${statusStyles[customer.status]} w-fit`}
                                variant="outline"
                              >
                                {getStatusIcon(customer.status)}
                                <span className="truncate">{customer.status}</span>
                              </Badge>
                            </TableCell>

                            {/* Date */}
                            <TableCell className="w-[140px]">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium truncate">
                                  {formatDate(customer.joinDate)}
                                </span>
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="w-[100px] text-right">
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
