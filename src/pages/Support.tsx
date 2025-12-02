import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  FileQuestion,
  Shield,
  CreditCard,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const faqs = [
  {
    icon: CreditCard,
    question: "How to create a new loan?",
    answer: "Navigate to Loans → Create Loan, fill in customer details, loan amount, tenure, and interest rate.",
  },
  {
    icon: FileQuestion,
    question: "How to verify customer KYC?",
    answer: "Go to Customer profile → KYC Documents section and upload required documents for verification.",
  },
  {
    icon: Shield,
    question: "How to handle overdue EMIs?",
    answer: "Use the Payments section to view overdue EMIs and send automated reminders via SMS or WhatsApp.",
  },
  {
    icon: HelpCircle,
    question: "How to export reports?",
    answer: "Visit Analytics → Click Export button to download reports in Excel or PDF format.",
  },
];

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Query Submitted",
      description: "Our support team will get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", category: "", message: "" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Support & Help</h1>
          <p className="text-muted-foreground mt-1">
            Get help with your queries or contact our support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up">
              <h2 className="text-lg font-semibold text-foreground mb-6">Submit a Query</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Your Name</Label>
                    <Input
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select query category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Describe your query in detail..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Query
                </Button>
              </form>
            </div>

            {/* FAQs */}
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-lg font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 flex-shrink-0">
                        <faq.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground text-sm">{faq.question}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <h2 className="text-lg font-semibold text-foreground mb-6">Contact Us</h2>
              <div className="space-y-4">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                  </div>
                </a>
                <a
                  href="mailto:support@hadfinance.com"
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">support@hadfinance.com</p>
                  </div>
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-success/5 hover:bg-success/10 transition-colors border border-success/20"
                >
                  <div className="p-3 rounded-xl bg-success/10">
                    <MessageCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Chat with us instantly</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <h2 className="text-lg font-semibold text-foreground mb-4">Office Location</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    123 Finance Tower, Business District,<br />
                    Mumbai, Maharashtra 400001
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Mon - Sat: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
              {/* Map Placeholder */}
              <div className="mt-4 h-40 rounded-xl bg-muted/50 flex items-center justify-center border border-border">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Interactive map</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
