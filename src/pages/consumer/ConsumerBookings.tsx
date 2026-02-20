import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Car, MessageSquare, Search, Loader2, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChatDialog } from '@/components/booking/ChatDialog';
import { PaymentButton } from '@/components/payment/PaymentButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBookings } from '@/hooks/useBookings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { usePayments } from '@/hooks/usePayments';
import { supabase } from '@/integrations/supabase/client';
import { CURRENCY, BOOKING_STATUS_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];
type ProviderRow = Database['public']['Tables']['providers']['Row'];

interface BookingWithProvider extends BookingRow {
  provider?: ProviderRow | null;
}

export default function ConsumerBookings() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { bookings, isLoading, cancelBooking, refetch } = useBookings();
  const { payments, refetch: refetchPayments } = usePayments();

  const [selectedBooking, setSelectedBooking] = useState<BookingWithProvider | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingsWithProviders, setBookingsWithProviders] = useState<BookingWithProvider[]>([]);

  // Fetch provider info for bookings
  useEffect(() => {
    const fetchProviderInfo = async () => {
      if (bookings.length === 0) {
        setBookingsWithProviders([]);
        return;
      }
      const providerIds = [...new Set(bookings.filter(b => b.provider_id).map(b => b.provider_id!))];
      if (providerIds.length === 0) {
        setBookingsWithProviders(bookings.map(b => ({ ...b, provider: null })));
        return;
      }
      const { data: providers } = await supabase
        .from('providers')
        .select('*')
        .in('id', providerIds);
      const providerMap = new Map(providers?.map(p => [p.id, p]) || []);
      setBookingsWithProviders(bookings.map(b => ({
        ...b,
        provider: b.provider_id ? providerMap.get(b.provider_id) || null : null,
      })));
    };
    fetchProviderInfo();
  }, [bookings]);

  // Check if a booking already has a successful payment
  const isBookingPaid = (bookingId: string) => {
    return payments.some(p => p.booking_id === bookingId && p.status === 'successful');
  };

  const filteredBookings = bookingsWithProviders.filter((booking) => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.pickup_address.toLowerCase().includes(query) ||
        booking.dropoff_address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleCancelBooking = async (bookingId: string) => {
    await cancelBooking(bookingId);
  };

  const handleOpenChat = (booking: BookingWithProvider) => {
    setSelectedBooking(booking);
    setShowChat(true);
  };

  const handlePaymentSuccess = async (txRef: string) => {
    toast.success('Payment confirmed! Your booking is now active.');
    await refetch();
    await refetchPayments();
  };

  const handlePriceAccepted = async (price: number, bookingId: string) => {
    // Update the local state immediately
    setBookingsWithProviders(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, negotiated_price: price } : b
      )
    );
    toast.success(`Price agreed at ${CURRENCY}${price.toLocaleString()}! Tap "Pay Now" to confirm.`);
    await refetch();
  };

  const statusFilters = ['all', 'pending', 'matching', 'matched', 'negotiating', 'confirmed', 'in-progress', 'completed'];

  if (isLoading) {
    return (
      <DashboardLayout title="My Bookings" subtitle="View and manage all your bookings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Bookings" subtitle="View and manage all your bookings">
      <div className="flex flex-col gap-4 h-full">
        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by pickup or drop-off..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status === 'all' ? 'All' : BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] || status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="flex-1 space-y-3 overflow-y-auto pb-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Car size={36} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {statusFilter === 'all'
                  ? "You haven't made any bookings yet"
                  : `No ${statusFilter} bookings`}
              </p>
              {statusFilter === 'all' && (
                <Button onClick={() => navigate('/consumer/book')} size="sm">
                  Book Your First Ride
                </Button>
              )}
            </div>
          ) : (
            filteredBookings.map((booking, index) => {
              const paid = isBookingPaid(booking.id);
              const agreedPrice = booking.final_price || booking.negotiated_price;
              const needsPayment = !paid && agreedPrice &&
                ['matched', 'negotiating', 'confirmed'].includes(booking.status);

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`bg-card rounded-xl border p-4 transition-all ${
                    selectedBooking?.id === booking.id
                      ? 'ring-2 ring-accent border-accent'
                      : 'border-border hover:border-accent/30'
                  }`}
                  onClick={() => setSelectedBooking(booking)}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Car size={20} className="text-accent" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground capitalize text-sm truncate">
                          {booking.vehicle_preference || 'Any'} vehicle
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.provider
                            ? booking.provider.business_name || 'Provider assigned'
                            : booking.status === 'pending' || booking.status === 'matching'
                            ? 'Finding provider...'
                            : 'Provider assigned'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Route */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
                      <p className="text-xs text-foreground truncate">
                        {booking.pickup_name || booking.pickup_address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                      <p className="text-xs text-foreground truncate">
                        {booking.dropoff_name || booking.dropoff_address}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                      <Clock size={12} />
                      <span>{booking.scheduled_time}</span>
                      <span>·</span>
                      <span>{new Date(booking.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Already paid badge */}
                      {paid && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                          <CheckCircle2 size={12} />
                          Paid
                        </span>
                      )}

                      {/* Chat/Negotiate button */}
                      {!paid && (booking.status === 'negotiating' || booking.status === 'matched') && booking.provider_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenChat(booking)}
                          className="h-8 px-2.5 text-xs"
                        >
                          <MessageSquare size={13} className="mr-1" />
                          {booking.provider?.allows_negotiation ? 'Negotiate' : 'Chat'}
                        </Button>
                      )}

                      {/* Pay Now button */}
                      {needsPayment && (
                        <div className="flex-shrink-0">
                          <PaymentButton
                            bookingId={booking.id}
                            providerId={booking.provider_id}
                            amount={agreedPrice!}
                            onSuccess={handlePaymentSuccess}
                            size="sm"
                            className="h-8 px-3 text-xs bg-success hover:bg-success/90 text-white"
                          />
                        </div>
                      )}

                      {/* Cancel button */}
                      {(booking.status === 'pending' || booking.status === 'matching') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      )}

                      {/* Price display */}
                      {!needsPayment && !paid && agreedPrice && !['matched', 'negotiating', 'confirmed'].includes(booking.status) && (
                        <p className="font-semibold text-foreground text-sm">
                          {CURRENCY}{agreedPrice.toLocaleString()}
                        </p>
                      )}
                      {!agreedPrice && booking.estimated_max_price && (
                        <p className="text-xs text-muted-foreground">
                          est. {CURRENCY}{booking.estimated_min_price?.toLocaleString()}–{CURRENCY}{booking.estimated_max_price?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Dialog */}
      {selectedBooking && user && (
        <ChatDialog
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          bookingId={selectedBooking.id}
          userRole="consumer"
          isNegotiating={['matching', 'matched', 'negotiating'].includes(selectedBooking.status)}
          allowsNegotiation={selectedBooking.provider?.allows_negotiation ?? true}
          estimatedMinPrice={selectedBooking.estimated_min_price || undefined}
          estimatedMaxPrice={selectedBooking.estimated_max_price || undefined}
          onPriceAccepted={(price) => handlePriceAccepted(price, selectedBooking.id)}
        />
      )}
    </DashboardLayout>
  );
}
