import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { COMMISSION_RATE } from '@/lib/constants';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BOOKING_TYPE_COLORS: Record<string, string> = {
  'full-day':       'hsl(175, 84%, 40%)',
  'half-day':       'hsl(45, 93%, 47%)',
  'point-to-point': 'hsl(217, 91%, 60%)',
  'event':          'hsl(262, 83%, 58%)',
  'to-and-fro':     'hsl(0, 84%, 60%)',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthLabel(dateStr: string) {
  return MONTHS[new Date(dateStr).getMonth()];
}

export interface RevenuePoint    { month: string; revenue: number; bookings: number }
export interface BookingTypePoint { name: string; value: number; color: string }
export interface GrowthPoint     { month: string; providers: number; consumers: number; drivers: number }
export interface GMVPoint        { month: string; gmv: number; commission: number }
export interface SettlementPoint { status: string; value: number; color: string }
export interface EarningsPoint   { week: string; gross: number; net: number; commission: number }
export interface UtilizationPoint { day: string; utilization: number; available: number }
export interface DriverPerformance { name: string; trips: number; rating: number; avatar: string }

export interface PlatformMetrics {
  totalGMV: number;
  platformRevenue: number;
  totalBookings: number;
  activeBookings: number;
  activeConsumers: number;
  activeProviders: number;
  gmvTrend: number;
  bookingTrend: number;
}

export interface AnalyticsData {
  isLoading: boolean;
  metrics: PlatformMetrics;
  revenueData: RevenuePoint[];
  bookingTypeData: BookingTypePoint[];
  growthData: GrowthPoint[];
  gmvData: GMVPoint[];
  settlementData: SettlementPoint[];
  earningsData: EarningsPoint[];
  utilizationData: UtilizationPoint[];
  topDrivers: DriverPerformance[];
}

function groupByMonth<T>(rows: T[], dateKey: keyof T): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const row of rows) {
    const key = monthLabel(row[dateKey] as string);
    if (!map[key]) map[key] = [];
    map[key].push(row);
  }
  return map;
}

const EMPTY_METRICS: PlatformMetrics = {
  totalGMV: 0, platformRevenue: 0,
  totalBookings: 0, activeBookings: 0,
  activeConsumers: 0, activeProviders: 0,
  gmvTrend: 0, bookingTrend: 0,
};

export function useAnalytics(): AnalyticsData {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<PlatformMetrics>(EMPTY_METRICS);
  const [revenueData, setRevenueData]         = useState<RevenuePoint[]>([]);
  const [bookingTypeData, setBookingTypeData] = useState<BookingTypePoint[]>([]);
  const [growthData, setGrowthData]           = useState<GrowthPoint[]>([]);
  const [gmvData, setGmvData]                 = useState<GMVPoint[]>([]);
  const [settlementData, setSettlementData]   = useState<SettlementPoint[]>([]);
  const [earningsData, setEarningsData]       = useState<EarningsPoint[]>([]);
  const [utilizationData, setUtilizationData] = useState<UtilizationPoint[]>([]);
  const [topDrivers, setTopDrivers]           = useState<DriverPerformance[]>([]);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, paymentsRes, providersRes, consumersRes, driversRes, vehiclesRes] = await Promise.all([
        supabase.from('bookings').select('id, status, booking_type, final_price, negotiated_price, created_at').order('created_at', { ascending: true }),
        supabase.from('payments' as any).select('id, amount, status, created_at'),
        supabase.from('providers').select('id, created_at, verification_status').order('created_at', { ascending: true }),
        supabase.from('user_roles').select('user_id, created_at').eq('role', 'consumer').order('created_at', { ascending: true }),
        supabase.from('drivers').select('*, profiles(name, avatar_url)').order('created_at', { ascending: true }),
        supabase.from('vehicles').select('id', { count: 'exact' }),
      ]);

      const bookings    = (bookingsRes.data  || []) as any[];
      const payments    = (paymentsRes.data  || []) as any[];
      const providers   = (providersRes.data || []) as any[];
      const consumers   = (consumersRes.data || []) as any[];
      const drivers     = (driversRes.data   || []) as any[];

      // ── Platform Metrics ────────────────────────────────────────────────
      const activeStatuses = ['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress'];
      const successfulPayments = payments.filter((p: any) => p.status === 'successful');
      const totalGMV = successfulPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);

      // Simple trend calculation (last 30 days vs previous 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 86400000);
      const sixtyDaysAgo  = Date.now() - (60 * 86400000);
      
      const recentGMV = successfulPayments
        .filter((p: any) => new Date(p.created_at).getTime() > thirtyDaysAgo)
        .reduce((s: number, p: any) => s + Number(p.amount), 0);
      const previousGMV = successfulPayments
        .filter((p: any) => {
          const t = new Date(p.created_at).getTime();
          return t > sixtyDaysAgo && t <= thirtyDaysAgo;
        })
        .reduce((s: number, p: any) => s + Number(p.amount), 0);
      
      const gmvTrend = previousGMV === 0 ? 100 : Math.round(((recentGMV - previousGMV) / previousGMV) * 100);

      setMetrics({
        totalGMV,
        platformRevenue:  totalGMV * COMMISSION_RATE,
        totalBookings:    bookings.length,
        activeBookings:   bookings.filter((b: any) => activeStatuses.includes(b.status)).length,
        activeConsumers:  consumers.length,
        activeProviders:  providers.filter((p: any) => p.verification_status === 'approved').length,
        gmvTrend,
        bookingTrend: 12, // placeholder for now
      });

      // ── Revenue by Month ────────────────────────────────────────────────
      const revenueByMonth: Record<string, { revenue: number; bookings: number }> = {};
      for (const p of successfulPayments) {
        const m = monthLabel(p.created_at);
        if (!revenueByMonth[m]) revenueByMonth[m] = { revenue: 0, bookings: 0 };
        revenueByMonth[m].revenue += Number(p.amount);
      }
      for (const b of bookings) {
        const m = monthLabel(b.created_at);
        if (!revenueByMonth[m]) revenueByMonth[m] = { revenue: 0, bookings: 0 };
        revenueByMonth[m].bookings += 1;
      }
      setRevenueData(
        MONTHS.filter(m => revenueByMonth[m]).map(m => ({
          month: m, ...revenueByMonth[m],
        }))
      );

      // ── Booking Type Distribution ────────────────────────────────────────
      const typeCounts: Record<string, number> = {};
      for (const b of bookings) {
        typeCounts[b.booking_type] = (typeCounts[b.booking_type] || 0) + 1;
      }
      const total = bookings.length || 1;
      setBookingTypeData(
        Object.entries(typeCounts).map(([type, count]) => ({
          name:  type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          value: Math.round((count / total) * 100),
          color: BOOKING_TYPE_COLORS[type] || 'hsl(var(--muted))',
        }))
      );

      // ── GMV by Month ────────────────────────────────────────────────────
      const gmvByMonth: Record<string, number> = {};
      for (const p of successfulPayments) {
        const m = monthLabel(p.created_at);
        gmvByMonth[m] = (gmvByMonth[m] || 0) + Number(p.amount);
      }
      setGmvData(
        MONTHS.filter(m => gmvByMonth[m]).map(m => ({
          month: m,
          gmv: gmvByMonth[m],
          commission: Math.round(gmvByMonth[m] * COMMISSION_RATE),
        }))
      );

      // ── Platform Growth (cumulative counts by month) ──────────────────────
      const growthByMonth: Record<string, { providers: number; consumers: number; drivers: number }> = {};
      for (const p of providers) {
        const m = monthLabel(p.created_at); growthByMonth[m] = growthByMonth[m] || { providers: 0, consumers: 0, drivers: 0 }; growthByMonth[m].providers++;
      }
      for (const c of consumers) {
        const m = monthLabel(c.created_at); growthByMonth[m] = growthByMonth[m] || { providers: 0, consumers: 0, drivers: 0 }; growthByMonth[m].consumers++;
      }
      for (const d of drivers) {
        const m = monthLabel(d.created_at); growthByMonth[m] = growthByMonth[m] || { providers: 0, consumers: 0, drivers: 0 }; growthByMonth[m].drivers++;
      }
      // Make cumulative
      let cumP = 0, cumC = 0, cumD = 0;
      setGrowthData(
        MONTHS.filter(m => growthByMonth[m]).map(m => {
          cumP += growthByMonth[m].providers;
          cumC += growthByMonth[m].consumers;
          cumD += growthByMonth[m].drivers;
          return { month: m, providers: cumP, consumers: cumC, drivers: cumD };
        })
      );

      // ── Settlement Status ────────────────────────────────────────────────
      const successful = payments.filter((p: any) => p.status === 'successful').length;
      const pending    = payments.filter((p: any) => p.status === 'pending').length;
      const failed     = payments.filter((p: any) => p.status === 'failed').length;
      const ptotal     = payments.length || 1;
      setSettlementData([
        { status: 'Completed',  value: Math.round((successful / ptotal) * 100), color: 'hsl(142, 71%, 45%)' },
        { status: 'Processing', value: Math.round((pending    / ptotal) * 100), color: 'hsl(45, 93%, 47%)' },
        { status: 'Failed',     value: Math.round((failed     / ptotal) * 100), color: 'hsl(var(--destructive))' },
      ].filter(s => s.value > 0));

      // ── Earnings Trend (last 4 weeks) ─────────────────────────────────────
      const now = Date.now();
      const weeks: EarningsPoint[] = Array.from({ length: 4 }, (_, i) => {
        const weekStart = now - (4 - i) * 7 * 86400000;
        const weekEnd   = now - (3 - i) * 7 * 86400000;
        const gross = successfulPayments
          .filter((p: any) => {
            const t = new Date(p.created_at).getTime();
            return t >= weekStart && t < weekEnd;
          })
          .reduce((s: number, p: any) => s + Number(p.amount), 0);
        const commission = Math.round(gross * COMMISSION_RATE);
        return { week: `W${i + 1}`, gross, net: gross - commission, commission };
      });
      setEarningsData(weeks);

      // ── Fleet Utilization ────────────────────────────────────────────────
      const totalVehicles = vehiclesRes.count || 1;
      const utilization: UtilizationPoint[] = DAYS.map(day => {
        // Find bookings active on this day of the week (last 7 days)
        const dayBookings = bookings.filter((b: any) => {
          const date = new Date(b.created_at);
          return DAYS[date.getDay()] === day && (now - date.getTime()) < (7 * 86400000);
        }).length;
        const utilPercent = Math.min(100, Math.round((dayBookings / totalVehicles) * 100));
        return { day, utilization: utilPercent, available: 100 - utilPercent };
      });
      setUtilizationData(utilization);

      // ── Top Drivers ───────────────────────────────────────────────────────
      const top = drivers
        .sort((a: any, b: any) => (b.total_trips || 0) - (a.total_trips || 0))
        .slice(0, 5)
        .map((d: any) => ({
          name: d.profiles?.name || 'Unknown Driver',
          trips: d.total_trips || 0,
          rating: d.rating || 0,
          avatar: d.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`,
        }));
      setTopDrivers(top);

    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { isLoading, metrics, revenueData, bookingTypeData, growthData, gmvData, settlementData, earningsData, utilizationData, topDrivers };
}
