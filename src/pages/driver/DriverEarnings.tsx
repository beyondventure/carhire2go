import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Calendar, ArrowUpRight, Download, FileText, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { EarningsTrendChart } from '@/components/analytics/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';
import { downloadFile } from '@/lib/platform';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface EarningRow {
  id: string;
  description: string;
  amount: number;
  date: string;
  bookingId: string;
  pickupAddress: string;
}

interface DayStats {
  day: string;
  trips: number;
  earnings: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildWeeklyStats(rows: EarningRow[]): DayStats[] {
  const stats: Record<number, DayStats> = {};
  DAY_LABELS.forEach((d, i) => { stats[i] = { day: d, trips: 0, earnings: 0 }; });

  const weekAgo = Date.now() - 7 * 86400000;
  rows
    .filter(r => new Date(r.date).getTime() >= weekAgo)
    .forEach(r => {
      const dayIdx = new Date(r.date).getDay();
      stats[dayIdx].trips += 1;
      stats[dayIdx].earnings += r.amount;
    });

  return DAY_LABELS.map((_, i) => stats[i]);
}

export default function DriverEarnings() {
  const { user } = useSupabaseAuth();
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Get the driver record for this user
      const { data: driverData, error: driverErr } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (driverErr) throw driverErr;
      if (!driverData) { setEarnings([]); return; }

      // Fetch completed bookings assigned to this driver
      const { data: bookings, error: bookingsErr } = await supabase
        .from('bookings')
        .select('id, pickup_address, booking_type, final_price, negotiated_price, completed_at, created_at')
        .eq('driver_id', driverData.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(50);

      if (bookingsErr) throw bookingsErr;

      const rows: EarningRow[] = (bookings || []).map(b => {
        const gross = Number(b.final_price ?? b.negotiated_price ?? 0);
        // Driver receives 90% of the booking amount (platform takes 10%)
        const net = Math.round(gross * 0.9);
        return {
          id: b.id,
          description: `${b.booking_type.replace(/-/g, ' ')} completed`.replace(/\b\w/g, c => c.toUpperCase()),
          amount: net,
          date: b.completed_at || b.created_at,
          bookingId: b.id.slice(0, 8).toUpperCase(),
          pickupAddress: b.pickup_address,
        };
      });

      setEarnings(rows);
    } catch (err: any) {
      console.error('Error fetching earnings:', err);
      toast.error('Failed to load earnings');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchEarnings(); }, [fetchEarnings]);

  const today = new Date().toDateString();
  const todayEarnings = earnings
    .filter(e => new Date(e.date).toDateString() === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const weekAgo = Date.now() - 7 * 86400000;
  const weeklyRows = earnings.filter(e => new Date(e.date).getTime() >= weekAgo);
  const weeklyEarnings = weeklyRows.reduce((sum, e) => sum + e.amount, 0);
  const totalTrips = weeklyRows.length;
  const weeklyStats = buildWeeklyStats(earnings);

  const handleExport = () => {
    const headers = ['Date', 'Description', 'Booking ID', 'Amount'];
    const rows = earnings.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.description,
      e.bookingId,
      e.amount.toString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    downloadFile(csv, `earnings-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    toast.success('Earnings exported successfully!');
  };

  return (
    <DashboardLayout title="My Earnings" subtitle="Track your earnings and payouts">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Today's Earnings"
          value={`${CURRENCY}${todayEarnings.toLocaleString()}`}
          icon={Wallet}
        />
        <MetricCard
          title="This Week"
          value={`${CURRENCY}${weeklyEarnings.toLocaleString()}`}
          icon={Calendar}
        />
        <MetricCard
          title="Weekly Trips"
          value={totalTrips.toString()}
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg Per Trip"
          value={totalTrips > 0 ? `${CURRENCY}${Math.round(weeklyEarnings / totalTrips).toLocaleString()}` : `${CURRENCY}0`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <EarningsTrendChart />
        </div>

        {/* Weekly Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h3 className="font-semibold text-foreground mb-4">This Week</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyStats.map(day => (
                <div
                  key={day.day}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toast.info(`${day.day}: ${day.trips} trip${day.trips !== 1 ? 's' : ''} completed`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-8">{day.day}</span>
                    <span className="text-xs text-muted-foreground">{day.trips} trip{day.trips !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {day.earnings > 0 ? `${CURRENCY}${day.earnings.toLocaleString()}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border flex justify-between">
            <span className="font-medium text-foreground">Total</span>
            <span className="font-bold text-foreground">{CURRENCY}{weeklyEarnings.toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 bg-card rounded-xl border border-border"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Trips</h3>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={earnings.length === 0}>
            <Download size={14} className="mr-1" /> Export
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : earnings.length === 0 ? (
          <div className="text-center py-12">
            <Wallet size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No earnings yet</h3>
            <p className="text-muted-foreground">Completed trips will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {earnings.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toast.info(`Trip ${tx.bookingId}`, { description: tx.pickupAddress })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <ArrowUpRight size={20} className="text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{tx.bookingId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success">+{CURRENCY}{tx.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-border text-center">
          <Button variant="ghost" className="text-accent" onClick={() => toast.info('Showing all trips above')}>
            <FileText size={14} className="mr-1" /> {earnings.length} trip{earnings.length !== 1 ? 's' : ''} total
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
