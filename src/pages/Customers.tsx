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
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  SlidersHorizontal,
  XCircle as XCircleIcon,
  AlertTriangle,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  SheetTitle,
  SheetDescription,
  SheetHeader,
  SheetFooter,
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

// Helper: Get loan end date
const getLoanEndDate = (customer: Loan): Date | null => {
  if (!customer.joinDate) return null;

  const startDate = new Date(customer.joinDate);

  let totalMonths = 0;
  if (customer.term === "months") {
    totalMonths = customer.months || 0;
  } else {
    totalMonths = (customer.years || 0) * 12;
  }

  if (totalMonths === 0) return null;

  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + totalMonths);

  return endDate;
};

// Helper: Check if loan is upcoming (within last 30 days)
const isUpcomingLoan = (customer: Loan): boolean => {
  if (customer.status !== "active") return false;

  const endDate = getLoanEndDate(customer);
  if (!endDate) return false;

  const currentDate = new Date();
  const daysUntilEnd = Math.ceil(
    (endDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24),
  );

  return daysUntilEnd >= 0 && daysUntilEnd <= 30;
};

// Helper: Check if loan is overdue (end date has passed)
const isOverdueLoan = (customer: Loan): boolean => {
  if (customer.status !== "active") return false;

  const endDate = getLoanEndDate(customer);
  if (!endDate) return false;

  const currentDate = new Date();
  const today = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const endDateOnly = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  return endDateOnly < today;
};

// Helper: Get days overdue
const getDaysOverdue = (customer: Loan): number | null => {
  const endDate = getLoanEndDate(customer);
  if (!endDate) return null;

  const currentDate = new Date();
  const today = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const endDateOnly = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  if (endDateOnly >= today) return null;

  return Math.ceil(
    (today.getTime() - endDateOnly.getTime()) / (1000 * 3600 * 24),
  );
};

// Helper: Get days until loan ends
const getDaysUntilEnd = (customer: Loan): number | null => {
  const endDate = getLoanEndDate(customer);
  if (!endDate) return null;

  const currentDate = new Date();
  return Math.ceil(
    (endDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24),
  );
};

export default function Customers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Loan[]>([]);
  const searchQuery = searchParams.get("search") || "";
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  const statusFilter = searchParams.get("status") || "all";
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: statusFilter,
  });
  const [showSearchClear, setShowSearchClear] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

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
    setFilterPopoverOpen(false);
  };

  const clearSearch = () => {
    updateParams("search", "");
    setShowSearchClear(false);
  };

  const applyMobileFilter = (statusValue: string) => {
    setTempFilters({ status: statusValue });
    updateParams("status", statusValue);
    setShowMobileFilters(false);
  };

  const resetMobileFilters = () => {
    setTempFilters({ status: "all" });
    updateParams("status", "all");
    setShowMobileFilters(false);
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
    const dataToExport = filteredCustomers;

    if (dataToExport.length === 0) {
      alert("No data to export based on current filters");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Header
    doc.setFillColor(22, 160, 133);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Loan Management System", 14, 13);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      doc.internal.pageSize.width - 50,
      13,
    );

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Customer & Loan Report", 14, 30);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    let filterText = "Filters Applied: ";
    if (statusFilter !== "all") filterText += `Status = ${statusFilter} `;
    if (searchQuery) filterText += `| Search = "${searchQuery}" `;
    if (filterText === "Filters Applied: ")
      filterText = "No filters applied - Showing all customers";
    doc.text(filterText, 14, 37);

    const totalLoanAmount = dataToExport.reduce(
      (sum, c) => sum + c.loanAmount,
      0,
    );
    const avgLoanAmount = totalLoanAmount / dataToExport.length;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Records: ${dataToExport.length}`, 14, 44);
    doc.text(`Total Portfolio: ${formatCurrency(totalLoanAmount)}`, 70, 44);
    doc.text(`Average Loan: ${formatCurrency(avgLoanAmount)}`, 130, 44);

    // Table Columns
    const tableColumn = [
      "S.No",
      "Name",
      "Phone",
      "ID Type",
      "ID Number",
      "Join Date",
      "Receiving Date",
      "Duration",
      "Loan Amount",
      "Total Payable",
      "Monthly EMI",
      "Overdue Days",
      "Status",
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
      const endDate = getLoanEndDate(c);
      const daysOverdue = getDaysOverdue(c);
      const isOverdue =
        daysOverdue !== null && daysOverdue > 0 && c.status === "active";

      // Calculate receiving date (end date of loan)
      let receivingDate = "-";
      if (endDate) {
        receivingDate = formatDate(endDate.toISOString());
      }

      // Overdue days display - only for active loans that are overdue
      let overdueDisplay = "-";
      if (isOverdue && daysOverdue !== null) {
        overdueDisplay = `${daysOverdue} days`;
      }

      tableRows.push([
        index + 1,
        c.name,
        c.phone,
        c.idType,
        c.idNumber,
        formatDate(c.joinDate),
        receivingDate,
        duration,
        `Rs. ${c.loanAmount.toLocaleString("en-IN")}`,
        `Rs. ${Math.round(calc.totalPayable).toLocaleString("en-IN")}`,
        `Rs. ${Math.round(calc.monthlyInstallment).toLocaleString("en-IN")}`,
        overdueDisplay,
        c.status.charAt(0).toUpperCase() + c.status.slice(1),
      ]);
    });

    // Generate table with conditional row coloring for overdue loans
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
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        8: { halign: "right" },
        9: { halign: "right" },
        10: { halign: "right" },
        11: { halign: "center" },
        12: { halign: "center" },
      },
      // Custom row styling for overdue loans (entire row in red)
      didParseCell: (data) => {
        const rowData = tableRows[data.row.index];
        if (rowData) {
          const status = rowData[12].toLowerCase();
          const overdueDays = rowData[11];
          // Check if loan is active and overdue
          if (
            status === "active" &&
            overdueDays !== "-" &&
            overdueDays !== "0 days"
          ) {
            data.cell.styles.textColor = [220, 38, 38]; // Red color for overdue rows
          }
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
        );
        doc.text(
          "Confidential - For Internal Use Only",
          14,
          doc.internal.pageSize.height - 10,
        );
      },
    });

    // Summary Statistics Page
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
      [
        "Active Loans",
        dataToExport.filter((c) => c.status === "active").length.toString(),
      ],
      [
        "Pending Loans",
        dataToExport.filter((c) => c.status === "pending").length.toString(),
      ],
      [
        "Closed Loans",
        dataToExport.filter((c) => c.status === "closed").length.toString(),
      ],
      [
        "Defaulted Loans",
        dataToExport.filter((c) => c.status === "defaulted").length.toString(),
      ],
      [
        "Upcoming Loans (Last Month)",
        dataToExport.filter((c) => isUpcomingLoan(c)).length.toString(),
      ],
      [
        "Overdue Loans",
        dataToExport.filter((c) => isOverdueLoan(c)).length.toString(),
      ],
    ];

    autoTable(doc, {
      body: summaryData,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 80 },
        1: { halign: "right", cellWidth: 60 },
      },
      theme: "plain",
    });

    let filename = "Loan_Report";
    if (statusFilter !== "all") filename += `_${statusFilter}`;
    filename += `_${new Date().toISOString().split("T")[0]}.pdf`;

    doc.save(filename);
  };

 // Filter customers
const filteredCustomers = customers.filter((customer) => {
  const query = searchQuery.toLowerCase();
  const matchesSearch =
    customer.name?.toLowerCase().includes(query) ||
    customer.phone?.includes(query) ||
    customer.idNumber?.toLowerCase().includes(query) ||
    customer._id?.toLowerCase().includes(query);

  // Overdue filter
  if (statusFilter === "overdue") {
    return matchesSearch && isOverdueLoan(customer);
  }

  // Upcoming filter
  if (statusFilter === "upcoming") {
    return matchesSearch && isUpcomingLoan(customer);
  }

  // Other status filters
  const matchesStatus =
    statusFilter === "all" || customer.status === statusFilter;

  // Month filter
  const monthFilter = searchParams.get("month") || "all";
  let matchesMonth = true;
  
  if (monthFilter !== "all") {
    const joinDate = new Date(customer.joinDate);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (monthFilter) {
      case "current":
        matchesMonth = 
          joinDate.getMonth() === currentMonth &&
          joinDate.getFullYear() === currentYear;
        break;
      case "last": {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        matchesMonth = 
          joinDate.getMonth() === lastMonth &&
          joinDate.getFullYear() === lastMonthYear;
        break;
      }
      case "last2": {
        const twoMonthsAgo = new Date(now);
        twoMonthsAgo.setMonth(now.getMonth() - 2);
        const startDate = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 1);
        matchesMonth = joinDate >= startDate && joinDate <= now;
        break;
      }
      case "last3": {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        const startDate = new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth(), 1);
        matchesMonth = joinDate >= startDate && joinDate <= now;
        break;
      }
      case "last6": {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const startDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1);
        matchesMonth = joinDate >= startDate && joinDate <= now;
        break;
      }
      case "year":
        matchesMonth = joinDate.getFullYear() === currentYear;
        break;
      default:
        matchesMonth = true;
    }
  }

  return matchesSearch && matchesStatus && matchesMonth;
});

  // Sort customers
  const sortedFilteredCustomers = (() => {
    if (statusFilter === "upcoming") {
      return [...filteredCustomers].sort((a, b) => {
        const daysA = getDaysUntilEnd(a) ?? Infinity;
        const daysB = getDaysUntilEnd(b) ?? Infinity;
        return daysA - daysB;
      });
    }
    if (statusFilter === "overdue") {
      return [...filteredCustomers].sort((a, b) => {
        const daysA = getDaysOverdue(a) ?? -1;
        const daysB = getDaysOverdue(b) ?? -1;
        return daysB - daysA;
      });
    }
    return filteredCustomers;
  })();

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
    })
      .format(amount)
      .replace("₹", "₹ ");
  };

  // Statistics Calculations
  const activeCustomers = customers.filter((c) => c.status === "active");
  const closedCustomers = customers.filter((c) => c.status === "closed");
  const pendingCustomers = customers.filter((c) => c.status === "pending");
  const defaultedCustomers = customers.filter((c) => c.status === "defaulted");
  const upcomingCustomers = customers.filter((c) => isUpcomingLoan(c));
  const overdueCustomers = customers.filter((c) => isOverdueLoan(c));
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
  const upcomingAmount = upcomingCustomers.reduce((sum, c) => sum + c.loanAmount, 0); // ✅ Upcoming total amount
const overdueAmount = overdueCustomers.reduce((sum, c) => sum + c.loanAmount, 0); // ✅ Overdue total amount

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
    if (searchQuery) count++;
    return count;
  };

// Mobile Filters Sheet
const MobileFiltersSheet = () => {
  const [activeTab, setActiveTab] = useState<"status" | "month">("status");
  const monthFilter = searchParams.get("month") || "all";

  const handleMonthFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("month");
    } else {
      params.set("month", value);
    }
    setSearchParams(params);
    setShowMobileFilters(false);
  };

  return (
    <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </SheetTitle>
          <SheetDescription>
            Filter customers by status or join month
          </SheetDescription>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === "status" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("status")}
          >
            Status
          </Button>
          <Button
            variant={activeTab === "month" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("month")}
          >
            Month
          </Button>
        </div>

        <ScrollArea className="h-[calc(85vh-200px)] pr-4 mt-4">
          {/* Status Filters */}
          {activeTab === "status" && (
            <div className="space-y-2">
              {[
                {
                  value: "all",
                  label: "All Customers",
                  color: "bg-gray-500",
                  count: totalCustomers,
                },
                {
                  value: "active",
                  label: "Active",
                  color: "bg-green-500",
                  count: activeCustomers.length,
                },
                {
                  value: "pending",
                  label: "Pending",
                  color: "bg-yellow-500",
                  count: pendingCustomers.length,
                },
                {
                  value: "closed",
                  label: "Closed",
                  color: "bg-blue-500",
                  count: closedCustomers.length,
                },
                {
                  value: "defaulted",
                  label: "Defaulted",
                  color: "bg-red-500",
                  count: defaultedCustomers.length,
                },
                {
                  value: "upcoming",
                  label: "Upcoming (Last Month)",
                  color: "bg-purple-500",
                  count: upcomingCustomers.length,
                },
                {
                  value: "overdue",
                  label: "Overdue",
                  color: "bg-orange-500",
                  count: overdueCustomers.length,
                },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? "default" : "outline"}
                  onClick={() => applyMobileFilter(status.value)}
                  className="w-full justify-between h-12"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <span>{status.label}</span>
                  </div>
                  <Badge variant="secondary">{status.count}</Badge>
                </Button>
              ))}
            </div>
          )}

          {/* Month Filters */}
          {activeTab === "month" && (
            <div className="space-y-2">
              {[
                { value: "all", label: "All Months" },
                { value: "current", label: "Current Month" },
                { value: "last", label: "Last Month" },
                { value: "last2", label: "Last 2 Months" },
                { value: "last3", label: "Last 3 Months" },
                { value: "last6", label: "Last 6 Months" },
                { value: "year", label: "This Year" },
              ].map((month) => {
                const isActive = monthFilter === month.value;
                return (
                  <Button
                    key={month.value}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => handleMonthFilterChange(month.value)}
                    className="w-full justify-start gap-3 h-12"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{month.label}</span>
                    {isActive && (
                      <Badge variant="secondary" className="ml-auto">
                        Active
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              resetMobileFilters();
              handleMonthFilterChange("all");
            }}
          >
            Reset All
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setShowMobileFilters(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Desktop Filter Popover
const DesktopFilterPopover = () => {
  const [monthFilter, setMonthFilter] = useState(() => {
    return searchParams.get("month") || "all";
  });

  const handleMonthFilterChange = (value: string) => {
    setMonthFilter(value);
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("month");
    } else {
      params.set("month", value);
    }
    setSearchParams(params);
    setFilterPopoverOpen(false);
  };

  return (
    <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-11 w-11 relative ${getActiveFilterCount() > 0 ? "border-primary" : ""}`}
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
          <p className="text-xs text-muted-foreground">
            Filter by status or join month
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">By Status</p>
            <div className="space-y-1.5">
              {[
                {
                  value: "all",
                  label: "All Customers",
                  color: "bg-gray-500",
                  count: totalCustomers,
                },
                {
                  value: "active",
                  label: "Active",
                  color: "bg-green-500",
                  count: activeCustomers.length,
                },
                {
                  value: "pending",
                  label: "Pending",
                  color: "bg-yellow-500",
                  count: pendingCustomers.length,
                },
                {
                  value: "closed",
                  label: "Closed",
                  color: "bg-blue-500",
                  count: closedCustomers.length,
                },
                {
                  value: "defaulted",
                  label: "Defaulted",
                  color: "bg-red-500",
                  count: defaultedCustomers.length,
                },
                {
                  value: "upcoming",
                  label: "Upcoming (Last Month)",
                  color: "bg-purple-500",
                  count: upcomingCustomers.length,
                },
                {
                  value: "overdue",
                  label: "Overdue",
                  color: "bg-orange-500",
                  count: overdueCustomers.length,
                },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateParams("status", status.value)}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span>{status.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {status.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Month Filter */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">By Join Month</p>
            <div className="space-y-1.5">
              {[
                { value: "all", label: "All Months" },
                { value: "current", label: "Current Month" },
                { value: "last", label: "Last Month" },
                { value: "last2", label: "Last 2 Months" },
                { value: "last3", label: "Last 3 Months" },
                { value: "last6", label: "Last 6 Months" },
                { value: "year", label: "This Year" },
              ].map((month) => {
                const currentMonthFilter = searchParams.get("month") || "all";
                const isActive = currentMonthFilter === month.value;
                return (
                  <Button
                    key={month.value}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleMonthFilterChange(month.value)}
                    className="w-full justify-start gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{month.label}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        Active
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

       {(statusFilter !== "all" || searchQuery || searchParams.get("month") !== "all") && (
  <div className="flex flex-wrap items-center gap-2 pt-2">
    <span className="text-xs text-muted-foreground">
      Active filters:
    </span>
    {statusFilter !== "all" && (
      <Badge variant="secondary" className="gap-1">
        Status: {statusFilter === "upcoming" ? "Upcoming" : statusFilter === "overdue" ? "Overdue" : statusFilter}
        <button onClick={() => updateParams("status", "all")} className="ml-1 hover:text-destructive">
          <XCircleIcon className="w-3 h-3" />
        </button>
      </Badge>
    )}
    {searchParams.get("month") !== "all" && searchParams.get("month") !== null && (
      <Badge variant="secondary" className="gap-1">
        Month: {(() => {
          const month = searchParams.get("month");
          const labels: Record<string, string> = {
            current: "Current Month",
            last: "Last Month",
            last2: "Last 2 Months",
            last3: "Last 3 Months",
            last6: "Last 6 Months",
            year: "This Year",
          };
          return labels[month || ""] || month;
        })()}
        <button 
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.delete("month");
            setSearchParams(params);
          }} 
          className="ml-1 hover:text-destructive"
        >
          <XCircleIcon className="w-3 h-3" />
        </button>
      </Badge>
    )}
    
    {searchQuery && (
      <Badge variant="secondary" className="gap-1">
        Search: "{searchQuery}"
        <button onClick={clearSearch} className="ml-1 hover:text-destructive">
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
        updateParams("search", "");
        const params = new URLSearchParams(searchParams);
        params.delete("month");
        setSearchParams(params);
      }}
    >
      Clear all
    </Button>
  </div>
)}
      </PopoverContent>
    </Popover>
  );
};

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
      {[...Array(8)].map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );

// Mobile Card View - Modified version
const MobileCustomerCard = ({ customer }: { customer: Loan }) => {
  const calc = calculateDirectInterest(customer);
  const daysUntilEnd = getDaysUntilEnd(customer);
  const daysOverdue = getDaysOverdue(customer);
  const isUpcomingView = statusFilter === "upcoming";
  const isOverdueView = statusFilter === "overdue";

  // Handle card click - redirect to customer detail page
  const handleCardClick = () => {
    navigate(`/customers/${customer._id}`);
  };

  return (
    <Card 
      className="mb-4 hover:shadow-lg transition-shadow duration-300 border-border/60 cursor-pointer"
      onClick={handleCardClick}
    >
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
              <div>
                <h3 className="font-semibold text-foreground">
                  {customer.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {customer.phone}
                </p>
              </div>
            </div>
          </div>
          <Badge
            className={`flex items-center gap-1 px-2 py-1 text-xs ${statusStyles[customer.status]}`}
            variant="outline"
          >
            {getStatusIcon(customer.status)}
            <span className="capitalize">{customer.status.charAt(0)}</span>
          </Badge>
        </div>

        {isUpcomingView && daysUntilEnd !== null && daysUntilEnd >= 0 && (
          <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 font-medium">
              ⏰ Loan ends in {daysUntilEnd} days (
              {formatDate(getLoanEndDate(customer)?.toISOString() || "")})
            </p>
          </div>
        )}

        {isOverdueView && daysOverdue !== null && daysOverdue > 0 && (
          <div className="mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-700 font-medium">
              ⚠️ Overdue by {daysOverdue} days (Loan ended on{" "}
              {formatDate(getLoanEndDate(customer)?.toISOString() || "")})
            </p>
          </div>
        )}

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

        {/* ✅ Total Interest Earned Section - Full Width */}
        <div className="mt-3 pt-3 border-t">
          <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Total Interest Earned
                </p>
              </div>
              <p className="font-bold text-base text-blue-700 dark:text-blue-300">
                {formatCurrency(calc.totalInterest)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Rate: {customer.interestRate}% p.a.
              </p>
              <p className="text-xs text-muted-foreground">
                {calc.monthlyInterest.toFixed(2)}/month
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Removed Edit and Eye buttons - Only card click handles navigation */}
      </CardContent>
    </Card>
  );
};

  return (
    <DashboardLayout>
      <div className="w-full min-w-0">
        <div className="space-y-6 p-4 md:p-6 max-w-full overflow-x-hidden">
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
          <div className="grid grid-rows-1 sm:grid-rows-2 lg:grid-rows-7 gap-3 sm:gap-4">
            {loading ? (
              [...Array(7)].map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow h-fit">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />{" "}
                      </div>
                      {/* Title */}
                      <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Active Loans
                      </p>
                      {/* Count */}
                      <h3 className="text-xl font-bold whitespace-nowrap">
                        {activeCustomers.length}
                      </h3>
                      {/* Amount */}
                      <p className="text-sm font-medium text-green-600 whitespace-nowrap">
                        {formatCurrency(activeAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow h-fit">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      {/* Title */}
                      <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Closed Loans
                      </p>
                      {/* Count */}
                      <h3 className="text-xl font-bold whitespace-nowrap">
                        {closedCustomers.length}
                      </h3>
                      {/* Amount */}
                      <p className="text-sm font-medium text-blue-600 whitespace-nowrap">
                        {formatCurrency(closedAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow h-fit">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />{" "}
                      </div>
                      {/* Title */}
                      <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Pending Loans
                      </p>
                      {/* Count */}
                      <h3 className="text-xl font-bold whitespace-nowrap">
                        {pendingCustomers.length}
                      </h3>
                      {/* Amount */}
                      <p className="text-xs sm:text-sm text-yellow-600 font-medium truncate ml-2">
                        {formatCurrency(pendingAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow h-fit">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                      </div>
                      {/* Title */}
                      <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Defaulted Loans
                      </p>
                      {/* Count */}
                      <h3 className="text-xl font-bold whitespace-nowrap">
                        {defaultedCustomers.length}
                      </h3>

                      {/* Amount */}
                      <p className="text-xs sm:text-sm text-red-600 font-medium truncate ml-2">
                        {formatCurrency(defaultedAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow h-fit">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Portfolio
                      </p>

                      {/* Count */}
                      <h3 className="text-xl font-bold whitespace-nowrap">
                        {totalCustomers}
                      </h3>

                      {/* Amount */}
                      <p className="text-xs sm:text-sm font-medium truncate ml-2">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 bg-orange-50/30 hover:shadow-md transition-shadow h-fit">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                      </div>

                      {/* Title */}
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Upcoming
                      </p>

                      {/* Count */}
                      <h3 className="text-xl font-bold whitespace-nowrap">
                        {upcomingCustomers.length}
                      </h3>

                      {/* Amount */}
                      <p className="text-xs sm:text-sm text-orange-600 font-medium truncate ml-2">
                         {formatCurrency(upcomingAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-700 bg-red-50/30 hover:shadow-md transition-shadow h-fit">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Icon */}
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-700 dark:text-red-400" />
                      </div>

                      {/* Title */}
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Overdue
                      </p>

                      {/* Count */}
                      <h3 className="text-xl font-bold whitespace-nowrap">
                        {overdueCustomers.length}
                      </h3>

                      {/* Amount */}
                      <p className="text-xs sm:text-sm text-red-700 font-medium truncate ml-2">
                       {formatCurrency(overdueAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Search and Filters Section */}
          <Card className="w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <ResponsiveSearch />

                  {isMobile ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-11 w-11 flex-shrink-0 ${getActiveFilterCount() > 0 ? "border-primary" : ""}`}
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

                {(statusFilter !== "all" || searchQuery) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">
                      Active filters:
                    </span>
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Status:{" "}
                        {statusFilter === "upcoming"
                          ? "Upcoming"
                          : statusFilter === "overdue"
                            ? "Overdue"
                            : statusFilter}
                        <button
                          onClick={() => updateParams("status", "all")}
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
                  {sortedFilteredCustomers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalCustomers}
                </span>{" "}
                customers
              </span>
            </div>
            {sortedFilteredCustomers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={exportPDF}
                className="gap-2 text-sm flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                Export Filtered ({sortedFilteredCustomers.length})
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
          ) : sortedFilteredCustomers.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="mx-auto w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No customers found
                </h3>
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
              {sortedFilteredCustomers.map((customer) => (
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
                        <TableHead className="font-semibold w-[200px]">
                          Customer
                        </TableHead>
                        <TableHead className="font-semibold w-[180px]">
                          Contact & ID
                        </TableHead>
                        <TableHead className="font-semibold w-[180px]">
                          Loan Details
                        </TableHead>
                        <TableHead className="font-semibold w-[180px]">
                          Financials
                        </TableHead>
                        <TableHead className="font-semibold w-[120px]">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold w-[140px]">
                          Date
                        </TableHead>
                        {(statusFilter === "upcoming" ||
                          statusFilter === "overdue") && (
                          <TableHead className="font-semibold w-[100px]">
                            {statusFilter === "upcoming"
                              ? "Days Left"
                              : "Overdue Days"}
                          </TableHead>
                        )}
                        <TableHead className="font-semibold w-[100px] text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedFilteredCustomers.map((customer) => {
                        const calc = calculateDirectInterest(customer);
                        const daysUntilEnd = getDaysUntilEnd(customer);
                        const daysOverdue = getDaysOverdue(customer);

                        return (
                          <TableRow
                            key={customer._id}
                            className="hover:bg-muted/10 border-border/50 group cursor-pointer transition-colors"
                            onClick={() =>
                              navigate(`/customers/${customer._id}`)
                            }
                          >
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
                                    ID: {customer._id.slice(-8)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

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

                            <TableCell className="w-[120px]">
                              <div className="flex flex-col gap-1">
                                <Badge
                                  className={`flex items-center gap-1.5 px-3 py-1.5 capitalize font-medium ${statusStyles[customer.status]} w-fit`}
                                  variant="outline"
                                >
                                  {getStatusIcon(customer.status)}
                                  <span className="truncate">
                                    {customer.status}
                                  </span>
                                </Badge>
                                {statusFilter === "upcoming" &&
                                  daysUntilEnd !== null &&
                                  daysUntilEnd >= 0 && (
                                    <Badge className="bg-purple-500 text-white text-xs w-fit">
                                      ⚡ {daysUntilEnd}d left
                                    </Badge>
                                  )}
                                {statusFilter === "overdue" &&
                                  daysOverdue !== null &&
                                  daysOverdue > 0 && (
                                    <Badge className="bg-orange-500 text-white text-xs w-fit">
                                      🔥 {daysOverdue}d overdue
                                    </Badge>
                                  )}
                              </div>
                            </TableCell>

                            <TableCell className="w-[140px]">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium truncate">
                                  {formatDate(customer.joinDate)}
                                </span>
                              </div>
                            </TableCell>

                            {(statusFilter === "upcoming" ||
                              statusFilter === "overdue") && (
                              <TableCell className="w-[100px]">
                                {statusFilter === "upcoming" &&
                                  daysUntilEnd !== null &&
                                  daysUntilEnd >= 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-purple-50 text-purple-700"
                                    >
                                      {daysUntilEnd} days
                                    </Badge>
                                  )}
                                {statusFilter === "overdue" &&
                                  daysOverdue !== null &&
                                  daysOverdue > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-orange-50 text-orange-700"
                                    >
                                      {daysOverdue} days
                                    </Badge>
                                  )}
                              </TableCell>
                            )}

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
                                          navigate(
                                            `/customers/${customer._id}`,
                                          );
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
                                          navigate(
                                            `/customer-form/${customer._id}`,
                                          );
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
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
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
                                        navigate(
                                          `/customer-form/${customer._id}`,
                                        )
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

              {sortedFilteredCustomers.length > 10 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t px-6 py-4 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing 1-10 of {sortedFilteredCustomers.length} customers
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
