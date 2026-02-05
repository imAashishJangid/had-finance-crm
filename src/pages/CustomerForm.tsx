import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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

  // 🔥 ORIGINAL DATA (for comparison)
  const [originalData, setOriginalData] = useState<any>(null);

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  if (isEditMode && stateCustomer) {
    // 👉 Edit button se aaya
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
    // 👉 Direct URL / refresh
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

        // 🔥 EDIT MODE FIX: same phone / idNumber skip
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

      console.log("FINAL FORM DATA (EDIT SAFE)");

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
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          {isEditMode ? "Edit Customer & Loan" : "Add New Customer & Loan"}
        </h1>

        {/* Customer Information */}
        <div className="space-y-4">
          <h2 className="text-base md:text-lg font-semibold">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2 col-span-full md:col-span-1">
              <Label className="text-sm md:text-base">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2 col-span-full md:col-span-1">
              <Label className="text-sm md:text-base">Phone Number *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2 col-span-full">
              <Label className="text-sm md:text-base">Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter complete address"
              />
            </div>

            <div className="space-y-2 col-span-full md:col-span-1">
              <Label className="text-sm md:text-base">ID Type *</Label>
              <Select
                value={formData.idType}
                onValueChange={(val) => handleChange("idType", val)}
              >
                <SelectTrigger>
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

            <div className="space-y-2 col-span-full md:col-span-1">
              <Label className="text-sm md:text-base">ID Number *</Label>
              <Input
                value={formData.idNumber}
                onChange={(e) => handleChange("idNumber", e.target.value)}
                placeholder="Enter ID number"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2 col-span-full">
              <Label className="text-sm md:text-base">Customer Photo</Label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
                    }}
                  />
                </div>
                {image && (
                  <div className="flex-shrink-0">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="preview"
                      className="h-24 w-24 md:h-32 md:w-32 rounded-lg object-cover border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Join Date */}
            <div className="space-y-2 col-span-full md:col-span-1">
              <Label className="text-sm md:text-base">Join Date *</Label>
              <Input
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleChange("joinDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Loan Information */}
        <div className="space-y-4">
          <h2 className="text-base md:text-lg font-semibold">Loan Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2 col-span-full md:col-span-1">
              <Label>Loan Amount (₹) *</Label>
              <Input
                type="number"
                min="0"
                value={formData.loanAmount}
                onChange={(e) => handleChange("loanAmount", e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-full md:col-span-1">
              <Label>Interest Rate (%) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => handleChange("interestRate", e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-full md:col-span-1">
              <Label>Term Type *</Label>
              <Select
                value={formData.term}
                onValueChange={(val) => handleChange("term", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select term type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.term === "months" ? (
              <div className="space-y-2 col-span-full md:col-span-1">
                <Label>Duration (Months) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.months}
                  onChange={(e) => handleChange("months", e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2 col-span-full md:col-span-1">
                <Label>Duration (Years) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.years}
                  onChange={(e) => handleChange("years", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2 col-span-full">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="hero" onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : isEditMode ? "Update Customer & Loan" : "Add Customer & Loan"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}