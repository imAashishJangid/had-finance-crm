// src/pages/PersonalLending.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Eye,
  Calendar,
  IndianRupee,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { API_URL } from "@/api/config";
import axios from "axios";

interface Transaction {
  _id: string;
  type: "lend" | "borrow";
  personName: string;
  personPhone: string;
  personAddress: string;
  amount: number;
  interestRate: number;
  interestType: "simple" | "compound" | "fixed";
  duration: number;
  durationType: "days" | "months" | "years";
  transactionDate: string;
  dueDate: string;
  returnDate: string;
  totalInterest: number;
  totalPayable: number;
  totalPaid: number;
  remainingAmount: number;
  status: "pending" | "partially_paid" | "completed" | "overdue" | "defaulted" | "active";
  payments: Array<{
    amount: number;
    date: string;
    note: string;
  }>;
  purpose: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const statusStyles = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  partially_paid: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-600 text-white border-green-700",
  overdue: "bg-red-100 text-red-700 border-red-200",
  defaulted: "bg-red-200 text-red-800 border-red-300",
};

const statusIcons = {
  active: CheckCircle,
  pending: Clock,
  partially_paid: Clock,
  completed: CheckCircle,
  overdue: AlertTriangle,
  defaulted: AlertTriangle,
};

// Status dropdown options
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
  { value: "defaulted", label: "Defaulted" },
];

export default function PersonalLending() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [summary, setSummary] = useState({
    totalLent: 0,
    totalBorrowed: 0,
    totalInterestEarned: 0,
    totalInterestPaid: 0,
    netBalance: 0,
    totalTransactions: 0,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "lend",
    personName: "",
    personPhone: "",
    amount: "",
    interestRate: "0",
    interestType: "simple",
    duration: "",
    durationType: "months",
    startDate: "",
    purpose: "",
    notes: "",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/personal-transactions`);
      if (response.data.success) {
        setTransactions(response.data.data);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      if (!newTransaction.personName || !newTransaction.amount || !newTransaction.duration || !newTransaction.startDate) {
        toast.error("Please fill all required fields");
        return;
      }

      // Calculate due date based on start date + duration
      const startDate = new Date(newTransaction.startDate);
      const durationMonths = parseInt(newTransaction.duration);
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + durationMonths);

      const payload = {
        type: newTransaction.type,
        personName: newTransaction.personName,
        personPhone: newTransaction.personPhone || "",
        amount: parseFloat(newTransaction.amount),
        interestRate: parseFloat(newTransaction.interestRate) || 0,
        interestType: newTransaction.interestType,
        duration: parseInt(newTransaction.duration),
        durationType: newTransaction.durationType,
        transactionDate: newTransaction.startDate,
        dueDate: dueDate.toISOString().split("T")[0],
        purpose: newTransaction.purpose || "",
        notes: newTransaction.notes || "",
        status: "active",
      };

      console.log("📤 Sending payload:", payload);

      const response = await axios.post(`${API_URL}/api/personal-transactions`, payload);
      
      if (response.data.success) {
        setIsAddDialogOpen(false);
        fetchTransactions();
        setNewTransaction({
          type: "lend",
          personName: "",
          personPhone: "",
          amount: "",
          interestRate: "0",
          interestType: "simple",
          duration: "",
          durationType: "months",
          startDate: "",
          purpose: "",
          notes: "",
        });
        toast.success("✅ Transaction added successfully!");
      }
    } catch (error: any) {
      console.error("❌ Error adding transaction:", error);
      toast.error(`❌ ${error.response?.data?.message || "Something went wrong"}`);
    }
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

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.personPhone.includes(searchQuery);
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && t.type === activeTab;
  });

  const totalLent = transactions.filter(t => t.type === "lend").reduce((sum, t) => sum + t.amount, 0);
  const totalBorrowed = transactions.filter(t => t.type === "borrow").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalLent - totalBorrowed;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Personal Lending</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track all your personal lendings and borrowings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchTransactions} size="sm" className="h-9">
              <Users className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <Plus className="w-4 h-4 mr-1" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value as "lend" | "borrow" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lend">Lend (I gave)</SelectItem>
                        <SelectItem value="borrow">Borrow (I took)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Person Name *</Label>
                      <Input
                        placeholder="Name"
                        value={newTransaction.personName}
                        onChange={(e) => setNewTransaction({ ...newTransaction, personName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="Phone"
                        value={newTransaction.personPhone}
                        onChange={(e) => setNewTransaction({ ...newTransaction, personPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          type="number"
                          placeholder="50000"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        placeholder="12"
                        value={newTransaction.interestRate}
                        onChange={(e) => setNewTransaction({ ...newTransaction, interestRate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (Months) *</Label>
                      <Input
                        type="number"
                        placeholder="12"
                        value={newTransaction.duration}
                        onChange={(e) => setNewTransaction({ ...newTransaction, duration: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Loan Start Date *</Label>
                      <Input
                        type="date"
                        value={newTransaction.startDate}
                        onChange={(e) => setNewTransaction({ ...newTransaction, startDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose / Notes</Label>
                    <Input
                      placeholder="Purpose of transaction"
                      value={newTransaction.purpose}
                      onChange={(e) => setNewTransaction({ ...newTransaction, purpose: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddTransaction}>Add Transaction</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">Total Lent</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalLent)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">Total Borrowed</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalBorrowed)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">Net Balance</p>
            <p className={`text-lg font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-lg font-bold">{transactions.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 w-full sm:w-auto flex-wrap h-auto p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
              All ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="lend" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
              Lent ({transactions.filter(t => t.type === "lend").length})
            </TabsTrigger>
            <TabsTrigger value="borrow" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
              Borrowed ({transactions.filter(t => t.type === "borrow").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-9 h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No transactions found</div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold text-xs">Person</TableHead>
                    <TableHead className="font-semibold text-xs hidden sm:table-cell">Type</TableHead>
                    <TableHead className="font-semibold text-xs hidden md:table-cell">Start Date</TableHead>
                    <TableHead className="font-semibold text-xs">Amount</TableHead>
                    <TableHead className="font-semibold text-xs hidden lg:table-cell">Interest</TableHead>
                    <TableHead className="font-semibold text-xs hidden sm:table-cell">Total Payable</TableHead>
                    <TableHead className="font-semibold text-xs hidden sm:table-cell">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right hidden sm:table-cell">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const StatusIcon = statusIcons[transaction.status as keyof typeof statusIcons] || statusIcons.pending;
                    return (
                      <TableRow 
                        key={transaction._id} 
                        className="hover:bg-muted/20 cursor-pointer transition-colors" 
                        onClick={() => navigate(`/personal-lending/${transaction._id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{transaction.personName}</p>
                            <p className="text-xs text-muted-foreground">{transaction.personPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={transaction.type === "lend" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                            {transaction.type === "lend" ? "Lent" : "Borrowed"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm hidden md:table-cell whitespace-nowrap">{formatDate(transaction.transactionDate)}</TableCell>
                        <TableCell className="font-semibold text-sm">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="text-sm hidden lg:table-cell text-green-600">{formatCurrency(transaction.totalInterest)}</TableCell>
                        <TableCell className="font-bold text-sm hidden sm:table-cell text-purple-600">{formatCurrency(transaction.totalPayable)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={statusStyles[transaction.status as keyof typeof statusStyles] || statusStyles.pending}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {transaction.status === "active" ? "Active" : transaction.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/personal-lending/${transaction._id}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}