// src/pages/PersonalLendingDetail.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  User,
  Phone,
  Wallet,
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Clock as ClockIcon,
} from "lucide-react";
import { API_URL } from "@/api/config";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  status: "active" | "pending" | "partially_paid" | "completed" | "overdue" | "defaulted";
  payments: Array<{
    _id?: string;
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

export default function PersonalLendingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    personName: "",
    personPhone: "",
    amount: "",
    interestRate: "",
    duration: "",
    startDate: "",
    status: "active",
    purpose: "",
    notes: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: "",
    note: "",
  });

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  // Calculate loan duration in days
  const getLoanDuration = () => {
    if (!transaction) return null;
    
    const startDate = new Date(transaction.transactionDate);
    const endDate = transaction.status === "completed" && transaction.returnDate
      ? new Date(transaction.returnDate)
      : new Date();
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/personal-transactions/${id}`
      );
      if (response.data.success) {
        const data = response.data.data;
        setTransaction(data);
        setEditForm({
          personName: data.personName,
          personPhone: data.personPhone || "",
          amount: data.amount.toString(),
          interestRate: data.interestRate.toString(),
          duration: data.duration.toString(),
          startDate: data.transactionDate.split("T")[0],
          status: data.status || "active",
          purpose: data.purpose || "",
          notes: data.notes || "",
        });
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      toast.error("Failed to fetch transaction details");
      navigate("/personal-lending");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      // Calculate due date based on start date + duration
      const startDate = new Date(editForm.startDate);
      const durationMonths = parseInt(editForm.duration);
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + durationMonths);

      const payload = {
        personName: editForm.personName,
        personPhone: editForm.personPhone,
        amount: parseFloat(editForm.amount),
        interestRate: parseFloat(editForm.interestRate),
        duration: parseInt(editForm.duration),
        durationType: "months",
        transactionDate: editForm.startDate,
        dueDate: dueDate.toISOString().split("T")[0],
        status: editForm.status,
        purpose: editForm.purpose,
        notes: editForm.notes,
      };

      console.log("📤 Updating payload:", payload);

      const response = await axios.put(
        `${API_URL}/api/personal-transactions/${id}`,
        payload
      );
      if (response.data.success) {
        setIsEditDialogOpen(false);
        fetchTransaction();
        toast.success("✅ Transaction updated successfully!");
      }
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      toast.error(`❌ ${error.response?.data?.message || "Something went wrong"}`);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/personal-transactions/${id}`
      );
      if (response.data.success) {
        setIsDeleteDialogOpen(false);
        toast.success("✅ Transaction deleted successfully!");
        navigate("/personal-lending");
      }
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      toast.error(`❌ ${error.response?.data?.message || "Something went wrong"}`);
    }
  };

  const handleAddPayment = async () => {
    try {
      if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const payload = {
        amount: parseFloat(paymentForm.amount),
        date: paymentForm.date || new Date().toISOString().split("T")[0],
        note: paymentForm.note || "",
      };

      const response = await axios.post(
        `${API_URL}/api/personal-transactions/${id}/payment`,
        payload
      );
      if (response.data.success) {
        setIsPaymentDialogOpen(false);
        setPaymentForm({ amount: "", date: "", note: "" });
        fetchTransaction();
        toast.success("✅ Payment added successfully!");
      }
    } catch (error: any) {
      console.error("Error adding payment:", error);
      toast.error(`❌ ${error.response?.data?.message || "Something went wrong"}`);
    }
  };

  const exportPDF = () => {
    if (!transaction) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFillColor(22, 160, 133);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Receipt", 14, 13);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(14);
    doc.text("Transaction Details", 14, y);
    y += 10;

    const details = [
      ["Transaction ID", transaction._id],
      ["Type", transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)],
      ["Person Name", transaction.personName],
      ["Phone", transaction.personPhone || "N/A"],
      ["Amount", `₹${transaction.amount.toLocaleString("en-IN")}`],
      ["Interest Rate", `${transaction.interestRate}%`],
      ["Duration", `${transaction.duration} ${transaction.durationType}`],
      ["Total Interest", `₹${transaction.totalInterest.toLocaleString("en-IN")}`],
      ["Total Payable", `₹${transaction.totalPayable.toLocaleString("en-IN")}`],
      ["Total Paid", `₹${transaction.totalPaid.toLocaleString("en-IN")}`],
      ["Remaining", `₹${transaction.remainingAmount.toLocaleString("en-IN")}`],
      ["Status", transaction.status === "active" ? "Active" : transaction.status.replace("_", " ")],
      ["Start Date", new Date(transaction.transactionDate).toLocaleDateString("en-IN")],
      ["Due Date", new Date(transaction.dueDate).toLocaleDateString("en-IN")],
      ["Purpose", transaction.purpose || "N/A"],
      ["Notes", transaction.notes || "N/A"],
    ];

    autoTable(doc, {
      body: details,
      startY: y,
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 100 },
      },
      theme: "plain",
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    if (transaction.payments.length > 0) {
      doc.setFontSize(14);
      doc.text("Payment History", 14, y);
      y += 10;

      const paymentData = transaction.payments.map((p) => [
        new Date(p.date).toLocaleDateString("en-IN"),
        `₹${p.amount.toLocaleString("en-IN")}`,
        p.note || "-",
      ]);

      autoTable(doc, {
        head: [["Date", "Amount", "Note"]],
        body: paymentData,
        startY: y,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      });
    }

    doc.save(`Transaction_${transaction._id.slice(-6)}.pdf`);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading transaction...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Transaction not found</p>
          <Button onClick={() => navigate("/personal-lending")} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const StatusIcon = statusIcons[transaction.status as keyof typeof statusIcons] || statusIcons.pending;
  const statusKey = transaction.status as keyof typeof statusStyles;
  const loanDuration = getLoanDuration();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/personal-lending")}
              className="h-9 w-9"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Transaction Details</h1>
              <p className="text-sm text-muted-foreground">
                #{transaction._id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportPDF}>
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </div>

        {/* Status & Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Type</p>
              <Badge
                className={transaction.type === "lend" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
              >
                {transaction.type === "lend" ? "Lent" : "Borrowed"}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={statusStyles[statusKey] || statusStyles.pending}>
                <StatusIcon className="w-3.5 h-3.5 mr-1" />
                {transaction.status === "active" ? "Active" : transaction.status.replace("_", " ")}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-lg font-bold">{formatCurrency(transaction.amount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={`text-lg font-bold ${transaction.remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(transaction.remainingAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Loan Duration</p>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                <p className="text-lg font-bold text-blue-600">
                  {loanDuration !== null ? `${loanDuration} days` : "—"}
                </p>
              </div>
              {transaction.status === "completed" && transaction.returnDate && (
                <p className="text-xs text-muted-foreground">
                  Closed on {formatDate(transaction.returnDate)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Person Details */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Person Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{transaction.personName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{transaction.personPhone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(transaction.transactionDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(transaction.dueDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Middle - Loan Details */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Principal</p>
                  <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-medium">{transaction.interestRate}% ({transaction.interestType})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{transaction.duration} {transaction.durationType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="font-medium text-green-600">{formatCurrency(transaction.totalInterest)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Payable</p>
                  <p className="font-medium text-purple-600">{formatCurrency(transaction.totalPayable)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right - Payment Summary */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
              <Button size="sm" onClick={() => setIsPaymentDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Payment
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(transaction.totalPaid)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-lg font-bold ${transaction.remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(transaction.remainingAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payments Made</p>
                <p className="text-lg font-bold">{transaction.payments.length}</p>
              </div>
              {transaction.purpose && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="text-sm">{transaction.purpose}</p>
                </div>
              )}
              {transaction.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History Table */}
        {transaction.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.payments.map((payment, index) => (
                    <TableRow key={payment._id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{payment.note || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Person Name *</Label>
                  <Input
                    value={editForm.personName}
                    onChange={(e) => setEditForm({ ...editForm, personName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editForm.personPhone}
                    onChange={(e) => setEditForm({ ...editForm, personPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    value={editForm.interestRate}
                    onChange={(e) => setEditForm({ ...editForm, interestRate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (Months) *</Label>
                  <Input
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input
                  value={editForm.purpose}
                  onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Transaction</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  placeholder="Enter payment amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Input
                  placeholder="Payment note"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Remaining: {formatCurrency(transaction.remainingAmount)}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPayment}>Add Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}