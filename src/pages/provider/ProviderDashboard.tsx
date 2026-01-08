import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Car, 
  Users, 
  Wallet, 
  Clock, 
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockProviderMetrics, mockBookings, mockVehicles, mockDrivers } from '@/lib/mock-data';
import { CURRENCY } from '@/lib/constants';

// Mock incoming requests
const incomingRequests = [
  {
    id: 'req1',
    consumer: 'Adaeze Okafor',
    pickup: 'Lekki Phase 1',
    dropoff: 'Victoria Island',
    vehicleType: 'Sedan',
    countdown: 45,
    estimatedPrice: '₦35,000 - ₦45,000',
  },
  {
    id: 'req2',
    consumer: 'Olumide Taiwo',
    pickup: 'Ikeja GRA',
    dropoff: 'Murtala Airport',
    vehicleType: 'SUV',
    countdown: 52,
    estimatedPrice: '₦50,000 - ₦65,000',
  },
];

export default function ProviderDashboard() {
  const metrics = mockProviderMetrics;

  return (
    <DashboardLayout 
      title="Provider Dashboard" 
      subtitle="FleetMaster Nigeria • Welcome back, Emeka"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Today's Bookings"
          value={metrics.todayBookings}
          change="+2 from yesterday"
          changeType="positive"
          icon={Car}
        />
        <MetricCard
          title="Today's Earnings"
          value={`${CURRENCY}${(metrics.todayEarnings / 1000).toFixed(0)}K`}
          change="+15%"
          changeType="positive"
          icon={Wallet}
          iconColor="bg-success/10 text-success"
        />
        <MetricCard
          title="Pending Settlement"
          value={`${CURRENCY}${(metrics.pendingSettlement / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          iconColor="bg-warning/10 text-warning"
        />
        <MetricCard
          title="Acceptance Rate"
          value={`${metrics.acceptanceRate}%`}
          change="+2%"
          changeType="positive"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Incoming Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell size={20} className="text-foreground" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-xs text-white rounded-full flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Incoming Requests</h2>
            </div>
          </div>

          <div className="space-y-4">
            {incomingRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-muted/30 rounded-xl border border-border hover:border-accent/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-foreground">{request.consumer}</h3>
                    <p className="text-sm text-muted-foreground">{request.vehicleType}</p>
                  </div>
                  
                  {/* Countdown Timer */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="2"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="hsl(var(--accent))"
                          strokeWidth="2"
                          strokeDasharray={100}
                          strokeDashoffset={100 - (request.countdown / 60) * 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                        {request.countdown}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span>{request.pickup}</span>
                  <span className="text-muted-foreground/50">→</span>
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  <span>{request.dropoff}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-accent">{request.estimatedPrice}</span>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <XCircle size={16} />
                      Decline
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-success text-white hover:bg-success/90 transition-colors"
                    >
                      <CheckCircle2 size={16} />
                      Accept
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Fleet Status */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Fleet Status</h3>
              <button className="text-sm text-accent hover:underline">View all</button>
            </div>
            
            <div className="space-y-3">
              {mockVehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <img 
                        src={vehicle.images[0]} 
                        alt={vehicle.model}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-xs text-muted-foreground">{vehicle.plateNumber}</p>
                    </div>
                  </div>
                  <StatusBadge status={vehicle.available ? 'available' : 'unavailable'} />
                </div>
              ))}
            </div>
          </div>

          {/* Driver Availability */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Drivers</h3>
              <button className="text-sm text-accent hover:underline">View all</button>
            </div>
            
            <div className="space-y-3">
              {mockDrivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={driver.user.avatar}
                      alt={driver.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{driver.user.name}</p>
                      <p className="text-xs text-muted-foreground">{driver.totalTrips} trips</p>
                    </div>
                  </div>
                  <StatusBadge status={driver.available ? 'available' : 'unavailable'} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Customer</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img 
                        src={booking.consumer?.avatar}
                        alt={booking.consumer?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium text-foreground">{booking.consumer?.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <p className="text-foreground">{booking.pickup.name}</p>
                      <p className="text-muted-foreground">→ {booking.dropoff.name}</p>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-foreground">
                      {booking.vehicle?.make} {booking.vehicle?.model}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-foreground">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="font-medium text-foreground">
                      {booking.finalPrice ? `${CURRENCY}${booking.finalPrice.toLocaleString()}` : '-'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                  <td>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MoreHorizontal size={16} className="text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
