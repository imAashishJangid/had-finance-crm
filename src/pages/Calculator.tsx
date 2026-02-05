import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Calculator, IndianRupee, Percent, Calendar, RefreshCw, Copy } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [rateType, setRateType] = useState<"yearly" | "monthly">("yearly");
  const [durationType, setDurationType] = useState<"years" | "months">("months");
  const [emi, setEmi] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);

  const calculateEMI = () => {
    const loan = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    const dur = parseFloat(duration);

    if (!loan || !rate || !dur) {
      toast.error("Please enter all values");
      return;
    }

    // Convert everything to months
    let totalMonths = durationType === "years" ? dur * 12 : dur;
    let monthlyRate = rateType === "yearly" ? rate / 12 / 100 : rate / 100;

    // Simple EMI calculation: (Principal + Total Interest) / Total Months
    let totalInterestAmount = 0;
    
    if (rateType === "monthly") {
      // Monthly interest: interest per month * total months
      totalInterestAmount = (loan * monthlyRate) * totalMonths;
    } else {
      // Yearly interest: (loan * yearly rate / 100) * years
      totalInterestAmount = (loan * rate / 100) * (durationType === "years" ? dur : dur / 12);
    }

    const totalPayable = loan + totalInterestAmount;
    const monthlyEMI = totalPayable / totalMonths;

    setEmi(Math.round(monthlyEMI));
    setTotalInterest(Math.round(totalInterestAmount));
    setTotalPayment(Math.round(totalPayable));
    
    toast.success("EMI calculated successfully!");
  };

  const resetCalculator = () => {
    setLoanAmount("");
    setInterestRate("");
    setDuration("");
    setRateType("yearly");
    setDurationType("months");
    setEmi(null);
    setTotalInterest(null);
    setTotalPayment(null);
  };

  const copyResults = () => {
    if (!emi) {
      toast.error("No results to copy");
      return;
    }

    const results = `
📱 EMI Calculator Results
─────────────────
Loan Amount: ₹${parseFloat(loanAmount).toLocaleString()}
Interest Rate: ${interestRate}% ${rateType === "yearly" ? "p.a." : "p.m."}
Duration: ${duration} ${durationType}
─────────────────
Monthly EMI: ₹${emi.toLocaleString()}
Total Interest: ₹${totalInterest?.toLocaleString()}
Total Payment: ₹${totalPayment?.toLocaleString()}
─────────────────
`;

    navigator.clipboard.writeText(results.trim())
      .then(() => {
        toast.success("Results copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy results");
      });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">EMI Calculator</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Calculate your monthly EMI instantly
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Loan Amount */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-base font-medium">
                        <IndianRupee className="w-5 h-5 text-emerald-600" />
                        Loan Amount
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <IndianRupee className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <Input
                          type="number"
                          placeholder="Enter loan amount"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="pl-10 h-12 text-base"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[10000, 50000, 100000, 500000].map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLoanAmount(amount.toString())}
                            className="text-xs"
                          >
                            {formatCurrency(amount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-base font-medium">
                        <Percent className="w-5 h-5 text-blue-600" />
                        Interest Rate
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Percent className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <Input
                            type="number"
                            placeholder="Enter interest rate"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="pl-10 h-12 text-base"
                          />
                        </div>
                        <Select
                          value={rateType}
                          onValueChange={(val: "yearly" | "monthly") => setRateType(val)}
                        >
                          <SelectTrigger className="w-24 h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[5, 8, 10, 12, 15].map((rate) => (
                          <Button
                            key={rate}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setInterestRate(rate.toString())}
                            className="text-xs"
                          >
                            {rate}%
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-base font-medium">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Loan Duration
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <Input
                            type="number"
                            placeholder="Enter duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="pl-10 h-12 text-base"
                          />
                        </div>
                        <Select
                          value={durationType}
                          onValueChange={(val: "years" | "months") => setDurationType(val)}
                        >
                          <SelectTrigger className="w-24 h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="years">Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {durationType === "months" 
                          ? [6, 12, 24, 36, 60].map((dur) => (
                              <Button
                                key={dur}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDuration(dur.toString())}
                                className="text-xs"
                              >
                                {dur} Months
                              </Button>
                            ))
                          : [1, 2, 3, 5, 10].map((dur) => (
                              <Button
                                key={dur}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDuration(dur.toString())}
                                className="text-xs"
                              >
                                {dur} Years
                              </Button>
                            ))
                        }
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={calculateEMI}
                        className="flex-1 h-12 text-base font-medium"
                      >
                        Calculate EMI
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetCalculator}
                        className="h-12"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg rounded-2xl h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-6">EMI Breakdown</h2>
                    
                    {emi ? (
                      <div className="space-y-6">
                        {/* Main EMI Display */}
                        <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                          <p className="text-sm text-emerald-700 mb-2">Monthly EMI</p>
                          <h3 className="text-4xl font-bold text-emerald-900 mb-2">
                            {formatCurrency(emi)}
                          </h3>
                          <p className="text-sm text-emerald-600">
                            per month for {duration} {durationType}
                          </p>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-slate-50 border">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Loan Amount</span>
                                <span className="font-semibold">{formatCurrency(parseFloat(loanAmount))}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Interest</span>
                                <span className="font-semibold text-rose-600">
                                  {formatCurrency(totalInterest || 0)}
                                </span>
                              </div>
                              <div className="pt-3 border-t">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Total Payment</span>
                                  <span className="text-lg font-bold text-emerald-700">
                                    {formatCurrency(totalPayment || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Summary */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                              <p className="text-xs text-blue-700 mb-1">Interest Rate</p>
                              <p className="font-bold text-blue-900">
                                {interestRate}% {rateType === "yearly" ? "p.a." : "p.m."}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                              <p className="text-xs text-purple-700 mb-1">Total Months</p>
                              <p className="font-bold text-purple-900">
                                {durationType === "years" 
                                  ? parseFloat(duration) * 12 
                                  : parseFloat(duration)}
                              </p>
                            </div>
                          </div>

                          {/* Copy Button */}
                          <Button
                            onClick={copyResults}
                            variant="outline"
                            className="w-full mt-4"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Results
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                          <Calculator className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Calculate Your EMI</h3>
                        <p className="text-muted-foreground mb-6">
                          Enter your loan details to see the EMI breakdown
                        </p>
                        <Button onClick={calculateEMI} variant="outline">
                          Start Calculation
                        </Button>
                      </div>
                    )}
                  </div>

                  
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Simple Info */}
           
        </div>
      </div>
    </DashboardLayout>
  );
}