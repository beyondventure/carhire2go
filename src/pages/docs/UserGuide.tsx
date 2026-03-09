import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Circle, AlertTriangle, ExternalLink,
  Users, Car, Truck, Shield, MapPin, CreditCard, Bell, Settings,
  ChevronDown, ChevronRight, Smartphone, Key, Globe, Database,
  FileText, BookOpen, HelpCircle, Wallet, Navigation, Star,
  Zap, MessageSquare, Lock, BarChart3, Clock, Wifi, Upload,
  Monitor, Phone
} from 'lucide-react';
import logoAltBlack from '@/assets/logo-alt-black.png';
import { PLATFORM_NAME } from '@/lib/constants';

type Section = 'status' | 'checklist' | 'consumer' | 'provider' | 'driver' | 'admin' | 'faq';

interface ChecklistItem {
  title: string;
  description: string;
  status: 'required' | 'optional' | 'done' | 'future';
  steps: string[];
  apiProvider?: string;
  estimatedCost?: string;
}

interface FeatureItem {
  name: string;
  description: string;
  working: boolean;
  details?: string[];
}

// ── BUILT & WORKING FEATURES ──
const featureCategories: { category: string; icon: React.ElementType; features: FeatureItem[] }[] = [
  {
    category: 'Authentication & Accounts',
    icon: Lock,
    features: [
      { name: 'Email Registration', description: 'Users register with name, email, phone, password', working: true, details: ['Auto-confirm enabled for instant access', 'Role selection during signup (Consumer, Provider, Driver)'] },
      { name: 'Login / Logout', description: 'Secure session-based auth', working: true },
      { name: 'Role-Based Access Control', description: 'Separate dashboards per role (Consumer, Provider, Driver, Admin)', working: true, details: ['Roles stored in user_roles table', 'RLS policies enforce data isolation'] },
      { name: 'Profile Management', description: 'Update name, phone, avatar from dashboard', working: true },
    ],
  },
  {
    category: 'Consumer Features',
    icon: Users,
    features: [
      { name: 'Booking Creation', description: 'Full booking form with pickup/dropoff, date, time, vehicle type', working: true, details: ['5 booking types: Full Day, Half Day, To & Fro, Point-to-Point, Event', '5 vehicle types: Sedan, SUV, Luxury, Van, Bus', 'Location search via OpenStreetMap/Nominatim (Google Maps not yet connected)', 'Interactive map with pickup/dropoff markers', 'Estimated price range calculation'] },
      { name: 'My Bookings', description: 'View all bookings with status filters and search', working: true, details: ['Filter by status (pending, matching, matched, confirmed, etc.)', 'Real-time status updates via WebSocket', 'Click to view details, negotiate, or pay'] },
      { name: 'Real-Time Matching', description: 'Animated overlay while system finds providers', working: true },
      { name: 'Price Negotiation Chat', description: 'In-app chat with provider to agree on price', working: true, details: ['Text messages', 'Price proposal/counter/accept flows', 'Real-time message delivery'] },
      { name: 'Payments (Flutterwave)', description: 'UI built but Flutterwave API keys NOT connected yet', working: false, details: ['Payment UI and flow built', 'Flutterwave integration code ready', '❌ Needs Flutterwave API keys to process real payments', 'Payment history with status tracking', 'Receipt generation'] },
      { name: 'Consumer Dashboard', description: 'Home page with active booking, trip stats, recent bookings', working: true },
      { name: 'Consumer Profile', description: 'Edit personal details', working: true },
    ],
  },
  {
    category: 'Provider Features',
    icon: Truck,
    features: [
      { name: 'Provider Onboarding', description: '3-step onboarding: business info → verification → bank details', working: true, details: ['Individual or Company provider types', 'NIN input (individual) or CAC number (company)', '❌ NIN/CAC verification API not yet connected — captures data only', 'Service area selection from Nigerian cities', 'Bank details for settlements'] },
      { name: 'Provider Dashboard', description: 'Metrics, incoming requests, fleet status, driver status', working: true, details: ['Today\'s bookings & earnings', 'Total earnings & acceptance rate', 'Real-time incoming booking requests', 'Quick accept/decline actions'] },
      { name: 'Fleet Management (CRUD)', description: 'Add, edit, delete vehicles with full details', working: true, details: ['Vehicle make, model, year, color, plate number', 'Vehicle type and seating capacity', 'Daily rate setting', 'Availability toggle', 'Vehicle count metrics'] },
      { name: 'Driver Management', description: 'View drivers linked to your provider account', working: true },
      { name: 'Booking Requests', description: 'View and accept/decline incoming booking requests', working: true, details: ['Real-time notifications for new bookings', 'Route and price range preview', 'Accept → auto-assigns provider to booking', 'Chat/negotiate with consumer after accepting'] },
      { name: 'Earnings Dashboard', description: 'Track completed trip revenue and commission breakdown', working: true },
      { name: 'Provider Settings', description: 'Update business info, bank details, negotiation preferences', working: true },
    ],
  },
  {
    category: 'Driver Features',
    icon: Car,
    features: [
      { name: 'Driver Onboarding', description: 'License details and NIN submission (NIN API not connected)', working: true, details: ['License number and expiry captured', 'NIN number captured', '❌ NIN verification API not yet connected'] },
      { name: 'Driver Dashboard', description: 'Assigned trips, availability toggle, quick stats', working: true },
      { name: 'Trip Management', description: 'Start trip → navigate → complete trip lifecycle', working: true },
      { name: 'Trip History', description: 'View all past trips with details', working: true },
      { name: 'Earnings Tracking', description: 'View earnings per trip and totals', working: true },
      { name: 'Driver Profile', description: 'View and edit license info, NIN status', working: true },
    ],
  },
  {
    category: 'Admin Features',
    icon: Shield,
    features: [
      { name: 'Admin Dashboard', description: 'Platform-wide metrics and overview', working: true, details: ['Total bookings, revenue, users', 'Real-time data from all tables'] },
      { name: 'Provider Verification', description: 'Manual review only — NIN/CAC API verification not connected', working: true, details: ['Admin can approve/reject providers manually', '❌ Automated NIN/CAC verification pending API integration'] },
      { name: 'Booking Management', description: 'View and manage all bookings platform-wide', working: true },
      { name: 'Consumer Management', description: 'View all consumers and their activity', working: true },
      { name: 'Provider Management', description: 'View all providers, their fleets, and status', working: true },
      { name: 'Settlements & Finance', description: 'Track payments and commission', working: true },
      { name: 'Analytics', description: 'Charts and metrics for platform performance', working: true },
      { name: 'System Settings', description: 'Platform configuration', working: true },
    ],
  },
  {
    category: 'Real-Time & Notifications',
    icon: Zap,
    features: [
      { name: 'Real-Time Data Sync', description: 'All dashboards auto-update via WebSocket subscriptions', working: true, details: ['Bookings table: real-time for all roles', 'Notifications table: per-user real-time', 'Chat messages: per-booking real-time', 'Payments: real-time status updates'] },
      { name: 'In-App Notifications', description: 'Bell icon with unread count, click to navigate', working: true, details: ['New booking alerts for providers', 'Booking matched/confirmed alerts for consumers', 'Trip started/completed alerts', 'Price negotiation alerts', 'Mark as read / mark all read'] },
      { name: 'Database Triggers', description: 'Auto-generate notifications on booking events', working: true, details: ['notify_providers_new_booking: alerts all verified providers', 'notify_booking_status_change: alerts on match/confirm/start/complete', 'notify_chat_message: alerts on price proposals'] },
      { name: 'Web Push Notifications', description: 'Browser push notifications via VAPID/service worker', working: true, details: ['VAPID keys configured', 'Service worker registered', 'Push subscription management', 'Needs FCM for mobile native (see checklist)'] },
    ],
  },
  {
    category: 'Platform & PWA',
    icon: Smartphone,
    features: [
      { name: 'Progressive Web App', description: 'Installable on mobile devices from browser', working: true, details: ['manifest.json with InstantRyde branding', 'Service worker for offline capability', 'Role-specific PWA manifests available', 'Install page with instructions'] },
      { name: 'Mobile-Responsive UI', description: 'All pages optimized for mobile screens', working: true },
      { name: 'Dark/Light Theme', description: 'System-aware theme with manual toggle', working: true },
      { name: 'Landing Page', description: 'Marketing page with hero, services, testimonials, CTA', working: true },
      { name: 'Pitch Deck', description: 'Investor presentation at /pitch', working: true },
      { name: 'Developer Documentation', description: 'Mobile dev guide at /docs/mobile', working: true },
      { name: 'Native Mobile Apps (iOS/Android)', description: 'React Native apps — NOT YET BUILT, in development', working: false, details: ['❌ Not started — planned for future development', 'Documentation and architecture ready at /docs/mobile', 'PWAs serve as interim mobile solution'] },
      { name: 'Custom Domain & Hosting', description: 'Production domain not yet configured', working: false, details: ['❌ Not deployed to custom domain yet', 'Currently on Lovable staging URL only', 'Need to purchase domain and configure DNS'] },
      { name: 'Google Maps Integration', description: 'Using free OpenStreetMap — Google Maps API not connected', working: false, details: ['❌ Google Maps API key not yet obtained', 'Currently using Leaflet + Nominatim (free, less accurate)', 'Google Maps needed for production-quality autocomplete and routing'] },
    ],
  },
];

// ── INTEGRATION CHECKLIST ──
const integrationChecklist: ChecklistItem[] = [
  {
    title: '🔴 NIN Verification API',
    description: 'Verify driver and provider identities via NIMC records. NOT YET CONNECTED — needs API key.',
    status: 'required',
    apiProvider: 'VerifyMe (verifymenow.com) | Prembly/Identitypass | Youverify',
    estimatedCost: '₦50–₦150 per verification call',
    steps: [
      '❌ NOT DONE — API key not yet obtained',
      '1. Sign up at your chosen provider (e.g., verifymenow.com)',
      '2. Complete KYC on the provider platform to access production API',
      '3. Copy your API key from the provider dashboard',
      '4. In Lovable: Add it as a backend secret named NIN_VERIFY_API_KEY',
      '5. A backend function "verify-nin" needs to be created that: accepts a NIN → calls the API → returns pass/fail',
      '6. The onboarding forms already capture NIN — they just need to call this function',
      '7. On success, the drivers/providers table nin_verified field is set to true',
      '8. Admin verification dashboard already shows NIN status',
    ],
  },
  {
    title: '🟡 BVN Verification API',
    description: 'Verify bank account ownership for provider payouts. NOT YET CONNECTED — needs API key.',
    status: 'optional',
    apiProvider: 'Paystack (paystack.com) | Flutterwave | Mono',
    estimatedCost: '₦50–₦100 per verification',
    steps: [
      '❌ NOT DONE — API key not yet obtained',
      '1. Use same Flutterwave account (if already set up for payments) or sign up at Paystack',
      '2. Get the secret key from the dashboard',
      '3. Add as backend secret named BVN_VERIFY_API_KEY',
      '4. Create a backend function "verify-bvn" that validates BVN against account name/number',
      '5. Add a "Verify Bank" button in the provider onboarding bank step',
      '6. Store result in providers table',
    ],
  },
  {
    title: '🔴 CAC Verification API',
    description: 'Verify company registration for company-type providers. NOT YET CONNECTED — needs API key.',
    status: 'required',
    apiProvider: 'VerifyMe | Prembly/Identitypass',
    estimatedCost: '₦100–₦300 per verification',
    steps: [
      '❌ NOT DONE — API key not yet obtained',
      '1. Use same verification provider as NIN (e.g., VerifyMe)',
      '2. Get API credentials (may be same key as NIN)',
      '3. Add as backend secret named CAC_VERIFY_API_KEY (or reuse NIN key if same provider)',
      '4. Create backend function "verify-cac" that checks CAC registration number',
      '5. Company provider onboarding already captures CAC number — just needs to call this function',
      '6. Store result in providers table (cac_verified field)',
    ],
  },
  {
    title: '🔴 Vehicle Document Verification',
    description: 'Verify vehicle registration, insurance, and roadworthiness. Currently manual only.',
    status: 'required',
    steps: [
      '⚠️ PARTIALLY DONE — manual admin review exists, but no document upload yet',
      '1. Create a file storage bucket for vehicle documents',
      '2. Add upload fields in fleet management for: registration certificate, insurance, roadworthiness',
      '3. Admin sees uploaded documents in verification queue',
      '4. Admin approves → vehicles.verified = true → vehicle becomes bookable',
      '5. (Future) Integrate with FRSC API for automated plate number verification if available',
    ],
  },
  {
    title: '🔴 Google Maps & Places API',
    description: 'For accurate autocomplete, routing, and distance calculations. NOT YET CONNECTED.',
    status: 'required',
    apiProvider: 'Google Cloud Platform (console.cloud.google.com)',
    estimatedCost: '$200/month free tier, then pay-per-use (~$7/1000 requests)',
    steps: [
      '❌ NOT DONE — API key not yet obtained. Currently using free OpenStreetMap/Nominatim as fallback.',
      '1. Create a Google Cloud Platform account and enable billing',
      '2. Go to APIs & Services → Enable these APIs:',
      '   • Maps JavaScript API',
      '   • Places API (New)',
      '   • Geocoding API',
      '   • Directions API',
      '3. Create an API key → Restrict to your domain',
      '4. Add the key as VITE_GOOGLE_MAPS_KEY in your project settings (publishable/client key)',
      '5. Install @react-google-maps/api package',
      '6. Replace Leaflet map component with Google Maps',
      '7. Replace Nominatim location search with Google Places Autocomplete',
      '8. Add Directions API for accurate distance/duration/pricing',
      'NOTE: The current Leaflet/Nominatim setup works for testing. Google Maps is REQUIRED for production accuracy.',
    ],
  },
  {
    title: '🔴 Flutterwave Payment Integration',
    description: 'Process consumer payments and settle with providers. NOT YET CONNECTED — needs API keys.',
    status: 'required',
    apiProvider: 'Flutterwave (flutterwave.com)',
    estimatedCost: '1.4% per transaction (capped at ₦2,000)',
    steps: [
      '❌ NOT DONE — API keys not yet obtained. Payment UI is built but non-functional.',
      '1. Sign up for a Flutterwave business account at flutterwave.com',
      '2. Complete KYC verification on Flutterwave',
      '3. Get your PUBLIC KEY and add as VITE_FLUTTERWAVE_PUBLIC_KEY',
      '4. Get your SECRET KEY and add as backend secret named FLUTTERWAVE_SECRET_KEY',
      '5. Create backend function "verify-payment" to confirm transactions server-side',
      '6. Set up webhook URL in Flutterwave dashboard for payment confirmations',
      '7. Configure subaccount/transfer for provider settlements (provider gets payment minus 10% commission)',
      '8. Test with Flutterwave TEST MODE first (toggle in Flutterwave dashboard)',
      '9. Switch to LIVE MODE when ready to accept real payments',
    ],
  },
  {
    title: '🔴 Custom Domain & Hosting',
    description: 'Connect your own domain (e.g., instantryde.com) and deploy to production.',
    status: 'required',
    steps: [
      '❌ NOT DONE — currently only accessible via Lovable preview/staging URL',
      '1. Purchase your domain name (e.g., instantryde.com) from Namecheap, GoDaddy, etc.',
      '2. In Lovable: Go to Project Settings → Domains',
      '3. Add your custom domain and follow the DNS configuration instructions',
      '4. Set up CNAME or A records as instructed',
      '5. Wait for DNS propagation (up to 48 hours)',
      '6. SSL certificate is auto-configured',
      '7. Click "Publish" → "Update" to deploy the latest version to your domain',
      'NOTE: A paid Lovable plan is required for custom domains.',
    ],
  },
  {
    title: '🟢 Web Push Notifications',
    description: 'Browser push notifications are configured and working.',
    status: 'done',
    steps: [
      '✅ VAPID keys are configured as backend secrets',
      '✅ Service worker (sw.js) handles push events',
      '✅ Push subscription management is implemented',
      '✅ Backend function send-push-notification is deployed',
      '✅ Database triggers auto-fire notifications on booking events',
      'For MOBILE NATIVE (React Native) push:',
      '1. Set up Firebase project at console.firebase.google.com',
      '2. Enable Cloud Messaging (FCM)',
      '3. Get FCM server key and add as backend secret FCM_SERVER_KEY',
      '4. Install @react-native-firebase/messaging in your React Native app',
      '5. Update send-push-notification function to support both web push and FCM',
    ],
  },
  {
    title: '🟢 Progressive Web Apps (PWAs)',
    description: 'Installable PWAs for Consumer, Driver, and Provider roles.',
    status: 'done',
    steps: [
      '✅ Role-specific manifests configured (consumer, driver, provider)',
      '✅ InstantRyde branded icons generated for all roles',
      '✅ Service worker for offline caching registered',
      '✅ Install page with instructions at /install',
      '✅ Standalone mode with safe-area padding',
    ],
  },
  {
    title: '🟡 Native Mobile Apps (React Native)',
    description: 'Full native iOS and Android apps. IN DEVELOPMENT — not yet built.',
    status: 'future',
    estimatedCost: 'Developer time + Apple Developer ($99/yr) + Google Play ($25 one-time)',
    steps: [
      '❌ NOT STARTED — React Native apps are planned but not yet built',
      '1. Mobile development documentation is ready at /docs/mobile',
      '2. System architecture and API contracts are documented',
      '3. The web platform serves as the functional reference for all features',
      '4. PWAs serve as interim mobile solution while native apps are developed',
      '5. Key native features to build: GPS tracking, push via FCM/APNs, offline mode',
      '6. Estimated timeline: 3-6 months for MVP native apps',
    ],
  },
  {
    title: '🟡 SMS Notifications',
    description: 'SMS alerts for critical booking updates. NOT YET CONNECTED.',
    status: 'future',
    apiProvider: 'Termii (termii.com) | Africa\'s Talking | Twilio',
    estimatedCost: '₦2–₦4 per SMS',
    steps: [
      '❌ NOT DONE — API key not yet obtained',
      '1. Sign up at Termii (best Nigerian coverage) or Africa\'s Talking',
      '2. Get API key from dashboard',
      '3. Add as backend secret named SMS_API_KEY',
      '4. Create backend function "send-sms" that sends SMS via the API',
      '5. Add SMS triggers to key booking events (confirmed, driver arriving, trip complete)',
      '6. Let users opt-in/out of SMS in their profile settings',
    ],
  },
  {
    title: '🟡 Email Notifications',
    description: 'Transactional emails for booking confirmations, receipts. NOT YET CONNECTED.',
    status: 'future',
    apiProvider: 'Resend | SendGrid | Brevo',
    estimatedCost: 'Free tier available (100–300 emails/day)',
    steps: [
      '❌ NOT DONE — no email service connected yet',
      '1. Sign up at resend.com (recommended) or SendGrid',
      '2. Verify your sending domain',
      '3. Get API key and add as backend secret named EMAIL_API_KEY',
      '4. Create backend function "send-email" with HTML templates',
      '5. Send booking confirmation, payment receipt, and trip summary emails',
    ],
  },
];

// ── FAQ ──
const faqItems = [
  {
    q: 'How do I register as a provider?',
    a: 'Go to the landing page → click "Get Started" → select "Provider" → fill in your details → complete the 3-step onboarding (business info, verification details, bank details). Your application will be reviewed within 24-48 hours.',
  },
  {
    q: 'How long does verification take?',
    a: 'Admin reviews applications within 24-48 hours. You\'ll receive an in-app notification when approved. Until then, your dashboard shows a "Verification Pending" message.',
  },
  {
    q: 'How do I add vehicles to my fleet?',
    a: 'Once verified: Provider Dashboard → Fleet Management → "Add Vehicle" button. Fill in make, model, year, plate number, color, type (sedan/SUV/etc.), seats, and daily rate. Toggle availability on/off anytime.',
  },
  {
    q: 'How does pricing work?',
    a: 'Consumers see an estimated price range when booking. After a provider accepts, both parties can negotiate the final price via in-app chat. The consumer pays the agreed price to confirm. Platform takes 10% commission.',
  },
  {
    q: 'How do I get paid as a provider?',
    a: 'After a completed trip, the payment (minus 10% platform commission) is settled to your registered bank account via Flutterwave transfers. Track all earnings in the Earnings section of your dashboard.',
  },
  {
    q: 'Can I be both a provider and a driver?',
    a: 'Each account has one role. If you\'re a solo operator who owns a vehicle AND drives it, register as a Provider. You\'ll manage your own fleet and accept bookings directly.',
  },
  {
    q: 'What happens if a consumer cancels?',
    a: 'Before payment: no charge. After payment but before trip: refund policy applies. During trip: full charge. Cancellation details appear in the booking history.',
  },
  {
    q: 'How do I install the app on my phone?',
    a: 'Visit the app from your phone browser → For Android: tap browser menu → "Add to Home Screen". For iPhone: tap Share → "Add to Home Screen". The app icon will appear on your home screen like a native app.',
  },
  {
    q: 'What vehicle types are supported?',
    a: 'Sedan (4 seats), SUV (5-7 seats), Luxury (4 seats, premium), Van (7-12 seats), Bus (15+ seats). Each has different pricing tiers.',
  },
  {
    q: 'How does the matching system work?',
    a: 'Consumer creates booking → all verified providers are notified in real-time → first provider to accept gets matched → consumer is notified instantly → both can negotiate price via chat → consumer pays to confirm.',
  },
  {
    q: 'Do notifications work in real-time?',
    a: 'Yes! All notifications are delivered instantly via WebSocket connections. When a booking is created, providers see it immediately. When a provider accepts, the consumer is notified right away. Chat messages also appear in real-time.',
  },
  {
    q: 'What currency does the platform use?',
    a: 'All prices are in Nigerian Naira (₦). The platform uses Flutterwave for NGN payments.',
  },
];

export default function UserGuide() {
  const [activeSection, setActiveSection] = useState<Section>('status');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [expandedFaq, setExpandedFaq] = useState<Set<number>>(new Set());
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  const toggleItem = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const toggleFeature = (key: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalFeatures = featureCategories.reduce((sum, c) => sum + c.features.length, 0);
  const workingFeatures = featureCategories.reduce((sum, c) => sum + c.features.filter(f => f.working).length, 0);

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'status', label: 'Platform Status', icon: <Monitor size={16} /> },
    { id: 'checklist', label: 'Integration Checklist', icon: <CheckCircle2 size={16} /> },
    { id: 'consumer', label: 'Consumer Guide', icon: <Users size={16} /> },
    { id: 'provider', label: 'Provider Guide', icon: <Truck size={16} /> },
    { id: 'driver', label: 'Driver Guide', icon: <Car size={16} /> },
    { id: 'admin', label: 'Admin Guide', icon: <Shield size={16} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
            </Link>
            <img src={logoAltBlack} alt={PLATFORM_NAME} className="h-5" />
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">/ Documentation</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {/* ═══════════ PLATFORM STATUS ═══════════ */}
        {activeSection === 'status' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Platform Status — What's Built & Working</h1>
              <p className="text-muted-foreground mt-1">
                Complete inventory of every feature in {PLATFORM_NAME}. {workingFeatures}/{totalFeatures} features operational.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                  <CheckCircle2 size={14} /> {workingFeatures} Working
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                  <Circle size={14} /> {totalFeatures - workingFeatures} Pending
                </div>
              </div>
            </div>

            {featureCategories.map((cat) => (
              <div key={cat.category} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 md:p-5 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <cat.icon size={20} className="text-accent" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">{cat.category}</h2>
                      <p className="text-xs text-muted-foreground">
                        {cat.features.filter(f => f.working).length}/{cat.features.length} features working
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {cat.features.map((feature) => {
                    const key = `${cat.category}-${feature.name}`;
                    const hasDetails = feature.details && feature.details.length > 0;
                    return (
                      <div key={feature.name}>
                        <button
                          onClick={() => hasDetails && toggleFeature(key)}
                          className={`w-full flex items-center justify-between p-3 md:p-4 text-left ${hasDetails ? 'cursor-pointer hover:bg-muted/30' : 'cursor-default'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {feature.working ? (
                              <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                            ) : (
                              <Circle size={16} className="text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{feature.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                            </div>
                          </div>
                          {hasDetails && (
                            expandedFeatures.has(key) ? <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        {hasDetails && expandedFeatures.has(key) && (
                          <div className="px-4 md:px-12 pb-3 md:pb-4">
                            <ul className="space-y-1">
                              {feature.details!.map((d, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <span className="text-accent mt-0.5">•</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ═══════════ INTEGRATION CHECKLIST ═══════════ */}
        {activeSection === 'checklist' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Integration Checklist</h1>
              <p className="text-muted-foreground mt-1">
                What the product owner needs to set up before going live. Each item lists the exact steps, API providers, and costs.
              </p>
              <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">
                  <AlertTriangle size={14} /> {integrationChecklist.filter(i => i.status === 'required').length} Required — Must do before launch
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success text-xs font-semibold border border-success/20">
                  <CheckCircle2 size={14} /> {integrationChecklist.filter(i => i.status === 'done').length} Done
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold border border-border">
                  <Circle size={14} /> {integrationChecklist.filter(i => i.status === 'optional').length} Optional
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground/70 text-xs font-semibold border border-border/50">
                  <Clock size={14} /> {integrationChecklist.filter(i => i.status === 'future').length} Future
                </div>
              </div>
            </div>

            {integrationChecklist.map((item, idx) => (
              <div key={idx} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleItem(idx)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.status === 'required' ? (
                      <AlertTriangle size={18} className="text-warning flex-shrink-0" />
                    ) : item.status === 'done' ? (
                      <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                    ) : item.status === 'optional' ? (
                      <Circle size={18} className="text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Clock size={18} className="text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm md:text-base">{item.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.status === 'required' ? 'bg-warning/10 text-warning' :
                      item.status === 'done' ? 'bg-success/10 text-success' :
                      item.status === 'optional' ? 'bg-muted text-muted-foreground' :
                      'bg-muted/50 text-muted-foreground/60'
                    }`}>
                      {item.status}
                    </span>
                    {expandedItems.has(idx) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>
                {expandedItems.has(idx) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 md:px-5 pb-4 md:pb-5 border-t border-border pt-4"
                  >
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                      {item.apiProvider && (
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Provider:</strong> {item.apiProvider}
                        </p>
                      )}
                      {item.estimatedCost && (
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Cost:</strong> {item.estimatedCost}
                        </p>
                      )}
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      {item.steps.map((step, sIdx) => (
                        <p key={sIdx} className={`text-sm ${step.startsWith('✅') ? 'text-success' : step.startsWith('NOTE') ? 'text-accent font-medium' : 'text-foreground'}`}>
                          {step}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* ═══════════ CONSUMER GUIDE ═══════════ */}
        {activeSection === 'consumer' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Consumer Guide</h1>
              <p className="text-muted-foreground mt-1">How to book rides on {PLATFORM_NAME}</p>
            </div>

            <div className="space-y-4">
              {[
                { step: 1, title: 'Create an Account', icon: Users, desc: 'Visit the registration page, select "Consumer" as your role, fill in your name, email, phone, and password. Your account is created instantly.' },
                { step: 2, title: 'Start a New Booking', icon: MapPin, desc: 'From your dashboard, click "New Booking". Enter your pickup location using the search bar or use your current GPS location.' },
                { step: 3, title: 'Choose Service Type', icon: Navigation, desc: 'Select the type of service: Full Day, Half Day, To & Fro, Point-to-Point, or Event. For To & Fro and Point-to-Point, you\'ll also enter a drop-off location.' },
                { step: 4, title: 'Set Date, Time & Vehicle', icon: Car, desc: 'Choose your travel date, time, and preferred vehicle type (Sedan, SUV, Luxury, Van, or Bus). Review the estimated price range.' },
                { step: 5, title: 'Wait for Provider Match', icon: Bell, desc: 'After confirming, all verified providers are notified in real-time. A provider will accept your request within minutes. You\'ll see a notification instantly when matched.' },
                { step: 6, title: 'Negotiate & Pay', icon: CreditCard, desc: 'Chat with your matched provider to agree on a final price. Both sides can propose and counter. Once agreed, pay securely through Flutterwave to confirm.' },
                { step: 7, title: 'Enjoy Your Ride', icon: Star, desc: 'On the scheduled date, your assigned driver will arrive at your pickup location. Track your trip status in real-time from your dashboard.' },
              ].map((item) => (
                <div key={item.step} className="bg-card rounded-xl border border-border p-4 md:p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Step {item.step}: {item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════ PROVIDER GUIDE ═══════════ */}
        {activeSection === 'provider' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Provider Guide</h1>
              <p className="text-muted-foreground mt-1">How to list your fleet and manage bookings</p>
            </div>

            <div className="space-y-4">
              {[
                { step: 1, title: 'Register as a Provider', icon: Users, desc: 'Create an account and select "Provider" as your role. You\'ll be directed to the provider onboarding process.' },
                { step: 2, title: 'Complete Onboarding', icon: FileText, desc: 'Choose Individual or Company. Enter business name, address, service areas (Lagos, Abuja, etc.). Provide NIN (individual) or CAC number (company).' },
                { step: 3, title: 'Add Bank Details', icon: Wallet, desc: 'Enter bank name, account number, and account name for settlement. You can skip and add later from Settings.' },
                { step: 4, title: 'Wait for Verification', icon: Shield, desc: 'Admin reviews your application within 24-48 hours. You\'ll get a notification when approved. Cannot accept bookings until verified.' },
                { step: 5, title: 'Add Your Vehicles', icon: Car, desc: 'Fleet Management → Add Vehicle. Enter make, model, year, plate number, color, type, seats, daily rate. Toggle availability on/off.' },
                { step: 6, title: 'Add Drivers (Optional)', icon: Users, desc: 'Drivers register separately and link to your provider account. They need license + NIN verification.' },
                { step: 7, title: 'Accept Booking Requests', icon: Bell, desc: 'New bookings appear in real-time on your dashboard. Review route, date, and price range. Accept or Decline.' },
                { step: 8, title: 'Negotiate & Confirm', icon: MessageSquare, desc: 'After accepting, chat with consumer to agree on price. Send price proposals, counter, or accept. Consumer pays to confirm.' },
                { step: 9, title: 'Assign Driver & Complete', icon: Navigation, desc: 'Assign a driver and vehicle. Driver manages the trip lifecycle. Track earnings in real-time.' },
              ].map((item) => (
                <div key={item.step} className="bg-card rounded-xl border border-border p-4 md:p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Step {item.step}: {item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════ DRIVER GUIDE ═══════════ */}
        {activeSection === 'driver' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Driver Guide</h1>
              <p className="text-muted-foreground mt-1">How to register and complete trips</p>
            </div>

            <div className="space-y-4">
              {[
                { step: 1, title: 'Register as a Driver', icon: Users, desc: 'Create an account and select "Driver". You\'ll be directed to driver onboarding.' },
                { step: 2, title: 'Enter License Details', icon: FileText, desc: 'Provide your valid driver\'s license number and expiry date. Must be valid for at least 6 months.' },
                { step: 3, title: 'NIN Verification', icon: Shield, desc: 'Enter your 11-digit NIN for identity verification. This builds trust with passengers.' },
                { step: 4, title: 'Wait for Verification', icon: Clock, desc: 'Application reviewed within 24-48 hours. You\'ll be notified once approved.' },
                { step: 5, title: 'Get Assigned Trips', icon: Bell, desc: 'Once verified and linked to a provider, trip assignments appear on your dashboard in real-time.' },
                { step: 6, title: 'Start & Complete Trips', icon: Navigation, desc: 'When trip begins, tap "Start Trip". Navigate to destination. On arrival, tap "Complete Trip".' },
                { step: 7, title: 'Track Your Earnings', icon: Wallet, desc: 'View trip history and earnings breakdown. Payments settled through your provider.' },
              ].map((item) => (
                <div key={item.step} className="bg-card rounded-xl border border-border p-4 md:p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Step {item.step}: {item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════ ADMIN GUIDE ═══════════ */}
        {activeSection === 'admin' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Guide</h1>
              <p className="text-muted-foreground mt-1">Platform management and operations</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Dashboard Overview', icon: BarChart3, desc: 'Real-time platform metrics: total bookings, active trips, revenue, provider count, consumer count. Use for daily ops monitoring.' },
                { title: 'Verify Providers & Drivers', icon: Shield, desc: 'Verification page shows pending applications. Review NIN/CAC details, approve or reject. Approved providers can immediately accept bookings.' },
                { title: 'Manage Bookings', icon: Car, desc: 'View all bookings platform-wide. Filter by status. Intervene in disputes or reassign bookings.' },
                { title: 'Monitor Providers', icon: Truck, desc: 'View all providers, verification status, fleet size, earnings, ratings. Suspend providers if needed.' },
                { title: 'Consumer Management', icon: Users, desc: 'View all consumers, booking history, spending. Handle support requests.' },
                { title: 'Settlements & Finance', icon: CreditCard, desc: 'Track all payments and settlements. Monitor 10% commission, pending payouts, completed settlements.' },
                { title: 'Analytics', icon: BarChart3, desc: 'Booking trends, revenue growth, popular routes, fleet utilization charts.' },
                { title: 'System Settings', icon: Settings, desc: 'Configure commission rates, matching timeouts, notification preferences.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-card rounded-xl border border-border p-4 md:p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════ FAQ ═══════════ */}
        {activeSection === 'faq' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
              <p className="text-muted-foreground mt-1">Common questions about using {PLATFORM_NAME}</p>
            </div>

            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left"
                >
                  <h3 className="font-medium text-foreground text-sm md:text-base pr-4">{item.q}</h3>
                  {expandedFaq.has(idx) ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
                </button>
                {expandedFaq.has(idx) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 md:px-5 pb-4 md:pb-5 border-t border-border pt-3"
                  >
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
