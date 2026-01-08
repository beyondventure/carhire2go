import { motion } from 'framer-motion';
import { 
  TrendingUp, Car, Users, Truck, Wallet, BarChart3, 
  MapPin, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockPlatformMetrics, mockBookings } from '@/lib/mock-data';
import { CURRENCY } from '@/lib/constants';

export default function AdminDashboard() {
  const metrics = mockPlatformMetrics;

  return (
    <DashboardLayout title="Platform Overview" subtitle="Admin Console">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total GMV" value={`${CURRENCY}${(metrics.totalGMV / 1000000).toFixed(1)}M`} change="+12.5%" changeType="positive" icon={TrendingUp} />
        <MetricCard title="Platform Revenue" value={`${CURRENCY}${(metrics.platformRevenue / 1000000).toFixed(1)}M`} change="+8.2%" changeType="positive" icon={Wallet} iconColor="bg-success/10 text-success" />
        <MetricCard title="Active Bookings" value={metrics.activeBookings} icon={Car} iconColor="bg-warning/10 text-warning" />
        <MetricCard title="Active Providers" value={metrics.activeProviders} icon={Truck} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Bookings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Live Bookings</h2>
          <div className="space-y-3">
            {mockBookings.slice(0, 4).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPin size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{booking.consumer?.name}</p>
                    <p className="text-xs text-muted-foreground">{booking.pickup.name} → {booking.dropoff.name}</p>
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Platform Health */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Avg Response Time</span><span className="font-medium text-foreground">{metrics.avgResponseTime}s</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Acceptance Rate</span><span className="font-medium text-success">{metrics.avgAcceptanceRate}%</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total Consumers</span><span className="font-medium text-foreground">{metrics.totalConsumers.toLocaleString()}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total Providers</span><span className="font-medium text-foreground">{metrics.totalProviders}</span></div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
