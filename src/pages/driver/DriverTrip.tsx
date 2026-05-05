import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Phone, MessageSquare, Check, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { BookingMap } from '@/components/map/BookingMap';
import { CURRENCY } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDrivers } from '@/hooks/useDrivers';

// We map DB statuses to our driver UI flow states
type TripState = 'arriving' | 'waiting' | 'in-progress' | 'completed';

export default function DriverTrip() {
  const { driver, isLoading: driverLoading } = useDrivers();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [consumer, setConsumer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripState, setTripState] = useState<TripState>('arriving');

  const fetchActiveTrip = useCallback(async () => {
    if (!driver) {
      setActiveTrip(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', driver.id)
        .in('status', ['matched', 'in-progress']) // "matched" means assigned, "in-progress" means started
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveTrip(data);

      if (data) {
        // Init UI state based on DB status. 
        // We'll treat 'matched' as the phase where the driver is arriving/waiting,
        // and 'in-progress' as the actual ride.
        if (data.status === 'in-progress') {
          setTripState('in-progress');
        } else {
          // If 'matched', we start them at 'arriving'
          // A more complex app would save the 'arriving'/'waiting' sub-state to the DB.
          setTripState('arriving');
        }

        // Fetch consumer details
        const { data: consumerData } = await supabase
          .from('profiles')
          .select('name, phone, avatar_url')
          .eq('id', data.consumer_id)
          .single();
        if (consumerData) {
          setConsumer(consumerData);
        }
      }
    } catch (err) {
      console.error('Error fetching active trip:', err);
    } finally {
      setIsLoading(false);
    }
  }, [driver]);

  useEffect(() => {
    if (!driverLoading) {
      fetchActiveTrip();
    }
  }, [driverLoading, fetchActiveTrip]);

  const updateDbStatus = async (newStatus: string) => {
    if (!activeTrip) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', activeTrip.id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to update DB status:', err);
      toast.error('Failed to save progress');
    }
  };

  const handleStatusUpdate = async (newState: TripState) => {
    // Optimistic UI update
    setTripState(newState);

    if (newState === 'in-progress') {
      await updateDbStatus('in-progress');
      toast.success('Trip started!');
    } else if (newState === 'completed') {
      await updateDbStatus('completed');
      toast.success('Trip completed successfully!');
      // After a short delay, refresh so the trip disappears from active view
      setTimeout(() => fetchActiveTrip(), 2000);
    }
  };

  if (driverLoading || isLoading) {
    return (
      <DashboardLayout title="Current Trip">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!activeTrip) {
    return (
      <DashboardLayout title="Current Trip" subtitle="No active trip">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Navigation size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Active Trip</h2>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any active trips at the moment. When a provider assigns you to a booking, it will appear here.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Current Trip" subtitle={`Trip to ${activeTrip.dropoff_address || 'Destination'}`}>
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="bg-muted w-full h-full min-h-[400px] rounded-xl overflow-hidden flex items-center justify-center">
            <BookingMap
              pickup={{ name: activeTrip.pickup_address, address: activeTrip.pickup_address, coordinates: [6.5244, 3.3792] }}
              dropoff={{ name: activeTrip.dropoff_address, address: activeTrip.dropoff_address, coordinates: [6.5244, 3.3792] }}
              showRoute={true}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-4">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Trip Status</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                tripState === 'in-progress' ? 'bg-accent/10 text-accent' :
                tripState === 'completed' ? 'bg-success/10 text-success' :
                'bg-warning/10 text-warning'
              }`}>
                {tripState === 'arriving' ? 'Arriving to Pickup' :
                 tripState === 'waiting' ? 'Waiting for Passenger' :
                 tripState === 'in-progress' ? 'Trip in Progress' : 'Completed'}
              </span>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {[
                { key: 'arriving', label: 'Arriving to pickup' },
                { key: 'waiting', label: 'Waiting for passenger' },
                { key: 'in-progress', label: 'Trip in progress' },
                { key: 'completed', label: 'Trip completed' },
              ].map((step, index) => {
                const steps = ['arriving', 'waiting', 'in-progress', 'completed'];
                const currentIndex = steps.indexOf(tripState);
                const stepIndex = steps.indexOf(step.key);
                const isCompleted = stepIndex < currentIndex;
                const isCurrent = step.key === tripState;

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-success text-white' :
                      isCurrent ? 'bg-accent text-accent-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check size={16} /> : index + 1}
                    </div>
                    <span className={`text-sm ${isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Passenger Info */}
          {consumer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-semibold text-foreground mb-4">Passenger</h3>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={consumer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeTrip.consumer_id}`}
                  alt={consumer.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{consumer.name}</p>
                  <p className="text-sm text-muted-foreground">{consumer.phone || 'No phone number'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => consumer.phone ? toast.info(`Calling ${consumer.phone}`) : toast.error('No phone number available')}>
                  <Phone size={16} className="mr-2" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.info('In-app chat coming soon')}>
                  <MessageSquare size={16} className="mr-2" />
                  Chat
                </Button>
              </div>
            </motion.div>
          )}

          {/* Route Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-success mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {activeTrip.pickup_address || 'Unknown Pickup'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pickup Location</p>
                </div>
              </div>
              <div className="ml-1.5 w-0.5 h-6 bg-border" />
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {activeTrip.dropoff_address || 'Unknown Drop-off'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Drop-off Location</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trip Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 pt-2"
          >
            {tripState === 'arriving' && (
              <Button 
                className="w-full bg-accent hover:bg-accent/90"
                onClick={() => handleStatusUpdate('waiting')}
              >
                I've Arrived
              </Button>
            )}
            {tripState === 'waiting' && (
              <Button 
                className="w-full bg-success hover:bg-success/90"
                onClick={() => handleStatusUpdate('in-progress')}
              >
                Start Trip
              </Button>
            )}
            {tripState === 'in-progress' && (
              <Button 
                className="w-full bg-success hover:bg-success/90"
                onClick={() => handleStatusUpdate('completed')}
              >
                Complete Trip
              </Button>
            )}
            {tripState === 'completed' && (
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-foreground mb-1">
                  {CURRENCY}{(activeTrip.final_price || activeTrip.negotiated_price || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Trip Completed</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
