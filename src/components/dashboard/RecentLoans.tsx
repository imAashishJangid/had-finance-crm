// components/dashboard/RecentLoans.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // Add this import
import api from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MoreHorizontal, ArrowUpRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusStyles = {
  approved: "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-600 dark:from-emerald-400/10 dark:to-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  pending: "bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-600 dark:from-amber-400/10 dark:to-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  rejected: "bg-gradient-to-r from-rose-500/10 to-rose-600/10 text-rose-600 dark:from-rose-400/10 dark:to-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

const statusIcons = {
  approved: "✅",
  pending: "⏳",
  rejected: "❌",
};

export default function RecentLoans() {
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">
                Recent Loan Applications
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Latest loan customers and their status
              </p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:text-blue-700">
              View All <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <AnimatePresence>
              {recentLoans.map((loan, index) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onHoverStart={() => setHoveredId(loan.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="relative group"
                >
                  <div className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800 shadow-lg">
                        <AvatarImage src={loan.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {loan.initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                            {loan.customer}
                          </p>
                          <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800">
                            ID: {loan.id?.slice(0, 8) || 'N/A'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{loan.type}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                          <span className="text-gray-600 dark:text-gray-400">{loan.tenure || '12 months'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-gray-50 text-lg">
                          {loan.amount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 justify-end">
                          <span>{loan.date}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                          <span>{loan.time || '10:30 AM'}</span>
                        </p>
                      </div>

                      <Badge className={cn(
                        "px-3 py-1.5 text-xs font-medium border shadow-sm",
                        statusStyles[loan.status as keyof typeof statusStyles] || statusStyles.pending
                      )}>
                        <span className="mr-1">{statusIcons[loan.status as keyof typeof statusIcons] || '📝'}</span>
                        {loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : 'Pending'}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Process Application</DropdownMenuItem>
                          <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Progress indicator */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: hoveredId === loan.id ? "100%" : "0%" }}
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* View all link */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <Button variant="link" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
              View all loan applications →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}