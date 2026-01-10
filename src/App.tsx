import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/hooks/useSupabaseAuth";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProviderOnboarding from "./pages/onboarding/ProviderOnboarding";
import DriverOnboarding from "./pages/onboarding/DriverOnboarding";
import ConsumerHome from "./pages/consumer/ConsumerHome";
import ConsumerBooking from "./pages/consumer/ConsumerBooking";
import ConsumerBookings from "./pages/consumer/ConsumerBookings";
import ConsumerPayments from "./pages/consumer/ConsumerPayments";
import ConsumerProfile from "./pages/consumer/ConsumerProfile";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderRequests from "./pages/provider/ProviderRequests";
import ProviderFleet from "./pages/provider/ProviderFleet";
import ProviderDrivers from "./pages/provider/ProviderDrivers";
import ProviderEarnings from "./pages/provider/ProviderEarnings";
import ProviderSettings from "./pages/provider/ProviderSettings";
import DriverHome from "./pages/driver/DriverHome";
import DriverTrip from "./pages/driver/DriverTrip";
import DriverTrips from "./pages/driver/DriverTrips";
import DriverEarnings from "./pages/driver/DriverEarnings";
import DriverProfile from "./pages/driver/DriverProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminConsumers from "./pages/admin/AdminConsumers";
import AdminSettlements from "./pages/admin/AdminSettlements";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminSettings from "./pages/admin/AdminSettings";
import Sitemap from "./pages/Sitemap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/sitemap" element={<Sitemap />} />
            
            {/* Onboarding */}
            <Route path="/onboarding/provider" element={<ProviderOnboarding />} />
            <Route path="/onboarding/driver" element={<DriverOnboarding />} />
            
            {/* Consumer Routes */}
            <Route path="/consumer" element={<ConsumerHome />} />
            <Route path="/consumer/book" element={<ConsumerBooking />} />
            <Route path="/consumer/bookings" element={<ConsumerBookings />} />
            <Route path="/consumer/payments" element={<ConsumerPayments />} />
            <Route path="/consumer/profile" element={<ConsumerProfile />} />
            
            {/* Provider Routes */}
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/requests" element={<ProviderRequests />} />
            <Route path="/provider/fleet" element={<ProviderFleet />} />
            <Route path="/provider/drivers" element={<ProviderDrivers />} />
            <Route path="/provider/earnings" element={<ProviderEarnings />} />
            <Route path="/provider/settings" element={<ProviderSettings />} />
            
            {/* Driver Routes */}
            <Route path="/driver" element={<DriverHome />} />
            <Route path="/driver/trip" element={<DriverTrip />} />
            <Route path="/driver/trips" element={<DriverTrips />} />
            <Route path="/driver/earnings" element={<DriverEarnings />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/consumers" element={<AdminConsumers />} />
            <Route path="/admin/settlements" element={<AdminSettlements />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/verification" element={<AdminVerification />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
