import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import LandingPage from "./pages/LandingPage";
import ConsumerHome from "./pages/consumer/ConsumerHome";
import ConsumerBooking from "./pages/consumer/ConsumerBooking";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import DriverHome from "./pages/driver/DriverHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Consumer Routes */}
            <Route path="/consumer" element={<ConsumerHome />} />
            <Route path="/consumer/book" element={<ConsumerBooking />} />
            <Route path="/consumer/bookings" element={<ConsumerHome />} />
            <Route path="/consumer/payments" element={<ConsumerHome />} />
            <Route path="/consumer/profile" element={<ConsumerHome />} />
            
            {/* Provider Routes */}
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/requests" element={<ProviderDashboard />} />
            <Route path="/provider/fleet" element={<ProviderDashboard />} />
            <Route path="/provider/drivers" element={<ProviderDashboard />} />
            <Route path="/provider/earnings" element={<ProviderDashboard />} />
            <Route path="/provider/settings" element={<ProviderDashboard />} />
            
            {/* Driver Routes */}
            <Route path="/driver" element={<DriverHome />} />
            <Route path="/driver/trip" element={<DriverHome />} />
            <Route path="/driver/trips" element={<DriverHome />} />
            <Route path="/driver/earnings" element={<DriverHome />} />
            <Route path="/driver/profile" element={<DriverHome />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminDashboard />} />
            <Route path="/admin/providers" element={<AdminDashboard />} />
            <Route path="/admin/consumers" element={<AdminDashboard />} />
            <Route path="/admin/settlements" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />
            <Route path="/admin/verification" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
