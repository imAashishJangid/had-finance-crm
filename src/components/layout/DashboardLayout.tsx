import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  BarChart3,
  HelpCircle,
  Calculator,
  FileClock,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: CreditCard, label: "Loans", path: "/loans" },
  { icon: Wallet, label: "Payments", path: "/payments" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: HelpCircle, label: "Support", path: "/support" },
  { icon: Calculator , label: "Calculator", path: "/calculator" }, 
  { icon: FileClock , label: "History", path: "/history" }, 
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row ">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sticky Logo */}
         <div
  className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border 
  sticky top-0 bg-sidebar z-50"
>
  <Link to="/" className="flex items-center gap-3">

    {/* Your Image Logo */}
    <img
      src="/logo.png"         // <-- yaha apni image ka naam lagao
      alt="Had Finance Logo"
      className="w-10 h-10 rounded-x2 object-cover"
    />

    <span className="font-bold text-lg text-sidebar-foreground">
      Had Finance
    </span>
  </Link>

  <Button
    variant="ghost"
    size="icon"
    className="lg:hidden text-sidebar-foreground"
    onClick={() => setSidebarOpen(false)}
  >
    <X className="w-5 h-5" />
  </Button>
</div>

          {/* Sticky Nav Links */}
          <div className="sticky top-20 bg-sidebar border-b border-sidebar-border z-40">
            <nav className="px-4 py-4 space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Scrollable bottom part (future items) */}
          <div className="flex-1 overflow-y-auto px-4 py-4"></div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Search */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers, loans..."
                className="w-80 pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Header Right Icons */}
          <Link to="/notifications">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </div>
          </Link>
        </header>

        {/* Mobile Search Input */}
        {mobileSearchOpen && (
          <div className="p-4 md:hidden bg-card border-b border-border">
            <Input
              placeholder="Search customers, loans..."
              className="w-full"
            />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
