import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Database, Server, Shield, Users, Car, ArrowLeft, Loader2, Zap, Code, Cloud, Globe, Layers, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function SystemArchitecture() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const sections = pdfRef.current.querySelectorAll('.pdf-page');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        const canvas = await html2canvas(section, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 5, 5, 287, 200);
        pdf.setFontSize(8);
        pdf.text(`Page ${i + 1}/${sections.length}`, 280, 205);
      }
      pdf.save('CarHire2Go-Architecture.pdf');
    } catch (e) { console.error(e); }
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold">System Architecture</h1>
              <p className="text-sm text-muted-foreground">CarHire2Go Technical Documentation</p>
            </div>
          </div>
          <Button onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            {isExporting ? 'Generating...' : 'Export PDF'}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><OverviewContent /></TabsContent>
          <TabsContent value="architecture"><ArchitectureContent /></TabsContent>
          <TabsContent value="database"><DatabaseContent /></TabsContent>
          <TabsContent value="security"><SecurityContent /></TabsContent>
        </Tabs>
      </main>

      {/* PDF Pages */}
      <div ref={pdfRef} className="fixed left-[-9999px]" style={{ width: '1400px' }}>
        <div className="pdf-page bg-white p-16 flex flex-col items-center justify-center" style={{ height: '900px' }}>
          <Car className="h-24 w-24 text-blue-600 mb-8" />
          <h1 className="text-6xl font-bold mb-4">CarHire2Go</h1>
          <p className="text-2xl text-gray-500 mb-8">System Architecture Document</p>
          <div className="w-32 h-1 bg-blue-600 mb-8" />
          <p className="text-xl">Version 1.0 | January 2026</p>
        </div>
        <div className="pdf-page bg-white p-12" style={{ height: '900px' }}>
          <h2 className="text-3xl font-bold border-b-4 border-blue-600 pb-3 mb-6">1. Executive Overview</h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[['4', 'Apps'], ['7', 'Tables'], ['25+', 'APIs'], ['5', 'Security Layers']].map(([v, l]) => (
              <div key={l} className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-blue-600">{v}</div>
                <div className="text-gray-700">{l}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl"><h3 className="font-bold text-xl mb-3">Platform</h3><p>Enterprise vehicle hire marketplace connecting consumers with providers and drivers.</p></div>
            <div className="bg-gray-50 p-6 rounded-xl"><h3 className="font-bold text-xl mb-3">Tech Stack</h3><p>React, TypeScript, PostgreSQL, Edge Functions, Row Level Security</p></div>
          </div>
        </div>
        <div className="pdf-page bg-white p-12" style={{ height: '900px' }}>
          <h2 className="text-3xl font-bold border-b-4 border-blue-600 pb-3 mb-6">2. Architecture</h2>
          <div className="space-y-4">
            <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-4 text-center"><strong>Client Layer:</strong> Consumer App | Provider Portal | Driver App | Admin Dashboard</div>
            <div className="text-center text-2xl">↓</div>
            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 text-center"><strong>API Layer:</strong> Authentication | Booking API | Payments | Notifications</div>
            <div className="text-center text-2xl">↓</div>
            <div className="bg-purple-100 border-2 border-purple-400 rounded-xl p-4 text-center"><strong>Data Layer:</strong> PostgreSQL | Object Storage | Real-time Engine</div>
          </div>
        </div>
        <div className="pdf-page bg-white p-12" style={{ height: '900px' }}>
          <h2 className="text-3xl font-bold border-b-4 border-blue-600 pb-3 mb-6">3. Database & Security</h2>
          <div className="grid grid-cols-2 gap-8">
            <div><h3 className="font-bold text-xl mb-3">Tables</h3>
              {['profiles', 'bookings', 'vehicles', 'drivers', 'providers', 'chat_messages', 'user_roles'].map(t => (
                <div key={t} className="bg-gray-100 p-2 rounded mb-2 font-mono">{t}</div>
              ))}
            </div>
            <div><h3 className="font-bold text-xl mb-3">Security</h3>
              {['JWT Authentication', 'Row Level Security', 'Role-based Access', 'TLS Encryption', 'Data Protection'].map(s => (
                <div key={s} className="flex items-center gap-2 mb-2"><span className="text-green-600">✓</span>{s}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[{ v: '4', l: 'Apps', i: Users }, { v: '7', l: 'Tables', i: Database }, { v: '25+', l: 'APIs', i: Server }, { v: '5', l: 'Security', i: Shield }].map(s => (
          <Card key={s.l}><CardContent className="pt-6 text-center"><s.i className="h-8 w-8 mx-auto text-primary mb-2" /><p className="text-3xl font-bold">{s.v}</p><p className="text-muted-foreground">{s.l}</p></CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle><Zap className="h-5 w-5 inline mr-2" />Core Features</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-2 gap-3">
          {['Multi-tenant Architecture', 'Real-time Booking', 'Price Negotiation', 'Fleet Management', 'Automated Settlements', 'Analytics Dashboard'].map(f => (
            <div key={f} className="flex items-center gap-2 p-2 bg-muted/50 rounded"><div className="h-2 w-2 bg-accent rounded-full" />{f}</div>
          ))}
        </div></CardContent>
      </Card>
      <Card><CardHeader><CardTitle><Code className="h-5 w-5 inline mr-2" />Tech Stack</CardTitle></CardHeader>
        <CardContent><div className="flex flex-wrap gap-2">
          {['React 18', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Edge Functions', 'RLS', 'Real-time'].map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
        </div></CardContent>
      </Card>
    </div>
  );
}

function ArchitectureContent() {
  return (
    <div className="space-y-6">
      <Card><CardHeader><CardTitle><Layers className="h-5 w-5 inline mr-2" />System Layers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              {[{ n: 'Consumer', c: 'bg-blue-500' }, { n: 'Provider', c: 'bg-green-500' }, { n: 'Driver', c: 'bg-orange-500' }, { n: 'Admin', c: 'bg-purple-500' }].map(a => (
                <div key={a.n} className="text-center"><div className={`w-14 h-14 ${a.c} rounded-xl flex items-center justify-center mx-auto mb-1`}><Users className="h-6 w-6 text-white" /></div><p className="text-sm">{a.n}</p></div>
              ))}
            </div>
            <div className="bg-primary/10 rounded-xl p-4 text-center"><Globe className="h-5 w-5 inline mr-2" />API Gateway</div>
            <div className="bg-muted rounded-xl p-4 text-center"><Database className="h-5 w-5 inline mr-2" />PostgreSQL + Storage</div>
          </div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle><GitBranch className="h-5 w-5 inline mr-2" />Booking Flow</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-between">
            {['Request', 'Match', 'Negotiate', 'Confirm', 'Execute', 'Complete'].map((s, i) => (
              <div key={s} className="text-center"><div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-1">{i + 1}</div><p className="text-xs">{s}</p></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DatabaseContent() {
  return (
    <div className="space-y-6">
      <Card><CardHeader><CardTitle><Database className="h-5 w-5 inline mr-2" />Tables</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-4 gap-3">
          {['profiles', 'bookings', 'vehicles', 'drivers', 'providers', 'chat_messages', 'user_roles'].map(t => (
            <div key={t} className="bg-muted/50 p-3 rounded"><code className="text-primary">{t}</code></div>
          ))}
        </div></CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Enums</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-3 gap-4">
          <div><p className="font-semibold mb-2">app_role</p>{['consumer', 'provider', 'driver', 'admin'].map(v => <Badge key={v} variant="outline" className="mr-1">{v}</Badge>)}</div>
          <div><p className="font-semibold mb-2">booking_status</p>{['pending', 'confirmed', 'completed'].map(v => <Badge key={v} variant="outline" className="mr-1">{v}</Badge>)}</div>
          <div><p className="font-semibold mb-2">vehicle_type</p>{['sedan', 'suv', 'luxury', 'van'].map(v => <Badge key={v} variant="outline" className="mr-1">{v}</Badge>)}</div>
        </div></CardContent>
      </Card>
    </div>
  );
}

function SecurityContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[{ t: 'Authentication', i: ['JWT tokens', 'Password hashing', 'Sessions'] }, { t: 'Authorization', i: ['RBAC', 'RLS policies', 'API protection'] }, { t: 'Data Protection', i: ['TLS 1.3', 'Encryption', 'Backups'] }].map(l => (
          <Card key={l.t}><CardHeader><CardTitle className="text-base"><Shield className="h-4 w-4 inline mr-2" />{l.t}</CardTitle></CardHeader>
            <CardContent><ul className="space-y-1">{l.i.map(x => <li key={x} className="flex items-center gap-2 text-sm"><div className="h-2 w-2 bg-green-500 rounded-full" />{x}</li>)}</ul></CardContent>
          </Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle><Cloud className="h-5 w-5 inline mr-2" />SLA Targets</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-4 gap-4">
          {[['99.9%', 'Uptime'], ['<200ms', 'Latency'], ['<15min', 'Recovery'], ['<5min', 'Deploy']].map(([v, l]) => (
            <div key={l} className="text-center p-3 bg-accent/10 rounded"><p className="text-xl font-bold text-accent">{v}</p><p className="text-sm">{l}</p></div>
          ))}
        </div></CardContent>
      </Card>
    </div>
  );
}
