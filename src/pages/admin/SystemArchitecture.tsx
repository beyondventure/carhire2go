import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Database, 
  Server, 
  Shield, 
  Users, 
  Car, 
  MapPin,
  CreditCard,
  MessageSquare,
  Bell,
  Layers,
  GitBranch,
  Code,
  Cpu,
  Globe,
  Lock,
  Zap,
  BarChart3,
  FileText,
  Smartphone,
  Monitor,
  Cloud,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function SystemArchitecture() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      
      // Get all tab contents
      const tabContents = ['overview', 'architecture', 'database', 'modules', 'security', 'infrastructure'];
      
      for (let i = 0; i < tabContents.length; i++) {
        // Switch to each tab to render it
        setActiveSection(tabContents[i]);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render
        
        const element = contentRef.current;
        if (!element) continue;
        
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) pdf.addPage();
        
        // Add header
        pdf.setFillColor(59, 130, 246);
        pdf.rect(0, 0, pageWidth, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text('InstantRyde - System Architecture', margin, 8);
        pdf.text(`${tabContents[i].charAt(0).toUpperCase() + tabContents[i].slice(1)}`, pageWidth - margin, 8, { align: 'right' });
        
        // Calculate dimensions - fit width and center
        const contentWidth = pageWidth - (margin * 2);
        const imgRatio = canvas.height / canvas.width;
        const maxHeight = pageHeight - 30;
        
        let finalWidth = contentWidth;
        let finalHeight = contentWidth * imgRatio;
        
        // Scale down if too tall
        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = finalHeight / imgRatio;
        }
        
        // Center horizontally
        const xOffset = (pageWidth - finalWidth) / 2;
        
        pdf.addImage(imgData, 'JPEG', xOffset, 15, finalWidth, finalHeight);
        
        // Add footer
        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(8);
        pdf.text(`Page ${i + 1} of ${tabContents.length}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        pdf.text('Confidential', pageWidth - margin, pageHeight - 5, { align: 'right' });
      }
      
      // Reset to overview
      setActiveSection('overview');
      pdf.save('CarHire2Go-System-Architecture.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                System Architecture
              </h1>
              <p className="text-sm text-muted-foreground">
                InstantRyde Platform Technical Documentation
              </p>
            </div>
          </div>
          <Button onClick={handleExportPDF} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          </TabsList>

          <div ref={contentRef} className="bg-background">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <OverviewSection />
            </TabsContent>
            <TabsContent value="architecture" className="space-y-6 mt-0">
              <ArchitectureSection />
            </TabsContent>
            <TabsContent value="database" className="space-y-6 mt-0">
              <DatabaseSection />
            </TabsContent>
            <TabsContent value="modules" className="space-y-6 mt-0">
              <ModulesSection />
            </TabsContent>
            <TabsContent value="security" className="space-y-6 mt-0">
              <SecuritySection />
            </TabsContent>
            <TabsContent value="infrastructure" className="space-y-6 mt-0">
              <InfrastructureSection />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

function OverviewSection() {
  const stats = [
    { label: 'User Applications', value: '4', icon: Users },
    { label: 'Database Tables', value: '7', icon: Database },
    { label: 'API Endpoints', value: '25+', icon: Server },
    { label: 'Security Layers', value: '5', icon: Shield },
  ];

  const features = [
    { name: 'Multi-tenant Architecture', desc: 'Separate portals for consumers, providers, drivers, and administrators' },
    { name: 'Real-time Booking Engine', desc: 'Live matching algorithm connecting consumers with available vehicles' },
    { name: 'Intelligent Price Negotiation', desc: 'In-app chat with price proposal and counter-offer system' },
    { name: 'Fleet Management System', desc: 'Complete vehicle and driver management for providers' },
    { name: 'Automated Settlements', desc: 'Commission calculation and payment processing' },
    { name: 'Analytics Dashboard', desc: 'Comprehensive metrics and business intelligence' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Executive Summary</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          CarHire2Go is an enterprise-grade vehicle hire marketplace platform connecting consumers 
          with car hire providers and professional drivers. The platform enables seamless booking, 
          real-time matching, price negotiation, and comprehensive fleet management.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center bg-gradient-to-br from-card to-muted/30">
            <CardContent className="pt-6">
              <stat.icon className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Core Platform Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0" />
                <div>
                  <p className="font-medium">{feature.name}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-accent" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Monitor className="h-4 w-4" /> Frontend
              </h4>
              <div className="space-y-1">
                {['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'React Router'].map((tech) => (
                  <Badge key={tech} variant="secondary" className="mr-1 mb-1">{tech}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Server className="h-4 w-4" /> Backend
              </h4>
              <div className="space-y-1">
                {['PostgreSQL', 'Edge Functions', 'Row Level Security', 'Real-time Subscriptions'].map((tech) => (
                  <Badge key={tech} variant="secondary" className="mr-1 mb-1">{tech}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Cloud className="h-4 w-4" /> Infrastructure
              </h4>
              <div className="space-y-1">
                {['Cloud Hosting', 'CDN', 'Auto-scaling', 'SSL/TLS'].map((tech) => (
                  <Badge key={tech} variant="secondary" className="mr-1 mb-1">{tech}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Smartphone className="h-4 w-4" /> Mobile Ready
              </h4>
              <div className="space-y-1">
                {['Responsive Design', 'PWA Support', 'Touch Optimized', 'Offline Capable'].map((tech) => (
                  <Badge key={tech} variant="secondary" className="mr-1 mb-1">{tech}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">System Architecture</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            High-Level Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-xl p-8">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-5 flex justify-center gap-8 pb-6 border-b border-border">
                {[
                  { name: 'Consumer App', icon: Users, color: 'bg-blue-500' },
                  { name: 'Provider App', icon: Car, color: 'bg-green-500' },
                  { name: 'Driver App', icon: MapPin, color: 'bg-orange-500' },
                  { name: 'Admin Portal', icon: Shield, color: 'bg-purple-500' },
                ].map((app) => (
                  <div key={app.name} className="text-center">
                    <div className={`w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                      <app.icon className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-medium">{app.name}</p>
                  </div>
                ))}
              </div>

              <div className="col-span-5 py-4">
                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="font-semibold">API Gateway & Authentication Layer</span>
                  </div>
                  <div className="flex justify-center gap-4 text-sm">
                    <Badge>REST API</Badge>
                    <Badge>Real-time WebSocket</Badge>
                    <Badge>JWT Auth</Badge>
                    <Badge>Rate Limiting</Badge>
                  </div>
                </div>
              </div>

              <div className="col-span-5 grid grid-cols-5 gap-4 py-4 border-y border-border">
                {[
                  { name: 'Booking Engine', icon: FileText },
                  { name: 'Matching Service', icon: Zap },
                  { name: 'Payment Service', icon: CreditCard },
                  { name: 'Notification Service', icon: Bell },
                  { name: 'Analytics Engine', icon: BarChart3 },
                ].map((service) => (
                  <div key={service.name} className="bg-accent/10 rounded-lg p-4 text-center">
                    <service.icon className="h-6 w-6 mx-auto mb-2 text-accent" />
                    <p className="text-xs font-medium">{service.name}</p>
                  </div>
                ))}
              </div>

              <div className="col-span-5 pt-4">
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Database className="h-5 w-5" />
                    <span className="font-semibold">Data Layer</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-background rounded-lg p-3 text-center">
                      <p className="font-medium text-sm">PostgreSQL</p>
                      <p className="text-xs text-muted-foreground">Primary Database</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 text-center">
                      <p className="font-medium text-sm">Object Storage</p>
                      <p className="text-xs text-muted-foreground">Files & Images</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 text-center">
                      <p className="font-medium text-sm">Real-time Engine</p>
                      <p className="text-xs text-muted-foreground">Live Updates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-accent" />
            Booking Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              {[
                { step: '1', title: 'Request', desc: 'Consumer creates booking', color: 'bg-blue-500' },
                { step: '2', title: 'Match', desc: 'System finds providers', color: 'bg-yellow-500' },
                { step: '3', title: 'Negotiate', desc: 'Price negotiation', color: 'bg-orange-500' },
                { step: '4', title: 'Confirm', desc: 'Booking confirmed', color: 'bg-green-500' },
                { step: '5', title: 'Execute', desc: 'Trip in progress', color: 'bg-purple-500' },
                { step: '6', title: 'Complete', desc: 'Payment & rating', color: 'bg-accent' },
              ].map((item, i, arr) => (
                <div key={item.step} className="flex items-center">
                  <div className="text-center">
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                      {item.step}
                    </div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-12 h-0.5 bg-border mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-accent" />
            Frontend Component Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Core Components</h4>
              <div className="space-y-2">
                {[
                  { name: 'DashboardLayout', desc: 'Role-based layout wrapper with navigation' },
                  { name: 'Header', desc: 'Top navigation with user menu and notifications' },
                  { name: 'Sidebar', desc: 'Role-specific navigation menu' },
                  { name: 'BookingMap', desc: 'Interactive map with Leaflet integration' },
                ].map((comp) => (
                  <div key={comp.name} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                    <Code className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <code className="text-sm font-medium">{comp.name}</code>
                      <p className="text-xs text-muted-foreground">{comp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Feature Components</h4>
              <div className="space-y-2">
                {[
                  { name: 'ChatPanel', desc: 'Real-time messaging for negotiation' },
                  { name: 'MatchingOverlay', desc: 'Provider matching animation' },
                  { name: 'NegotiationOverlay', desc: 'Price negotiation interface' },
                  { name: 'BookingSelectors', desc: 'Date, time, and type selection' },
                ].map((comp) => (
                  <div key={comp.name} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                    <Code className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <code className="text-sm font-medium">{comp.name}</code>
                      <p className="text-xs text-muted-foreground">{comp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DatabaseSection() {
  const tables = [
    {
      name: 'profiles',
      desc: 'User profile information',
      columns: ['id (UUID, PK)', 'email (TEXT)', 'name (TEXT)', 'phone (TEXT)', 'avatar_url (TEXT)', 'created_at (TIMESTAMP)', 'updated_at (TIMESTAMP)'],
      relations: 'Referenced by user_roles, providers, drivers',
    },
    {
      name: 'user_roles',
      desc: 'Role assignments for users',
      columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'role (app_role ENUM)', 'created_at (TIMESTAMP)'],
      relations: 'References profiles(id)',
    },
    {
      name: 'providers',
      desc: 'Service provider business details',
      columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'business_name (TEXT)', 'cac_number (TEXT)', 'provider_type (ENUM)', 'verification_status (ENUM)', 'service_areas (TEXT[])', 'rating (DECIMAL)'],
      relations: 'References profiles(id)',
    },
    {
      name: 'vehicles',
      desc: 'Fleet vehicle inventory',
      columns: ['id (UUID, PK)', 'provider_id (UUID, FK)', 'type (vehicle_type ENUM)', 'make (TEXT)', 'model (TEXT)', 'year (INT)', 'plate_number (TEXT)', 'color (TEXT)', 'seats (INT)', 'daily_rate (DECIMAL)', 'available (BOOLEAN)'],
      relations: 'References providers(id)',
    },
    {
      name: 'drivers',
      desc: 'Professional driver profiles',
      columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'provider_id (UUID, FK)', 'license_number (TEXT)', 'license_expiry (DATE)', 'verified (BOOLEAN)', 'available (BOOLEAN)', 'rating (DECIMAL)', 'total_trips (INT)'],
      relations: 'References profiles(id), providers(id)',
    },
    {
      name: 'bookings',
      desc: 'Booking transactions and status',
      columns: ['id (UUID, PK)', 'consumer_id (UUID, FK)', 'provider_id (UUID, FK)', 'driver_id (UUID, FK)', 'vehicle_id (UUID, FK)', 'booking_type (ENUM)', 'status (booking_status ENUM)', 'pickup_* (location)', 'dropoff_* (location)', 'scheduled_date (DATE)', 'estimated_price_* (DECIMAL)', 'final_price (DECIMAL)'],
      relations: 'References profiles, providers, drivers, vehicles',
    },
    {
      name: 'chat_messages',
      desc: 'Negotiation and communication',
      columns: ['id (UUID, PK)', 'booking_id (UUID, FK)', 'sender_id (UUID, FK)', 'content (TEXT)', 'message_type (ENUM)', 'proposed_price (DECIMAL)', 'created_at (TIMESTAMP)'],
      relations: 'References bookings(id), profiles(id)',
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Database Schema</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-accent" />
            Entity Relationship Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="grid grid-cols-7 gap-4">
              <div className="col-start-4 col-span-1">
                <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-3 text-center">
                  <Users className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                  <p className="font-bold text-sm">profiles</p>
                </div>
              </div>
              <div className="col-start-2 row-start-2">
                <div className="bg-purple-500/20 border-2 border-purple-500 rounded-lg p-3 text-center">
                  <Shield className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                  <p className="font-bold text-sm">user_roles</p>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">N:1 → profiles</span>
                </div>
              </div>
              <div className="col-start-4 row-start-2">
                <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-3 text-center">
                  <Car className="h-6 w-6 mx-auto text-green-500 mb-1" />
                  <p className="font-bold text-sm">providers</p>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">1:1 → profiles</span>
                </div>
              </div>
              <div className="col-start-6 row-start-2">
                <div className="bg-orange-500/20 border-2 border-orange-500 rounded-lg p-3 text-center">
                  <FileText className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                  <p className="font-bold text-sm">bookings</p>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">Central entity</span>
                </div>
              </div>
              <div className="col-start-3 row-start-3">
                <div className="bg-teal-500/20 border-2 border-teal-500 rounded-lg p-3 text-center">
                  <Car className="h-6 w-6 mx-auto text-teal-500 mb-1" />
                  <p className="font-bold text-sm">vehicles</p>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">N:1 → providers</span>
                </div>
              </div>
              <div className="col-start-5 row-start-3">
                <div className="bg-amber-500/20 border-2 border-amber-500 rounded-lg p-3 text-center">
                  <Users className="h-6 w-6 mx-auto text-amber-500 mb-1" />
                  <p className="font-bold text-sm">drivers</p>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">N:1 → providers</span>
                </div>
              </div>
              <div className="col-start-7 row-start-3">
                <div className="bg-pink-500/20 border-2 border-pink-500 rounded-lg p-3 text-center">
                  <MessageSquare className="h-6 w-6 mx-auto text-pink-500 mb-1" />
                  <p className="font-bold text-sm">chat_messages</p>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">N:1 → bookings</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {tables.map((table) => (
          <Card key={table.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <code>{table.name}</code>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{table.desc}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs space-y-1">
                  {table.columns.slice(0, 5).map((col) => (
                    <div key={col} className="font-mono bg-muted/50 rounded px-2 py-1">
                      {col}
                    </div>
                  ))}
                  {table.columns.length > 5 && (
                    <div className="text-muted-foreground px-2">
                      +{table.columns.length - 5} more columns
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">{table.relations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Enumerations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">app_role</h4>
              <div className="space-y-1">
                {['consumer', 'provider', 'driver', 'admin'].map((v) => (
                  <Badge key={v} variant="outline" className="mr-1">{v}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">booking_status</h4>
              <div className="space-y-1">
                {['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((v) => (
                  <Badge key={v} variant="outline" className="mr-1 mb-1">{v}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">vehicle_type</h4>
              <div className="space-y-1">
                {['sedan', 'suv', 'luxury', 'van', 'bus'].map((v) => (
                  <Badge key={v} variant="outline" className="mr-1">{v}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ModulesSection() {
  const modules = [
    {
      name: 'Consumer Module',
      icon: Users,
      color: 'bg-blue-500',
      pages: ['Home Dashboard', 'New Booking', 'My Bookings', 'Payments', 'Profile'],
      features: [
        'Location-based booking with interactive map',
        'Multiple booking types (full-day, half-day, point-to-point)',
        'Real-time matching with nearby providers',
        'In-app price negotiation',
        'Booking history and receipts',
        'Driver tracking during trips',
      ],
    },
    {
      name: 'Provider Module',
      icon: Car,
      color: 'bg-green-500',
      pages: ['Dashboard', 'Booking Requests', 'Fleet Management', 'Drivers', 'Earnings', 'Settings'],
      features: [
        'Real-time booking request notifications',
        'Accept/decline with counter-offers',
        'Complete fleet inventory management',
        'Driver assignment and scheduling',
        'Revenue analytics and reports',
        'Settlement tracking and payouts',
      ],
    },
    {
      name: 'Driver Module',
      icon: MapPin,
      color: 'bg-orange-500',
      pages: ['Home', 'Active Trip', 'Trip History', 'Earnings', 'Profile'],
      features: [
        'Current trip details and navigation',
        'Trip status updates (start, complete)',
        'Earnings breakdown and history',
        'Availability toggle',
        'Document upload for verification',
        'Customer communication',
      ],
    },
    {
      name: 'Admin Module',
      icon: Shield,
      color: 'bg-purple-500',
      pages: ['Dashboard', 'Bookings', 'Providers', 'Consumers', 'Verification', 'Settlements', 'Analytics', 'Settings'],
      features: [
        'Platform-wide analytics and KPIs',
        'Provider and driver verification workflow',
        'Booking monitoring and intervention',
        'Settlement processing and commission',
        'User management and support',
        'System configuration',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Application Modules</h2>

      <div className="grid grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card key={module.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center`}>
                  <module.icon className="h-5 w-5 text-white" />
                </div>
                {module.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Pages</h4>
                <div className="flex flex-wrap gap-1">
                  {module.pages.map((page) => (
                    <Badge key={page} variant="secondary">{page}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Key Features</h4>
                <ul className="text-sm space-y-1">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-accent" />
            Project File Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 font-mono text-sm">
            <div>
              <p className="font-bold mb-2">src/</p>
              <div className="pl-4 space-y-1 text-muted-foreground">
                <p>├── components/</p>
                <p className="pl-4">├── booking/</p>
                <p className="pl-4">├── chat/</p>
                <p className="pl-4">├── layout/</p>
                <p className="pl-4">├── map/</p>
                <p className="pl-4">└── ui/</p>
                <p>├── hooks/</p>
                <p>├── integrations/</p>
                <p>├── lib/</p>
                <p>├── pages/</p>
                <p>└── types/</p>
              </div>
            </div>
            <div>
              <p className="font-bold mb-2">src/pages/</p>
              <div className="pl-4 space-y-1 text-muted-foreground">
                <p>├── admin/</p>
                <p className="pl-4">├── AdminDashboard.tsx</p>
                <p className="pl-4">├── AdminBookings.tsx</p>
                <p className="pl-4">└── ...</p>
                <p>├── consumer/</p>
                <p>├── driver/</p>
                <p>├── provider/</p>
                <p>├── auth/</p>
                <p>└── onboarding/</p>
              </div>
            </div>
            <div>
              <p className="font-bold mb-2">src/hooks/</p>
              <div className="pl-4 space-y-1 text-muted-foreground">
                <p>├── useSupabaseAuth.tsx</p>
                <p>├── useBookings.tsx</p>
                <p>├── useProviders.tsx</p>
                <p>├── useDrivers.tsx</p>
                <p>├── useVehicles.tsx</p>
                <p>└── use-toast.ts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySection() {
  const securityLayers = [
    {
      name: 'Authentication Layer',
      icon: Lock,
      items: [
        'JWT-based authentication tokens',
        'Secure password hashing (bcrypt)',
        'Session management with refresh tokens',
        'Email verification for new accounts',
        'Multi-factor authentication ready',
      ],
    },
    {
      name: 'Authorization Layer',
      icon: Shield,
      items: [
        'Role-based access control (RBAC)',
        'Row Level Security (RLS) policies',
        'Resource-level permissions',
        'API endpoint protection',
        'Admin privilege escalation prevention',
      ],
    },
    {
      name: 'Data Protection',
      icon: Database,
      items: [
        'Encryption at rest (AES-256)',
        'Encryption in transit (TLS 1.3)',
        'PII data masking',
        'Secure file storage',
        'Data backup and recovery',
      ],
    },
    {
      name: 'Application Security',
      icon: Code,
      items: [
        'Input validation and sanitization',
        'SQL injection prevention',
        'XSS protection',
        'CSRF token validation',
        'Rate limiting and throttling',
      ],
    },
  ];

  const rlsPolicies = [
    { table: 'profiles', policy: 'Users can view own profile; Admins view all', type: 'SELECT' },
    { table: 'profiles', policy: 'Users can update own profile only', type: 'UPDATE' },
    { table: 'bookings', policy: 'Consumers see own bookings; Providers see assigned', type: 'SELECT' },
    { table: 'bookings', policy: 'Consumers create own bookings only', type: 'INSERT' },
    { table: 'vehicles', policy: 'Providers manage own fleet only', type: 'ALL' },
    { table: 'drivers', policy: 'Providers manage own drivers only', type: 'ALL' },
    { table: 'chat_messages', policy: 'Participants in booking can read/write', type: 'ALL' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Security Architecture</h2>

      <div className="grid grid-cols-2 gap-6">
        {securityLayers.map((layer) => (
          <Card key={layer.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <layer.icon className="h-5 w-5 text-accent" />
                {layer.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {layer.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Row Level Security Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Table</th>
                  <th className="text-left py-2 font-semibold">Operation</th>
                  <th className="text-left py-2 font-semibold">Policy Rule</th>
                </tr>
              </thead>
              <tbody>
                {rlsPolicies.map((policy, i) => (
                  <tr key={i} className="border-b border-muted">
                    <td className="py-2"><code className="text-primary">{policy.table}</code></td>
                    <td className="py-2"><Badge variant="outline">{policy.type}</Badge></td>
                    <td className="py-2 text-muted-foreground">{policy.policy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance & Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'GDPR', desc: 'EU Data Protection' },
              { name: 'NDPR', desc: 'Nigeria Data Protection' },
              { name: 'PCI DSS', desc: 'Payment Security' },
              { name: 'OWASP', desc: 'Security Standards' },
            ].map((std) => (
              <div key={std.name} className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="font-bold text-lg">{std.name}</p>
                <p className="text-xs text-muted-foreground">{std.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfrastructureSection() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Infrastructure & Deployment</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-accent" />
            Cloud Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-center">Frontend Tier</h4>
                <div className="bg-blue-500/20 rounded-lg p-4 space-y-3">
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <Globe className="h-4 w-4 mx-auto mb-1" />
                    CDN Edge Nodes
                  </div>
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <Monitor className="h-4 w-4 mx-auto mb-1" />
                    Static Asset Hosting
                  </div>
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <Zap className="h-4 w-4 mx-auto mb-1" />
                    React SPA Bundle
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-center">Backend Tier</h4>
                <div className="bg-green-500/20 rounded-lg p-4 space-y-3">
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <Server className="h-4 w-4 mx-auto mb-1" />
                    API Gateway
                  </div>
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <Cpu className="h-4 w-4 mx-auto mb-1" />
                    Edge Functions
                  </div>
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <Lock className="h-4 w-4 mx-auto mb-1" />
                    Auth Service
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-center">Data Tier</h4>
                <div className="bg-purple-500/20 rounded-lg p-4 space-y-3">
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <Database className="h-4 w-4 mx-auto mb-1" />
                    PostgreSQL
                  </div>
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <FileText className="h-4 w-4 mx-auto mb-1" />
                    Object Storage
                  </div>
                  <div className="bg-background rounded p-2 text-center text-sm">
                    <Bell className="h-4 w-4 mx-auto mb-1" />
                    Real-time Engine
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scalability Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'Horizontal auto-scaling based on load',
                'Database connection pooling',
                'CDN caching for static assets',
                'Edge function cold start optimization',
                'Database read replicas for high traffic',
                'Async job queues for background tasks',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Zap className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoring & Observability</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'Real-time application performance monitoring',
                'Error tracking and alerting',
                'Database query analytics',
                'User session recording',
                'Custom business metrics dashboards',
                'Automated health checks',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-accent" />
            CI/CD Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-muted/30 rounded-xl p-6">
            {[
              { step: 'Code Push', icon: Code, desc: 'Git commit' },
              { step: 'Build', icon: Cpu, desc: 'TypeScript compile' },
              { step: 'Test', icon: Shield, desc: 'Unit & E2E tests' },
              { step: 'Preview', icon: Monitor, desc: 'Staging deploy' },
              { step: 'Production', icon: Globe, desc: 'Live deploy' },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-center">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm">{item.step}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-16 h-0.5 bg-border mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Level Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { metric: 'Uptime', target: '99.9%', desc: 'Monthly availability' },
              { metric: 'Latency', target: '<200ms', desc: 'API response time' },
              { metric: 'Recovery', target: '<15min', desc: 'Incident resolution' },
              { metric: 'Deploy', target: '<5min', desc: 'Zero-downtime deploy' },
            ].map((sla) => (
              <div key={sla.metric} className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-2xl font-bold text-accent">{sla.target}</p>
                <p className="font-medium">{sla.metric}</p>
                <p className="text-xs text-muted-foreground">{sla.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
