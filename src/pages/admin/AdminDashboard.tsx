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
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AdminDashboard() {
  const { isLoading: analyticsLoading, metrics } = useAnalytics();
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const { data } = await supabase
          .from('bookings')
          .select('id, status, pickup_address, dropoff_address, consumer_id, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentBookings(data || []);
      } catch (err) {
        console.error('Error fetching recent bookings:', err);
      } finally {
        setIsBookingsLoading(false);
      }
    };

    fetchRecentBookings();
  }, []);

  const isLoading = analyticsLoading || isBookingsLoading;

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
          value={metrics.totalGMV > 1000000
            ? `${CURRENCY}${(metrics.totalGMV / 1000000).toFixed(1)}M`
            : `${CURRENCY}${metrics.totalGMV.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: metrics.gmvTrend, isPositive: metrics.gmvTrend >= 0 }}
        />
        <MetricCard
          title="Platform Revenue"
          value={metrics.platformRevenue > 1000000
            ? `${CURRENCY}${(metrics.platformRevenue / 1000000).toFixed(1)}M`
            : `${CURRENCY}${metrics.platformRevenue.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: metrics.gmvTrend, isPositive: metrics.gmvTrend >= 0 }}
          variant="success"
        />
        <MetricCard
          title="Active Bookings"
          value={String(metrics.activeBookings)}
          icon={Car}
          variant="warning"
        />
        <MetricCard
          title="Total Bookings"
          value={String(metrics.totalBookings)}
          icon={CheckCircle2}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Providers" value={String(metrics.activeProviders)} icon={Truck} />
        <MetricCard title="Total Consumers" value={String(metrics.activeConsumers)} icon={Users} />
        <MetricCard
          title="Platform Fee Rate"
          value="10%"
          icon={CreditCard}
        />
        <MetricCard
          title="Net GMV"
          value={metrics.totalGMV > 1000000
            ? `${CURRENCY}${((metrics.totalGMV - metrics.platformRevenue) / 1000000).toFixed(1)}M`
            : `${CURRENCY}${(metrics.totalGMV - metrics.platformRevenue).toLocaleString()}`}
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
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Car size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
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
              <span className="font-medium text-foreground">{metrics.totalBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Now</span>
              <span className="font-medium text-warning">{metrics.activeBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Consumers</span>
              <span className="font-medium text-foreground">{metrics.activeConsumers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Providers</span>
              <span className="font-medium text-foreground">{metrics.activeProviders}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Revenue Collected</span>
              <span className="font-medium text-success">{CURRENCY}{metrics.platformRevenue.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
