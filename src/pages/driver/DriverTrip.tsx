import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Phone, MessageSquare, MapPin, Clock, User, Check, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { BookingMap } from '@/components/map/BookingMap';
import { mockBookings } from '@/lib/mock-data';
import { CURRENCY } from '@/lib/constants';

export default function DriverTrip() {
  const [tripStatus, setTripStatus] = useState<'arriving' | 'waiting' | 'in-progress' | 'completed'>('arriving');
  const activeTrip = mockBookings.find(b => b.status === 'in-progress');

  if (!activeTrip) {
    return (
      <DashboardLayout title="Current Trip" subtitle="No active trip">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Navigation size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Active Trip</h2>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any active trips at the moment. New trip requests will appear on your home screen.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusUpdate = (newStatus: typeof tripStatus) => {
    setTripStatus(newStatus);
  };

  return (
    <DashboardLayout title="Current Trip" subtitle={`Trip to ${activeTrip.dropoff.name || activeTrip.dropoff.address}`}>
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Map */}
        <div className="lg:col-span-2">
          <BookingMap
            pickup={activeTrip.pickup}
            dropoff={activeTrip.dropoff}
            showRoute={true}
            className="h-full min-h-[400px]"
          />
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
                tripStatus === 'in-progress' ? 'bg-accent/10 text-accent' :
                tripStatus === 'completed' ? 'bg-success/10 text-success' :
                'bg-warning/10 text-warning'
              }`}>
                {tripStatus === 'arriving' ? 'Arriving to Pickup' :
                 tripStatus === 'waiting' ? 'Waiting for Passenger' :
                 tripStatus === 'in-progress' ? 'Trip in Progress' : 'Completed'}
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
                const currentIndex = steps.indexOf(tripStatus);
                const stepIndex = steps.indexOf(step.key);
                const isCompleted = stepIndex < currentIndex;
                const isCurrent = step.key === tripStatus;

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">Passenger</h3>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={activeTrip.consumer?.avatar}
                alt={activeTrip.consumer?.name}
                className="w-14 h-14 rounded-xl"
              />
              <div>
                <p className="font-semibold text-foreground">{activeTrip.consumer?.name}</p>
                <p className="text-sm text-muted-foreground">{activeTrip.consumer?.phone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Phone size={16} className="mr-2" />
                Call
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageSquare size={16} className="mr-2" />
                Chat
              </Button>
            </div>
          </motion.div>

          {/* Route Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-success mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {activeTrip.pickup.name || activeTrip.pickup.address}
                  </p>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                </div>
              </div>
              <div className="ml-1.5 w-0.5 h-6 bg-border" />
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {activeTrip.dropoff.name || activeTrip.dropoff.address}
                  </p>
                  <p className="text-xs text-muted-foreground">Drop-off</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trip Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            {tripStatus === 'arriving' && (
              <Button 
                className="w-full bg-accent hover:bg-accent/90"
                onClick={() => handleStatusUpdate('waiting')}
              >
                I've Arrived
              </Button>
            )}
            {tripStatus === 'waiting' && (
              <Button 
                className="w-full bg-success hover:bg-success/90"
                onClick={() => handleStatusUpdate('in-progress')}
              >
                Start Trip
              </Button>
            )}
            {tripStatus === 'in-progress' && (
              <Button 
                className="w-full bg-success hover:bg-success/90"
                onClick={() => handleStatusUpdate('completed')}
              >
                Complete Trip
              </Button>
            )}
            {tripStatus === 'completed' && (
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-foreground mb-1">
                  {CURRENCY}{activeTrip.finalPrice?.toLocaleString()}
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
