import { useState, useEffect } from "react";
import { AlertTriangle, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/config/api";

export default function OverdueAlerts() {
  const [overdueEMIs, setOverdueEMIs] = useState<
    { id: string; customer: string; loanId: string; amount: string; daysOverdue: number; phone: string }[]
  >([]);

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const response = await api.get("/overdue-emis");
        setOverdueEMIs(response.data);
      } catch (err) {
        console.error("Error fetching overdue EMIs:", err);
      }
    };
    fetchOverdue();
  }, []);

  return (
    <div
      className="bg-card rounded-2xl shadow-card border border-border/50 animate-slide-up"
      style={{ animationDelay: "400ms" }}
    >
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
                <p className="text-sm text-destructive font-medium">{emi.daysOverdue} days overdue</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${emi.phone}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="w-4 h-4 mr-1" /> Call
                </Button>
              </a>
              <a href={`sms:${emi.phone}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-1" /> Message
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
