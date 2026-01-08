import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Calendar, Filter, Car, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { mockBookings } from '@/lib/mock-data';
import { CURRENCY, BOOKING_TYPE_LABELS } from '@/lib/constants';

export default function DriverTrips() {
  const [filter, setFilter] = useState<string>('all');
  
  const driverTrips = mockBookings.map(b => ({
    ...b,
    earnings: b.finalPrice ? b.finalPrice * 0.7 : 0, // 70% to driver
  }));

  const completedTrips = driverTrips.filter(t => t.status === 'completed').length;
  const totalEarnings = driverTrips.reduce((sum, t) => sum + t.earnings, 0);
  const todayTrips = driverTrips.filter(t => {
    const today = new Date();
    const tripDate = new Date(t.scheduledDate);
    return tripDate.toDateString() === today.toDateString();
  }).length;

  const filteredTrips = driverTrips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

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
          {filteredTrips.map((trip, index) => (
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
                      {BOOKING_TYPE_LABELS[trip.bookingType] || trip.bookingType}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {trip.consumer?.name}
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
                      {trip.pickup.name || trip.pickup.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <p className="text-sm text-foreground truncate">
                      {trip.dropoff.name || trip.dropoff.address}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <p className="text-lg font-bold text-foreground">
                    {CURRENCY}{trip.earnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Your earnings</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {trip.scheduledTime}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(trip.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
