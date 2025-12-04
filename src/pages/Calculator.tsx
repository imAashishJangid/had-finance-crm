import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function EMICalculator() {
  const [loan, setLoan] = useState(0);
  const [rate, setRate] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rateType, setRateType] = useState<"monthly" | "yearly">("monthly");
  const [emi, setEmi] = useState<number | null>(null);

  const calculateEMI = () => {
  if (!loan || !rate || !duration) return;

  let totalMonths = rateType === "yearly" ? duration * 12 : duration;

  let totalInterest = 0;

  if (rateType === "monthly") {
    // monthly interest per month * months
    totalInterest = (loan * rate) / 100 * totalMonths;
  } else {
    // yearly interest * 1 (flat) => same amount regardless of number of years
    totalInterest = (loan * rate) / 100*duration;
  }

  const totalPayable = loan + totalInterest;
  const monthlyEMI = totalPayable / totalMonths;

  setEmi(Number(monthlyEMI.toFixed(2)));
};


  return (
    <div className="w-full flex justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl rounded-2xl p-2">
          <CardContent className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent/20">
                <Calculator className="w-6 h-6 text-accent-foreground" />
              </div>
              <h2 className="text-xl font-bold">EMI Calculator</h2>
            </div>

            {/* Loan Amount */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium">Loan Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                onChange={(e) => setLoan(Number(e.target.value))}
              />
            </motion.div>

            {/* Interest Rate */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium">Interest Rate (%)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter rate"
                  onChange={(e) => setRate(Number(e.target.value))}
                />
                <Select
                  value={rateType}
                  onValueChange={(val: "monthly" | "yearly") => setRateType(val)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Monthly/Yearly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Duration */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium">
                Duration ({rateType === "monthly" ? "Months" : "Years"})
              </label>
              <Input
                type="number"
                placeholder={`Enter ${rateType === "monthly" ? "months" : "years"}`}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </motion.div>

            {/* Calculate Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                className="w-full rounded-xl text-base py-5"
                onClick={calculateEMI}
              >
                Calculate EMI
              </Button>
            </motion.div>

            {/* Result */}
            {emi && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 mt-4 rounded-xl border text-center"
              >
                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                <h3 className="text-2xl font-bold">₹ {emi}</h3>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
