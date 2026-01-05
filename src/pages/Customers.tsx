import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/config/api";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // default import


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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";



const statusStyles = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  defaulted: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const idTypeStyles = {
  Aadhaar:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  PAN: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Voter ID":
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "Driving License":
    "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  Passport: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
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

  const [customers, setCustomers] = useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchCustomers();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/loans");
      if (response.data.success) {
        // Sort by joinDate descending (newest first)
        const sorted = response.data.data.sort(
          (a: Loan, b: Loan) =>
            new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
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

  // Title
  doc.setFontSize(18);
  doc.text("Customer & Loan Report", 14, 20);

  // Summary
  const totalCustomers = customers.length;
  const totalLoanAmount = customers.reduce((sum, c) => sum + c.loanAmount, 0);
  const activeLoans = customers.filter((c) => c.status === "active").length;
  const closedLoans = customers.filter((c) => c.status === "closed").length;

  doc.setFontSize(12);
  doc.text(`Total Customers: ${totalCustomers}`, 14, 30);
  doc.text(`Total Loan Amount: ₹${totalLoanAmount}`, 14, 36);
  doc.text(`Active Loans: ${activeLoans}`, 14, 42);
  doc.text(`Closed Loans: ${closedLoans}`, 14, 48);

  // Table
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
  ];

  const tableRows: any[] = [];

  customers.forEach((c) => {
    const duration =
      c.term === "months"
        ? `${c.months} months`
        : c.years
        ? `${c.years} years`
        : "-";

    const row = [
      c.name,
      c.phone,
      c.idType,
      c.idNumber,
      c.loanAmount,
      c.interestRate + "%",
      c.term,
      duration,
      c.status,
      c.monthlyInstallment,
    ];
    tableRows.push(row);
  });

   autoTable(doc,{
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save("Customer_Loan_Report.pdf");
};

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.idNumber?.toLowerCase().includes(query) ||
      customer._id?.toLowerCase().includes(query)
    );
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

  const getTermDuration = (customer: Loan) => {
    if (customer.term === "months" && customer.months) {
      return `${customer.months} months`;
    } else if (customer.term === "years" && customer.years) {
      return `${customer.years} years`;
    }
    return "N/A";
  };

  // Mobile Card View
  const MobileCustomerCard = ({ customer }: { customer: Loan }) => {
    const navigate = useNavigate();

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {customer.customerImage?.url ? (
                <img
                  src={customer.customerImage.url}
                  alt={customer.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-base">{customer.name}</CardTitle>
                <CardDescription className="text-xs">
                  {customer.phone}
                </CardDescription>
              </div>
            </div>
            <Badge
              className={`capitalize ${statusStyles[customer.status] || ""}`}
            >
              {customer.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-3">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="font-medium">₹{customer.loanAmount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Interest</p>
                <p className="font-medium">{customer.interestRate}%</p>
              </div>
            </div>

            <div className="pt-2 border-t flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/customers/${customer._id}`)}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                View
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/customer-form/${customer._id}`)}
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Loan Management
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage your customers and their loan details.
            </p>
          </div>

          {/* Add Customer Link */}
          <Link to="/customer-form">
            <Button variant="hero" className="w-full md:w-auto">
              <span className="mr-2">+</span> Add Customer & Loan
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 flex-wrap animate-slide-up">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, ID..."
              className="pl-10 text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={fetchCustomers}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Filter className="w-3.5 h-3.5 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF}>
              <Download className="w-3.5 h-3.5 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats - Always visible, responsive grid */}
        {customers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 animate-slide-up">
            <div className="bg-card rounded-xl p-3 md:p-4 border">
              <p className="text-xs md:text-sm text-muted-foreground">
                Total Customers
              </p>
              <p className="text-xl md:text-2xl font-bold">
                {customers.length}
              </p>
            </div>
            <div className="bg-card rounded-xl p-3 md:p-4 border">
              <p className="text-xs md:text-sm text-muted-foreground">
                Total Loan Amount
              </p>
              <p className="text-xl md:text-2xl font-bold">
                {formatCurrency(
                  customers.reduce((sum, c) => sum + c.loanAmount, 0)
                )}
              </p>
            </div>
            <div className="bg-card rounded-xl p-3 md:p-4 border">
              <p className="text-xs md:text-sm text-muted-foreground">
                Active Loans
              </p>
              <p className="text-xl md:text-2xl font-bold">
                {customers.filter((c) => c.status === "active").length}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center h-32 flex flex-col items-center justify-center text-muted-foreground">
            <User className="w-12 h-12 mb-2 opacity-50" />
            <p className="mb-2">No customers found</p>
            <Link to="/customer-form">
              <Button variant="link" className="mt-2">
                Add your first customer
              </Button>
            </Link>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="animate-slide-up">
            {filteredCustomers.map((customer) => (
              <MobileCustomerCard key={customer._id} customer={customer} />
            ))}
          </div>
        ) : (
          // Desktop Table View
          <div className="overflow-x-auto bg-card rounded-2xl shadow-card border border-border/50 animate-slide-up">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-sm md:text-base">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-sm md:text-base">
                    Contact & ID
                  </TableHead>
                  <TableHead className="font-semibold text-sm md:text-base">
                    Loan Details
                  </TableHead>
                  <TableHead className="font-semibold text-sm md:text-base">
                    Financials
                  </TableHead>
                  <TableHead className="font-semibold text-sm md:text-base">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-sm md:text-base">
                    Date
                  </TableHead>
                  <TableHead className="text-right font-semibold text-sm md:text-base">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id} className="hover:bg-muted/20">
                    {/* Customer Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {customer.customerImage?.url ? (
                          <img
                            src={customer.customerImage.url}
                            alt={customer.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            ID: {customer._id.substring(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact & ID */}
                    <TableCell>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">
                            {customer.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs ${
                              idTypeStyles[customer.idType] || ""
                            }`}
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
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span className="font-medium">
                            {formatCurrency(customer.loanAmount)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.interestRate}% × {getTermDuration(customer)}
                        </div>
                      </div>
                    </TableCell>

                    {/* Financials */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-medium">
                            {formatCurrency(customer.totalPayable)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Monthly:{" "}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(customer.monthlyInstallment)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        className={`capitalize text-xs md:text-sm ${
                          statusStyles[customer.status] || ""
                        }`}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        {formatDate(customer.joinDate)}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Create Another Loan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
