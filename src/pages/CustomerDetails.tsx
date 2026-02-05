import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Phone,
  MapPin,
  Calendar,
  FileText,
  IndianRupee,
  Percent,
  Clock,
  User,
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Smartphone,
  DollarSign,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Printer,
  FileDigit,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const statusConfig = {
  active: {
    color: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: <CheckCircle className="w-4 h-4" />
  },
  closed: {
    color: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: <CheckCircle className="w-4 h-4" />
  },
  pending: {
    color: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: <Clock className="w-4 h-4" />
  },
  defaulted: {
    color: "bg-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: <AlertTriangle className="w-4 h-4" />
  }
};

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/api/loans/${id}`);
      setCustomer(res.data.data);
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast.error("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await api.put(`/api/loans/${id}`, {
        status: newStatus,
      });
      setCustomer(res.data.data);
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/api/loans/${id}`);
      toast.success("Customer deleted successfully!");
      navigate("/customers");
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer. Try again!");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="w-full px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-dashed">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-6">
                    <User className="w-10 h-10 text-rose-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Customer Not Found</h3>
                  <p className="text-muted-foreground mb-6">
                    The customer you're looking for doesn't exist or has been removed.
                  </p>
                  <Button onClick={() => navigate("/customers")} variant="default">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Customers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusConfig[customer.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <DashboardLayout>
      <div className="w-full px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Top Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                    {customer.customerImage?.url ? (
                      <img
                        src={customer.customerImage.url}
                        alt={customer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${status.color}`} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{customer.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">{customer.phone}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">ID: {customer._id?.slice(-6)}</span>
                  </div>
                </div>
              </div>
              
               
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Loan Amount</p>
                      <p className="text-xl font-bold">{formatCurrency(customer.loanAmount)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="text-xl font-bold">{customer.interestRate}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Percent className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly EMI</p>
                      <p className="text-xl font-bold">{formatCurrency(customer.monthlyInstallment)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-violet-100">
                      <CreditCard className="w-5 h-5 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${status.bg} ${status.text} ${status.border} gap-1`}
                        >
                          {status.icon}
                          <span className="capitalize">{customer.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                          Mark Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("closed")}>
                          <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                          Mark Closed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
                          <Clock className="w-4 h-4 mr-2 text-amber-600" />
                          Mark Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("defaulted")}>
                          <AlertTriangle className="w-4 h-4 mr-2 text-rose-600" />
                          Mark Defaulted
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-md bg-slate-100">
                            <Smartphone className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Phone Number</p>
                            <p className="font-medium">{customer.phone || "Not provided"}</p>
                          </div>
                        </div>
                        {customer.phone && (
                          <a href={`tel:${customer.phone}`}>
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              <Phone className="w-4 h-4 mr-2" />
                              Call Customer
                            </Button>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-slate-100">
                          <MapPin className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">{customer.address || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-slate-100">
                          <Calendar className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Join Date</p>
                          <p className="font-medium">{formatDate(customer.joinDate)}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-md bg-slate-100">
                            <FileDigit className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ID Type</p>
                            <Badge variant="secondary">{customer.idType}</Badge>
                          </div>
                        </div>
                        <p className="text-sm font-mono bg-slate-100 p-2 rounded">{customer.idNumber}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loan Details Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Loan Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-slate-50 border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Principal Amount</span>
                          <span className="font-semibold">{formatCurrency(customer.loanAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Interest Rate</span>
                          <span className="font-semibold">{customer.interestRate}%</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Term Type</span>
                          <Badge variant="outline">{customer.term}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="font-semibold">
                            {customer.term === "months" 
                              ? `${customer.months} Months` 
                              : `${customer.years} Years`
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-sm text-emerald-700">Total Payable</p>
                            <p className="text-2xl font-bold text-emerald-900">{formatCurrency(customer.totalPayable)}</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-emerald-600" />
                        </div>
                        <Progress 
                          value={(customer.loanAmount / customer.totalPayable) * 100} 
                          className="h-2 bg-emerald-200"
                        />
                        <div className="flex justify-between text-xs text-emerald-700 mt-2">
                          <span>Principal</span>
                          <span>Total</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Interest Amount</p>
                          <p className="font-bold text-blue-900">
                            {formatCurrency(customer.totalPayable - customer.loanAmount)}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                          <p className="text-xs text-violet-700 mb-1">Monthly EMI</p>
                          <p className="font-bold text-violet-900">{formatCurrency(customer.monthlyInstallment)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Actions & Info */}
            <div className="space-y-6">
              {/* Actions Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="default" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/customer-form/${id}`)}
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit Customer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4 mr-3" />
                    Print Details
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Customer
                  </Button>
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.notes ? (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-muted-foreground">No notes added</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Account Created</p>
                        <p className="text-xs text-muted-foreground">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Last Updated</p>
                        <p className="text-xs text-muted-foreground">{formatDate(customer.updatedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Current Status</p>
                        <div className="mt-1">
                          <Badge 
                            variant="outline" 
                            className={`${status.bg} ${status.text} ${status.border} gap-1 text-xs`}
                          >
                            {status.icon}
                            <span className="capitalize">{customer.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This will permanently delete <span className="font-semibold">{customer.name}</span> and all associated loan data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Deleting...
                </>
              ) : (
                "Delete Customer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}