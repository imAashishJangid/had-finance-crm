import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Customer Management",
    description: "Complete customer profiles with KYC verification and loan history tracking.",
  },
  {
    icon: CreditCard,
    title: "Loan Processing",
    description: "Streamlined loan applications, approvals, and EMI schedule generation.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights on loan performance, EMI collections, and growth metrics.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Bank-grade security with complete regulatory compliance built-in.",
  },
];

const benefits = [
  "Automated EMI reminders",
  "Digital KYC verification",
  "Multi-branch support",
  "Custom loan products",
  "Real-time reporting",
  "WhatsApp integration",
];

export default function Index() {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg text-foreground">Had Finance</span>
              <span className="block text-xs text-muted-foreground">Loan CRM</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Trusted by 500+ Finance Companies
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Modern Loan Management{" "}
              <span className="text-accent">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Streamline your lending operations with our comprehensive CRM. Manage customers, 
              process loans, track payments, and grow your business—all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="absolute inset-0 gradient-primary opacity-5 rounded-3xl blur-3xl" />
            <div className="relative bg-card rounded-3xl shadow-xl border border-border/50 p-2 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <div className="w-3 h-3 rounded-full bg-warning/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Customers", value: "12,847" },
                  { label: "Active Loans", value: "₹45.2Cr" },
                  { label: "EMI Collected", value: "₹8.5Cr" },
                  { label: "Recovery Rate", value: "94.5%" },
                ].map((stat, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for modern lending businesses
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-background rounded-2xl p-6 border border-border hover:shadow-card hover:border-accent/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Boost Your Lending Business
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join hundreds of finance companies that have transformed their operations 
                with Had Finance CRM. See measurable results from day one.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/dashboard">
                  <Button variant="hero" size="lg">
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 gradient-accent opacity-10 rounded-3xl blur-2xl" />
              <div className="relative bg-card rounded-3xl p-8 shadow-card border border-border/50">
                <div className="text-center mb-6">
                  <p className="text-5xl font-bold text-accent mb-2">94%</p>
                  <p className="text-muted-foreground">Average Recovery Rate</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">50%</p>
                    <p className="text-xs text-muted-foreground">Faster Processing</p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">3x</p>
                    <p className="text-xs text-muted-foreground">Team Productivity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get In Touch
              </h2>
              <p className="text-lg text-muted-foreground">
                Have questions? Our team is ready to help you get started.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <a
                href="tel:+919876543210"
                className="bg-background rounded-2xl p-6 border border-border hover:border-accent/30 hover:shadow-card transition-all text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              </a>
              <a
                href="mailto:support@hadfinance.com"
                className="bg-background rounded-2xl p-6 border border-border hover:border-accent/30 hover:shadow-card transition-all text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                <p className="text-sm text-muted-foreground">support@hadfinance.com</p>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background rounded-2xl p-6 border border-border hover:border-success/30 hover:shadow-card transition-all text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
                <p className="text-sm text-muted-foreground">Chat with us</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Had Finance</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Had Finance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}