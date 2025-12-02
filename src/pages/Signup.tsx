import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account Created!",
        description: "Welcome to Had Finance. Redirecting to dashboard...",
      });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen gradient-hero flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxek0yNCAyNGgxMnYySDI0di0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-xl text-primary-foreground">Had Finance</span>
              <span className="block text-sm text-primary-foreground/70">Loan CRM</span>
            </div>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
            Start Your Free<br />14-Day Trial
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Join 500+ finance companies already using Had Finance to streamline their lending operations.
          </p>
          <ul className="space-y-3">
            {[
              "Complete loan management system",
              "Customer KYC & verification",
              "Automated EMI reminders",
              "Analytics & reporting dashboard",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          © 2024 Had Finance. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">Had Finance</span>
            </Link>
          </div>

          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
              <p className="text-muted-foreground mt-2">Start your free trial today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-accent hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-accent font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
