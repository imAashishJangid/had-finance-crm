// components/dashboard/QuickActions.tsx
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Add this import
import {
  UserPlus,
  FileText,
  CreditCard,
  Calculator,
  Download,
  Upload,
  Send,
  Printer,
} from "lucide-react";

const actions = [
  { icon: UserPlus, label: "Add Customer", color: "bg-blue-500", href: "/customers/new" },
  { icon: FileText, label: "New Loan", color: "bg-emerald-500", href: "/loans/new" },
  { icon: CreditCard, label: "Record Payment", color: "bg-purple-500", href: "/payments/new" },
  { icon: Calculator, label: "Calculate EMI", color: "bg-amber-500", href: "/calculator" },
  { icon: Download, label: "Download Report", color: "bg-rose-500", href: "/reports" },
  { icon: Upload, label: "Bulk Upload", color: "bg-cyan-500", href: "/upload" },
  { icon: Send, label: "Send Reminders", color: "bg-indigo-500", href: "/reminders" },
  { icon: Printer, label: "Print Statement", color: "bg-gray-500", href: "/statements" },
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-none shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">
            Quick Actions
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Frequently used operations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                >
                  <div className={cn("p-2.5 rounded-xl text-white shadow-lg", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}