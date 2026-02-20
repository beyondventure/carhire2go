import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Car, Plus, TrendingUp, ArrowRight, Loader2, Sparkles, Shield, Star } from 'lucide-react';
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

  const handleActiveBookingClick = () => {
    navigate('/consumer/bookings');
  };

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const recentBookings = bookings.slice(0, 3);

  const userName = profile?.name?.split(' ')[0] || 'there';

  const features = [
    { icon: Shield, label: 'Verified Drivers', color: 'text-success' },
    { icon: Star, label: 'Best Prices', color: 'text-warning' },
    { icon: Sparkles, label: 'Premium Service', color: 'text-accent' },
  ];

  // Pass loading state to layout for proper skeleton
  if (isLoading) {
    return <DashboardLayout isLoading={true} />;
  }

  return (
    <DashboardLayout title={`Welcome back, ${userName}`} subtitle="What would you like to do today?">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
        {/* Quick Book Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-primary via-slate-800 to-slate-900 rounded-2xl p-5 md:p-8 text-primary-foreground relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 bg-secondary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          <div className="absolute top-1/2 right-8 w-20 h-20 bg-accent/10 rounded-full blur-xl hidden md:block" />
          
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/20 flex items-center justify-center backdrop-blur-sm">
                <Car size={24} className="text-accent" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Book Your Next Ride</h2>
                <p className="text-primary-foreground/60 text-sm md:text-base mt-1 max-w-md">
                  Find verified providers and travel with confidence across Nigeria.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 md:gap-4 mb-5 md:mb-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-lg">
                  <feature.icon size={14} className={feature.color} />
                  <span className="text-xs font-medium text-primary-foreground/90">{feature.label}</span>
                </div>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/consumer/book')}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
            >
              <Plus size={18} />
              New Booking
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 md:p-6 border border-border flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
              <TrendingUp size={24} className="text-success" />
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">{completedBookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Trips</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm pt-4 mt-4 border-t border-border">
            <span className="text-muted-foreground">Active bookings</span>
            <span className="text-accent font-semibold">{activeBookings.length} active</span>
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

          <div 
            className="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-accent/40 transition-all group"
            onClick={handleActiveBookingClick}
          >
            {activeBookings.slice(0, 1).map((booking) => (
              <div key={booking.id} className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
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
                    <div className="w-3 h-3 rounded-full bg-success mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {booking.pickup_name || booking.pickup_address}
                      </p>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                    </div>
                  </div>
                  <div className="ml-1.5 w-0.5 h-6 bg-border" />
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {booking.dropoff_name || booking.dropoff_address}
                      </p>
                      <p className="text-xs text-muted-foreground">Drop-off</p>
                    </div>
                  </div>
                </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {booking.scheduled_time}
                      </span>
                      <span>{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(booking.final_price || booking.negotiated_price) && (
                        <p className="font-semibold text-foreground">
                          {CURRENCY}{(booking.final_price || booking.negotiated_price)!.toLocaleString()}
                        </p>
                      )}
                      <span className="text-sm text-accent font-medium group-hover:underline flex items-center gap-1">
                        {['matched', 'negotiating', 'confirmed'].includes(booking.status) ? 'View & Pay →' : 'View details →'}
                      </span>
                    </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <MapPin size={14} className="text-success flex-shrink-0" />
                  <p className="text-sm text-foreground truncate">
                    {booking.pickup_name || booking.pickup_address}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-destructive flex-shrink-0" />
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

      {/* Empty State - Enhanced */}
      {!isLoading && bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="bg-gradient-to-br from-card via-card to-muted/30 rounded-2xl border border-border overflow-hidden">
            <div className="p-6 md:p-10 text-center">
              {/* Animated Car Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6"
              >
                <div className="absolute inset-0 bg-accent/20 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-accent/10 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car size={40} className="text-accent" />
                </div>
              </motion.div>

              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Ready for your first ride?
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm md:text-base">
                Book a verified driver and travel safely across Nigeria. Great prices, reliable service.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-full text-xs font-medium">
                  <Shield size={12} />
                  Verified Drivers
                </div>
                <div className="flex items-center gap-1.5 bg-warning/10 text-warning px-3 py-1.5 rounded-full text-xs font-medium">
                  <Star size={12} />
                  Best Prices
                </div>
                <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-medium">
                  <Sparkles size={12} />
                  24/7 Support
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/consumer/book')}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25 text-base"
              >
                <Plus size={20} />
                Create Your First Booking
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
