import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/api/config";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LoanHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/history`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("Error loading history:", err));
  }, []);

  const filteredHistory = history.filter((item) =>
    item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusStyle: any = {
    completed: "bg-success/15 text-success border-success/20",
    closed: "bg-blue-200 text-blue-700",
    defaulted: "bg-red-200 text-red-700",
    settled: "bg-yellow-200 text-yellow-700",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Loan History</h1>
            <p className="text-muted-foreground">View all completed and closed loans of past customers.</p>
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
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Loan Amount</TableHead>
                <TableHead className="font-semibold">Loan Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredHistory.map((loan) => (
                <TableRow key={loan._id}>
                  <TableCell className="font-medium">{loan.customerName}</TableCell>
                  <TableCell className="font-semibold">₹{loan.amount}</TableCell>
                  <TableCell>{loan.loanDate}</TableCell>
                  <TableCell>
                    <Badge
                      className={`capitalize border ${statusStyle[loan.status]}`}
                    >
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
