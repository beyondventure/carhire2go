import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Car, Plus, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { useBookings } from '@/hooks/useBookings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { CURRENCY } from '@/lib/constants';

export default function ConsumerHome() {
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth();
  const { bookings, isLoading } = useBookings();
  
  const activeBookings = bookings.filter(b => 
    ['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress'].includes(b.status)
  );

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const recentBookings = bookings.slice(0, 3);

  const userName = profile?.name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout title={`Welcome back, ${userName}`} subtitle="What would you like to do today?">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Book Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-primary to-slate-800 rounded-2xl p-6 text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Book Your Next Ride</h2>
            <p className="text-primary-foreground/70 mb-6 max-w-md">
              Find verified providers, negotiate the best prices, and travel with confidence across Nigeria.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/consumer/book')}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              <Plus size={20} />
              New Booking
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedBookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Trips</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active bookings</span>
            <span className="text-accent font-medium">{activeBookings.length} active</span>
          </div>
        </motion.div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-6 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      )}

      {/* Active Booking */}
      {!isLoading && activeBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Active Booking</h3>
            <button 
              onClick={() => navigate('/consumer/bookings')}
              className="text-sm text-accent hover:underline"
            >
              View all
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {activeBookings.slice(0, 1).map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Car size={24} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground capitalize">
                        {booking.vehicle_preference || 'Any'} Vehicle
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.status === 'pending' || booking.status === 'matching' 
                          ? 'Finding provider...' 
                          : 'Provider assigned'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-success mt-1.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {booking.pickup_name || booking.pickup_address}
                      </p>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                    </div>
                  </div>
                  <div className="ml-1.5 w-0.5 h-6 bg-border" />
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-destructive mt-1.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {booking.dropoff_name || booking.dropoff_address}
                      </p>
                      <p className="text-xs text-muted-foreground">Drop-off</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {booking.scheduled_time}
                    </span>
                    <span>{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                  </div>
                  {booking.final_price && (
                    <p className="font-semibold text-foreground">
                      {CURRENCY}{booking.final_price.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Bookings */}
      {!isLoading && recentBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Bookings</h3>
            <button 
              onClick={() => navigate('/consumer/bookings')}
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="booking-card p-4 cursor-pointer"
                onClick={() => navigate('/consumer/bookings')}
              >
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={booking.status} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-success" />
                  <p className="text-sm text-foreground truncate">
                    {booking.pickup_name || booking.pickup_address}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-destructive" />
                  <p className="text-sm text-foreground truncate">
                    {booking.dropoff_name || booking.dropoff_address}
                  </p>
                </div>

                {booking.final_price && (
                  <p className="text-sm font-semibold text-foreground mt-3">
                    {CURRENCY}{booking.final_price.toLocaleString()}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center py-12 bg-card rounded-2xl border border-border"
        >
          <Car size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-4">Create your first booking to get started</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/consumer/book')}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus size={20} />
            Create Booking
          </motion.button>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
