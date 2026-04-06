import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/hooks/useSupabaseAuth";
import { RequireAuth } from "@/components/auth/RequireAuth";

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
import SystemArchitecture from "./pages/admin/SystemArchitecture";
import MobileDocs from "./pages/MobileDocs";
import PitchDeck from "./pages/PitchDeck";
import InstallApp from "./pages/install/InstallApp";
import Sitemap from "./pages/Sitemap";
import UserGuide from "./pages/docs/UserGuide";
import ApiDocs from "./pages/docs/ApiDocs";
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
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/sitemap" element={<Sitemap />} />

            {/* PWA Install Pages */}
            <Route path="/install" element={<InstallApp />} />
            <Route path="/install/:role" element={<InstallApp />} />

            {/* Onboarding */}
            <Route path="/onboarding/provider" element={<RequireAuth><ProviderOnboarding /></RequireAuth>} />
            <Route path="/onboarding/driver" element={<RequireAuth><DriverOnboarding /></RequireAuth>} />

            {/* Consumer Routes */}
            <Route path="/consumer" element={<RequireAuth><ConsumerHome /></RequireAuth>} />
            <Route path="/consumer/book" element={<RequireAuth><ConsumerBooking /></RequireAuth>} />
            <Route path="/consumer/bookings" element={<RequireAuth><ConsumerBookings /></RequireAuth>} />
            <Route path="/consumer/payments" element={<RequireAuth><ConsumerPayments /></RequireAuth>} />
            <Route path="/consumer/profile" element={<RequireAuth><ConsumerProfile /></RequireAuth>} />

            {/* Provider Routes */}
            <Route path="/provider" element={<RequireAuth><ProviderDashboard /></RequireAuth>} />
            <Route path="/provider/requests" element={<RequireAuth><ProviderRequests /></RequireAuth>} />
            <Route path="/provider/fleet" element={<RequireAuth><ProviderFleet /></RequireAuth>} />
            <Route path="/provider/drivers" element={<RequireAuth><ProviderDrivers /></RequireAuth>} />
            <Route path="/provider/earnings" element={<RequireAuth><ProviderEarnings /></RequireAuth>} />
            <Route path="/provider/settings" element={<RequireAuth><ProviderSettings /></RequireAuth>} />

            {/* Driver Routes */}
            <Route path="/driver" element={<RequireAuth><DriverHome /></RequireAuth>} />
            <Route path="/driver/trip" element={<RequireAuth><DriverTrip /></RequireAuth>} />
            <Route path="/driver/trips" element={<RequireAuth><DriverTrips /></RequireAuth>} />
            <Route path="/driver/earnings" element={<RequireAuth><DriverEarnings /></RequireAuth>} />
            <Route path="/driver/profile" element={<RequireAuth><DriverProfile /></RequireAuth>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/bookings" element={<RequireAuth><AdminBookings /></RequireAuth>} />
            <Route path="/admin/providers" element={<RequireAuth><AdminProviders /></RequireAuth>} />
            <Route path="/admin/consumers" element={<RequireAuth><AdminConsumers /></RequireAuth>} />
            <Route path="/admin/settlements" element={<RequireAuth><AdminSettlements /></RequireAuth>} />
            <Route path="/admin/analytics" element={<RequireAuth><AdminAnalytics /></RequireAuth>} />
            <Route path="/admin/verification" element={<RequireAuth><AdminVerification /></RequireAuth>} />
            <Route path="/admin/settings" element={<RequireAuth><AdminSettings /></RequireAuth>} />

            {/* Architecture - Public */}
            <Route path="/architecture" element={<SystemArchitecture />} />
            <Route path="/admin/architecture" element={<RequireAuth><SystemArchitecture /></RequireAuth>} />

            {/* Mobile Developer Documentation */}
            <Route path="/docs/mobile" element={<MobileDocs />} />

            {/* User Guides & Integration Docs */}
            <Route path="/docs/guide" element={<UserGuide />} />

            {/* Investor Pitch Deck */}
            <Route path="/pitch" element={<PitchDeck />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
