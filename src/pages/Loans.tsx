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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  {
    id: "LN-2024-002",
    customer: "Priya Sharma",
    initials: "PS",
    type: "Business Loan",
    amount: "₹2,50,000",
    disbursed: "₹0",
    emi: "₹6,800",
    tenure: "36 months",
    interest: "14%",
    status: "pending",
    nextEmi: "-",
    startDate: "-",
  },
  {
    id: "LN-2024-003",
    customer: "Amit Patel",
    initials: "AP",
    type: "Home Loan",
    amount: "₹10,00,000",
    disbursed: "₹10,00,000",
    emi: "₹18,500",
    tenure: "120 months",
    interest: "8.5%",
    status: "active",
    nextEmi: "Dec 5, 2024",
    startDate: "Mar 10, 2024",
  },
  {
    id: "LN-2024-004",
    customer: "Sunita Reddy",
    initials: "SR",
    type: "Personal Loan",
    amount: "₹1,50,000",
    disbursed: "₹1,50,000",
    emi: "₹5,200",
    tenure: "24 months",
    interest: "11%",
    status: "closed",
    nextEmi: "-",
    startDate: "Apr 5, 2024",
  },
  {
    id: "LN-2024-005",
    customer: "Vikram Singh",
    initials: "VS",
    type: "Vehicle Loan",
    amount: "₹3,00,000",
    disbursed: "₹0",
    emi: "₹7,200",
    tenure: "60 months",
    interest: "10.5%",
    status: "rejected",
    nextEmi: "-",
    startDate: "-",
  },
];

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  closed: "bg-muted text-muted-foreground border-muted",
};

export default function Loans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && loan.status === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Loan Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and track all loan applications and disbursements.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Create Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Loan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c001">Rajesh Kumar</SelectItem>
                      <SelectItem value="c002">Priya Sharma</SelectItem>
                      <SelectItem value="c003">Amit Patel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Loan</SelectItem>
                      <SelectItem value="business">Business Loan</SelectItem>
                      <SelectItem value="home">Home Loan</SelectItem>
                      <SelectItem value="vehicle">Vehicle Loan</SelectItem>
                      <SelectItem value="education">Education Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loan Amount</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="5,00,000" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Interest Rate (%)</Label>
                    <Input placeholder="12" type="number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tenure (months)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Processing Fee (%)</Label>
                    <Input placeholder="2" type="number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Input placeholder="Enter loan purpose" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={() => setIsCreateDialogOpen(false)}>
                    Create Loan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All Loans</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search loans by customer name or loan ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
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

        {/* Loans Table */}
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Loan ID</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">EMI</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Next EMI</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-accent">{loan.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {loan.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{loan.customer}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{loan.type}</TableCell>
                  <TableCell className="font-semibold text-foreground">{loan.amount}</TableCell>
                  <TableCell className="text-foreground">{loan.emi}/mo</TableCell>
                  <TableCell>
                    <Badge className={statusStyles[loan.status as keyof typeof statusStyles]}>
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {loan.nextEmi}
                    </div>
                  </TableCell>
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
                          <FileText className="w-4 h-4 mr-2" />
                          EMI Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Documents
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
