import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Printer,
  FileDigit,
  TrendingUp,
  Target,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  active: {
    label: "Active",
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-200",
    icon: <CheckCircle className="w-4 h-4" />
  },
  closed: {
    label: "Closed",
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
    icon: <CheckCircle className="w-4 h-4" />
  },
  pending: {
    label: "Pending",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-200",
    icon: <Clock className="w-4 h-4" />
  },
  defaulted: {
    label: "Defaulted",
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200",
    icon: <AlertTriangle className="w-4 h-4" />
  }
};

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Direct Interest Calculation Function
  const calculateDirectInterest = (customer: any) => {
    if (!customer) return null;
    
    const principal = customer.loanAmount;
    const rate = customer.interestRate;

    // Calculate total months
    let totalMonths = 0;
    if (customer.term === "months") {
      totalMonths = customer.months || 0;
    } else {
      totalMonths = (customer.years || 0) * 12;
    }

    // Direct Interest Calculation Formula:
    // Monthly Interest = (Principal × Rate) / 100
    const monthlyInterest = (principal * rate) / 100;

    // Total Interest = Monthly Interest × Total Months
    const totalInterest = monthlyInterest * totalMonths;

    // Total Payable = Principal + Total Interest
    const totalPayable = principal + totalInterest;

    // Monthly Installment = Total Payable / Total Months
    const monthlyInstallment = totalMonths > 0 ? totalPayable / totalMonths : 0;

    return {
      totalPayable,
      monthlyInstallment,
      totalInterest,
      totalMonths,
      monthlyInterest,
    };
  };

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/loans/${id}`);
      
      if (res.data.success) {
        setCustomer(res.data.data);
      } else {
        setError("Failed to load customer data");
      }
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      setError(error.response?.data?.message || "Failed to load customer details");
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
      if (res.data.success) {
        setCustomer(res.data.data);
        toast.success("Status updated successfully!");
      }
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

  const getStatusConfig = () => {
    if (!customer?.status) return statusConfig.pending;
    return statusConfig[customer.status as keyof typeof statusConfig] || statusConfig.pending;
  };

  // Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              
              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-4 w-20 mb-2" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-lg" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Content Skeleton */}
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

  // Error State
  if (error || !customer) {
    return (
      <DashboardLayout>
        <div className="w-full px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Customer Not Found</h3>
                  <p className="text-gray-600 mb-6">
                    {error || "The customer you're looking for doesn't exist or has been removed."}
                  </p>
                  <Button 
                    onClick={() => navigate("/customers")} 
                    variant="default"
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
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

  const status = getStatusConfig();
  const calc = calculateDirectInterest(customer);

  return (
    <DashboardLayout>
      <div className="w-full px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
           

          {/* Customer Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200">
                  {customer.customerImage?.url ? (
                    <img
                      src={customer.customerImage.url}
                      alt={customer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                  {customer.idNumber && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      <Badge variant="outline" className="text-xs">
                        {customer.idType}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/customer-form/${id}`, { state: { customer } })}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Quick Stats with Status Dropdown in Status Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(customer.loanAmount)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50">
                    <IndianRupee className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
                    <p className="text-xl font-bold text-gray-900">{customer.interestRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">Direct Interest</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50">
                    <Percent className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(calc?.monthlyInstallment || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(calc?.monthlyInterest || 0)} monthly interest
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card with Dropdown */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className={`${status.bg} ${status.color} ${status.border} h-8 px-3 gap-2 hover:bg-opacity-80`}
                          >
                            {status.icon}
                            <span className="font-medium capitalize">{customer.status}</span>
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange("active")}
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Active
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange("closed")}
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            Closed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange("pending")}
                            className="gap-2"
                          >
                            <Clock className="w-4 h-4 text-yellow-600" />
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange("defaulted")}
                            className="gap-2"
                          >
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            Defaulted
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Target className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-md bg-gray-100">
                            <Phone className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
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

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-md bg-gray-100">
                            <MapPin className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{customer.address || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-md bg-gray-100">
                            <Calendar className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Join Date</p>
                            <p className="font-medium">{formatDate(customer.joinDate)}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-md bg-gray-100">
                            <FileDigit className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ID Information</p>
                            <div className="mt-1">
                              <Badge variant="secondary" className="mr-2">
                                {customer.idType}
                              </Badge>
                              <span className="text-sm font-mono">{customer.idNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loan Details Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    Loan Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-gray-50">
                        <h4 className="font-medium mb-3 text-gray-700">Loan Terms</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Principal Amount</span>
                            <span className="font-semibold">{formatCurrency(customer.loanAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Interest Rate</span>
                            <span className="font-semibold">{customer.interestRate}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Term Type</span>
                            <Badge variant="outline">{customer.term}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Duration</span>
                            <span className="font-semibold">
                              {customer.term === "months" 
                                ? `${customer.months || 0} Months` 
                                : `${customer.years || 0} Years`
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Monthly Interest</span>
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(calc?.monthlyInterest || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-green-700 font-medium">Total Payable (Direct Interest)</p>
                            <p className="text-2xl font-bold text-green-900">
                              {formatCurrency(calc?.totalPayable || 0)}
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Principal Amount</span>
                            <span className="font-medium">{formatCurrency(customer.loanAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Total Interest</span>
                            <span className="font-medium">
                              {formatCurrency(calc?.totalInterest || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Monthly EMI</span>
                            <span className="font-medium">
                              {formatCurrency(calc?.monthlyInstallment || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                          <p className="text-xs text-blue-700 font-medium mb-1">Monthly EMI</p>
                          <p className="text-lg font-bold text-blue-900">
                            {formatCurrency(calc?.monthlyInstallment || 0)}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border border-purple-200 bg-purple-50">
                          <p className="text-xs text-purple-700 font-medium mb-1">Total Interest</p>
                          <p className="text-lg font-bold text-purple-900">
                            {formatCurrency(calc?.totalInterest || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">Account Created</p>
                        <p className="text-xs text-gray-500">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">Last Updated</p>
                        <p className="text-xs text-gray-500">{formatDate(customer.updatedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">Loan Start Date</p>
                        <p className="text-xs text-gray-500">{formatDate(customer.joinDate)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.notes ? (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No notes added</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate(`/customer-form/${id}`, { state: { customer } })}
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        Add Notes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interest Calculation Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Percent className="w-5 h-5 text-gray-600" />
                    Interest Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Interest</span>
                      <span className="font-semibold">
                        = {formatCurrency(customer.loanAmount)} × {customer.interestRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600"></span>
                      <span className="font-semibold text-blue-600">
                        = {formatCurrency(calc?.monthlyInterest || 0)}
                      </span>
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Interest</span>
                        <span className="font-semibold">
                          = {formatCurrency(calc?.monthlyInterest || 0)} × {calc?.totalMonths || 0} months
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600"></span>
                        <span className="font-semibold text-green-600">
                          = {formatCurrency(calc?.totalInterest || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Payable</span>
                        <span className="font-semibold">
                          = {formatCurrency(customer.loanAmount)} + {formatCurrency(calc?.totalInterest || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600"></span>
                        <span className="font-semibold text-green-600 text-lg">
                          = {formatCurrency(calc?.totalPayable || 0)}
                        </span>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              This will permanently delete <span className="font-semibold">{customer.name}</span> and all associated loan data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}