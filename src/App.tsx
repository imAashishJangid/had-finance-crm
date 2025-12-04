import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Loans from "./pages/Loans";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import CustomerForm from "@/pages/CustomerForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/support" element={<Support />} />          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
           <Route path="/customer-form" element={<CustomerForm />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
