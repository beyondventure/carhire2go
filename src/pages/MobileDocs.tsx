import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Download, ArrowLeft, Loader2, Smartphone, Database, Shield, Users,
  Car, MapPin, CreditCard, MessageSquare, Bell, Code, Globe, Lock,
  Zap, BarChart3, CheckCircle, AlertCircle, ArrowRight, FileText,
  Settings, Navigation, Wallet, Clock, Star, Building, Key, Wifi,
  Server, GitBranch, Layers, Monitor, RefreshCw, Package, Terminal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SECTIONS = [
  { id: 'brd', label: 'BRD' },
  { id: 'prd', label: 'PRD' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'database', label: 'Database' },
  { id: 'api', label: 'API & Flows' },
  { id: 'screens', label: 'Screens' },
  { id: 'mobile', label: 'Mobile Guide' },
  { id: 'security', label: 'Security' },
];

export default function MobileDocs() {
  const [activeSection, setActiveSection] = useState('brd');
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210, pageH = 297, margin = 10;

      for (let i = 0; i < SECTIONS.length; i++) {
        setActiveSection(SECTIONS[i].id);
        await new Promise(r => setTimeout(r, 200));
        if (!contentRef.current) continue;

        const canvas = await html2canvas(contentRef.current, {
          scale: 1.5, backgroundColor: '#ffffff', logging: false, useCORS: true
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        if (i > 0) pdf.addPage();

        // Header bar
        pdf.setFillColor(10, 10, 10);
        pdf.rect(0, 0, pageW, 14, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('InstantRyde — Mobile Developer Documentation', margin, 9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(SECTIONS[i].label, pageW - margin, 9, { align: 'right' });

        const contentW = pageW - margin * 2;
        const imgRatio = canvas.height / canvas.width;
        const maxH = pageH - 28;
        let finalW = contentW, finalH = contentW * imgRatio;
        if (finalH > maxH) { finalH = maxH; finalW = finalH / imgRatio; }
        const xOff = (pageW - finalW) / 2;
        pdf.addImage(imgData, 'JPEG', xOff, 17, finalW, finalH);

        // Footer
        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(7);
        pdf.text(`Page ${i + 1} of ${SECTIONS.length} · Confidential`, pageW / 2, pageH - 4, { align: 'center' });
      }

      setActiveSection('brd');
      pdf.save('InstantRyde-Mobile-Developer-Docs.pdf');
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">InstantRyde — Mobile Developer Docs</h1>
              <p className="text-xs text-muted-foreground">BRD · PRD · Architecture · API Reference · iOS & Android Guide</p>
            </div>
          </div>
          <Button onClick={handleExportPDF} disabled={isExporting} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            {isExporting ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><Download className="h-4 w-4" />Export PDF</>}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="flex flex-wrap gap-1 h-auto mb-8 bg-muted/40 p-1 rounded-lg">
            {SECTIONS.map(s => (
              <TabsTrigger key={s.id} value={s.id} className="text-sm">{s.label}</TabsTrigger>
            ))}
          </TabsList>

          <div ref={contentRef} className="bg-background">
            <TabsContent value="brd"><BRDSection /></TabsContent>
            <TabsContent value="prd"><PRDSection /></TabsContent>
            <TabsContent value="architecture"><ArchSection /></TabsContent>
            <TabsContent value="database"><DatabaseSection /></TabsContent>
            <TabsContent value="api"><APISection /></TabsContent>
            <TabsContent value="screens"><ScreensSection /></TabsContent>
            <TabsContent value="mobile"><MobileGuideSection /></TabsContent>
            <TabsContent value="security"><SecuritySection /></TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION: BRD
// ─────────────────────────────────────────────────────────────
function BRDSection() {
  return (
    <div className="space-y-8">
      <DocHeader
        title="Business Requirements Document (BRD)"
        subtitle="InstantRyde Platform · Version 1.0 · February 2026"
        icon={<FileText className="h-6 w-6" />}
      />

      <TwoCol
        left={
          <InfoCard title="Executive Summary" icon={<Star className="h-4 w-4 text-yellow-500" />}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              InstantRyde is an enterprise-grade on-demand vehicle hire marketplace operating in Nigeria.
              It connects <strong>consumers</strong> seeking transportation with <strong>fleet providers</strong> and
              professional <strong>drivers</strong>. The platform enables real-time booking, price negotiation,
              fleet management, and automated settlement — all underpinned by a secure cloud backend.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mt-3">
              The business model generates revenue through a <strong>10% commission</strong> on every completed booking,
              with settlements disbursed to providers after deducting platform and gateway fees.
            </p>
          </InfoCard>
        }
        right={
          <InfoCard title="Business Objectives" icon={<CheckCircle className="h-4 w-4 text-green-500" />}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Create a trusted marketplace connecting consumers with vetted vehicle providers',
                'Reduce booking friction through real-time matching and negotiation',
                'Enable fleet providers to efficiently manage vehicles, drivers and earnings',
                'Generate sustainable revenue via transparent 10% commission model',
                'Ensure regulatory compliance with Nigerian NIN & CAC verification',
                'Expand to all major Nigerian cities starting with Lagos & Abuja',
              ].map(o => <li key={o} className="flex gap-2"><ArrowRight className="h-3 w-3 shrink-0 mt-0.5 text-foreground" />{o}</li>)}
            </ul>
          </InfoCard>
        }
      />

      <InfoCard title="Stakeholders & User Personas" icon={<Users className="h-4 w-4 text-blue-500" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { role: 'Consumer', icon: '👤', desc: 'Individuals or corporates needing hire cars for events, trips or daily use. Tech-savvy, aged 22–50, urban Nigeria.' },
            { role: 'Provider', icon: '🏢', desc: 'Fleet owners or individual car owners monetising idle vehicles. Ranges from single-car owners to 50+ vehicle companies.' },
            { role: 'Driver', icon: '🚗', desc: 'Professional drivers assigned by providers. Manages availability, executes trips, tracks earnings.' },
            { role: 'Admin', icon: '🛡️', desc: 'InstantRyde operations team. Verifies identities, manages disputes, views platform analytics, processes settlements.' },
          ].map(p => (
            <div key={p.role} className="bg-muted/40 rounded-lg p-4 space-y-2">
              <div className="text-2xl">{p.icon}</div>
              <p className="font-semibold text-sm">{p.role}</p>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Business Rules" icon={<Shield className="h-4 w-4 text-purple-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { rule: 'Commission Rate', detail: '10% of final booking price deducted before settlement' },
            { rule: 'Provider Verification', detail: 'Providers must submit NIN + CAC documents. Status: pending → under_review → approved/rejected' },
            { rule: 'Driver Verification', detail: 'Drivers require valid license + NIN. Must be linked to a verified provider' },
            { rule: 'Matching Timeout', detail: 'Booking automatically expires if no provider accepts within 60 seconds' },
            { rule: 'Price Negotiation', detail: 'Providers can toggle negotiation. Max 5 rounds of counter-offers via in-app chat' },
            { rule: 'Currency', detail: 'All transactions in Nigerian Naira (₦ / NGN). Payment via Flutterwave gateway' },
            { rule: 'Booking Types', detail: 'Full-day, Half-day (≤6h), To-and-Fro, Point-to-Point, Event hire' },
            { rule: 'Service Areas', detail: 'Lagos, Abuja, Port Harcourt, Ibadan, Kano, Kaduna, Benin City, Enugu, Calabar, Warri' },
          ].map(b => (
            <div key={b.rule} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-foreground mt-1.5 shrink-0" />
              <div><strong className="text-xs uppercase tracking-wide">{b.rule}</strong><p className="text-muted-foreground mt-0.5">{b.detail}</p></div>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Constraints & Assumptions" icon={<AlertCircle className="h-4 w-4 text-orange-500" />}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">Constraints</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {['Must operate on mobile (iOS 14+ / Android 10+)', 'Flutterwave for all payment processing (NGN only)', 'NIN verification via government database API', 'Offline-capable for low connectivity areas', 'Must handle 10,000+ concurrent sessions at scale'].map(c => <li key={c} className="flex gap-2"><span className="text-red-400">·</span>{c}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Assumptions</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {['Users have smartphones with internet access', 'Providers have valid Nigerian bank accounts for payouts', 'Drivers possess valid Nigerian driving licences', 'GPS/location services available on consumer devices', 'Push notifications supported on target devices'].map(a => <li key={a} className="flex gap-2"><span className="text-green-400">·</span>{a}</li>)}
            </ul>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION: PRD
// ─────────────────────────────────────────────────────────────
function PRDSection() {
  return (
    <div className="space-y-8">
      <DocHeader title="Product Requirements Document (PRD)" subtitle="Feature Specifications · Acceptance Criteria · User Stories" icon={<Package className="h-6 w-6" />} />

      <InfoCard title="Consumer App — Feature Specifications" icon={<Users className="h-4 w-4 text-blue-500" />}>
        <FeatureTable features={[
          { id: 'CON-001', feature: 'Registration & Login', priority: 'P0', story: 'As a consumer, I can register with email/password and select my role', acceptance: 'Account created, role assigned, redirected to dashboard' },
          { id: 'CON-002', feature: 'Create Booking', priority: 'P0', story: 'As a consumer, I can set pickup, dropoff, booking type, vehicle preference, date/time', acceptance: 'Booking saved with status=pending, matching initiated' },
          { id: 'CON-003', feature: 'Real-time Matching', priority: 'P0', story: 'As a consumer, I see a live overlay while the system finds a provider', acceptance: 'Overlay shows within 2s, times out at 60s with cancellation option' },
          { id: 'CON-004', feature: 'Price Negotiation', priority: 'P1', story: 'As a consumer, I can see and counter price proposals in an in-app chat', acceptance: 'Messages appear in real-time, price proposals highlighted distinctly' },
          { id: 'CON-005', feature: 'Payment via Flutterwave', priority: 'P0', story: 'As a consumer, I can pay for confirmed bookings via card/bank transfer', acceptance: 'Payment confirmed, booking status updates, receipt available' },
          { id: 'CON-006', feature: 'Booking History', priority: 'P1', story: 'As a consumer, I can view all past and active bookings with filters', acceptance: 'Filtered by All/Active/Completed/Cancelled, searchable' },
          { id: 'CON-007', feature: 'Profile Management', priority: 'P2', story: 'As a consumer, I can update my name, phone, and saved locations', acceptance: 'Changes persist across sessions' },
          { id: 'CON-008', feature: 'Push Notifications', priority: 'P1', story: 'As a consumer, I receive push notifications for booking status changes', acceptance: 'Notifications arrive within 5s of status change' },
        ]} />
      </InfoCard>

      <InfoCard title="Provider App — Feature Specifications" icon={<Building className="h-4 w-4 text-green-500" />}>
        <FeatureTable features={[
          { id: 'PRO-001', feature: 'Provider Onboarding', priority: 'P0', story: 'As a provider, I can complete onboarding with business info, NIN, and bank details', acceptance: 'Profile created with status=pending, admin notified' },
          { id: 'PRO-002', feature: 'Booking Requests', priority: 'P0', story: 'As a provider, I can view pending requests and accept/decline within 60s', acceptance: 'On accept, booking status → matched; on decline, booking remains pending' },
          { id: 'PRO-003', feature: 'Fleet Management', priority: 'P0', story: 'As a provider, I can add/edit vehicles with type, plate, images, and rate', acceptance: 'Vehicle visible in fleet list, can be assigned to drivers' },
          { id: 'PRO-004', feature: 'Driver Management', priority: 'P1', story: 'As a provider, I can add drivers and assign vehicles to them', acceptance: 'Driver linked to provider, vehicle assignment persists' },
          { id: 'PRO-005', feature: 'Price Negotiation Toggle', priority: 'P1', story: 'As a provider, I can enable/disable price negotiation per account', acceptance: 'Toggle saved, consumer sees correct negotiation option' },
          { id: 'PRO-006', feature: 'Earnings Dashboard', priority: 'P1', story: "As a provider, I can view today's earnings, weekly chart and transaction history", acceptance: 'Data accurate, chart updates in real-time' },
          { id: 'PRO-007', feature: 'Settlement Payouts', priority: 'P1', story: 'As a provider, I receive payouts to registered bank after commission deduction', acceptance: 'Payout marked complete, transaction reference provided' },
        ]} />
      </InfoCard>

      <InfoCard title="Driver App — Feature Specifications" icon={<Car className="h-4 w-4 text-orange-500" />}>
        <FeatureTable features={[
          { id: 'DRV-001', feature: 'Driver Onboarding', priority: 'P0', story: 'As a driver, I can register with license number, expiry, NIN and link to a provider', acceptance: 'Driver profile created, verification initiated' },
          { id: 'DRV-002', feature: 'Trip Management', priority: 'P0', story: 'As a driver, I can see assigned trips and start/complete them', acceptance: 'Start updates booking status to in-progress; complete updates to completed' },
          { id: 'DRV-003', feature: 'Availability Toggle', priority: 'P1', story: 'As a driver, I can go online/offline to accept or pause trips', acceptance: 'Available flag updated in DB within 1s' },
          { id: 'DRV-004', feature: 'Navigation', priority: 'P1', story: 'As a driver, I can view the pickup/dropoff map and get navigation directions', acceptance: 'Map renders with correct pins, directions open in native map app' },
          { id: 'DRV-005', feature: 'Earnings View', priority: 'P2', story: 'As a driver, I can view my earnings per trip and total for the week', acceptance: 'Earnings calculated correctly, exportable to CSV' },
        ]} />
      </InfoCard>

      <InfoCard title="Admin Portal — Feature Specifications" icon={<Shield className="h-4 w-4 text-purple-500" />}>
        <FeatureTable features={[
          { id: 'ADM-001', feature: 'Verification Queue', priority: 'P0', story: 'As admin, I can review and approve/reject provider and driver verification requests', acceptance: 'Status updated, provider/driver notified via notification' },
          { id: 'ADM-002', feature: 'Platform Analytics', priority: 'P1', story: 'As admin, I can view GMV, bookings, user growth and geographic distribution', acceptance: 'Charts render correctly, data refreshes every 5 minutes' },
          { id: 'ADM-003', feature: 'Settlement Management', priority: 'P0', story: 'As admin, I can view pending settlements and trigger payouts', acceptance: 'Payout status tracked: pending → processing → completed/failed' },
          { id: 'ADM-004', feature: 'Booking Oversight', priority: 'P1', story: 'As admin, I can view, filter and manage all bookings on the platform', acceptance: 'Full CRUD access, can cancel any booking' },
        ]} />
      </InfoCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION: ARCHITECTURE
// ─────────────────────────────────────────────────────────────
function ArchSection() {
  return (
    <div className="space-y-8">
      <DocHeader title="System Architecture" subtitle="High-Level Design · Component Hierarchy · Data Flow" icon={<Layers className="h-6 w-6" />} />

      <InfoCard title="High-Level Architecture" icon={<Globe className="h-4 w-4 text-blue-500" />}>
        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          {/* Client Layer */}
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Client Layer</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Consumer App', color: 'bg-blue-500', sub: 'React Native / iOS & Android' },
                { label: 'Provider App', color: 'bg-green-500', sub: 'React Native / iOS & Android' },
                { label: 'Driver App', color: 'bg-orange-500', sub: 'React Native / iOS & Android' },
                { label: 'Admin Portal', color: 'bg-purple-500', sub: 'Web — React (existing)' },
              ].map(a => (
                <div key={a.label} className="text-center">
                  <div className={`${a.color} rounded-lg py-3 text-white text-xs font-semibold`}>{a.label}</div>
                  <p className="text-xs text-muted-foreground mt-1">{a.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Gateway */}
          <div className="border border-border rounded-lg p-4 bg-foreground/5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">API & Auth Layer</p>
            <div className="flex flex-wrap gap-2">
              {['REST API (PostgREST)', 'WebSocket Realtime', 'JWT Authentication', 'Row Level Security', 'Rate Limiting', 'Edge Functions (Deno)'].map(b => <Badge key={b} variant="outline" className="text-xs">{b}</Badge>)}
            </div>
          </div>

          {/* Services */}
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Core Services</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: 'Booking Engine', icon: <FileText className="h-4 w-4" />, color: 'text-blue-500' },
                { name: 'Matching Service', icon: <Zap className="h-4 w-4" />, color: 'text-yellow-500' },
                { name: 'Payment Service', icon: <CreditCard className="h-4 w-4" />, color: 'text-green-500' },
                { name: 'Notification Service', icon: <Bell className="h-4 w-4" />, color: 'text-orange-500' },
                { name: 'Analytics Engine', icon: <BarChart3 className="h-4 w-4" />, color: 'text-purple-500' },
              ].map(s => (
                <div key={s.name} className="bg-background border border-border rounded-lg p-3 text-center">
                  <div className={`${s.color} flex justify-center mb-1`}>{s.icon}</div>
                  <p className="text-xs font-medium">{s.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Layer */}
          <div className="border border-border rounded-lg p-4 bg-muted/20">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Data Layer (Lovable Cloud / PostgreSQL)</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'PostgreSQL', sub: '9 tables, RLS enforced' },
                { label: 'Object Storage', sub: 'Vehicle images, CAC docs' },
                { label: 'Realtime Engine', sub: 'WebSocket pub/sub' },
              ].map(d => (
                <div key={d.label} className="bg-background border border-border rounded-lg p-3 text-center">
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{d.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* External */}
          <div className="border border-border rounded-lg p-3 bg-muted/10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">External Services</p>
            <div className="flex flex-wrap gap-2">
              {['Flutterwave (Payments)', 'Web Push VAPID (Notifications)', 'Google Maps / Leaflet (Maps)', 'NIN Verification API', 'CAC Portal'].map(e => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
            </div>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Booking Lifecycle State Machine" icon={<GitBranch className="h-4 w-4 text-green-500" />}>
        <div className="overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max py-4">
            {[
              { status: 'pending', color: 'bg-zinc-500', desc: 'Consumer creates booking' },
              { status: 'matching', color: 'bg-yellow-500', desc: 'System seeks provider' },
              { status: 'matched', color: 'bg-blue-500', desc: 'Provider accepted' },
              { status: 'negotiating', color: 'bg-orange-500', desc: 'Price chat active' },
              { status: 'confirmed', color: 'bg-green-500', desc: 'Price agreed, payment' },
              { status: 'in-progress', color: 'bg-purple-500', desc: 'Trip underway' },
              { status: 'completed', color: 'bg-emerald-500', desc: 'Trip done, settle' },
            ].map((s, i, arr) => (
              <div key={s.status} className="flex items-center gap-2">
                <div className="text-center">
                  <div className={`${s.color} text-white rounded-full px-3 py-1 text-xs font-bold`}>{s.status}</div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-16">{s.desc}</p>
                </div>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Any state except <code className="bg-muted px-1 rounded">completed</code> can transition to <code className="bg-muted px-1 rounded">cancelled</code></p>
        </div>
      </InfoCard>

      <InfoCard title="Technology Stack" icon={<Code className="h-4 w-4 text-foreground" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Current Web Frontend', icon: <Monitor className="h-4 w-4" />, items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'React Router v6', 'TanStack Query', 'shadcn/ui', 'Leaflet Maps'] },
            { label: 'Mobile (Target)', icon: <Smartphone className="h-4 w-4" />, items: ['React Native 0.74+', 'TypeScript', 'NativeWind / StyleSheet', 'React Navigation v6', 'react-native-maps', 'react-query', 'react-native-reanimated', 'expo-notifications'] },
            { label: 'Backend (Cloud)', icon: <Server className="h-4 w-4" />, items: ['PostgreSQL 14', 'PostgREST (auto REST)', 'Deno Edge Functions', 'Supabase Realtime', 'Row Level Security', 'JWT + GoTrue Auth', 'Object Storage', 'VAPID Push'] },
            { label: 'External Services', icon: <Globe className="h-4 w-4" />, items: ['Flutterwave (payments)', 'Google Maps SDK', 'NIMC (NIN verify)', 'CAC Portal', 'Firebase (alt push)', 'Sentry (errors)', 'Mixpanel (analytics)'] },
          ].map(g => (
            <div key={g.label} className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">{g.icon}{g.label}</div>
              <div className="flex flex-wrap gap-1">
                {g.items.map(i => <Badge key={i} variant="outline" className="text-xs">{i}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION: DATABASE
// ─────────────────────────────────────────────────────────────
function DatabaseSection() {
  return (
    <div className="space-y-8">
      <DocHeader title="Database Schema" subtitle="PostgreSQL · Row Level Security · Enums · Relationships" icon={<Database className="h-6 w-6" />} />

      <InfoCard title="Enum Types" icon={<Code className="h-4 w-4" />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'app_role', values: ['consumer', 'provider', 'driver', 'admin'] },
            { name: 'booking_status', values: ['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress', 'completed', 'cancelled'] },
            { name: 'booking_type', values: ['full-day', 'half-day', 'to-and-fro', 'point-to-point', 'event'] },
            { name: 'vehicle_type', values: ['sedan', 'suv', 'luxury', 'van', 'bus'] },
            { name: 'verification_status', values: ['pending', 'under_review', 'approved', 'rejected'] },
            { name: 'provider_type', values: ['individual', 'company'] },
          ].map(e => (
            <div key={e.name} className="bg-muted/30 rounded-lg p-3">
              <code className="text-xs font-bold text-foreground">{e.name}</code>
              <div className="flex flex-wrap gap-1 mt-2">
                {e.values.map(v => <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      </InfoCard>

      {[
        {
          table: 'profiles', desc: 'Mirrors auth.users — stores display-safe user info',
          cols: [
            { name: 'id', type: 'UUID PK', note: 'Matches auth.uid()' },
            { name: 'email', type: 'TEXT', note: 'User email (NOT NULL)' },
            { name: 'name', type: 'TEXT', note: 'Full name (NOT NULL)' },
            { name: 'phone', type: 'TEXT', note: 'Optional phone number' },
            { name: 'avatar_url', type: 'TEXT', note: 'Profile image URL' },
            { name: 'created_at / updated_at', type: 'TIMESTAMPTZ', note: 'Auto-managed' },
          ],
          rls: ['SELECT/UPDATE/INSERT: auth.uid() = id', 'Admin: has_role(uid, admin)', 'Provider: can view consumer profiles for their bookings']
        },
        {
          table: 'user_roles', desc: 'Maps users to their platform roles (one or more)',
          cols: [
            { name: 'id', type: 'UUID PK', note: 'Auto-generated' },
            { name: 'user_id', type: 'UUID', note: 'References auth user' },
            { name: 'role', type: 'app_role', note: 'consumer | provider | driver | admin' },
            { name: 'created_at', type: 'TIMESTAMPTZ', note: 'Auto-managed' },
          ],
          rls: ['SELECT/INSERT: auth.uid() = user_id', 'Admin: full access']
        },
        {
          table: 'providers', desc: 'Fleet owner business profiles and verification state',
          cols: [
            { name: 'id', type: 'UUID PK', note: '' },
            { name: 'user_id', type: 'UUID', note: 'Auth user reference' },
            { name: 'business_name', type: 'TEXT', note: 'Trading name' },
            { name: 'provider_type', type: 'provider_type', note: 'individual | company' },
            { name: 'business_address', type: 'TEXT', note: '' },
            { name: 'nin_number / cac_number', type: 'TEXT', note: 'Verification IDs' },
            { name: 'nin_verified / cac_verified', type: 'BOOLEAN', note: 'Defaults false' },
            { name: 'verification_status', type: 'verification_status', note: 'Default pending' },
            { name: 'allows_negotiation', type: 'BOOLEAN', note: 'Default true' },
            { name: 'service_areas', type: 'TEXT[]', note: 'Array of city names' },
            { name: 'rating / total_bookings / acceptance_rate', type: 'NUMERIC/INT', note: 'Aggregated metrics' },
            { name: 'bank_name / account_number / account_name', type: 'TEXT', note: 'Payout details' },
          ],
          rls: ['SELECT/UPDATE/INSERT: auth.uid() = user_id', 'Consumer: can view approved providers', 'Admin: full access']
        },
        {
          table: 'drivers', desc: 'Individual driver profiles linked to a provider',
          cols: [
            { name: 'id', type: 'UUID PK', note: '' },
            { name: 'user_id', type: 'UUID', note: 'Driver auth user' },
            { name: 'provider_id', type: 'UUID FK → providers', note: 'Nullable (independent driver)' },
            { name: 'license_number', type: 'TEXT', note: 'NOT NULL' },
            { name: 'license_expiry', type: 'DATE', note: 'NOT NULL' },
            { name: 'nin_number', type: 'TEXT', note: '' },
            { name: 'nin_verified', type: 'BOOLEAN', note: 'Default false' },
            { name: 'verification_status', type: 'verification_status', note: '' },
            { name: 'assigned_vehicle_id', type: 'UUID FK → vehicles', note: 'Nullable' },
            { name: 'available', type: 'BOOLEAN', note: 'Default true' },
            { name: 'rating / total_trips', type: 'NUMERIC/INT', note: '' },
          ],
          rls: ['Driver: own record only', 'Provider: their linked drivers', 'Admin: full access']
        },
        {
          table: 'vehicles', desc: 'Fleet vehicles owned by providers',
          cols: [
            { name: 'id', type: 'UUID PK', note: '' },
            { name: 'provider_id', type: 'UUID FK → providers', note: 'NOT NULL' },
            { name: 'make / model / year / color', type: 'TEXT / INT', note: '' },
            { name: 'plate_number', type: 'TEXT', note: '' },
            { name: 'vehicle_type', type: 'vehicle_type', note: 'sedan|suv|luxury|van|bus' },
            { name: 'seats', type: 'INT', note: 'Default 4' },
            { name: 'daily_rate', type: 'NUMERIC', note: 'Base rate in ₦' },
            { name: 'available / verified', type: 'BOOLEAN', note: 'Both default false' },
            { name: 'assigned_driver_id', type: 'UUID FK → drivers', note: 'Nullable' },
            { name: 'images', type: 'TEXT[]', note: 'Storage URLs' },
          ],
          rls: ['Provider: full CRUD on own vehicles', 'Everyone: can view available + verified', 'Admin: full access']
        },
        {
          table: 'bookings', desc: 'Core booking records — central to all platform activity',
          cols: [
            { name: 'id', type: 'UUID PK', note: '' },
            { name: 'consumer_id', type: 'UUID', note: 'NOT NULL — auth user' },
            { name: 'provider_id / driver_id / vehicle_id', type: 'UUID FK (nullable)', note: 'Set during matching' },
            { name: 'pickup_address / pickup_name', type: 'TEXT', note: '' },
            { name: 'pickup_lat / pickup_lng', type: 'NUMERIC', note: 'Required' },
            { name: 'dropoff_address / dropoff_name / dropoff_lat / dropoff_lng', type: 'NUMERIC/TEXT', note: '' },
            { name: 'booking_type', type: 'booking_type', note: 'NOT NULL' },
            { name: 'vehicle_preference', type: 'vehicle_type', note: 'Nullable' },
            { name: 'scheduled_date / scheduled_time', type: 'DATE / TIME', note: 'NOT NULL' },
            { name: 'status', type: 'booking_status', note: 'Default pending' },
            { name: 'estimated_min_price / estimated_max_price', type: 'NUMERIC', note: 'Price range shown to consumer' },
            { name: 'negotiated_price / final_price', type: 'NUMERIC', note: 'Set during negotiation' },
            { name: 'matching/matched/confirmed/started/completed/cancelled_at', type: 'TIMESTAMPTZ', note: 'Lifecycle timestamps' },
          ],
          rls: ['Consumer: own bookings', 'Provider: pending bookings + assigned', 'Driver: assigned trips', 'Admin: full access']
        },
        {
          table: 'chat_messages', desc: 'In-app negotiation chat messages per booking',
          cols: [
            { name: 'id', type: 'UUID PK', note: '' },
            { name: 'booking_id', type: 'UUID FK → bookings', note: 'NOT NULL' },
            { name: 'sender_id', type: 'UUID', note: 'Auth user' },
            { name: 'sender_role', type: 'app_role', note: 'consumer | provider' },
            { name: 'message_type', type: 'TEXT', note: 'text | price-proposal | price-accepted | system' },
            { name: 'content', type: 'TEXT', note: 'Message body' },
            { name: 'proposed_price', type: 'NUMERIC', note: 'For price-proposal messages' },
            { name: 'created_at', type: 'TIMESTAMPTZ', note: '' },
          ],
          rls: ['Booking participants only (consumer + provider + driver)', 'No UPDATE or DELETE allowed']
        },
        {
          table: 'payments', desc: 'Payment records tied to bookings, processed by Flutterwave',
          cols: [
            { name: 'id', type: 'UUID PK', note: '' },
            { name: 'booking_id', type: 'UUID FK → bookings', note: 'NOT NULL' },
            { name: 'consumer_id / provider_id', type: 'UUID', note: '' },
            { name: 'amount', type: 'NUMERIC', note: 'In NGN' },
            { name: 'currency', type: 'TEXT', note: 'Default NGN' },
            { name: 'status', type: 'TEXT', note: 'pending | successful | failed' },
            { name: 'flutterwave_tx_id / flutterwave_ref', type: 'TEXT', note: 'Gateway references' },
            { name: 'payment_method', type: 'TEXT', note: 'card | bank_transfer etc.' },
            { name: 'customer_email / customer_name / customer_phone', type: 'TEXT', note: '' },
            { name: 'metadata', type: 'JSONB', note: 'Extra gateway data' },
          ],
          rls: ['Consumer: own payments', 'Provider: payments for their bookings', 'Admin: full access']
        },
      ].map(t => (
        <InfoCard key={t.table} title={`Table: ${t.table}`} icon={<Database className="h-4 w-4" />}>
          <p className="text-sm text-muted-foreground mb-3">{t.desc}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-muted/50"><th className="text-left p-2 rounded-l">Column</th><th className="text-left p-2">Type</th><th className="text-left p-2 rounded-r">Notes</th></tr></thead>
              <tbody>{t.cols.map((c, i) => <tr key={c.name} className={i % 2 === 0 ? 'bg-muted/20' : ''}><td className="p-2 font-mono">{c.name}</td><td className="p-2 text-muted-foreground">{c.type}</td><td className="p-2 text-muted-foreground">{c.note}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold mb-1">RLS Policies:</p>
            <div className="flex flex-wrap gap-1">{t.rls.map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}</div>
          </div>
        </InfoCard>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION: API & FLOWS
// ─────────────────────────────────────────────────────────────
function APISection() {
  return (
    <div className="space-y-8">
      <DocHeader title="API Reference & Data Flows" subtitle="Authentication · REST Endpoints · Realtime · Edge Functions" icon={<Server className="h-6 w-6" />} />

      <InfoCard title="Authentication Flow" icon={<Key className="h-4 w-4 text-yellow-500" />}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold mb-3">Registration</h4>
            <ol className="space-y-2 text-sm">
              {[
                'POST /auth/v1/signup → creates auth.user + session',
                'Insert into user_roles (user_id, role)',
                'Trigger: handle_new_user() → inserts into profiles',
                'Redirect based on role: consumer→/consumer, provider→/onboarding/provider, driver→/onboarding/driver',
              ].map((s, i) => <li key={i} className="flex gap-2"><span className="text-muted-foreground font-mono text-xs">{i+1}.</span><span className="text-muted-foreground text-xs">{s}</span></li>)}
            </ol>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-3">Login & Session</h4>
            <ol className="space-y-2 text-sm">
              {[
                'POST /auth/v1/token?grant_type=password → JWT + refresh token',
                'Client stores tokens in localStorage (web) / SecureStore (mobile)',
                'Auto-refresh via supabase.auth.onAuthStateChange()',
                'Fetch profiles + user_roles for role-based routing',
                'All API calls include Authorization: Bearer <jwt>',
              ].map((s, i) => <li key={i} className="flex gap-2"><span className="text-muted-foreground font-mono text-xs">{i+1}.</span><span className="text-muted-foreground text-xs">{s}</span></li>)}
            </ol>
          </div>
        </div>
        <Separator className="my-4" />
        <div>
          <h4 className="text-sm font-bold mb-2">Base URL</h4>
          <code className="text-xs bg-muted px-3 py-2 rounded block">https://oeadjjfyafneixxcwlfn.supabase.co</code>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">REST: /rest/v1/{`{table}`}</Badge>
            <Badge variant="outline" className="text-xs">Auth: /auth/v1/</Badge>
            <Badge variant="outline" className="text-xs">Realtime: wss://…/realtime/v1</Badge>
            <Badge variant="outline" className="text-xs">Functions: /functions/v1/{`{name}`}</Badge>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Key API Operations" icon={<RefreshCw className="h-4 w-4 text-blue-500" />}>
        <div className="space-y-3">
          {[
            { method: 'GET', path: '/rest/v1/bookings', desc: 'Fetch bookings — RLS auto-filters by role', auth: true },
            { method: 'POST', path: '/rest/v1/bookings', desc: 'Create new booking (consumer_id = auth.uid())', auth: true },
            { method: 'PATCH', path: '/rest/v1/bookings?id=eq.:id', desc: 'Update booking status, prices, timestamps', auth: true },
            { method: 'GET', path: '/rest/v1/providers', desc: 'Fetch providers — consumers see approved only', auth: true },
            { method: 'POST', path: '/rest/v1/providers', desc: 'Create provider profile during onboarding', auth: true },
            { method: 'GET', path: '/rest/v1/vehicles', desc: 'Fetch vehicles — public sees available+verified only', auth: false },
            { method: 'POST', path: '/rest/v1/vehicles', desc: 'Add vehicle to provider fleet', auth: true },
            { method: 'GET', path: '/rest/v1/chat_messages?booking_id=eq.:id', desc: 'Fetch negotiation chat for a booking', auth: true },
            { method: 'POST', path: '/rest/v1/chat_messages', desc: 'Send chat message or price proposal', auth: true },
            { method: 'GET', path: '/rest/v1/payments', desc: 'Payment history (consumer sees own, provider sees theirs)', auth: true },
            { method: 'POST', path: '/functions/v1/send-push-notification', desc: 'Trigger push notification via VAPID', auth: true },
            { method: 'GET', path: '/functions/v1/get-vapid-key', desc: 'Get VAPID public key for push subscription', auth: false },
          ].map(e => (
            <div key={e.path} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Badge className={`text-xs shrink-0 ${e.method === 'GET' ? 'bg-blue-500' : e.method === 'POST' ? 'bg-green-500' : 'bg-orange-500'} text-white`}>{e.method}</Badge>
              <div className="min-w-0">
                <code className="text-xs font-mono">{e.path}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{e.desc}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">{e.auth ? '🔒 Auth' : '🌐 Public'}</Badge>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Real-time Subscriptions" icon={<Wifi className="h-4 w-4 text-green-500" />}>
        <p className="text-sm text-muted-foreground mb-4">Use Supabase Realtime (WebSocket) to subscribe to database changes. On mobile, use the supabase-js v2 client — same API as web.</p>
        <div className="space-y-4">
          {[
            { channel: 'bookings-changes', table: 'bookings', filter: 'All changes', who: 'All roles', purpose: 'Live booking status updates, matching notifications' },
            { channel: 'payments-realtime', table: 'payments', filter: 'consumer_id=eq.{uid}', who: 'Consumer', purpose: 'Payment confirmation updates' },
            { channel: 'chat-{bookingId}', table: 'chat_messages', filter: 'booking_id=eq.{id}', who: 'Consumer + Provider', purpose: 'Real-time negotiation chat' },
            { channel: 'notifications-{uid}', table: 'notifications', filter: 'user_id=eq.{uid}', who: 'All roles', purpose: 'In-app notification badge and alerts' },
          ].map(s => (
            <div key={s.channel} className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-mono text-foreground">{s.channel}</code>
                <Badge variant="outline" className="text-xs">{s.who}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Table: <strong>{s.table}</strong> · Filter: <code>{s.filter}</code></p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.purpose}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-muted/20 rounded-lg p-3">
          <p className="text-xs font-semibold mb-2">React Native Code Example:</p>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-muted-foreground">{`const channel = supabase
  .channel('bookings-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    // Handle change
    refetchBookings();
  })
  .subscribe();

// Cleanup
return () => { supabase.removeChannel(channel); };`}</pre>
        </div>
      </InfoCard>

      <InfoCard title="Custom Hooks Reference" icon={<Code className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { hook: 'useSupabaseAuth', returns: ['user', 'profile', 'roles', 'isLoading'], methods: ['signIn(email, password)', 'signUp(email, password, name, role)', 'signOut()', 'refreshProfile()'] },
            { hook: 'useBookings', returns: ['bookings[]', 'isLoading'], methods: ['createBooking(data)', 'updateBooking(id, updates)', 'acceptBooking(id, providerId)', 'confirmBooking(id, price)', 'startTrip(id)', 'completeTrip(id)', 'cancelBooking(id)'] },
            { hook: 'useProviders', returns: ['provider', 'allProviders', 'isLoading'], methods: ['createProvider(data)', 'updateProvider(data)'] },
            { hook: 'useDrivers', returns: ['driver', 'allDrivers', 'isLoading'], methods: ['createDriver(data)', 'updateDriver(data)'] },
            { hook: 'useVehicles', returns: ['vehicles[]', 'isLoading'], methods: ['addVehicle(data)', 'updateVehicle(id, data)', 'deleteVehicle(id)'] },
            { hook: 'useChat', returns: ['messages[]', 'isLoading'], methods: ['sendMessage(content)', 'proposePrice(amount)', 'acceptPrice(messageId)'] },
            { hook: 'usePayments', returns: ['payments[]', 'totalPaid', 'pendingAmount'], methods: ['createPayment(data)', 'updatePaymentStatus(ref, status, txId)'] },
            { hook: 'useNotifications', returns: ['notifications[]', 'unreadCount'], methods: ['markAsRead(id)', 'markAllAsRead()'] },
          ].map(h => (
            <div key={h.hook} className="bg-muted/30 rounded-lg p-3">
              <code className="text-sm font-bold">{h.hook}</code>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground font-semibold">Returns:</p>
                <div className="flex flex-wrap gap-1 mt-1">{h.returns.map(r => <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>)}</div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground font-semibold">Methods:</p>
                <ul className="mt-1 space-y-0.5">{h.methods.map(m => <li key={m} className="text-xs text-muted-foreground font-mono">· {m}</li>)}</ul>
              </div>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION: SCREENS
// ─────────────────────────────────────────────────────────────
function ScreensSection() {
  return (
    <div className="space-y-8">
      <DocHeader title="Screen Inventory & Navigation" subtitle="All routes, screen purposes, navigation patterns per role" icon={<Smartphone className="h-6 w-6" />} />

      {[
        {
          role: 'Consumer', color: 'bg-blue-500', nav: 'Bottom Tab Bar (5 tabs)',
          screens: [
            { route: '/consumer', screen: 'Home', desc: 'Welcome, quick book CTA, active booking status, recent trips', data: 'bookings, profile' },
            { route: '/consumer/book', screen: 'New Booking', desc: 'Multi-step: pickup → type → details → confirm. Map picker, matching overlay, negotiation overlay', data: 'bookings (create), providers' },
            { route: '/consumer/bookings', screen: 'My Bookings', desc: 'Filterable list of all bookings with status, route, price, chat access', data: 'bookings[]' },
            { route: '/consumer/payments', screen: 'Payments', desc: 'Payment history, total spent, pending amounts, download receipts', data: 'payments[]' },
            { route: '/consumer/profile', screen: 'Profile', desc: 'Edit name/phone, saved locations, notification settings, sign out', data: 'profiles' },
          ]
        },
        {
          role: 'Provider', color: 'bg-green-500', nav: 'Bottom Tab Bar (5 tabs)',
          screens: [
            { route: '/provider', screen: 'Dashboard', desc: 'Metrics (today earnings, acceptance rate), incoming requests, fleet snapshot', data: 'providers, bookings' },
            { route: '/provider/requests', screen: 'Requests', desc: 'Pending bookings with accept/decline + chat/negotiate interface', data: 'bookings (pending status), chat_messages' },
            { route: '/provider/fleet', screen: 'Fleet', desc: 'Add/edit vehicles, toggle availability, assign drivers', data: 'vehicles[]' },
            { route: '/provider/drivers', screen: 'Drivers', desc: 'Add/manage drivers, assign vehicles, view driver status', data: 'drivers[], vehicles[]' },
            { route: '/provider/earnings', screen: 'Earnings', desc: 'Earnings overview, weekly chart, transaction history, payout info', data: 'payments[], bookings[]' },
            { route: '/provider/settings', screen: 'Settings', desc: 'Business info, bank details, negotiation toggle, notification prefs', data: 'providers (update)' },
          ]
        },
        {
          role: 'Driver', color: 'bg-orange-500', nav: 'Bottom Tab Bar (5 tabs)',
          screens: [
            { route: '/driver', screen: 'Home', desc: 'Active trip display with map, availability toggle, no-trip idle state', data: 'drivers, bookings' },
            { route: '/driver/trip', screen: 'Active Trip', desc: 'Full-screen map, navigation to pickup/dropoff, start/complete actions, call customer', data: 'bookings (assigned)' },
            { route: '/driver/trips', screen: 'Trip History', desc: 'All past trips with filters, earnings per trip', data: 'bookings[]' },
            { route: '/driver/earnings', screen: 'Earnings', desc: 'Today/weekly earnings breakdown, trip-by-trip earnings list', data: 'payments[], bookings[]' },
            { route: '/driver/profile', screen: 'Profile', desc: 'Personal info, license details, assigned vehicle, availability toggle', data: 'drivers, profiles' },
          ]
        },
        {
          role: 'Admin', color: 'bg-purple-500', nav: 'Sidebar (web only — mobile not required)',
          screens: [
            { route: '/admin', screen: 'Dashboard', desc: 'Platform-wide KPIs: GMV, bookings, users, revenue', data: 'all tables' },
            { route: '/admin/bookings', screen: 'Bookings', desc: 'All bookings, filter/search, cancel actions', data: 'bookings[]' },
            { route: '/admin/providers', screen: 'Providers', desc: 'All providers, verification status, approve/reject/suspend', data: 'providers[]' },
            { route: '/admin/consumers', screen: 'Consumers', desc: 'Consumer list, booking history, contact', data: 'profiles[], bookings[]' },
            { route: '/admin/verification', screen: 'Verification', desc: 'Queue of pending NIN/CAC verifications with document review', data: 'providers[], drivers[]' },
            { route: '/admin/settlements', screen: 'Settlements', desc: 'Settlement records, trigger payouts, track status', data: 'payments[]' },
            { route: '/admin/analytics', screen: 'Analytics', desc: 'Charts: booking trends, revenue, user growth, geo map', data: 'aggregated' },
            { route: '/admin/settings', screen: 'Settings', desc: 'Platform config: commission rates, service areas', data: '' },
          ]
        },
        {
          role: 'Public', color: 'bg-zinc-500', nav: 'None (landing pages)',
          screens: [
            { route: '/', screen: 'Landing Page', desc: 'Marketing homepage: hero, services, how it works, testimonials, CTA', data: 'none' },
            { route: '/login', screen: 'Login', desc: 'Email/password sign-in form with role-based redirect', data: 'auth' },
            { route: '/register', screen: 'Register', desc: 'Signup form with role selector (consumer/provider/driver)', data: 'auth' },
            { route: '/onboarding/provider', screen: 'Provider Onboarding', desc: 'Multi-step: business info → NIN → CAC → bank details', data: 'providers (create)' },
            { route: '/onboarding/driver', screen: 'Driver Onboarding', desc: 'License details, NIN, provider link', data: 'drivers (create)' },
            { route: '/install/:role', screen: 'PWA Install', desc: 'Role-specific PWA install page with feature list and notification setup', data: 'push_subscriptions' },
            { route: '/docs/guide', screen: 'User Guide', desc: 'Integration checklist, FAQ, and step-by-step onboarding guides per role', data: 'none' },
            { route: '/docs/mobile', screen: 'Mobile Docs', desc: 'This page — BRD, PRD, Architecture, API, and React Native guide', data: 'none' },
          ]
        },
      ].map(role => (
        <InfoCard key={role.role} title={`${role.role} Screens`} icon={<div className={`${role.color} h-3 w-3 rounded-full`} />}>
          <p className="text-xs text-muted-foreground mb-3">Navigation: <strong>{role.nav}</strong></p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-muted/50"><th className="text-left p-2">Route</th><th className="text-left p-2">Screen</th><th className="text-left p-2">Description</th><th className="text-left p-2">Data</th></tr></thead>
              <tbody>{role.screens.map((s, i) => <tr key={s.route} className={i % 2 === 0 ? 'bg-muted/20' : ''}><td className="p-2 font-mono text-muted-foreground">{s.route}</td><td className="p-2 font-semibold">{s.screen}</td><td className="p-2 text-muted-foreground">{s.desc}</td><td className="p-2 text-muted-foreground font-mono">{s.data}</td></tr>)}
              </tbody>
            </table>
          </div>
        </InfoCard>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION: MOBILE GUIDE
// ─────────────────────────────────────────────────────────────
function MobileGuideSection() {
  return (
    <div className="space-y-8">
      <DocHeader title="Mobile Developer Guide" subtitle="React Native Implementation · Platform Abstraction · Conversion Notes" icon={<Terminal className="h-6 w-6" />} />

      <InfoCard title="Latest Updates (March 2026)" icon={<RefreshCw className="h-4 w-4 text-green-500" />}>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground text-xs uppercase tracking-wide">What's New</p>
          <ul className="space-y-2">
            {[
              'Authentication gate: all dashboard routes (/consumer, /provider, /driver, /admin) now require login — unauthenticated users redirect to /login',
              'PWA splash screen: black background with centered white InstantRyde logo, shown once on first PWA launch (localStorage flag: ir_consumer_splash_seen)',
              'PWA app icons regenerated: original InstantRyde logo (white on black) for all icon sizes (72px, 512px) and role-specific variants',
              'Consumer home redesigned for mobile-first PWA: full-width hero, quick-action buttons, better spacing with no squeezed edges',
              'Consumer booking page optimised for PWA: stacked layout on mobile (panel above, map below), horizontal scroll progress steps',
              'DashboardLayout mobile padding fix: mobileContentClassName prop prevents content from being squeezed on smaller screens',
              'Service Worker cache v4: static-only caching strategy — HTML navigations always go to network to prevent stale 404 boot issues',
              'Live geocoding with OpenStreetMap Nominatim API (400ms debounce, Nigeria-scoped)',
              'Reverse geocoding for "Use current location" button',
              'Auto-confirm email signups enabled — no email verification required',
              'PWA manifests updated with #111111 theme/background color across all variants',
              'Mobile-responsive fixes across all dashboard pages (no content bleeding)',
              'Integration checklist documentation at /docs/guide (NIN/BVN, Google Maps, Flutterwave, Push)',
              'FAQ and step-by-step onboarding guides for all user roles at /docs/guide',
              'Provider dashboard real-time booking requests with Supabase Realtime',
              'Consumer booking flow: multi-step wizard with progress indicator',
              'Payment integration with Flutterwave (PaymentButton component)',
              'Chat/negotiation system with real-time messages via Supabase Realtime',
            ].map((item, i) => (
              <li key={i} className="flex gap-2"><CheckCircle className="h-3 w-3 shrink-0 mt-0.5 text-green-500" />{item}</li>
            ))}
          </ul>
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs font-semibold text-foreground mb-1">React Native Migration Notes</p>
            <ul className="text-xs space-y-1">
              <li>· Replace Nominatim API with <code className="bg-muted px-1 rounded">react-native-google-places-autocomplete</code> for production</li>
              <li>· Replace Leaflet maps with <code className="bg-muted px-1 rounded">react-native-maps</code> (MapView)</li>
              <li>· Replace Framer Motion animations with <code className="bg-muted px-1 rounded">react-native-reanimated</code></li>
              <li>· Use <code className="bg-muted px-1 rounded">@react-navigation/bottom-tabs</code> for role-specific bottom navigation</li>
              <li>· Flutterwave: use <code className="bg-muted px-1 rounded">flutterwave-react-native</code> SDK instead of WebView redirect</li>
            </ul>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Project Setup (React Native)" icon={<Package className="h-4 w-4 text-blue-500" />}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold mb-2">Recommended Dependencies</p>
            <div className="bg-muted/30 rounded-lg p-3">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{`# Core
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# Storage & Auth
npm install @react-native-async-storage/async-storage
npm install expo-secure-store  # for tokens

# Maps
npm install react-native-maps

# Push Notifications
npm install @notifee/react-native  # or expo-notifications

# UI / Styling
npm install nativewind  # Tailwind for RN
npm install react-native-vector-icons

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Payments (WebView approach)
npm install react-native-webview`}</pre>
            </div>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Supabase Client for React Native" icon={<Server className="h-4 w-4 text-green-500" />}>
        <div className="bg-muted/30 rounded-lg p-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{`// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://oeadjjfyafneixxcwlfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,        // ← replace localStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,    // ← IMPORTANT: disable for RN
  },
});`}</pre>
        </div>
      </InfoCard>

      <InfoCard title="Platform Abstraction Layer" icon={<Layers className="h-4 w-4 text-orange-500" />}>
        <p className="text-sm text-muted-foreground mb-3">The web app has <code className="bg-muted px-1 rounded text-xs">src/lib/platform.ts</code> — implement these equivalents in React Native:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-muted/50"><th className="text-left p-2">Web (platform.ts)</th><th className="text-left p-2">React Native Equivalent</th></tr></thead>
            <tbody>
              {[
                ['localStorage.getItem/setItem', 'AsyncStorage.getItem/setItem'],
                ['window.open(url)', 'Linking.openURL(url)'],
                ['mailto: / tel: links', 'Linking.openURL("mailto:") / Linking.openURL("tel:")'],
                ['window.location.origin', 'Constants.expoConfig?.extra?.apiUrl or env var'],
                ['document.createElement("a").click()', 'react-native-share or FileSystem.downloadAsync'],
                ['window.innerWidth/Height', 'Dimensions.get("window").width/height'],
                ['window.scrollY', 'ScrollView onScroll event'],
                ['Leaflet / react-leaflet maps', 'react-native-maps MapView'],
                ['HTML <input>', 'TextInput'],
                ['<select>', 'Picker or custom modal picker'],
                ['PWA Push (VAPID)', 'expo-notifications or @notifee/react-native'],
              ].map(([web, rn], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                  <td className="p-2 font-mono text-muted-foreground">{web}</td>
                  <td className="p-2 font-mono">{rn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <InfoCard title="Navigation Structure (React Navigation)" icon={<Navigation className="h-4 w-4 text-purple-500" />}>
        <div className="bg-muted/30 rounded-lg p-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{`// App.tsx (React Native)
<NavigationContainer>
  <Stack.Navigator>
    {/* Public */}
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ProviderOnboarding" component={ProviderOnboardingScreen} />
    <Stack.Screen name="DriverOnboarding" component={DriverOnboardingScreen} />
    
    {/* Consumer Tab Navigator */}
    <Stack.Screen name="ConsumerApp">
      <BottomTabs>
        <Tab name="Home" component={ConsumerHomeScreen} />
        <Tab name="Book" component={ConsumerBookingScreen} />
        <Tab name="Bookings" component={ConsumerBookingsScreen} />
        <Tab name="Payments" component={ConsumerPaymentsScreen} />
        <Tab name="Profile" component={ConsumerProfileScreen} />
      </BottomTabs>
    </Stack.Screen>
    
    {/* Provider Tab Navigator */}
    <Stack.Screen name="ProviderApp">
      <BottomTabs>
        <Tab name="Dashboard" component={ProviderDashboardScreen} />
        <Tab name="Requests" component={ProviderRequestsScreen} />
        <Tab name="Fleet" component={ProviderFleetScreen} />
        <Tab name="Drivers" component={ProviderDriversScreen} />
        <Tab name="Settings" component={ProviderSettingsScreen} />
      </BottomTabs>
    </Stack.Screen>
    
    {/* Driver Tab Navigator */}
    <Stack.Screen name="DriverApp">
      <BottomTabs>
        <Tab name="Home" component={DriverHomeScreen} />
        <Tab name="Trip" component={DriverTripScreen} />
        <Tab name="Trips" component={DriverTripsScreen} />
        <Tab name="Earnings" component={DriverEarningsScreen} />
        <Tab name="Profile" component={DriverProfileScreen} />
      </BottomTabs>
    </Stack.Screen>
  </Stack.Navigator>
</NavigationContainer>`}</pre>
        </div>
      </InfoCard>

      <InfoCard title="Flutterwave Payment (Mobile)" icon={<CreditCard className="h-4 w-4 text-green-500" />}>
        <p className="text-sm text-muted-foreground mb-3">Use a WebView to embed the Flutterwave payment modal or use the official <code className="bg-muted px-1 rounded text-xs">flutterwave-react-native</code> package.</p>
        <div className="bg-muted/30 rounded-lg p-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{`import { PayWithFlutterwave } from 'flutterwave-react-native';

<PayWithFlutterwave
  onRedirect={(data) => {
    if (data.status === 'successful') {
      // Update payment record in DB
      updatePaymentStatus(ref, 'successful', data.transaction_id);
      // Update booking to confirmed
      confirmBooking(bookingId, finalPrice);
    }
  }}
  options={{
    tx_ref: generateTransactionRef(),
    authorization: FLUTTERWAVE_PUBLIC_KEY,
    customer: { email, name, phone_number },
    amount: finalPrice,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd',
  }}
/>`}</pre>
        </div>
      </InfoCard>

      <InfoCard title="Push Notifications (Mobile)" icon={<Bell className="h-4 w-4 text-yellow-500" />}>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">The backend sends push notifications via the <code className="bg-muted px-1 rounded text-xs">send-push-notification</code> edge function triggered by DB changes.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold mb-2">iOS Setup</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>· Enable Push Notifications capability in Xcode</li>
                <li>· Add APNs key in Apple Developer Portal</li>
                <li>· Use UNUserNotificationCenter for permissions</li>
                <li>· Register FCM token and store in push_subscriptions</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Android Setup</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>· Add google-services.json from Firebase Console</li>
                <li>· Configure FCM in android/app/build.gradle</li>
                <li>· Create notification channel for Android 8+</li>
                <li>· Handle background notifications via HeadlessTask</li>
              </ul>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs font-semibold mb-1">Push Subscription Storage (save token to DB)</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{`// Store FCM/APNs token in push_subscriptions table
await supabase.from('push_subscriptions').upsert({
  user_id: user.id,
  endpoint: fcmToken,          // FCM token as endpoint
  p256dh: '',                  // Not needed for FCM
  auth: '',                    // Not needed for FCM
  role: userRole,
});`}</pre>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Map Integration (react-native-maps)" icon={<MapPin className="h-4 w-4 text-red-500" />}>
        <div className="bg-muted/30 rounded-lg p-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{`import MapView, { Marker, Polyline } from 'react-native-maps';

// Replace BookingMap (Leaflet) with:
<MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 6.5244,      // Lagos default
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  <Marker coordinate={pickup} title="Pickup" pinColor="green" />
  <Marker coordinate={dropoff} title="Drop-off" pinColor="red" />
</MapView>

// Location search: use Google Places Autocomplete
// npm install react-native-google-places-autocomplete
// API Key: Google Cloud Console → Maps SDK for Android/iOS`}</pre>
        </div>
      </InfoCard>

      <InfoCard title="iOS & Android Specific Requirements" icon={<Smartphone className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">iOS Requirements</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {[
                'Minimum iOS 14.0 target',
                'Add NSLocationWhenInUseUsageDescription in Info.plist',
                'NSLocationAlwaysAndWhenInUseUsageDescription for background tracking',
                'NSCameraUsageDescription for photo upload',
                'NSPhotoLibraryUsageDescription for vehicle images',
                'Configure App Transport Security for API calls',
                'Use Keychain for secure token storage',
                'TestFlight for beta distribution',
                'Apple Developer Program ($99/yr) for App Store',
              ].map(i => <li key={i} className="flex gap-2"><span className="text-blue-400 shrink-0">·</span>{i}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">Android Requirements</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {[
                'Minimum Android API 29 (Android 10)',
                'TARGET_SDK: 34 (Android 14)',
                'REQUEST_INSTALL_PACKAGES for APK',
                'ACCESS_FINE_LOCATION permission',
                'CAMERA + READ_EXTERNAL_STORAGE permissions',
                'INTERNET + ACCESS_NETWORK_STATE',
                'Configure ProGuard rules for release build',
                'Google Play Developer account ($25 one-time)',
                'Sign APK with release keystore',
              ].map(i => <li key={i} className="flex gap-2"><span className="text-green-400 shrink-0">·</span>{i}</li>)}
            </ul>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION: SECURITY
// ─────────────────────────────────────────────────────────────
function SecuritySection() {
  return (
    <div className="space-y-8">
      <DocHeader title="Security Architecture" subtitle="RLS Policies · Auth · Data Privacy · Mobile Security" icon={<Shield className="h-6 w-6" />} />

      <InfoCard title="Authentication Security" icon={<Lock className="h-4 w-4 text-red-500" />}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">Token Management</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>· JWT access tokens (1 hour expiry)</li>
              <li>· Refresh tokens (30 day expiry)</li>
              <li>· Auto-refresh via onAuthStateChange</li>
              <li>· Web: localStorage | Mobile: SecureStore/Keychain</li>
              <li>· Never store tokens in AsyncStorage plain</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Session Security</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>· All API calls require Bearer token</li>
              <li>· Server validates JWT on every request</li>
              <li>· auth.uid() used in all RLS policies</li>
              <li>· Password hashed with bcrypt (Supabase GoTrue)</li>
              <li>· Email verification enforced post-signup</li>
            </ul>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Row Level Security Summary" icon={<Database className="h-4 w-4 text-purple-500" />}>
        <p className="text-sm text-muted-foreground mb-4">Every database table has RLS enabled. No data is accessible without a valid JWT that passes the policy conditions.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-muted/50"><th className="text-left p-2">Table</th><th className="text-left p-2">Consumer</th><th className="text-left p-2">Provider</th><th className="text-left p-2">Driver</th><th className="text-left p-2">Admin</th></tr></thead>
            <tbody>
              {[
                { table: 'profiles', consumer: 'Own only', provider: 'Own + booking consumers', driver: 'Own only', admin: 'All' },
                { table: 'bookings', consumer: 'Own only', provider: 'Pending + assigned', driver: 'Assigned trips', admin: 'All' },
                { table: 'providers', consumer: 'Approved only', provider: 'Own only', driver: '—', admin: 'All' },
                { table: 'drivers', consumer: '—', provider: 'Their drivers', driver: 'Own only', admin: 'All' },
                { table: 'vehicles', consumer: 'Available+verified', provider: 'Own fleet', driver: '—', admin: 'All' },
                { table: 'chat_messages', consumer: 'Booking participant', provider: 'Booking participant', driver: 'Booking participant', admin: 'All' },
                { table: 'payments', consumer: 'Own payments', provider: 'For their bookings', driver: '—', admin: 'All' },
                { table: 'notifications', consumer: 'Own', provider: 'Own', driver: 'Own', admin: 'All' },
              ].map((r, i) => (
                <tr key={r.table} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                  <td className="p-2 font-mono font-semibold">{r.table}</td>
                  <td className="p-2 text-muted-foreground">{r.consumer}</td>
                  <td className="p-2 text-muted-foreground">{r.provider}</td>
                  <td className="p-2 text-muted-foreground">{r.driver}</td>
                  <td className="p-2 text-muted-foreground">{r.admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <InfoCard title="Mobile Security Best Practices" icon={<Smartphone className="h-4 w-4 text-blue-500" />}>
        <div className="grid grid-cols-2 gap-6">
          {[
            { title: 'Token Storage', items: ['Use expo-secure-store (iOS Keychain / Android Keystore)', 'Never AsyncStorage for auth tokens', 'Clear tokens on sign-out', 'Biometric unlock for returning users'] },
            { title: 'Network Security', items: ['Enforce HTTPS only (no HTTP cleartext)', 'Certificate pinning for production', 'All API via supabase-js (handles headers)', 'Flutterwave SDK handles PCI compliance'] },
            { title: 'Data Protection', items: ['No sensitive data in logs (production)', 'Mask card numbers in UI', 'NIN/CAC numbers never stored client-side', 'RLS prevents server-side data leakage'] },
            { title: 'App Security', items: ['Enable ProGuard/R8 for Android release', 'Code signing for iOS', 'Root/jailbreak detection (optional)', 'App-level authentication timeout (15 min idle)'] },
          ].map(s => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold mb-2">{s.title}</h4>
              <ul className="text-xs text-muted-foreground space-y-1">{s.items.map(i => <li key={i} className="flex gap-2"><span className="text-green-400 shrink-0">✓</span>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="Verification & Compliance" icon={<CheckCircle className="h-4 w-4 text-green-500" />}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">InstantRyde operates under Nigerian regulations. The following compliance requirements apply:</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'NIN Verification', desc: 'All providers and drivers must submit National Identification Number. Verified by admin against NIMC database before account approval.' },
              { label: 'CAC Verification', desc: 'Company providers must submit Corporate Affairs Commission registration number and certificate for business legitimacy check.' },
              { label: 'NDPR Compliance', desc: 'Nigeria Data Protection Regulation compliance: data minimisation, user consent, right to erasure, data breach notification within 72h.' },
            ].map(c => (
              <div key={c.label} className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-semibold mb-1">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </InfoCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────
function DocHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-border">
      <div className="bg-foreground text-background rounded-xl p-3">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TwoCol({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {left}{right}
    </div>
  );
}

function FeatureTable({ features }: { features: Array<{ id: string; feature: string; priority: string; story: string; acceptance: string }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="bg-muted/50"><th className="text-left p-2">ID</th><th className="text-left p-2">Feature</th><th className="text-left p-2">Priority</th><th className="text-left p-2">User Story</th><th className="text-left p-2">Acceptance Criteria</th></tr></thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={f.id} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
              <td className="p-2 font-mono text-muted-foreground">{f.id}</td>
              <td className="p-2 font-semibold">{f.feature}</td>
              <td className="p-2"><Badge variant={f.priority === 'P0' ? 'default' : f.priority === 'P1' ? 'secondary' : 'outline'} className="text-xs">{f.priority}</Badge></td>
              <td className="p-2 text-muted-foreground">{f.story}</td>
              <td className="p-2 text-muted-foreground">{f.acceptance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
