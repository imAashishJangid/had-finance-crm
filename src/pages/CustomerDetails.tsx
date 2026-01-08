import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // 👈 confirmation modal

  useEffect(() => {
    api
      .get(`/api/loans/${id}`)
      .then((res) => setCustomer(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);


  const handleStatusChange = async (newStatus: string) => {
  try {
    const res = await api.put(`/api/loans/${id}`, {
      status: newStatus,
    });

    setCustomer(res.data.data); // UI instantly update
    toast.success("Status updated successfully!");
  } catch (error) {
    console.error(error);
    toast.error("Failed to update status");
  }
};


  const handleDelete = async () => {
    setShowConfirm(false);
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
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!customer) return <p className="p-6">Customer not found</p>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 🔝 Header Card */}
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-muted">
            {/* Customer Image */}
            <div className="w-28 h-28 rounded-full overflow-hidden border bg-white">
              {customer.customerImage?.url ? (
                <img
                  src={customer.customerImage.url}
                  alt={customer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold">{customer.name}</h2>
<div className="flex items-center justify-center md:justify-start gap-3 mt-1">
  <p className="text-sm text-muted-foreground">{customer.phone}</p>

  {customer.phone && (
    <a href={`tel:${customer.phone}`}>
      <Button size="sm" variant="outline">
        📞 Call
      </Button>
    </a>
  )}
</div>
             <select
  value={customer.status}
  onChange={(e) => handleStatusChange(e.target.value)}
  className="mt-2 border rounded px-3 py-1 text-sm"
>
  <option value="active">Active</option>
  <option value="closed">Closed</option>
  <option value="pending">Pending</option>
  <option value="defaulted">Defaulted</option>
</select>

            </div>
          </div>
        </Card>

        {/* 📇 Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p>
              <b>Phone:</b> {customer.phone}
            </p>
            <p>
              <b>Address:</b> {customer.address || "-"}
            </p>
            <p>
              <b>ID Type:</b> {customer.idType}
            </p>
            <p>
              <b>ID Number:</b> {customer.idNumber}
            </p>
            <p>
  <b>Join Date:</b>{" "}
  {customer.joinDate
    ? new Date(customer.joinDate).toLocaleDateString("en-IN")
    : "-"}
</p>

          </CardContent>
          
        </Card>

        {/* 💰 Loan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p>
              <b>Loan Amount:</b> ₹{customer.loanAmount}
            </p>
            <p>
              <b>Interest Rate:</b> {customer.interestRate}%
            </p>
            <p>
              <b>Term:</b> {customer.term}
            </p>
            <p>
              <b>Duration:</b>{" "}
              {customer.months
                ? `${customer.months} Months`
                : `${customer.years} Years`}
            </p>
            <p>
              <b>Monthly EMI:</b> ₹{customer.monthlyInstallment}
            </p>
            <p>
              <b>Notes:</b> {customer.notes || "-"}
            </p>
          </CardContent>
        </Card>

        {/* 🔙 Back & Delete Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)} // 👈 show confirmation modal
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Customer"}
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-lg font-semibold">Confirm Delete</h3>
            <p>Are you sure you want to delete this customer?</p>
            <div className="flex justify-center gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
