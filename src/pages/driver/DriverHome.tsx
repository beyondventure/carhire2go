import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Clock, Phone, CheckCircle2, Loader2, Car } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingMap } from '@/components/map/BookingMap';
import { useBookings } from '@/hooks/useBookings';
import { useDrivers } from '@/hooks/useDrivers';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';

export default function DriverHome() {
  const navigate = useNavigate();
  const { profile } = useSupabaseAuth();
  const { driver, isLoading: driverLoading } = useDrivers();
  const { bookings, isLoading: bookingsLoading, startTrip, completeTrip } = useBookings();

  // Find active trip assigned to this driver
  const activeTrip = bookings.find(b => 
    b.driver_id === driver?.id && 
    ['confirmed', 'in-progress'].includes(b.status)
  );

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    const success = await startTrip(activeTrip.id);
    if (success) {
      toast.success('Trip started!');
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip) return;
    const success = await completeTrip(activeTrip.id);
    if (success) {
      toast.success('Trip completed successfully!');
      navigate('/driver/earnings');
    }
  };

  const handleCall = () => {
    toast.info('Calling customer...');
  };

  const isLoading = driverLoading || bookingsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Driver Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  // Show onboarding message if no driver profile
  if (!driver) {
    return (
      <DashboardLayout title="Driver Dashboard">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Car size={48} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Complete Your Driver Profile</h2>
          <p className="text-muted-foreground mb-6">You need to complete onboarding to access the driver dashboard</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/onboarding/driver')}
            className="btn-primary"
          >
            Complete Onboarding
          </motion.button>
        </div>
      </DashboardLayout>
    );
  }

  // Show pending verification message
  if (driver.verification_status !== 'approved') {
    return (
      <DashboardLayout title="Driver Dashboard">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock size={48} className="text-warning mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Verification Pending</h2>
          <p className="text-muted-foreground mb-2">
            Your driver profile is being reviewed. Status: <span className="font-medium capitalize">{driver.verification_status}</span>
          </p>
          <p className="text-sm text-muted-foreground">You'll be able to accept trips once approved.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Welcome, ${profile?.name?.split(' ')[0] || 'Driver'}`}>
      {activeTrip ? (
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          <BookingMap 
            pickup={{ 
              lat: Number(activeTrip.pickup_lat), 
              lng: Number(activeTrip.pickup_lng), 
              address: activeTrip.pickup_address,
              name: activeTrip.pickup_name || undefined
            }} 
            dropoff={{ 
              lat: Number(activeTrip.dropoff_lat), 
              lng: Number(activeTrip.dropoff_lng), 
              address: activeTrip.dropoff_address,
              name: activeTrip.dropoff_name || undefined
            }} 
            className="h-full min-h-[400px]" 
          />
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-2 text-success mb-4">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <span className="font-medium">
                {activeTrip.status === 'confirmed' ? 'Confirmed Trip' : 'Active Trip'}
              </span>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-success mt-1.5" />
                <div>
                  <p className="font-medium text-foreground">
                    {activeTrip.pickup_name || activeTrip.pickup_address}
                  </p>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive mt-1.5" />
                <div>
                  <p className="font-medium text-foreground">
                    {activeTrip.dropoff_name || activeTrip.dropoff_address}
                  </p>
                  <p className="text-sm text-muted-foreground">Drop-off</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Trip Details</p>
                <p className="font-medium text-foreground capitalize">
                  {activeTrip.booking_type.replace('-', ' ')}
                </p>
                {activeTrip.final_price && (
                  <p className="text-lg font-bold text-foreground mt-1">
                    {CURRENCY}{activeTrip.final_price.toLocaleString()}
                  </p>
                )}
              </div>
              <button 
                onClick={handleCall} 
                className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
              >
                <Phone size={20} />
              </button>
            </div>
            
            {activeTrip.status === 'confirmed' ? (
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={handleStartTrip} 
                className="btn-primary w-full py-4"
              >
                <Navigation size={20} />
                Start Trip
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={handleCompleteTrip} 
                className="btn-primary w-full py-4"
              >
                <CheckCircle2 size={20} />
                Complete Trip
              </motion.button>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Navigation size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Active Trip</h2>
          <p className="text-muted-foreground mb-4">You'll be notified when a new trip is assigned</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${driver.available ? 'bg-success' : 'bg-muted-foreground'}`} />
            <span>{driver.available ? 'You are online' : 'You are offline'}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
