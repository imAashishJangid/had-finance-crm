import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/config/api";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusStyles = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  defaulted: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const idTypeStyles = {
  Aadhaar: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  PAN: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Voter ID": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "Driving License": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
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
  const [customers, setCustomers] = useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/loans");
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTermDuration = (customer: Loan) => {
    if (customer.term === 'months' && customer.months) {
      return `${customer.months} months`;
    } else if (customer.term === 'years' && customer.years) {
      return `${customer.years} years`;
    }
    return 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Loan Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your customers and their loan details.
            </p>
          </div>

          {/* Add Customer Link */}
          <Link to="/customer-form">
            <Button variant="hero">
              <span className="mr-2">+</span> Add Customer & Loan
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap animate-slide-up">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, ID number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={fetchCustomers}>
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-card rounded-2xl shadow-card border border-border/50 animate-slide-up">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Contact & ID</TableHead>
                  <TableHead className="font-semibold">Loan Details</TableHead>
                  <TableHead className="font-semibold">Financials</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <User className="w-12 h-12 mb-2 opacity-50" />
                        <p>No customers found</p>
                        <Link to="/customer-form">
                          <Button variant="link" className="mt-2">
                            Add your first customer
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
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
                          <div>
                            <p className="font-medium text-foreground">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {customer._id.substring(-6)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact & ID */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={idTypeStyles[customer.idType] || ""}
                              variant="outline"
                            >
                              {customer.idType}
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
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
                            <span className="text-muted-foreground">Monthly: </span>
                            <span className="font-medium">
                              {formatCurrency(customer.monthlyInstallment)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge 
                          className={`capitalize ${statusStyles[customer.status] || ""}`}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {formatDate(customer.joinDate)}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Summary Stats */}
        {customers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
            <div className="bg-card rounded-xl p-4 border">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border">
              <p className="text-sm text-muted-foreground">Total Loan Amount</p>
              <p className="text-2xl font-bold">
                {formatCurrency(customers.reduce((sum, c) => sum + c.loanAmount, 0))}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 border">
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-2xl font-bold">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}