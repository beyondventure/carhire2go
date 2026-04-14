import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, ArrowRight, Sparkles, ChevronLeft, Check, Navigation } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingMap } from '@/components/map/BookingMap';
import { LocationInput } from '@/components/booking/LocationInput';
import { VehicleTypeSelector } from '@/components/booking/BookingSelectors';
import { MatchingOverlay } from '@/components/booking/MatchingOverlay';
import { NegotiationOverlay } from '@/components/booking/NegotiationOverlay';
import { StatusBadge } from '@/components/ui/status-badge';
import { useBookings } from '@/hooks/useBookings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { CURRENCY, BOOKING_TYPES } from '@/lib/constants';
import type { Location, BookingType, VehicleType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MatchedProvider {
  id: string;
  name: string;
  rating: number;
  distance: string;
  vehicle: string;
  providerId?: string; // DB provider id
}

type BookingStep = 'pickup' | 'type' | 'details' | 'confirm';

// Booking types that require dropoff location
const REQUIRES_DROPOFF: BookingType[] = ['to-and-fro', 'point-to-point'];

export default function ConsumerBooking() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { bookings, createBooking } = useBookings();
  const isMobile = useIsMobile();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('pickup');
  const [pickup, setPickup] = useState<Location | undefined>();
  const [dropoff, setDropoff] = useState<Location | undefined>();
  const [bookingType, setBookingType] = useState<BookingType | undefined>();
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [matchedProvider, setMatchedProvider] = useState<MatchedProvider | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);

  const estimatedPrice = { min: 35000, max: 55000 };
  const basePrice = Math.round((estimatedPrice.min + estimatedPrice.max) / 2);

  // Check if current booking type requires dropoff
  const needsDropoff = bookingType && REQUIRES_DROPOFF.includes(bookingType);

  // Step configurations
  const steps = [
    { id: 'pickup', label: 'Pickup', icon: MapPin },
    { id: 'type', label: 'Service', icon: Navigation },
    { id: 'details', label: 'Details', icon: Calendar },
    { id: 'confirm', label: 'Confirm', icon: Check },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'pickup':
        return !!pickup;
      case 'type':
        if (!bookingType) return false;
        if (needsDropoff && !dropoff) return false;
        return true;
      case 'details':
        return !!date && !!time;
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [currentStep, pickup, bookingType, dropoff, needsDropoff, date, time]);

  const handleNext = () => {
    const stepOrder: BookingStep[] = ['pickup', 'type', 'details', 'confirm'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: BookingStep[] = ['pickup', 'type', 'details', 'confirm'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleBookingTypeSelect = (type: BookingType) => {
    setBookingType(type);
    // Clear dropoff if not needed
    if (!REQUIRES_DROPOFF.includes(type)) {
      setDropoff(undefined);
    }
  };

  const handleSubmit = async () => {
    if (!pickup) {
      toast.error('Please enter pickup location');
      return;
    }
    if (!bookingType) {
      toast.error('Please select a booking type');
      return;
    }
    if (needsDropoff && !dropoff) {
      toast.error('Please enter dropoff location');
      return;
    }
    if (!date || !time) {
      toast.error('Please select date and time');
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    const currentDateTime = new Date();
    currentDateTime.setSeconds(0, 0);

    if (selectedDateTime < currentDateTime) {
      toast.error('Booking date and time cannot be in the past');
      return;
    }

    if (!user) {
      toast.error('Please sign in to create a booking');
      navigate('/login');
      return;
    }

    // For non-dropoff bookings, use pickup as dropoff (same location)
    const finalDropoff = dropoff || pickup;

    // Create the booking in database
    const booking = await createBooking({
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      pickup_address: pickup.address,
      pickup_name: pickup.name || null,
      dropoff_lat: finalDropoff.lat,
      dropoff_lng: finalDropoff.lng,
      dropoff_address: finalDropoff.address,
      dropoff_name: finalDropoff.name || null,
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

  const handleMatchingClose = () => {
    setIsMatching(false);
  };

  const handleMatchingTimeout = () => {
    setIsMatching(false);
    toast.info('Your booking is saved. Providers will be notified.');
    navigate('/consumer/bookings');
  };

  const handleNegotiationClose = () => {
    setIsNegotiating(false);
    setMatchedProvider(null);
  };

  const handleBookingConfirmed = (finalPrice: number) => {
    setIsNegotiating(false);
    setMatchedProvider(null);
    toast.success(`Booking confirmed at ${CURRENCY}${finalPrice.toLocaleString()}!`);
    navigate('/consumer/bookings');
  };

  const activeBookings = bookings.filter(b => 
    ['pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress'].includes(b.status)
  );

  const getBookingTypeInfo = (type: BookingType) => {
    return BOOKING_TYPES.find(t => t.value === type);
  };

  return (
    <DashboardLayout title="Book a Ride" mobileContentClassName="px-2 pt-2 pb-2">
      <div className={cn('gap-4 md:gap-6', isMobile ? 'grid grid-cols-1' : 'grid lg:grid-cols-5 lg:h-[calc(100vh-8rem)]')}>
        {/* Map */}
        <div className={cn(
          isMobile ? 'h-[220px] rounded-2xl overflow-hidden border border-border order-2' : 'lg:col-span-3 h-[280px] md:h-[400px] lg:h-full'
        )}>
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
        <div className={cn('flex flex-col', isMobile ? 'order-1' : 'lg:col-span-2')}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar"
          >
            {/* Header with Steps */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-accent" />
                New Booking
              </h2>
              
              {/* Progress Steps */}
              <div className={cn('flex items-center', isMobile ? 'overflow-x-auto pb-1' : 'justify-between')}>
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = step.id === currentStep;

                  return (
                    <div key={step.id} className={cn('flex items-center', isMobile ? 'min-w-[92px]' : 'flex-1')}>
                      <div className="flex flex-col items-center">
                        <motion.div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                            isCompleted ? 'bg-accent border-accent text-white' :
                            isCurrent ? 'border-accent text-accent bg-accent/10' :
                            'border-muted-foreground/30 text-muted-foreground'
                          )}
                          animate={{ scale: isCurrent ? 1.05 : 1 }}
                        >
                          {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                        </motion.div>
                        <span className={cn('text-xs mt-1 font-medium', isCurrent ? 'text-accent' : 'text-muted-foreground')}>
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={cn('h-0.5 mx-2', isMobile ? 'w-10' : 'flex-1', isCompleted ? 'bg-accent' : 'bg-muted-foreground/20')} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 'pickup' && (
                <motion.div
                  key="pickup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Where should we pick you up?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your pickup location to get started
                    </p>
                    <LocationInput
                      label="Pickup Location"
                      placeholder="Search for a location..."
                      value={pickup}
                      onChange={setPickup}
                      type="pickup"
                    />
                  </div>

                  {pickup && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/5 border border-accent/20 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <MapPin size={16} className="text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{pickup.name || 'Selected Location'}</p>
                          <p className="text-sm text-muted-foreground">{pickup.address}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {currentStep === 'type' && (
                <motion.div
                  key="type"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">What type of service do you need?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the service that best fits your trip
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {BOOKING_TYPES.map((type) => {
                      const isSelected = bookingType === type.value;
                      const requiresDropoff = REQUIRES_DROPOFF.includes(type.value as BookingType);
                      
                      return (
                        <motion.button
                          key={type.value}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleBookingTypeSelect(type.value as BookingType)}
                          className={cn(
                            'relative p-4 rounded-xl border transition-all text-left',
                            isSelected
                              ? 'border-accent bg-accent/5 ring-1 ring-accent'
                              : 'border-border hover:border-accent/30 hover:bg-muted/30'
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center"
                            >
                              <Check size={14} className="text-white" />
                            </motion.div>
                          )}
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              isSelected ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                            )}>
                              <Navigation size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{type.label}</p>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                              {requiresDropoff && (
                                <span className="text-xs text-accent mt-1 inline-block">
                                  Requires destination
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Show dropoff input if needed */}
                  {needsDropoff && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div className="relative pt-4">
                        <div className="absolute left-5 -top-2 w-0.5 h-6 bg-border" />
                      </div>
                      <LocationInput
                        label="Drop-off Location"
                        placeholder="Where are you going?"
                        value={dropoff}
                        onChange={setDropoff}
                        type="dropoff"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}

              {currentStep === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">When do you need the ride?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select your preferred date, time, and vehicle
                    </p>
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

                  {/* Vehicle Type */}
                  <VehicleTypeSelector
                    selected={vehicleType}
                    onChange={setVehicleType}
                  />
                </motion.div>
              )}

              {currentStep === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Review your booking</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Make sure everything looks correct before finding a provider
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Pickup */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-success mt-1.5" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium">Pickup</p>
                          <p className="font-medium text-foreground">{pickup?.name || pickup?.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dropoff (if applicable) */}
                    {needsDropoff && dropoff && (
                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-destructive mt-1.5" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-medium">Drop-off</p>
                            <p className="font-medium text-foreground">{dropoff?.name || dropoff?.address}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Type */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium">Service Type</p>
                          <p className="font-medium text-foreground">{getBookingTypeInfo(bookingType!)?.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Vehicle</p>
                          <p className="font-medium text-foreground capitalize">{vehicleType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium">Date</p>
                          <p className="font-medium text-foreground">
                            {date ? new Date(date).toLocaleDateString('en-NG', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            }) : '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Time</p>
                          <p className="font-medium text-foreground">{time || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price Estimate */}
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Price</span>
                        <span className="text-lg font-bold text-foreground">
                          {CURRENCY}{estimatedPrice.min.toLocaleString()} - {CURRENCY}{estimatedPrice.max.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Final price will be negotiated with the provider
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-6 flex gap-3">
              {currentStep !== 'pickup' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Back
                </motion.button>
              )}
              
              {currentStep !== 'confirm' ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight size={18} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="flex-1 btn-primary py-3"
                >
                  Find Provider
                  <ArrowRight size={18} />
                </motion.button>
              )}
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
        onClose={handleMatchingClose}
        onMatched={handleMatched}
        onTimeout={handleMatchingTimeout}
      />

      {/* Negotiation Overlay */}
      <NegotiationOverlay
        isVisible={isNegotiating}
        provider={matchedProvider}
        basePrice={basePrice}
        bookingId={currentBookingId}
        providerId={matchedProvider?.providerId || null}
        onClose={handleNegotiationClose}
        onConfirm={handleBookingConfirmed}
      />
    </DashboardLayout>
  );
}
