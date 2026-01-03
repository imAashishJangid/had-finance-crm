import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/api/config";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type LoanHistoryType = {
  _id: string;
  customerName?: string;
  amount?: number;
  loanDate?: string;
  status?: string;
};

export default function LoanHistory() {
  const [history, setHistory] = useState<LoanHistoryType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/history`);

        if (!res.ok) {
          console.error("API Error:", res.status);
          setHistory([]);
          return;
        }

        const data = await res.json();
        console.log("HISTORY API DATA 👉", data);

        // ✅ SAFETY: always set array
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // ✅ SAFETY FILTER
  const filteredHistory = history.filter((item) =>
    item.customerName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const statusStyle: Record<string, string> = {
    completed: "bg-success/15 text-success border-success/20",
    closed: "bg-blue-200 text-blue-700",
    defaulted: "bg-red-200 text-red-700",
    settled: "bg-yellow-200 text-yellow-700",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Loan History</h1>
            <p className="text-muted-foreground">
              View all completed and closed loans of past customers.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-card rounded-xl shadow border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Customer</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Loan Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredHistory.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell className="font-medium">
                      {loan.customerName || "N/A"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{loan.amount ?? 0}
                    </TableCell>
                    <TableCell>
                      {loan.loanDate || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize border ${
                          statusStyle[loan.status ?? ""] ||
                          "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {loan.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && filteredHistory.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
