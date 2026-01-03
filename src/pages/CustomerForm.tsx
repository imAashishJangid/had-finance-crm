import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/config/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomerForm() {
  const navigate = useNavigate();

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
  });

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Frontend validation
    const requiredFields = [
      "name",
      "phone",
      "idType",
      "idNumber",
      "loanAmount",
      "interestRate",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        alert(`Please fill the ${field} field`);
        return;
      }
    }

    // Validate term duration
    if (formData.term === "months" && !formData.months) {
      alert("Please enter number of months");
      return;
    }
    
    if (formData.term === "years" && !formData.years) {
      alert("Please enter number of years");
      return;
    }

    // Validate loan amount and interest rate
    const loanAmount = parseFloat(formData.loanAmount);
    const interestRate = parseFloat(formData.interestRate);
    
    if (isNaN(loanAmount) || loanAmount <= 0) {
      alert("Loan amount must be a positive number");
      return;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
      alert("Interest rate must be a positive number");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          data.append(key, value);
        }
      });

      // Add joinDate as current date
      data.append("joinDate", new Date().toISOString());

      if (image) {
        data.append("customerImage", image);
      }

      // Send to correct endpoint
      const response = await api.post("/api/loans", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Customer/Loan added:", response.data);
      alert("Customer and loan added successfully!");
      navigate("/customers");
    } catch (error: any) {
      console.error("Error adding customer:", error);
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes("ID number already exists")) {
        alert("This ID number is already registered. Please use a different ID number.");
      } else {
        alert("Failed to add customer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          Add New Customer & Loan
        </h1>

        {/* Customer Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Customer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                className="border-gray-400 focus:border-gray-600"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                className="border-gray-400 focus:border-gray-600"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Input
                className="border-gray-400 focus:border-gray-600"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter complete address"
              />
            </div>

            <div className="space-y-2">
              <Label>ID Type *</Label>
              <Select
                value={formData.idType}
                onValueChange={(val) => handleChange("idType", val)}
                required
              >
                <SelectTrigger className="border-gray-400 focus:border-gray-600">
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
              <Label>ID Number *</Label>
              <Input
                className="border-gray-400 focus:border-gray-600"
                value={formData.idNumber}
                onChange={(e) => handleChange("idNumber", e.target.value)}
                placeholder="Enter ID number"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Customer Photo</Label>
              <Input
                type="file"
                accept="image/*"
                className="border-gray-400 focus:border-gray-600"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImage(e.target.files[0]);
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Upload a clear photo of the customer (optional)
              </p>
              
              {image && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="h-32 w-32 rounded-lg object-cover border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loan Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Loan Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loan Amount (₹) *</Label>
              <Input
                type="number"
                min="0"
                className="border-gray-400 focus:border-gray-600"
                value={formData.loanAmount}
                onChange={(e) => handleChange("loanAmount", e.target.value)}
                placeholder="Enter loan amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Interest Rate (%) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="border-gray-400 focus:border-gray-600"
                value={formData.interestRate}
                onChange={(e) => handleChange("interestRate", e.target.value)}
                placeholder="Enter interest rate"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Term Type *</Label>
              <Select
                value={formData.term}
                onValueChange={(val) => handleChange("term", val)}
                required
              >
                <SelectTrigger className="border-gray-400 focus:border-gray-600">
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
                <Label>Duration (Months) *</Label>
                <Input
                  type="number"
                  min="1"
                  className="border-gray-400 focus:border-gray-600"
                  value={formData.months}
                  onChange={(e) => handleChange("months", e.target.value)}
                  placeholder="Enter months"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Duration (Years) *</Label>
                <Input
                  type="number"
                  min="1"
                  className="border-gray-400 focus:border-gray-600"
                  value={formData.years}
                  onChange={(e) => handleChange("years", e.target.value)}
                  placeholder="Enter years"
                  required
                />
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Input
                className="border-gray-400 focus:border-gray-600"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="hero" onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Customer & Loan"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}