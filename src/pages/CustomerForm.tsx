import { useState } from "react";
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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    joinDate: "",
    idType: "",
    idNumber: "",
    loanAmount: "",
    interest: "",
    term: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    // Backend call ya state update yaha
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Add New Customer</h1>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Join Date</Label>
            <Input
              type="date"
              value={formData.joinDate}
              onChange={(e) => handleChange("joinDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>ID Type</Label>
            <Select onValueChange={(val) => handleChange("idType", val)}>
              <SelectTrigger>
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
              value={formData.idNumber}
              onChange={(e) => handleChange("idNumber", e.target.value)}
            />
          </div>
        </div>

        {/* Loan Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Loan Amount</Label>
            <Input
              value={formData.loanAmount}
              onChange={(e) => handleChange("loanAmount", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Interest</Label>
            <div className="flex gap-2">
              <Input placeholder="%" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>{" "}
          </div>
          <div className="space-y-2">
            <Label>Term</Label>
            <div className="flex gap-2">
              <Input placeholder="%" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>{" "}
          </div>
           <div className="space-y-2">
                    <Label>Customer Photo</Label>
                    <Input type="file" accept="image/*" />
                  </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button variant="hero" onClick={handleSubmit}>
            Add Customer
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
