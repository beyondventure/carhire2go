import { motion } from 'framer-motion';
import { TrendingUp, Users, Car, Wallet, Calendar, MapPin, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import {
  RevenueChart,
  BookingTypeChart,
  PlatformGrowthChart,
  GMVChart,
  FleetUtilizationChart,
} from '@/components/analytics/AnalyticsCharts';
import { CURRENCY } from '@/lib/constants';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AdminAnalytics() {
  const { isLoading, metrics, revenueData, bookingTypeData, growthData, gmvData } = useAnalytics();

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Platform performance and insights">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics" subtitle="Platform performance and insights">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="Total GMV"
          value={metrics.totalGMV > 1000000
            ? `${CURRENCY}${(metrics.totalGMV / 1000000).toFixed(1)}M`
            : `${CURRENCY}${metrics.totalGMV.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 23, isPositive: true }}
        />
        <MetricCard
          title="Platform Revenue"
          value={metrics.platformRevenue > 1000000
            ? `${CURRENCY}${(metrics.platformRevenue / 1000000).toFixed(1)}M`
            : `${CURRENCY}${metrics.platformRevenue.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 18, isPositive: true }}
        />
        <MetricCard
          title="Total Bookings"
          value={metrics.totalBookings.toLocaleString()}
          icon={Calendar}
          trend={{ value: 15, isPositive: true }}
        />
        <MetricCard
          title="Active Bookings"
          value={metrics.activeBookings.toString()}
          icon={Car}
          variant="success"
        />
        <MetricCard
          title="Consumers"
          value={metrics.activeConsumers.toLocaleString()}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Active Providers"
          value={metrics.activeProviders.toString()}
          icon={MapPin}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart data={revenueData} />
        <GMVChart data={gmvData} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <PlatformGrowthChart data={growthData} />
        <BookingTypeChart data={bookingTypeData} />
        <FleetUtilizationChart />
      </div>

      {/* Performance Indicators */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: metrics.totalBookings.toString(), note: 'All time' },
          { label: 'Active Now', value: metrics.activeBookings.toString(), note: 'In progress' },
          { label: 'Total Consumers', value: metrics.activeConsumers.toString(), note: 'Registered' },
          { label: 'Verified Providers', value: metrics.activeProviders.toString(), note: 'Approved' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h4 className="text-sm text-muted-foreground mb-2">{item.label}</h4>
            <p className="text-3xl font-bold text-foreground">{item.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.note}</p>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
