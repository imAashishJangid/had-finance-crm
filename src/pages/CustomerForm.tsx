import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/config/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Calculator, IndianRupee, Percent, Calendar } from "lucide-react";

export default function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const location = useLocation();
  const stateCustomer = location.state?.customer;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    idType: "",
    idNumber: "",
    loanAmount: "",
    interestRate: "",
    term: "months",
    months: "",
    years: "",
    notes: "",
    joinDate: new Date().toISOString().split("T")[0],
  });

  const [originalData, setOriginalData] = useState<any>(null);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate interest and total amount
  const calculation = useMemo(() => {
    const amount = parseFloat(formData.loanAmount) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const months = parseInt(formData.months) || 0;
    const years = parseInt(formData.years) || 0;
    
    let totalMonths = 0;
    if (formData.term === "months") {
      totalMonths = months;
    } else {
      totalMonths = years * 12;
    }
    
    // Direct interest calculation
    const interestAmount = (amount * rate) / 100;
    const monthlyInterest = interestAmount;
    const totalInterest = interestAmount * totalMonths;
    const totalAmount = amount + totalInterest;
    
    // Calculate due dates
    const dueDates = [];
    const joinDate = new Date(formData.joinDate);
    
    for (let i = 1; i <= totalMonths; i++) {
      const dueDate = new Date(joinDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      dueDates.push(dueDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }));
    }
    
    return {
      interestAmount,
      monthlyInterest,
      totalInterest,
      totalAmount,
      totalMonths,
      monthlyPayment: totalAmount / totalMonths,
      dueDates: dueDates.slice(0, 5), // Show first 5 due dates
    };
  }, [formData.loanAmount, formData.interestRate, formData.months, formData.years, formData.term, formData.joinDate]);

  useEffect(() => {
    if (isEditMode && stateCustomer) {
      const d = stateCustomer;
      const preparedData = {
        name: d.name,
        phone: String(d.phone).trim(),
        address: d.address || "",
        idType: d.idType,
        idNumber: String(d.idNumber).trim(),
        loanAmount: d.loanAmount.toString(),
        interestRate: d.interestRate.toString(),
        term: d.term,
        months: d.months?.toString() || "",
        years: d.years?.toString() || "",
        notes: d.notes || "",
        joinDate: d.joinDate
          ? d.joinDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
      };
      setFormData(preparedData);
      setOriginalData(preparedData);
    } else if (isEditMode) {
      api.get(`/api/loans/${id}`).then((res) => {
        const d = res.data.data;
        const preparedData = {
          name: d.name,
          phone: String(d.phone).trim(),
          address: d.address || "",
          idType: d.idType,
          idNumber: String(d.idNumber).trim(),
          loanAmount: d.loanAmount.toString(),
          interestRate: d.interestRate.toString(),
          term: d.term,
          months: d.months?.toString() || "",
          years: d.years?.toString() || "",
          notes: d.notes || "",
          joinDate: d.joinDate
            ? d.joinDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
        };
        setFormData(preparedData);
        setOriginalData(preparedData);
      });
    }
  }, [id, stateCustomer]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value === "") return;
        if (
          isEditMode &&
          originalData &&
          (key === "phone" || key === "idNumber") &&
          String(value).trim() === String(originalData[key]).trim()
        ) {
          return;
        }
        data.append(key, String(value).trim());
      });
      if (image) {
        data.append("customerImage", image);
      }
      const response = isEditMode
        ? await api.put(`/api/loans/${id}`, data)
        : await api.post("/api/loans", data);
      toast.success(
        isEditMode
          ? "Customer & loan updated successfully!"
          : "Customer & loan added successfully!"
      );
      navigate("/customers");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {isEditMode ? "Edit Customer & Loan" : "Add New Customer & Loan"}
          </h1>
          <Badge variant="outline" className="text-sm">
            Direct Interest Method
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-base md:text-lg font-semibold">Customer Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter full name"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Phone Number *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm">Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Enter complete address"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">ID Type *</Label>
                    <Select
                      value={formData.idType}
                      onValueChange={(val) => handleChange("idType", val)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                        <SelectItem value="PAN">PAN Card</SelectItem>
                        <SelectItem value="Voter ID">Voter ID</SelectItem>
                        <SelectItem value="Driving License">Driving License</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">ID Number *</Label>
                    <Input
                      value={formData.idNumber}
                      onChange={(e) => handleChange("idNumber", e.target.value)}
                      placeholder="Enter ID number"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Join Date *</Label>
                    <Input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleChange("joinDate", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Customer Photo</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
                        }}
                        className="h-10"
                      />
                      {image && (
                        <div className="flex-shrink-0">
                          <img
                            src={URL.createObjectURL(image)}
                            alt="preview"
                            className="h-16 w-16 rounded-lg object-cover border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Information */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-base md:text-lg font-semibold">Loan Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Loan Amount (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.loanAmount}
                      onChange={(e) => handleChange("loanAmount", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Interest Rate (%) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.interestRate}
                      onChange={(e) => handleChange("interestRate", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Term Type *</Label>
                    <Select
                      value={formData.term}
                      onValueChange={(val) => handleChange("term", val)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select term type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.term === "months" ? (
                    <div className="space-y-2">
                      <Label className="text-sm">Duration (Months) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.months}
                        onChange={(e) => handleChange("months", e.target.value)}
                        className="h-10"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm">Duration (Years) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.years}
                        onChange={(e) => handleChange("years", e.target.value)}
                        className="h-10"
                      />
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm">Notes</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Any additional notes"
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calculation Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-base md:text-lg font-semibold">Interest Calculation</h2>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Principal Amount:</span>
                    <span className="font-semibold text-lg">
                      ₹{parseFloat(formData.loanAmount)?.toLocaleString('en-IN') || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Interest Rate:</span>
                    <span className="font-semibold">{formData.interestRate || "0"}%</span>
                  </div>
                  <Separator />
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Interest:</span>
                      <span className="font-bold text-yellow-700">
                        ₹{calculation.monthlyInterest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      (Principal × Rate) / 100 = {formData.loanAmount || "0"} × {formData.interestRate || "0"}% = ₹{calculation.monthlyInterest.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Months:</span>
                    <span className="font-semibold">{calculation.totalMonths}</span>
                  </div>
                  <Separator />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Interest:</span>
                      <span className="font-bold text-blue-700">
                        ₹{calculation.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      (Monthly Interest × Months) = {calculation.monthlyInterest.toFixed(2)} × {calculation.totalMonths}
                    </p>
                  </div>
                  <Separator />
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Payable:</span>
                      <span className="font-bold text-green-700 text-lg">
                        ₹{calculation.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      (Principal + Total Interest) = {formData.loanAmount || "0"} + {calculation.totalInterest.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Payment:</span>
                      <span className="font-bold text-purple-700">
                        ₹{calculation.monthlyPayment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      (Total Payable ÷ Months) = {calculation.totalAmount.toFixed(2)} ÷ {calculation.totalMonths}
                    </p>
                  </div>
                </div>

                {/* Due Dates Preview */}
                {calculation.totalMonths > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Upcoming Due Dates:</h3>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {calculation.dueDates.map((date, index) => (
                          <div key={index} className="flex justify-between items-center text-sm py-1 border-b last:border-0">
                            <span className="text-muted-foreground">Month {index + 1}:</span>
                            <span className="font-medium">{date}</span>
                          </div>
                        ))}
                        {calculation.totalMonths > 5 && (
                          <div className="text-xs text-muted-foreground text-center pt-1">
                            +{calculation.totalMonths - 5} more months
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Example Calculation */}
                <Separator className="my-4" />
                 
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={handleCancel} disabled={loading} className="h-10">
                Cancel
              </Button>
              <Button variant="hero" onClick={handleSubmit} disabled={loading} className="h-10">
                {loading ? "Processing..." : isEditMode ? "Update Loan" : "Create Loan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}