// ---- FULL FILE REPLACEMENT START ----

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Calendar,
  IndianRupee,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// -------------------------------
// DATA
// -------------------------------
const loans = [
  {
    id: "LN-2024-001",
    customer: "Rajesh Kumar",
    initials: "RK",
    type: "Personal Loan",
    amount: "₹5,00,000",
    disbursed: "₹5,00,000",
    emi: "₹12,500",
    tenure: "48 months",
    interest: "12%",
    status: "active",
    nextEmi: "Dec 15, 2024",
    startDate: "Jan 15, 2024",
  },
];

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  closed: "bg-muted text-muted-foreground border-muted",
};

// -------------------------------
// MAIN COMPONENT
// -------------------------------
export default function Loans() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLoans = loans.filter((loan) =>
    loan.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <div>
            <h1 className="text-2xl font-bold">Loan Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all loan disbursements.
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero" className="animate-slide-up" style={{ animationDelay: "80ms" }}>
                <Plus className="w-4 h-4 mr-2" /> Create Loan
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg animate-fade-in" style={{ animationDelay: "120ms" }}>
              <DialogHeader>
                <DialogTitle>Create New Loan</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customer */}
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c001">Rajesh Kumar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount & Interest */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loan Amount</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                      <Input className="pl-9" placeholder="5,00,000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Interest Rate (%)</Label>
                    <Input placeholder="12" />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-3">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="hero">Create Loan</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* SEARCH BAR */}
        <div
          className="flex flex-col sm:flex-row gap-4 animate-slide-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search loans..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-1" /> Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* RESPONSIVE TABLE */}
        <div
          className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden animate-slide-up"
          style={{ animationDelay: "180ms" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden sm:table-cell">EMI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Next EMI</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredLoans.map((loan, index) => (
                <TableRow
                  key={loan.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <TableCell className="font-medium text-accent">{loan.id}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="hidden sm:flex w-8 h-8">
                        <AvatarFallback>{loan.initials}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{loan.customer}</p>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {loan.type}
                  </TableCell>

                  <TableCell className="font-semibold">
                    {loan.amount}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {loan.emi}/mo
                  </TableCell>

                  <TableCell>
                    <Badge className={statusStyles[loan.status]}>
                      {loan.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {loan.nextEmi}
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" /> EMI Schedule
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

// ---- FULL FILE REPLACEMENT END ----
