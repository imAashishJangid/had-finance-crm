import { useEffect, useState } from "react";
import api from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusStyles = {
  approved: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function RecentLoans() {
  const [recentLoans, setRecentLoans] = useState<any[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await api.get("/loan/recent-loans");
        setRecentLoans(res.data);
      } catch (err) {
        console.error("Error fetching recent loans:", err);
      }
    };
    fetchLoans();
  }, []);

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Loan Applications</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest loan customers</p>
      </div>
      <div className="divide-y divide-border">
        {recentLoans.map((loan) => (
          <div key={loan.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {loan.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{loan.customer}</p>
                <p className="text-sm text-muted-foreground">{loan.type}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{loan.amount}</p>
                <p className="text-xs text-muted-foreground">{loan.date}</p>
              </div>
              <Badge className={statusStyles[loan.status as keyof typeof statusStyles]}>
                {loan.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
