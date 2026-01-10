import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingMap } from '@/components/map/BookingMap';
import { LocationInput } from '@/components/booking/LocationInput';
import { BookingTypeSelector, VehicleTypeSelector } from '@/components/booking/BookingSelectors';
import { MatchingOverlay } from '@/components/booking/MatchingOverlay';
import { NegotiationOverlay } from '@/components/booking/NegotiationOverlay';
import { StatusBadge } from '@/components/ui/status-badge';
import { useBookings } from '@/hooks/useBookings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { CURRENCY } from '@/lib/constants';
import type { Location, BookingType, VehicleType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MatchedProvider {
  id: string;
  name: string;
  rating: number;
  distance: string;
  vehicle: string;
}

export default function ConsumerBooking() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { bookings, createBooking } = useBookings();
  
  const [pickup, setPickup] = useState<Location | undefined>();
  const [dropoff, setDropoff] = useState<Location | undefined>();
  const [bookingType, setBookingType] = useState<BookingType>('full-day');
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [matchedProvider, setMatchedProvider] = useState<MatchedProvider | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);

  const estimatedPrice = { min: 35000, max: 55000 };
  const basePrice = Math.round((estimatedPrice.min + estimatedPrice.max) / 2);

  const handleSubmit = async () => {
    if (!pickup || !dropoff) {
      toast.error('Please enter pickup and dropoff locations');
      return;
    }
    if (!date || !time) {
      toast.error('Please select date and time');
      return;
    }
    if (!user) {
      toast.error('Please sign in to create a booking');
      navigate('/login');
      return;
    }

    // Create the booking in database
    const booking = await createBooking({
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      pickup_address: pickup.address,
      pickup_name: pickup.name || null,
      dropoff_lat: dropoff.lat,
      dropoff_lng: dropoff.lng,
      dropoff_address: dropoff.address,
      dropoff_name: dropoff.name || null,
      booking_type: bookingType,
      vehicle_preference: vehicleType,
      scheduled_date: date,
      scheduled_time: time,
      estimated_min_price: estimatedPrice.min,
      estimated_max_price: estimatedPrice.max,
      status: 'matching',
      matching_started_at: new Date().toISOString(),
    });

    if (booking) {
      setCurrentBookingId(booking.id);
      setIsMatching(true);
    }
  };

  const handleMatched = (provider: MatchedProvider) => {
    setIsMatching(false);
    setMatchedProvider(provider);
    setIsNegotiating(true);
  };

  const handleNegotiationClose = () => {
    setIsNegotiating(false);
    setMatchedProvider(null);
  };

  const handleBookingConfirmed = (finalPrice: number) => {
    setIsNegotiating(false);
    toast.success(`Booking confirmed at ${CURRENCY}${finalPrice.toLocaleString()}!`);
    navigate('/consumer/bookings');
  };

  const activeBookings = bookings.filter(b => 
    ['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress'].includes(b.status)
  );

  return (
    <DashboardLayout title="Book a Ride">
      <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-8rem)]">
        {/* Map */}
        <div className="lg:col-span-3 h-full min-h-[400px]">
          <BookingMap
            pickup={pickup}
            dropoff={dropoff}
            providerLocations={[
              { id: 'p1', lat: 6.4541, lng: 3.4047, available: true },
              { id: 'p2', lat: 6.4381, lng: 3.4119, available: true },
              { id: 'p3', lat: 6.4441, lng: 3.3847, available: false },
            ]}
            className="h-full"
          />
        </div>

        {/* Booking Panel */}
        <div className="lg:col-span-2 flex flex-col">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border p-6 flex-1 overflow-y-auto custom-scrollbar"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-accent" />
              New Booking
            </h2>

            <div className="space-y-6">
              {/* Location Inputs */}
              <div className="space-y-4">
                <LocationInput
                  label="Pickup Location"
                  placeholder="Where should we pick you up?"
                  value={pickup}
                  onChange={setPickup}
                  type="pickup"
                />
                
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border -translate-y-4 h-8" />
                </div>

                <LocationInput
                  label="Drop-off Location"
                  placeholder="Where are you going?"
                  value={dropoff}
                  onChange={setDropoff}
                  type="dropoff"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Time
                  </label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Type */}
              <BookingTypeSelector
                selected={bookingType}
                onChange={setBookingType}
              />

              {/* Vehicle Type */}
              <VehicleTypeSelector
                selected={vehicleType}
                onChange={setVehicleType}
              />

              {/* Price Estimate */}
              {pickup && dropoff && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-muted/50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Price</span>
                    <span className="text-lg font-bold text-foreground">
                      {CURRENCY}{estimatedPrice.min.toLocaleString()} - {CURRENCY}{estimatedPrice.max.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Final price will be negotiated with the provider
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!pickup || !dropoff}
                className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Find Provider
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>

          {/* Active Bookings Preview */}
          {activeBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 bg-card rounded-xl border border-border p-4"
            >
              <h3 className="text-sm font-medium text-foreground mb-3">Active Bookings</h3>
              <div className="space-y-2">
                {activeBookings.slice(0, 2).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate('/consumer/bookings')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <MapPin size={18} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                          {booking.dropoff_name || booking.dropoff_address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.scheduled_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Matching Overlay */}
      <MatchingOverlay
        isVisible={isMatching}
        onClose={() => setIsMatching(false)}
        onMatched={handleMatched}
      />

      {/* Negotiation Overlay */}
      <NegotiationOverlay
        isVisible={isNegotiating}
        provider={matchedProvider}
        basePrice={basePrice}
        onClose={handleNegotiationClose}
        onConfirm={handleBookingConfirmed}
      />
    </DashboardLayout>
  );
}
