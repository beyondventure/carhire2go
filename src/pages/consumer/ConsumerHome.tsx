import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Car, Plus, TrendingUp, ArrowRight, Shield, Star, Sparkles, Wallet, Bell } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { useBookings } from '@/hooks/useBookings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { CURRENCY, PLATFORM_NAME } from '@/lib/constants';
import { storage } from '@/lib/platform';
import logoWhite from '@/assets/logo-white.png';

const SPLASH_SEEN_KEY = 'ir_consumer_splash_seen';

export default function ConsumerHome() {
  const navigate = useNavigate();
  const { profile } = useSupabaseAuth();
  const { bookings, isLoading } = useBookings();
  const [showSplash, setShowSplash] = useState(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return isStandalone && storage.getItem(SPLASH_SEEN_KEY) !== '1';
  });

  useEffect(() => {
    if (!showSplash) return;
    const timer = window.setTimeout(() => {
      storage.setItem(SPLASH_SEEN_KEY, '1');
      setShowSplash(false);
    }, 1250);
    return () => window.clearTimeout(timer);
  }, [showSplash]);

  const activeBookings = useMemo(
    () => bookings.filter((b) => ['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress'].includes(b.status)),
    [bookings]
  );
  const completedBookings = useMemo(() => bookings.filter((b) => b.status === 'completed'), [bookings]);
  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings]);

  const userName = profile?.name?.split(' ')[0] || 'there';

  if (isLoading) {
    return <DashboardLayout isLoading={true} />;
  }

  return (
    <>
      {showSplash && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-foreground flex flex-col items-center justify-center"
        >
          <motion.img
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            src={logoWhite}
            alt={`${PLATFORM_NAME} logo`}
            className="h-10 w-auto"
          />
        </motion.div>
      )}

      <DashboardLayout title={`Welcome back, ${userName}`} subtitle="Book faster and track everything in one place.">
        <div className="space-y-5 md:space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-foreground text-background rounded-3xl p-5 md:p-7 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-background/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-10 w-28 h-28 rounded-full bg-background/10 blur-2xl" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center">
                  <Car size={22} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">Ready for your next ride?</h2>
                  <p className="text-background/75 text-sm md:text-base mt-1 max-w-md">
                    Verified providers, real-time updates, and easy booking across Nigeria.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-background/10 px-3 py-1.5 rounded-full text-xs font-medium">
                  <Shield size={12} /> Verified Drivers
                </span>
                <span className="inline-flex items-center gap-1.5 bg-background/10 px-3 py-1.5 rounded-full text-xs font-medium">
                  <Star size={12} /> Best Prices
                </span>
                <span className="inline-flex items-center gap-1.5 bg-background/10 px-3 py-1.5 rounded-full text-xs font-medium">
                  <Sparkles size={12} /> Premium Service
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => navigate('/consumer/book')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background text-foreground px-5 py-3 font-semibold"
                >
                  <Plus size={18} /> New Booking
                </button>
                <button
                  onClick={() => navigate('/consumer/bookings')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background/10 text-background px-5 py-3 font-semibold border border-background/20"
                >
                  <Bell size={18} /> View Bookings
                </button>
              </div>
            </div>
          </motion.section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedBookings.length}</p>
                  <p className="text-xs text-muted-foreground">Total Trips</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Wallet size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeBookings.length}</p>
                  <p className="text-xs text-muted-foreground">Active Bookings</p>
                </div>
              </div>
            </div>
          </section>

          {activeBookings.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Active booking</h3>
                <button onClick={() => navigate('/consumer/bookings')} className="text-sm text-accent">
                  View all
                </button>
              </div>
              <button
                onClick={() => navigate('/consumer/bookings')}
                className="w-full text-left bg-card rounded-2xl border border-border p-4 hover:border-accent/40 transition-colors"
              >
                {activeBookings.slice(0, 1).map((booking) => (
                  <div key={booking.id} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground capitalize truncate">{booking.vehicle_preference || 'Any'} Vehicle</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.status === 'pending' || booking.status === 'matching' ? 'Finding provider...' : 'Provider assigned'}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-success" />
                        <span className="text-foreground truncate">{booking.pickup_name || booking.pickup_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-destructive" />
                        <span className="text-foreground truncate">{booking.dropoff_name || booking.dropoff_address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                      <span className="text-muted-foreground inline-flex items-center gap-1.5">
                        <Clock size={13} /> {booking.scheduled_time}
                      </span>
                      {(booking.final_price || booking.negotiated_price) ? (
                        <span className="font-semibold text-foreground">
                          {CURRENCY}{(booking.final_price || booking.negotiated_price)!.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-accent font-medium">View details</span>
                      )}
                    </div>
                  </div>
                ))}
              </button>
            </motion.section>
          )}

          {recentBookings.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Recent bookings</h3>
                <button onClick={() => navigate('/consumer/bookings')} className="text-sm text-accent inline-flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentBookings.map((booking, index) => (
                  <motion.button
                    key={booking.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index }}
                    onClick={() => navigate('/consumer/bookings')}
                    className="text-left bg-card rounded-2xl border border-border p-4 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <StatusBadge status={booking.status} />
                      <span className="text-[11px] text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground truncate">{booking.pickup_name || booking.pickup_address}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">to {booking.dropoff_name || booking.dropoff_address}</p>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {bookings.length === 0 && (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Car size={30} className="text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Your first ride starts here</h3>
              <p className="text-muted-foreground mt-1 mb-5 text-sm">Create a booking and get matched with verified providers instantly.</p>
              <button
                onClick={() => navigate('/consumer/book')}
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-semibold"
              >
                <Plus size={18} /> Create First Booking
              </button>
            </motion.section>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
