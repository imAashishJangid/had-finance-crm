import DashboardLayout from "@/components/layout/DashboardLayout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Loans from "./pages/Loans";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Support from "./pages/Support";
import CustomerForm from "@/pages/CustomerForm";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import  History  from "./pages/History";
import Noti from "./pages/Noti"
import CustomerDetails from "./pages/CustomerDetails";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
<Sonner position="bottom-center" />

      <BrowserRouter>
        <Routes>


          {/* WRAP ALL ROUTES IN LAYOUT */}
           
            <Route path="/" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/support" element={<Support />} />
            <Route path="/customer-form" element={<CustomerForm />} />
            <Route path="/calculator" element={<Calculator />} />
             <Route path="/history" element={<History />} />
             <Route path="/notifications" element={<Noti />} />
             <Route path="/customer-form/:id" element={<CustomerForm />} />
             <Route path="/customer-form" element={<CustomerForm />} />
             <Route path="/customers/:id" element={<CustomerDetails />} />


           
           

          {/* NOT FOUND */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
