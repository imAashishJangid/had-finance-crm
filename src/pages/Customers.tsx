import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/api/config";
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
  Mail,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const kycStyles = {
  verified: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/customers`)
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Error fetching customers:", err));
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Customer Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your customers, KYC documents, and loan history.
            </p>
          </div>

          {/* Add Customer Link */}
          <Link to="/customer-form">
            <Button variant="hero">
              <span className="mr-2">+</span> Add Customer
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap animate-slide-up">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email, or ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-card rounded-2xl shadow-card border border-border/50 animate-slide-up">
          <Table className="min-w-[300px]">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold sm:hidden">Active Amount</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Total Loans</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Active Amount</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">KYC Status</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Join Date</TableHead>
                <TableHead className="text-right font-semibold hidden sm:table-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-sm text-muted-foreground hidden sm:block">{customer.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground sm:hidden">{customer.activeLoans}</TableCell>
                  <TableCell className="font-medium hidden sm:table-cell">{customer.totalLoans}</TableCell>
                  <TableCell className="font-semibold text-foreground hidden sm:table-cell">{customer.activeLoans}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={kycStyles[customer.kycStatus as keyof typeof kycStyles]}>
                      {customer.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">{customer.joinDate}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Create Loan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
