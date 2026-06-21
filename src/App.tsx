// src/App.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ React Hot Toast
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Loans from "./pages/Loans";
import Payments from "./pages/Payments";
import CustomerForm from "@/pages/CustomerForm";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import Noti from "./pages/Noti";
import CustomerDetails from "./pages/CustomerDetails";
import InterestAnalytics from "@/pages/InterestAnalytics";
import PersonalLending from "@/pages/PersonalLending";
import PersonalLendingDetail from "@/pages/PersonalLendingDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* ✅ React Hot Toast - Only one Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* ✅ Shadcn Sonner - For other notifications */}
      <Sonner position="bottom-center" />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/customer-form" element={<CustomerForm />} />
          <Route path="/customer-form/:id" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/edit/:id" element={<CustomerForm />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/history" element={<History />} />
          <Route path="/notifications" element={<Noti />} />
          <Route path="/interest-analytics" element={<InterestAnalytics />} />
          <Route path="/personal-lending" element={<PersonalLending />} />
          <Route path="/personal-lending/:id" element={<PersonalLendingDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;