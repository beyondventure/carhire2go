import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Car, Users, Truck, Wallet, 
  MapPin, CheckCircle2, AlertTriangle, CreditCard, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { CURRENCY, COMMISSION_RATE } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalProviders: number;
  totalConsumers: number;
  totalPaymentsGross: number;
  totalCommission: number;
  recentBookings: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    activeBookings: 0,
    totalProviders: 0,
    totalConsumers: 0,
    totalPaymentsGross: 0,
    totalCommission: 0,
    recentBookings: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, providersRes, consumersRes, paymentsRes] = await Promise.all([
          supabase.from('bookings').select('id, status, pickup_address, dropoff_address, consumer_id, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
          supabase.from('providers').select('id', { count: 'exact' }),
          supabase.from('user_roles').select('id', { count: 'exact' }).eq('role', 'consumer'),
          supabase.from('payments' as any).select('amount, status').eq('status', 'successful'),
        ]);

        const totalBookings = bookingsRes.count || 0;
        const activeStatuses = ['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress'];
        const activeBookings = (bookingsRes.data || []).filter(b => activeStatuses.includes(b.status)).length;
        const totalPaymentsGross = ((paymentsRes.data as any[]) || []).reduce((sum: number, p: any) => sum + p.amount, 0);

        setStats({
          totalBookings,
          activeBookings,
          totalProviders: providersRes.count || 0,
          totalConsumers: consumersRes.count || 0,
          totalPaymentsGross,
          totalCommission: totalPaymentsGross * COMMISSION_RATE,
          recentBookings: bookingsRes.data || [],
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Platform Overview" subtitle="Admin Console">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Platform Overview" subtitle="Admin Console">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total GMV"
          value={stats.totalPaymentsGross > 1000000
            ? `${CURRENCY}${(stats.totalPaymentsGross / 1000000).toFixed(1)}M`
            : `${CURRENCY}${stats.totalPaymentsGross.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Platform Revenue"
          value={stats.totalCommission > 1000000
            ? `${CURRENCY}${(stats.totalCommission / 1000000).toFixed(1)}M`
            : `${CURRENCY}${stats.totalCommission.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <MetricCard
          title="Active Bookings"
          value={String(stats.activeBookings)}
          icon={Car}
          variant="warning"
        />
        <MetricCard
          title="Total Bookings"
          value={String(stats.totalBookings)}
          icon={CheckCircle2}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Providers" value={String(stats.totalProviders)} icon={Truck} />
        <MetricCard title="Total Consumers" value={String(stats.totalConsumers)} icon={Users} />
        <MetricCard
          title="Platform Fee Rate"
          value="10%"
          icon={CreditCard}
        />
        <MetricCard
          title="Net GMV"
          value={stats.totalPaymentsGross > 1000000
            ? `${CURRENCY}${((stats.totalPaymentsGross - stats.totalCommission) / 1000000).toFixed(1)}M`
            : `${CURRENCY}${(stats.totalPaymentsGross - stats.totalCommission).toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Bookings</h2>
          {stats.recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Car size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <MapPin size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {booking.pickup_address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Platform Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-semibold text-foreground mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Bookings</span>
              <span className="font-medium text-foreground">{stats.totalBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Now</span>
              <span className="font-medium text-warning">{stats.activeBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Consumers</span>
              <span className="font-medium text-foreground">{stats.totalConsumers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Providers</span>
              <span className="font-medium text-foreground">{stats.totalProviders}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Revenue Collected</span>
              <span className="font-medium text-success">{CURRENCY}{stats.totalCommission.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
