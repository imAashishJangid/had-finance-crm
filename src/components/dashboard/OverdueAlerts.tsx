import { AlertTriangle, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const overdueEMIs = [
  {
    id: 1,
    customer: "Mohan Verma",
    loanId: "LN-2024-089",
    amount: "₹25,000",
    daysOverdue: 15,
    phone: "+91 98765 43210",
  },
  {
    id: 2,
    customer: "Geeta Devi",
    loanId: "LN-2024-102",
    amount: "₹18,500",
    daysOverdue: 8,
    phone: "+91 87654 32109",
  },
  {
    id: 3,
    customer: "Ramesh Gupta",
    loanId: "LN-2024-115",
    amount: "₹32,000",
    daysOverdue: 3,
    phone: "+91 76543 21098",
  },
];

export default function OverdueAlerts() {
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Overdue EMI Alerts</h3>
          <p className="text-sm text-muted-foreground">{overdueEMIs.length} customers require attention</p>
        </div>
      </div>
      <div className="divide-y divide-border">
        {overdueEMIs.map((emi) => (
          <div key={emi.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-foreground">{emi.customer}</p>
                <p className="text-sm text-muted-foreground">{emi.loanId}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{emi.amount}</p>
                <p className="text-sm text-destructive font-medium">
                  {emi.daysOverdue} days overdue
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
