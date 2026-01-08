import { motion } from 'framer-motion';
import { TrendingUp, Users, Car, Wallet, Calendar, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { 
  RevenueChart, 
  BookingTypeChart, 
  PlatformGrowthChart, 
  GMVChart,
  FleetUtilizationChart 
} from '@/components/analytics/AnalyticsCharts';
import { CURRENCY } from '@/lib/constants';
import { mockPlatformMetrics } from '@/lib/mock-data';

export default function AdminAnalytics() {
  const metrics = mockPlatformMetrics;

  return (
    <DashboardLayout title="Analytics" subtitle="Platform performance and insights">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="Total GMV"
          value={`${CURRENCY}${(metrics.totalGMV / 1000000).toFixed(0)}M`}
          icon={Wallet}
          trend={{ value: 23, isPositive: true }}
        />
        <MetricCard
          title="Platform Revenue"
          value={`${CURRENCY}${(metrics.platformRevenue / 1000000).toFixed(1)}M`}
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
          title="Active Consumers"
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

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart />
        <GMVChart />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <PlatformGrowthChart />
        <BookingTypeChart />
        <FleetUtilizationChart />
      </div>

      {/* Performance Indicators */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h4 className="text-sm text-muted-foreground mb-2">Avg Response Time</h4>
          <p className="text-3xl font-bold text-foreground">{metrics.avgResponseTime}s</p>
          <p className="text-sm text-success mt-1">↓ 12% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h4 className="text-sm text-muted-foreground mb-2">Acceptance Rate</h4>
          <p className="text-3xl font-bold text-foreground">{metrics.avgAcceptanceRate}%</p>
          <p className="text-sm text-success mt-1">↑ 3% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h4 className="text-sm text-muted-foreground mb-2">Conversion Rate</h4>
          <p className="text-3xl font-bold text-foreground">68%</p>
          <p className="text-sm text-success mt-1">↑ 5% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h4 className="text-sm text-muted-foreground mb-2">Customer Satisfaction</h4>
          <p className="text-3xl font-bold text-foreground">4.7</p>
          <p className="text-sm text-muted-foreground mt-1">Based on 2,340 reviews</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
