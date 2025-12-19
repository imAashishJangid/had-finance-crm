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
    joinDate: "",
    idType: "",
    idNumber: "",
    loanAmount: "",
    interest: "",
    term: "",
  });

  const [image, setImage] = useState<File | null>(null);

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
    "address",
    "joinDate",
    "idType",
    "idNumber",
    "loanAmount",
    "interest",
    "term",
  ];

  for (const field of requiredFields) {
    if (!formData[field as keyof typeof formData]) {
      alert(`Please fill the ${field} field`);
      return; // Stop form submission
    }
  }

  try {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (image) {
      data.append("image", image);
    }

    const response = await api.post("/api/customers", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Customer added:", response.data);
    navigate("/customers");
  } catch (error) {
    console.error("Error adding customer:", error);
    alert("Failed to add customer. Please try again.");
  }
};

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          Add New Customer
        </h1>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              className="border-gray-400 focus:border-gray-600"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
           required />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              className="border-gray-400 focus:border-gray-600"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
           required />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              className="border-gray-400 focus:border-gray-600"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            required/>
          </div>

          <div className="space-y-2">
            <Label>Join Date</Label>
            <Input
              type="date"
              className="border-gray-400 focus:border-gray-600"
              value={formData.joinDate}
              onChange={(e) => handleChange("joinDate", e.target.value)}
            required/>
          </div>

          <div className="space-y-2">
            <Label>ID Type</Label>
            <Select onValueChange={(val) => handleChange("idType", val)}>
              <SelectTrigger className="border-gray-400 focus:border-gray-600">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="voter">Voter ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ID Number</Label>
            <Input
              className="border-gray-400 focus:border-gray-600"
              value={formData.idNumber}
              onChange={(e) => handleChange("idNumber", e.target.value)}
            required/>
          </div>

          {/* Image Upload */}
          <div className="space-y-2 sm:col-span-2">
            <Label>Customer Image</Label>
            <Input
              type="file"
              accept="image/*"
              className="border-gray-400 focus:border-gray-600"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImage(e.target.files[0]);
                }
              }}
            required/>

            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="h-24 w-24 rounded object-cover mt-2"
              />
            )}
          </div>
        </div>

        {/* Loan Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Loan Amount</Label>
            <Input
              className="border-gray-400 focus:border-gray-600"
              value={formData.loanAmount}
              onChange={(e) =>
                handleChange("loanAmount", e.target.value)
              }
           required />
          </div>

          <div className="space-y-2">
            <Label>Interest (%)</Label>
            <Input
              className="border-gray-400 focus:border-gray-600"
              value={formData.interest}
              onChange={(e) =>
                handleChange("interest", e.target.value)
              }
           required />
          </div>

          <div className="space-y-2">
            <Label>Term</Label>
            <Input
              className="border-gray-400 focus:border-gray-600"
              placeholder="Months / Years"
              value={formData.term}
              onChange={(e) => handleChange("term", e.target.value)}
           required />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="hero" onClick={handleSubmit}>
            Add Customer
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
