import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Car, 
  Users, 
  Wallet, 
  Clock, 
  Bell,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useBookings } from '@/hooks/useBookings';
import { useProviders } from '@/hooks/useProviders';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth();
  const { provider, isLoading: providerLoading } = useProviders();
  const { bookings, isLoading: bookingsLoading, acceptBooking } = useBookings();
  const { vehicles } = useVehicles();
  const { allDrivers } = useDrivers();
  
  const [pendingRequests, setPendingRequests] = useState<BookingRow[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // Fetch pending bookings available for matching
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!provider || provider.verification_status !== 'approved') {
        setPendingRequests([]);
        setRequestsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .in('status', ['pending', 'matching'])
          .is('provider_id', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setPendingRequests(data || []);
      } catch (err) {
        console.error('Error fetching pending requests:', err);
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchPendingRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('provider-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          // Listen for any booking changes - we'll filter in the handler
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [provider]);

  const handleAcceptRequest = async (booking: BookingRow) => {
    if (!provider) return;
    
    const success = await acceptBooking(booking.id, provider.id);
    if (success) {
      setPendingRequests(prev => prev.filter(r => r.id !== booking.id));
      navigate('/provider/requests');
    }
  };

  const handleDeclineRequest = (bookingId: string) => {
    toast.info('Request declined');
    setPendingRequests(prev => prev.filter(r => r.id !== bookingId));
  };

  // Calculate metrics
  const providerBookings = bookings.filter(b => b.provider_id === provider?.id);
  const todayBookings = providerBookings.filter(b => {
    const today = new Date().toDateString();
    return new Date(b.scheduled_date).toDateString() === today;
  });
  const completedBookings = providerBookings.filter(b => b.status === 'completed');
  const todayEarnings = todayBookings.reduce((sum, b) => sum + (b.final_price || 0), 0);
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.final_price || 0), 0);
  const myDrivers = allDrivers.filter(d => d.provider_id === provider?.id);

  const isLoading = providerLoading || bookingsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Provider Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  // Show onboarding message if no provider profile
  if (!provider) {
    return (
      <DashboardLayout title="Provider Dashboard">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={48} className="text-warning mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Complete Your Provider Profile</h2>
          <p className="text-muted-foreground mb-6">You need to complete onboarding to access the provider dashboard</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/onboarding/provider')}
            className="btn-primary"
          >
            Complete Onboarding
          </motion.button>
        </div>
      </DashboardLayout>
    );
  }

  // Show pending verification message
  if (provider.verification_status !== 'approved') {
    return (
      <DashboardLayout title="Provider Dashboard" subtitle={provider.business_name || 'Welcome'}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock size={48} className="text-warning mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Verification Pending</h2>
          <p className="text-muted-foreground mb-2">
            Your provider profile is being reviewed. Status: <span className="font-medium capitalize">{provider.verification_status}</span>
          </p>
          <p className="text-sm text-muted-foreground">You'll be able to accept bookings once approved.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Provider Dashboard" 
      subtitle={`${provider.business_name || 'Provider'} • Welcome back, ${profile?.name?.split(' ')[0] || 'there'}`}
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Today's Bookings"
          value={todayBookings.length.toString()}
          icon={Car}
        />
        <MetricCard
          title="Today's Earnings"
          value={`${CURRENCY}${todayEarnings.toLocaleString()}`}
          icon={Wallet}
          iconColor="bg-success/10 text-success"
        />
        <MetricCard
          title="Total Earnings"
          value={`${CURRENCY}${totalEarnings.toLocaleString()}`}
          icon={TrendingUp}
          iconColor="bg-warning/10 text-warning"
        />
        <MetricCard
          title="Acceptance Rate"
          value={`${provider.acceptance_rate || 0}%`}
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
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-xs text-white rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground">Incoming Requests</h2>
            </div>
            <button 
              onClick={() => navigate('/provider/requests')}
              className="text-sm text-accent hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            {requestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending requests
              </div>
            ) : (
              pendingRequests.slice(0, 3).map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-muted/30 rounded-xl border border-border hover:border-accent/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground capitalize">
                        {request.booking_type.replace('-', ' ')} Booking
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {request.vehicle_preference || 'Any'} vehicle
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span className="truncate">{request.pickup_name || request.pickup_address}</span>
                    <span className="text-muted-foreground/50">→</span>
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="truncate">{request.dropoff_name || request.dropoff_address}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-accent">
                      {request.estimated_min_price && request.estimated_max_price
                        ? `${CURRENCY}${request.estimated_min_price.toLocaleString()} - ${CURRENCY}${request.estimated_max_price.toLocaleString()}`
                        : 'Price TBD'}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <XCircle size={16} />
                        Decline
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptRequest(request)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-success text-white hover:bg-success/90 transition-colors"
                      >
                        <CheckCircle2 size={16} />
                        Accept
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
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
              <button 
                onClick={() => navigate('/provider/fleet')}
                className="text-sm text-accent hover:underline"
              >
                View all
              </button>
            </div>
            
            <div className="space-y-3">
              {vehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No vehicles added yet</p>
              ) : (
                vehicles.slice(0, 3).map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Car size={18} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-xs text-muted-foreground">{vehicle.plate_number}</p>
                      </div>
                    </div>
                    <StatusBadge status={vehicle.available ? 'available' : 'unavailable'} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Driver Availability */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Drivers</h3>
              <button 
                onClick={() => navigate('/provider/drivers')}
                className="text-sm text-accent hover:underline"
              >
                View all
              </button>
            </div>
            
            <div className="space-y-3">
              {myDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No drivers added yet</p>
              ) : (
                myDrivers.slice(0, 3).map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Users size={18} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Driver</p>
                        <p className="text-xs text-muted-foreground">{driver.total_trips || 0} trips</p>
                      </div>
                    </div>
                    <StatusBadge status={driver.available ? 'available' : 'unavailable'} />
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      {providerBookings.length > 0 && (
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
                  <th>Route</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {providerBookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="text-sm">
                        <p className="text-foreground truncate max-w-[200px]">
                          {booking.pickup_name || booking.pickup_address}
                        </p>
                        <p className="text-muted-foreground truncate max-w-[200px]">
                          → {booking.dropoff_name || booking.dropoff_address}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-foreground capitalize">
                        {booking.booking_type.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-foreground">
                        {new Date(booking.scheduled_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-foreground">
                        {booking.final_price ? `${CURRENCY}${booking.final_price.toLocaleString()}` : '-'}
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
      )}
    </DashboardLayout>
  );
}
