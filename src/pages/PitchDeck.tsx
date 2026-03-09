import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Download,
  Car, Users, TrendingUp, DollarSign, Globe, Shield, Zap,
  ArrowRight, Target, BarChart3, Smartphone, Star, CheckCircle,
  MapPin, Clock, Percent, Award, Building2, Layers
} from 'lucide-react';
import logoAltWhite from '@/assets/logo-alt-white.png';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Data ────────────────────────────────────────────────────────────────────

const revenueProjections = [
  { year: 'Y1', gmv: 180, revenue: 25, providers: 120, drivers: 480, consumers: 9000 },
  { year: 'Y2', gmv: 720, revenue: 101, providers: 520, drivers: 2100, consumers: 42000 },
  { year: 'Y3', gmv: 2160, revenue: 302, providers: 1400, drivers: 5800, consumers: 134000 },
  { year: 'Y4', gmv: 5400, revenue: 756, providers: 3200, drivers: 13000, consumers: 360000 },
  { year: 'Y5', gmv: 12600, revenue: 1764, providers: 7000, drivers: 28000, consumers: 900000 },
];

const monthlyGrowth = [
  { month: 'M1', bookings: 300 },
  { month: 'M2', bookings: 580 },
  { month: 'M3', bookings: 1100 },
  { month: 'M4', bookings: 1900 },
  { month: 'M5', bookings: 3200 },
  { month: 'M6', bookings: 5100 },
  { month: 'M7', bookings: 7800 },
  { month: 'M8', bookings: 11200 },
  { month: 'M9', bookings: 15600 },
  { month: 'M10', bookings: 21000 },
  { month: 'M11', bookings: 27500 },
  { month: 'M12', bookings: 35000 },
];

const revenueStreams = [
  { name: 'Trip Commission (14%)', value: 62, color: '#0f0f0f' },
  { name: 'Provider Subscriptions', value: 18, color: '#3b82f6' },
  { name: 'Corporate Accounts', value: 12, color: '#10b981' },
  { name: 'Insurance Add-on', value: 5, color: '#f59e0b' },
  { name: 'Data & Analytics', value: 3, color: '#8b5cf6' },
];

const useOfFunds = [
  { name: 'Tech & Product', value: 40, color: '#0f0f0f' },
  { name: 'Sales & Marketing', value: 30, color: '#3b82f6' },
  { name: 'Operations', value: 20, color: '#10b981' },
  { name: 'Legal & Admin', value: 10, color: '#f59e0b' },
];

const competitorData = [
  { metric: 'Nigeria Focus', instantRyde: 5, uber: 2, bolt: 3, others: 1 },
  { metric: 'Price Negotiation', instantRyde: 5, uber: 0, bolt: 0, others: 2 },
  { metric: 'Fleet Owners', instantRyde: 5, uber: 2, bolt: 2, others: 3 },
  { metric: 'Corporate', instantRyde: 4, uber: 3, bolt: 2, others: 1 },
  { metric: 'Offline Ready', instantRyde: 4, uber: 1, bolt: 2, others: 1 },
];

const unitEconomics = [
  { label: 'Avg. Trip Value', value: '₦18,500', color: 'text-blue-400' },
  { label: 'Platform Commission', value: '14%', color: 'text-emerald-400' },
  { label: 'Revenue / Trip', value: '₦2,590', color: 'text-amber-400' },
  { label: 'Consumer CAC', value: '₦1,200', color: 'text-rose-400' },
  { label: 'LTV (24mo)', value: '₦62,000', color: 'text-violet-400' },
  { label: 'LTV : CAC Ratio', value: '52x', color: 'text-cyan-400' },
];

// ─── Slide Components ─────────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};

function SlideNumber({ current, total }: { current: number; total: number }) {
  return (
    <div className="absolute bottom-8 right-10 flex items-center gap-2">
      <span className="text-white/40 text-sm font-mono">{String(current).padStart(2, '0')}</span>
      <div className="w-12 h-px bg-white/20">
        <div className="h-full bg-white/60" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <span className="text-white/40 text-sm font-mono">{String(total).padStart(2, '0')}</span>
    </div>
  );
}

function SlideTag({ children }: { children: string }) {
  return (
    <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
      {children}
    </span>
  );
}

// Slide 1 — Cover
function SlideCover() {
  return (
    <div className="relative w-full h-full bg-[#080808] flex flex-col items-center justify-center overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #3b82f6 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center px-16">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img src={logoAltWhite} alt="InstantRyde" className="h-10" />
        </div>
        <div className="w-24 h-px bg-white/20 mb-10" />
        <h1 className="text-7xl font-black text-white leading-[1.05] mb-6">
          Africa's Premium<br />
          <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>
            Ride Platform
          </span>
        </h1>
        <p className="text-xl text-white/50 max-w-xl leading-relaxed mb-14">
          Connecting Nigeria's 220M people to professional vehicles, fleet owners, and drivers — built for negotiation, built for scale.
        </p>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-black text-white">$2M</p>
            <p className="text-sm text-white/40 mt-1">Seed Round</p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-3xl font-black text-white">Pre-A</p>
            <p className="text-sm text-white/40 mt-1">Stage</p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-3xl font-black text-white">2026</p>
            <p className="text-sm text-white/40 mt-1">Launch Year</p>
          </div>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />
    </div>
  );
}

// Slide 2 — Problem
function SlideProblem() {
  const problems = [
    { icon: '😤', title: 'No Transparency', desc: 'Fixed surge pricing with no recourse — prices spike 3–5× during peak' },
    { icon: '🚗', title: 'Fleet Owners Ignored', desc: 'Thousands of fleet owners have no platform to list and manage bookings' },
    { icon: '📵', title: 'Connectivity Gaps', desc: '40% of Nigeria has unreliable data — existing apps fail without internet' },
    { icon: '💸', title: 'Trust Deficit', desc: 'No negotiation, no relationship — zero accountability between parties' },
  ];
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] flex flex-col justify-center px-16 overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5"
        style={{ background: 'radial-gradient(ellipse at right, #ef4444 0%, transparent 70%)' }} />
      <SlideTag>The Problem</SlideTag>
      <h2 className="text-5xl font-black text-white mb-3 leading-tight">Nigeria's transport market<br />is broken.</h2>
      <p className="text-lg text-white/40 mb-10 max-w-2xl">The $8B ride-hailing market is dominated by foreign apps that don't understand Nigeria — or Nigerians.</p>
      <div className="grid grid-cols-2 gap-5">
        {problems.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <div className="text-3xl mb-3">{p.icon}</div>
            <h3 className="text-base font-bold text-white mb-1">{p.title}</h3>
            <p className="text-xs text-white/50 leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Slide 3 — Solution
function SlideSolution() {
  const features = [
    { icon: <Target className="w-4 h-4 text-blue-400" />, title: 'Smart Matching', desc: 'AI-powered provider matching by location, vehicle, rating' },
    { icon: <DollarSign className="w-4 h-4 text-emerald-400" />, title: 'Price Negotiation', desc: 'Real-time chat-based negotiation between parties' },
    { icon: <Building2 className="w-4 h-4 text-amber-400" />, title: 'Fleet Management', desc: 'Complete toolkit for fleet owners and drivers' },
    { icon: <Shield className="w-4 h-4 text-violet-400" />, title: 'Trust Layer', desc: 'NIN/CAC verification, ratings, insurance' },
    { icon: <Smartphone className="w-4 h-4 text-rose-400" />, title: 'Offline Ready', desc: 'Queue bookings offline, sync on 2G' },
    { icon: <Layers className="w-4 h-4 text-cyan-400" />, title: 'Multi-Role', desc: 'Consumer, Provider, Driver, Admin dashboards' },
  ];
  return (
    <div className="relative w-full h-full bg-[#080808] flex flex-col justify-center px-16 overflow-hidden">
      <SlideTag>The Solution</SlideTag>
      <div className="flex gap-14 items-center">
        <div className="flex-1">
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">One platform.<br />Every stakeholder.</h2>
          <p className="text-base text-white/50 mb-8 leading-relaxed">InstantRyde is Nigeria's first multi-sided transport marketplace that gives power back to consumers, fleet owners, and drivers.</p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="flex gap-2 bg-white/[0.03] border border-white/8 rounded-xl p-3">
                <div className="mt-0.5">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Phone mockup */}
        <div className="w-64 flex-shrink-0">
          <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-4 h-[520px] flex flex-col gap-3 overflow-hidden">
            <div className="h-2 w-20 bg-white/20 rounded-full mx-auto mb-1" />
            <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/80 font-semibold">New Booking Request</p>
                <p className="text-xs text-white/40">₦18,500 • Full Day • SUV</p>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <p className="text-xs text-emerald-400 font-bold mb-2">💬 Price Negotiation</p>
              <p className="text-xs text-white/60">"Can you do ₦16,000? I'm a regular customer"</p>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 bg-emerald-500/20 rounded-lg py-1.5 text-center text-xs text-emerald-400 font-medium">Accept</div>
                <div className="flex-1 bg-white/5 rounded-lg py-1.5 text-center text-xs text-white/40">Counter</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 flex-1">
              <p className="text-xs text-white/40 mb-3">Fleet Overview</p>
              {['Toyota Camry 2022', 'Honda CRV 2023', 'Lexus ES 2021'].map((v, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                  <p className="text-xs text-white/70">{v}</p>
                  <span className={`text-xs ${i === 1 ? 'text-amber-400' : 'text-emerald-400'}`}>{i === 1 ? 'On Trip' : 'Available'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide 4 — Market
function SlideMarket() {
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] flex flex-col justify-center px-24">
      <SlideTag>Market Opportunity</SlideTag>
      <h2 className="text-5xl font-black text-white mb-12 leading-tight">A $48B TAM and<br />growing at 23% CAGR.</h2>
      <div className="flex gap-12 items-center">
        <div className="flex flex-col gap-6 flex-1">
          {[
            { label: 'TAM', sub: 'African Mobility Market', value: '$48B', color: 'border-l-white/30', sub2: 'Total ride-hailing + logistics + fleet mgmt across Africa' },
            { label: 'SAM', sub: 'Nigeria Transport Market', value: '$8.2B', color: 'border-l-blue-500/60', sub2: "Formal + informal transport in Nigeria's top 36 cities" },
            { label: 'SOM', sub: 'Addressable Y1–Y3', value: '$340M', color: 'border-l-emerald-500/80', sub2: 'Lagos, Abuja, Port Harcourt premium ride segment' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
              className={`border-l-4 ${m.color} pl-6`}>
              <div className="flex items-baseline gap-4 mb-1">
                <span className="text-sm font-black text-white/40 uppercase tracking-widest">{m.label}</span>
                <span className="text-4xl font-black text-white">{m.value}</span>
              </div>
              <p className="text-sm font-semibold text-white/60 mb-1">{m.sub}</p>
              <p className="text-xs text-white/30">{m.sub2}</p>
            </motion.div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          {[
            { icon: <Globe className="w-6 h-6 text-blue-400" />, title: '220M+', sub: 'Nigeria Population', bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: <Car className="w-6 h-6 text-emerald-400" />, title: '11M+', sub: 'Registered Vehicles', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { icon: <Smartphone className="w-6 h-6 text-amber-400" />, title: '39M', sub: 'Smartphone Users', bg: 'bg-amber-500/10 border-amber-500/20' },
            { icon: <TrendingUp className="w-6 h-6 text-violet-400" />, title: '23% CAGR', sub: 'Market Growth Rate', bg: 'bg-violet-500/10 border-violet-500/20' },
            { icon: <Users className="w-6 h-6 text-rose-400" />, title: '25–40yrs', sub: 'Primary Demographic', bg: 'bg-rose-500/10 border-rose-500/20' },
            { icon: <MapPin className="w-6 h-6 text-cyan-400" />, title: '36 States', sub: 'Expansion Targets', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          ].map((s, i) => (
            <div key={i} className={`border ${s.bg} rounded-2xl p-5`}>
              {s.icon}
              <p className="text-2xl font-black text-white mt-3">{s.title}</p>
              <p className="text-xs text-white/40 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Slide 5 — Business Model
function SlideBusinessModel() {
  return (
    <div className="relative w-full h-full bg-[#080808] flex flex-col justify-center px-24">
      <SlideTag>Business Model</SlideTag>
      <h2 className="text-5xl font-black text-white mb-12 leading-tight">5 diversified revenue streams.</h2>
      <div className="flex gap-14 items-center">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={revenueStreams} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value">
                {revenueStreams.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {revenueStreams.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-white/[0.03] border border-white/8 rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                <span className="text-sm text-white/80">{s.name}</span>
              </div>
              <span className="text-lg font-black text-white">{s.value}%</span>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Unit Economics</p>
            <div className="flex flex-col gap-3">
              {unitEconomics.map((u, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-white/50">{u.label}</span>
                  <span className={`text-sm font-black ${u.color}`}>{u.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Payback Period</p>
            <p className="text-3xl font-black text-white">0.6 months</p>
            <p className="text-xs text-white/40 mt-1">On consumer CAC at avg. trip frequency</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide 6 — Traction / Roadmap
function SlideTraction() {
  const milestones = [
    { q: 'Q1 2026', label: 'Launch Ready', items: ['MVP built', 'Beta tested', 'Seed raise'], done: true },
    { q: 'Q2 2026', label: 'Lagos Launch', items: ['500 providers', '2,000 drivers', '20k consumers'], done: false },
    { q: 'Q3 2026', label: 'Abuja + PH', items: ['Corporate MVP', '₦720M GMV run rate', 'SMS integration'], done: false },
    { q: 'Q4 2026', label: 'Series A Prep', items: ['5 cities', '₦2.1B GMV', 'Insurance launch'], done: false },
  ];
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] flex flex-col justify-center px-24">
      <SlideTag>Traction & Roadmap</SlideTag>
      <h2 className="text-5xl font-black text-white mb-6 leading-tight">First mover execution plan.</h2>
      <p className="text-lg text-white/40 mb-12">MVP is built. Tech is live. We're raising to scale distribution.</p>
      <div className="flex gap-6 mb-12">
        {milestones.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
            className={`flex-1 border rounded-2xl p-6 ${m.done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-white/40 font-bold uppercase tracking-widest">{m.q}</span>
              {m.done && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-lg font-black text-white mb-4">{m.label}</p>
            <div className="flex flex-col gap-2">
              {m.items.map((item, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${m.done ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  <span className="text-xs text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Growth chart */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Projected Monthly Bookings — Year 1</p>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={monthlyGrowth}>
            <defs>
              <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 10 }} />
            <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12, color: '#fff' }} />
            <Area type="monotone" dataKey="bookings" stroke="#3b82f6" fill="url(#bookGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Slide 7 — Financials
function SlideFinancials() {
  return (
    <div className="relative w-full h-full bg-[#080808] flex flex-col justify-center px-24">
      <SlideTag>Financial Projections</SlideTag>
      <h2 className="text-5xl font-black text-white mb-10 leading-tight">Path to ₦1B+ revenue<br />in 36 months.</h2>
      <div className="flex gap-10 items-start">
        <div className="flex-[1.4]">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">GMV vs Revenue (₦ Millions)</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueProjections} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="year" stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 11 }} />
              <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff40', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12, color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#ffffff60', fontSize: 11 }} />
              <Bar dataKey="gmv" name="GMV" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Platform Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {revenueProjections.map((r, i) => (
            <div key={i} className="flex items-center justify-between border-b border-white/8 pb-3">
              <span className="text-sm font-bold text-white/60">{r.year}</span>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-xs text-white/30">GMV</p>
                  <p className="text-sm font-black text-blue-400">₦{r.gmv}M</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30">Revenue</p>
                  <p className="text-sm font-black text-emerald-400">₦{r.revenue}M</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30">Consumers</p>
                  <p className="text-sm font-black text-white">{r.consumers.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-2">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">Break-even</p>
            <p className="text-2xl font-black text-white">Month 18</p>
            <p className="text-xs text-white/40 mt-1">At 4,500 bookings/day run rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide 8 — Competitive Landscape
function SlideCompetitive() {
  const companies = [
    { name: 'InstantRyde', color: 'text-white bg-white/10', scores: [5, 5, 5, 4, 4] },
    { name: 'Uber', color: 'text-blue-400 bg-blue-500/10', scores: [2, 0, 2, 3, 1] },
    { name: 'Bolt', color: 'text-emerald-400 bg-emerald-500/10', scores: [3, 0, 2, 2, 2] },
    { name: 'Others', color: 'text-amber-400 bg-amber-500/10', scores: [1, 2, 3, 1, 1] },
  ];
  const dimensions = ['Nigeria Focus', 'Price Negotiation', 'Fleet Owners', 'Corporate', 'Offline Ready'];
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] flex flex-col justify-center px-24">
      <SlideTag>Competitive Landscape</SlideTag>
      <h2 className="text-5xl font-black text-white mb-4 leading-tight">We win on dimensions<br />nobody else built for.</h2>
      <p className="text-lg text-white/40 mb-12 max-w-2xl">Uber and Bolt are global products with Nigeria as an afterthought. InstantRyde is built from the ground up for this market.</p>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5">
              <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-widest text-white/40">Feature</th>
              {companies.map((c, i) => (
                <th key={i} className="py-4 px-6">
                  <span className={`text-sm font-black px-3 py-1 rounded-full ${c.color}`}>{c.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dim, di) => (
              <tr key={di} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="py-4 px-6 text-sm text-white/60">{dim}</td>
                {companies.map((c, ci) => {
                  const score = c.scores[di];
                  return (
                    <td key={ci} className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <div key={si} className={`w-3 h-3 rounded-sm ${si < score ? (ci === 0 ? 'bg-white' : ci === 1 ? 'bg-blue-500' : ci === 2 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Slide 9 — Team
function SlideTeam() {
  const team = [
    { name: 'Founder & CEO', bg: 'from-blue-500/20 to-blue-900/20', icon: '👨🏿‍💼', desc: 'Former Flutterwave growth lead. Built and scaled fintech products to 2M users across West Africa.' },
    { name: 'CTO', bg: 'from-emerald-500/20 to-emerald-900/20', icon: '👨🏿‍💻', desc: 'Ex-Google Nigeria engineer. Led infrastructure for 50M+ daily active users. React Native expert.' },
    { name: 'COO', bg: 'from-amber-500/20 to-amber-900/20', icon: '👩🏿‍💼', desc: 'Former Uber Eats Nigeria operations. Scaled driver supply from 0 to 8,000 in Lagos.' },
    { name: 'Head of Growth', bg: 'from-violet-500/20 to-violet-900/20', icon: '👨🏿‍📊', desc: 'Built growth loops at Piggyvest. 0 to 4M users in 24 months. Masters in Data Science.' },
  ];
  const advisors = [
    'Former Bolt Africa VP', 'Ex-Zenith Bank Head of Digital', 'Harvard Business School MBA', 'Lagos State Transport Authority'
  ];
  return (
    <div className="relative w-full h-full bg-[#080808] flex flex-col justify-center px-24">
      <SlideTag>Team</SlideTag>
      <h2 className="text-5xl font-black text-white mb-10 leading-tight">Built by people who've<br />done this before.</h2>
      <div className="grid grid-cols-4 gap-5 mb-10">
        {team.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-b ${t.bg} border border-white/10 rounded-2xl p-6`}>
            <div className="text-4xl mb-4">{t.icon}</div>
            <p className="text-base font-black text-white mb-3">{t.name}</p>
            <p className="text-xs text-white/50 leading-relaxed">{t.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Advisory Board</p>
        <div className="flex gap-4">
          {advisors.map((a, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-white/70">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Slide 10 — Use of Funds
function SlideUseOfFunds() {
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] flex flex-col justify-center px-24">
      <SlideTag>Use of Funds</SlideTag>
      <h2 className="text-5xl font-black text-white mb-12 leading-tight">$2M Seed Round —<br />deployed in 18 months.</h2>
      <div className="flex gap-14 items-center">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={useOfFunds} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={3} dataKey="value">
                {useOfFunds.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 12, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-[1.5] flex flex-col gap-5">
          {[
            { pct: '40%', label: 'Tech & Product', amount: '$800K', items: ['Native iOS + Android apps', 'AI matching engine', 'Real-time infrastructure', 'Security & compliance'], color: 'bg-white', text: 'text-black' },
            { pct: '30%', label: 'Sales & Marketing', amount: '$600K', items: ['Driver + Provider acquisition', 'Consumer brand campaigns', 'Corporate sales team', 'WhatsApp + SMS campaigns'], color: 'bg-blue-500', text: 'text-white' },
            { pct: '20%', label: 'Operations', amount: '$400K', items: ['City operations leads', 'Driver onboarding', 'Customer support', 'Verification systems'], color: 'bg-emerald-500', text: 'text-white' },
            { pct: '10%', label: 'Legal & Admin', amount: '$200K', items: ['Regulatory compliance', 'Legal structure', 'Insurance partnerships'], color: 'bg-amber-500', text: 'text-black' },
          ].map((u, i) => (
            <div key={i} className="flex gap-5 items-start border-b border-white/8 pb-5">
              <div className={`w-12 h-12 rounded-xl ${u.color} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-sm font-black ${u.text}`}>{u.pct}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-2">
                  <p className="text-base font-black text-white">{u.label}</p>
                  <p className="text-sm text-white/40">{u.amount}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {u.items.map((item, j) => (
                    <span key={j} className="text-xs bg-white/5 text-white/50 px-2 py-1 rounded-md">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Slide 11 — The Ask / Closing
function SlideAsk() {
  return (
    <div className="relative w-full h-full bg-[#080808] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #10b981 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center px-20">
        <SlideTag>The Ask</SlideTag>
        <h2 className="text-7xl font-black text-white mb-6 leading-tight">
          Join us in building<br />
          <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.25)' }}>
            Africa's #1 Ride Platform.
          </span>
        </h2>
        <p className="text-xl text-white/50 max-w-2xl mb-14 leading-relaxed">
          We're raising $2M at a $10M pre-money valuation to launch in Lagos, scale to 3 cities, and prove the model ahead of a Series A.
        </p>
        <div className="grid grid-cols-3 gap-6 w-full max-w-3xl mb-14">
          {[
            { label: 'Round Size', value: '$2M', sub: 'SAFE / Equity', color: 'border-white/20' },
            { label: 'Pre-Money Val.', value: '$10M', sub: 'Based on comps', color: 'border-blue-500/40' },
            { label: 'Target Close', value: 'Q2 2026', sub: '60-day runway to launch', color: 'border-emerald-500/40' },
          ].map((k, i) => (
            <div key={i} className={`border ${k.color} bg-white/[0.03] rounded-2xl p-6`}>
              <p className="text-4xl font-black text-white mb-2">{k.value}</p>
              <p className="text-sm font-bold text-white/70">{k.label}</p>
              <p className="text-xs text-white/30 mt-1">{k.sub}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-white/50">
          <span className="text-sm">investor@instantryde.ng</span>
          <span>•</span>
          <span className="text-sm">instantryde.ng/pitch</span>
          <span>•</span>
          <span className="text-sm">+234 800 INSTANT</span>
        </div>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />
    </div>
  );
}

// ─── Slides Registry ──────────────────────────────────────────────────────────

const slides = [
  { id: 1, title: 'Cover', component: SlideCover, exportable: true },
  { id: 2, title: 'Problem', component: SlideProblem, exportable: true },
  { id: 3, title: 'Solution', component: SlideSolution, exportable: true },
  { id: 4, title: 'Market', component: SlideMarket, exportable: true },
  { id: 5, title: 'Business Model', component: SlideBusinessModel, exportable: true },
  { id: 6, title: 'Traction', component: SlideTraction, exportable: true },
  { id: 7, title: 'Financials', component: SlideFinancials, exportable: true },
  { id: 8, title: 'Competitive', component: SlideCompetitive, exportable: true },
  { id: 9, title: 'Team', component: SlideTeam, exportable: false }, // Hidden from export until updated
  { id: 10, title: 'Use of Funds', component: SlideUseOfFunds, exportable: true },
  { id: 11, title: 'The Ask', component: SlideAsk, exportable: true },
];

// ─── Main PitchDeck ──────────────────────────────────────────────────────────

export default function PitchDeck() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const navTimer = useRef<ReturnType<typeof setTimeout>>();
  const total = slides.length;

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= total) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current, total]);

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try { await containerRef.current?.requestFullscreen(); setIsFullscreen(true); } catch {}
    } else {
      try { await document.exitFullscreen(); setIsFullscreen(false); } catch {}
    }
  };
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Auto-hide nav in fullscreen
  const resetNavTimer = useCallback(() => {
    setShowNav(true);
    clearTimeout(navTimer.current);
    if (isFullscreen) navTimer.current = setTimeout(() => setShowNav(false), 3000);
  }, [isFullscreen]);
  useEffect(() => { resetNavTimer(); }, [resetNavTimer]);

  // PDF Export
  const [isExporting, setIsExporting] = useState(false);
  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const W = 1280;
      const H = 720;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [W, H] });
      
      // Use the hidden export container which renders ALL slides
      const exportContainer = document.getElementById('pdf-export-container');
      if (!exportContainer) return;
      
      const exportSlides = exportContainer.querySelectorAll('[data-pdf-slide]');
      let pageAdded = false;
      
      for (let i = 0; i < exportSlides.length; i++) {
        const el = exportSlides[i] as HTMLElement;
        // Skip non-exportable slides (e.g., Team)
        if (el.dataset.pdfSkip === 'true') continue;
        
        const canvas = await html2canvas(el, {
          scale: 2,
          backgroundColor: '#080808',
          width: W,
          height: H,
          useCORS: true,
          logging: false,
          // Ensure SVGs and icons render properly
          onclone: (doc) => {
            // Force all SVG elements to have explicit dimensions
            doc.querySelectorAll('svg').forEach(svg => {
              if (!svg.getAttribute('width')) {
                const rect = svg.getBoundingClientRect();
                svg.setAttribute('width', String(rect.width || 16));
                svg.setAttribute('height', String(rect.height || 16));
              }
            });
          }
        });
        
        const img = canvas.toDataURL('image/jpeg', 0.92);
        if (pageAdded) pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, 0, W, H);
        pageAdded = true;
      }
      
      pdf.save('InstantRyde-Pitch-Deck.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const CurrentSlide = slides[current].component;

  return (
    <div ref={containerRef} className="w-full h-screen bg-black flex flex-col" onMouseMove={resetNavTimer}>
      {/* Top Bar */}
      <AnimatePresence>
        {showNav && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between px-6 py-3 bg-black/90 border-b border-white/10 z-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img src={logoAltWhite} alt="InstantRyde" className="h-5" />
              <span className="text-white/20 text-sm">•</span>
              <span className="text-xs text-white/40">Investor Pitch Deck 2026</span>
            </div>
            {/* Slide Tabs */}
            <div className="flex items-center gap-1">
              {slides.map((s, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === current ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/10'}`}>
                  {s.title}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportPDF} disabled={isExporting} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40">
                <Download className="w-3.5 h-3.5" /> {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button onClick={toggleFullscreen} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all">
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {isFullscreen ? 'Exit' : 'Present'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={current} custom={direction} variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0" data-slide={current}>
            {/* Hidden render for all slides (PDF export) */}
            <CurrentSlide />
            <SlideNumber current={current + 1} total={total} />
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        <AnimatePresence>
          {showNav && (
            <>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={prev} disabled={current === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed z-40">
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={next} disabled={current === total - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed z-40">
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom progress bar */}
      <div className="h-0.5 bg-white/10 flex-shrink-0">
        <motion.div className="h-full bg-white" animate={{ width: `${((current + 1) / total) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Hidden slides for PDF export — ALL rendered simultaneously at fixed size */}
      <div id="pdf-export-container" className="fixed pointer-events-none" style={{ left: '-99999px', top: 0 }} aria-hidden>
        {slides.map((s, i) => {
          const SlideComp = s.component;
          return (
            <div
              key={i}
              data-pdf-slide={i}
              data-pdf-skip={!s.exportable ? 'true' : 'false'}
              style={{ width: 1280, height: 720, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ width: 1280, height: 720, transform: 'scale(1)', transformOrigin: 'top left' }}>
                <SlideComp />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
