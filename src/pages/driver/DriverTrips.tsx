import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Calendar, Car, TrendingUp, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/hooks/useBookings';
import { useDrivers } from '@/hooks/useDrivers';
import { CURRENCY, BOOKING_TYPE_LABELS } from '@/lib/constants';

export default function DriverTrips() {
  const [filter, setFilter] = useState<string>('all');
  const { driver, isLoading: driverLoading } = useDrivers();
  const { bookings, isLoading: bookingsLoading } = useBookings();
  
  // Filter bookings assigned to this driver
  const driverTrips = bookings
    .filter(b => b.driver_id === driver?.id)
    .map(b => ({
      ...b,
      earnings: b.final_price ? b.final_price * 0.7 : 0, // 70% to driver
    }));

  const completedTrips = driverTrips.filter(t => t.status === 'completed').length;
  const totalEarnings = driverTrips.reduce((sum, t) => sum + t.earnings, 0);
  const todayTrips = driverTrips.filter(t => {
    const today = new Date();
    const tripDate = new Date(t.scheduled_date);
    return tripDate.toDateString() === today.toDateString();
  }).length;

  const filteredTrips = driverTrips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  const isLoading = driverLoading || bookingsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="My Trips" subtitle="View your trip history and earnings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Trips" subtitle="View your trip history and earnings">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Trips"
          value={driverTrips.length.toString()}
          icon={Car}
        />
        <MetricCard
          title="Completed"
          value={completedTrips.toString()}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Today's Trips"
          value={todayTrips.toString()}
          icon={Calendar}
        />
        <MetricCard
          title="Total Earnings"
          value={`${CURRENCY}${totalEarnings.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'in-progress', 'completed', 'cancelled'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'all' ? 'All Trips' : f.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Trips List */}
      <div className="bg-card rounded-xl border border-border">
        <div className="divide-y divide-border">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <Car size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No trips found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "You haven't completed any trips yet" 
                  : `No ${filter} trips found`}
              </p>
            </div>
          ) : (
            filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Car size={24} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {BOOKING_TYPE_LABELS[trip.booking_type] || trip.booking_type.replace('-', ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {trip.vehicle_preference || 'Standard'} vehicle
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <p className="text-sm text-foreground truncate">
                        {trip.pickup_name || trip.pickup_address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <p className="text-sm text-foreground truncate">
                        {trip.dropoff_name || trip.dropoff_address}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <p className="text-lg font-bold text-foreground">
                      {CURRENCY}{trip.earnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Your earnings (70%)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {trip.scheduled_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(trip.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
