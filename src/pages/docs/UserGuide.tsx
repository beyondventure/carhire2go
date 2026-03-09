import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Circle, AlertTriangle, ExternalLink,
  Users, Car, Truck, Shield, MapPin, CreditCard, Bell, Settings,
  ChevronDown, ChevronRight, Smartphone, Key, Globe, Database,
  FileText, BookOpen, HelpCircle, Wallet, Navigation, Star
} from 'lucide-react';
import logoAltBlack from '@/assets/logo-alt-black.png';
import { PLATFORM_NAME } from '@/lib/constants';

type Section = 'checklist' | 'consumer' | 'provider' | 'driver' | 'admin' | 'faq';

interface ChecklistItem {
  title: string;
  description: string;
  status: 'required' | 'optional' | 'future';
  steps: string[];
  apiProvider?: string;
}

const integrationChecklist: ChecklistItem[] = [
  {
    title: 'NIN (National Identification Number) Verification',
    description: 'Verify driver and individual provider identities via NIMC records.',
    status: 'required',
    apiProvider: 'VerifyMe, Prembly (Identitypass), or Youverify',
    steps: [
      'Sign up for a verification API provider (e.g., VerifyMe, Prembly, or Youverify)',
      'Obtain your API key and secret from the provider dashboard',
      'Add the API key as a backend secret named NIN_VERIFY_API_KEY',
      'Create a backend function "verify-nin" that accepts a NIN and calls the verification API',
      'Update the onboarding flow to call this function after NIN submission',
      'Store the verification result in the providers/drivers table (nin_verified field)',
      'Update admin verification dashboard to show NIN verification status',
    ],
  },
  {
    title: 'BVN (Bank Verification Number) Verification',
    description: 'Verify bank account ownership for provider payouts.',
    status: 'optional',
    apiProvider: 'Paystack, Flutterwave, or Mono',
    steps: [
      'Choose a payment provider that offers BVN verification (Paystack or Flutterwave recommended)',
      'Get your API keys from the payment provider dashboard',
      'Add the secret key as a backend secret named BVN_VERIFY_API_KEY',
      'Create a backend function "verify-bvn" that validates BVN against account details',
      'Integrate into the provider onboarding bank details step',
      'Store verification status in the providers table',
    ],
  },
  {
    title: 'CAC (Corporate Affairs Commission) Verification',
    description: 'Verify company registration for company providers.',
    status: 'required',
    apiProvider: 'VerifyMe or Prembly (Identitypass)',
    steps: [
      'Sign up for a CAC verification API provider',
      'Obtain API credentials',
      'Add the API key as a backend secret named CAC_VERIFY_API_KEY',
      'Create a backend function "verify-cac" that checks CAC registration number',
      'Update company provider onboarding to call this function',
      'Store verification result in the providers table (cac_verified field)',
    ],
  },
  {
    title: 'Vehicle Verification',
    description: 'Verify vehicle registration and roadworthiness.',
    status: 'required',
    steps: [
      'Currently handled manually by admin review in the Verification dashboard',
      'To automate: integrate with FRSC (Federal Road Safety Corps) API if available',
      'Alternatively, require providers to upload vehicle documents (registration, insurance, roadworthiness certificate)',
      'Add a document storage bucket for vehicle documents',
      'Create an admin review workflow to approve/reject vehicle documents',
      'Update the vehicles table verified field based on review outcome',
    ],
  },
  {
    title: 'Google Maps API Integration',
    description: 'Replace OpenStreetMap/Nominatim with Google Maps for better accuracy.',
    status: 'optional',
    apiProvider: 'Google Cloud Platform',
    steps: [
      'Create a Google Cloud Platform account and enable billing',
      'Enable the following APIs: Maps JavaScript API, Places API, Geocoding API, Directions API',
      'Create an API key and restrict it to your domain',
      'Add the API key as VITE_GOOGLE_MAPS_KEY in your project (this is a publishable key)',
      'Replace the Leaflet map component with Google Maps (react-google-maps or @react-google-maps/api)',
      'Update LocationInput to use Google Places Autocomplete instead of Nominatim',
      'Add route calculation using Directions API for accurate distance/duration estimates',
      'Update pricing algorithm to use actual distance from Directions API',
    ],
  },
  {
    title: 'Flutterwave Payment Integration',
    description: 'Process payments from consumers and settle with providers.',
    status: 'required',
    apiProvider: 'Flutterwave',
    steps: [
      'Sign up for a Flutterwave business account at flutterwave.com',
      'Complete KYC verification on your Flutterwave account',
      'Get your public key (already configured as publishable in the app)',
      'Add your secret key as a backend secret named FLUTTERWAVE_SECRET_KEY',
      'Create a backend function "verify-payment" to verify transaction status',
      'Set up a webhook endpoint to receive payment notifications',
      'Configure provider settlement/payout automation via Flutterwave transfers',
      'Test with Flutterwave test mode before going live',
    ],
  },
  {
    title: 'Push Notifications (Web & Mobile)',
    description: 'Send real-time notifications for bookings, trips, and messages.',
    status: 'optional',
    steps: [
      'VAPID keys are already configured in the backend',
      'Push notification backend function is already deployed',
      'For mobile: integrate Firebase Cloud Messaging (FCM) with your React Native app',
      'Add FCM server key as a backend secret named FCM_SERVER_KEY',
      'Update the push notification function to support both web push and FCM',
    ],
  },
  {
    title: 'SMS Notifications',
    description: 'Send SMS alerts for critical booking updates.',
    status: 'future',
    apiProvider: 'Termii, Africa\'s Talking, or Twilio',
    steps: [
      'Choose an SMS provider with good Nigerian coverage (Termii recommended)',
      'Sign up and get API credentials',
      'Add the API key as a backend secret named SMS_API_KEY',
      'Create a backend function "send-sms" for sending SMS',
      'Add SMS notifications to booking status change triggers',
    ],
  },
];

const faqItems = [
  {
    q: 'How do I register as a provider?',
    a: 'Click "Get Started" on the landing page, select "Provider" as your role, fill in your details, then complete the provider onboarding which includes business details, NIN/CAC verification, and bank details.',
  },
  {
    q: 'How long does verification take?',
    a: 'Once you submit your details, our team reviews applications within 24-48 hours. You\'ll receive a notification once approved.',
  },
  {
    q: 'How do I add vehicles to my fleet?',
    a: 'After being verified, go to Fleet Management in your provider dashboard, click "Add Vehicle", fill in the vehicle details (make, model, year, plate number, type), and submit.',
  },
  {
    q: 'How does pricing work?',
    a: 'Consumers set a budget range when booking. Providers can accept the proposed price or negotiate through the in-app chat. Once both parties agree, the consumer pays to confirm the booking.',
  },
  {
    q: 'How do I get paid as a provider?',
    a: 'After a trip is completed, the payment (minus 10% platform commission) is settled to your registered bank account. You can track earnings in the Earnings section.',
  },
  {
    q: 'Can I be both a provider and a driver?',
    a: 'Each account can only have one role. If you\'re an individual provider who also drives, register as a Provider. Company providers can add separate driver accounts.',
  },
  {
    q: 'What happens if a consumer cancels?',
    a: 'If cancelled before confirmation, no charge applies. After confirmation, cancellation policies apply based on how close to the scheduled date the cancellation occurs.',
  },
  {
    q: 'How do I install the app on my phone?',
    a: 'Visit the Install page (/install) from your phone\'s browser. On Android, tap "Add to Home Screen" from the browser menu. On iPhone, tap the Share button then "Add to Home Screen".',
  },
  {
    q: 'What vehicle types are supported?',
    a: 'We support Sedan, SUV, Luxury, Van, and Bus categories. Each has different seating capacity and pricing tiers.',
  },
  {
    q: 'How does the matching system work?',
    a: 'When a consumer creates a booking, all verified providers in the area are notified. Providers can review the request and accept it. The first provider to accept gets matched with the booking.',
  },
];

export default function UserGuide() {
  const [activeSection, setActiveSection] = useState<Section>('checklist');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [expandedFaq, setExpandedFaq] = useState<Set<number>>(new Set());

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

  const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
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

        {/* Integration Checklist */}
        {activeSection === 'checklist' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Integration Checklist</h1>
              <p className="text-muted-foreground mt-1">
                Steps required to activate all platform features for production use.
              </p>
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
                    ) : item.status === 'optional' ? (
                      <Circle size={18} className="text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm md:text-base">{item.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'required' ? 'bg-warning/10 text-warning' :
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
                    {item.apiProvider && (
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Recommended provider:</strong> {item.apiProvider}
                      </p>
                    )}
                    <ol className="space-y-2">
                      {item.steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground font-mono text-xs mt-0.5 flex-shrink-0">{sIdx + 1}.</span>
                          <span className="text-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Consumer Guide */}
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
                { step: 5, title: 'Wait for Provider Match', icon: Bell, desc: 'After confirming, the system notifies all verified providers. A provider will accept your request, and you\'ll be matched.' },
                { step: 6, title: 'Negotiate & Pay', icon: CreditCard, desc: 'Chat with your matched provider to agree on a final price. Once agreed, pay securely through Flutterwave to confirm your booking.' },
                { step: 7, title: 'Enjoy Your Ride', icon: Star, desc: 'On the scheduled date, your assigned driver will arrive at your pickup location. Track your trip in real-time from the app.' },
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

        {/* Provider Guide */}
        {activeSection === 'provider' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Provider Guide</h1>
              <p className="text-muted-foreground mt-1">How to list your fleet and manage bookings</p>
            </div>

            <div className="space-y-4">
              {[
                { step: 1, title: 'Register as a Provider', icon: Users, desc: 'Create an account and select "Provider" as your role. You\'ll be directed to the provider onboarding process.' },
                { step: 2, title: 'Complete Onboarding', icon: FileText, desc: 'Choose between Individual or Company provider. Fill in your business name, address, and service areas. Provide NIN (individual) or CAC number (company) for verification.' },
                { step: 3, title: 'Add Bank Details', icon: Wallet, desc: 'Enter your bank name, account number, and account name for earnings settlement. You can skip this and add later from Settings.' },
                { step: 4, title: 'Wait for Verification', icon: Shield, desc: 'Your profile will be reviewed within 24-48 hours. You\'ll receive a notification once approved. You cannot accept bookings until verified.' },
                { step: 5, title: 'Add Your Vehicles', icon: Car, desc: 'Once verified, go to Fleet Management → Add Vehicle. Enter vehicle details: make, model, year, plate number, color, type, seats, and daily rate. Toggle availability on/off.' },
                { step: 6, title: 'Add Drivers (Optional)', icon: Users, desc: 'If you have employees, they can register as Drivers and link to your provider account. Drivers need their own license and NIN verification.' },
                { step: 7, title: 'Accept Booking Requests', icon: Bell, desc: 'When consumers book, you\'ll see incoming requests in your dashboard. Review the route, date, and price range, then Accept or Decline.' },
                { step: 8, title: 'Negotiate & Confirm', icon: CreditCard, desc: 'After accepting, chat with the consumer to agree on pricing. Once the consumer pays, the booking is confirmed and assigned to your fleet.' },
                { step: 9, title: 'Assign Driver & Complete', icon: Navigation, desc: 'Assign a driver and vehicle to the confirmed booking. The driver manages the trip (start/complete) from their app. Track earnings in real-time.' },
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

        {/* Driver Guide */}
        {activeSection === 'driver' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Driver Guide</h1>
              <p className="text-muted-foreground mt-1">How to register and complete trips</p>
            </div>

            <div className="space-y-4">
              {[
                { step: 1, title: 'Register as a Driver', icon: Users, desc: 'Create an account and select "Driver". You\'ll be directed to the driver onboarding process.' },
                { step: 2, title: 'Enter License Details', icon: FileText, desc: 'Provide your valid driver\'s license number and expiry date. The license must be valid for at least 6 months.' },
                { step: 3, title: 'NIN Verification', icon: Shield, desc: 'Enter your 11-digit NIN (National Identification Number) for identity verification. This builds trust with passengers.' },
                { step: 4, title: 'Wait for Verification', icon: Settings, desc: 'Your application is reviewed within 24-48 hours. You\'ll be notified once approved.' },
                { step: 5, title: 'Get Assigned Trips', icon: Bell, desc: 'Once verified and linked to a provider, you\'ll receive trip assignments. Confirmed bookings appear on your dashboard.' },
                { step: 6, title: 'Start & Complete Trips', icon: Navigation, desc: 'When the trip begins, tap "Start Trip". Navigate to the destination. Upon arrival, tap "Complete Trip" to finish.' },
                { step: 7, title: 'Track Your Earnings', icon: Wallet, desc: 'View your trip history and earnings breakdown in the Earnings section. Payments are settled through your provider.' },
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

        {/* Admin Guide */}
        {activeSection === 'admin' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Guide</h1>
              <p className="text-muted-foreground mt-1">Platform management and operations</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Dashboard Overview', icon: BookOpen, desc: 'The admin dashboard shows real-time platform metrics: total bookings, active trips, revenue, provider count, and consumer count. Use this for daily operational monitoring.' },
                { title: 'Verify Providers & Drivers', icon: Shield, desc: 'Go to Verification to review pending applications. Check NIN/CAC details, review documents, and approve or reject applications. Approved providers can immediately start accepting bookings.' },
                { title: 'Manage Bookings', icon: Car, desc: 'View all bookings across the platform. Filter by status (pending, confirmed, completed, cancelled). Intervene in disputes or reassign bookings if needed.' },
                { title: 'Monitor Providers', icon: Truck, desc: 'View all registered providers, their verification status, fleet size, earnings, and ratings. Suspend providers if needed.' },
                { title: 'Consumer Management', icon: Users, desc: 'View all consumers, their booking history, and spending. Handle support requests and account issues.' },
                { title: 'Settlements & Finance', icon: CreditCard, desc: 'Track all payments and settlements. Monitor platform commission (10%), pending payouts, and completed settlements.' },
                { title: 'Analytics', icon: Star, desc: 'View platform analytics including booking trends, revenue growth, popular routes, and fleet utilization metrics.' },
                { title: 'System Settings', icon: Settings, desc: 'Configure platform settings like commission rates, matching timeouts, and notification preferences.' },
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

        {/* FAQ */}
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
