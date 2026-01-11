import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Car, MessageSquare, Search, Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChatDialog } from '@/components/booking/ChatDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBookings } from '@/hooks/useBookings';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
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
  const { bookings, isLoading, cancelBooking } = useBookings();
  
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

  const handlePriceAccepted = (price: number) => {
    toast.success(`Price agreed at ${CURRENCY}${price.toLocaleString()}!`);
  };

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
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Bookings List */}
        <div className={`flex-1 flex flex-col ${showChat ? 'lg:w-1/2' : 'w-full'}`}>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All' : BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS]}
                </Button>
              ))}
            </div>
          </div>

          {/* Bookings */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Car size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {statusFilter === 'all' 
                    ? "You haven't made any bookings yet" 
                    : `No ${statusFilter} bookings found`}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`booking-card p-5 cursor-pointer ${
                    selectedBooking?.id === booking.id ? 'ring-2 ring-accent' : ''
                  }`}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                        <Car size={24} className="text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground capitalize">
                          {booking.vehicle_preference || 'Any'} vehicle
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {booking.provider ? (
                            booking.provider.allows_negotiation ? (
                              <span className="flex items-center gap-1 text-success">
                                <DollarSign size={12} />
                                Negotiable
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <AlertCircle size={12} />
                                Fixed price
                              </span>
                            )
                          ) : booking.status === 'pending' ? (
                            'Finding provider...'
                          ) : (
                            'Provider assigned'
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <p className="text-sm text-foreground truncate">
                        {booking.pickup_name || booking.pickup_address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <p className="text-sm text-foreground truncate">
                        {booking.dropoff_name || booking.dropoff_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {booking.scheduled_time}
                      </span>
                      <span>{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(booking.status === 'negotiating' || booking.status === 'matched') && booking.provider_id && (
                        <Button
                          size="sm"
                          variant={booking.provider?.allows_negotiation ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChat(booking);
                          }}
                          className={booking.provider?.allows_negotiation ? 'bg-accent' : ''}
                        >
                          <MessageSquare size={16} className="mr-1" />
                          {booking.provider?.allows_negotiation ? 'Negotiate' : 'Chat'}
                        </Button>
                      )}
                      {booking.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelBooking(booking.id);
                          }}
                          className="text-destructive"
                        >
                          Cancel
                        </Button>
                      )}
                      {booking.final_price && (
                        <p className="font-semibold text-foreground">
                          {CURRENCY}{booking.final_price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
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
            isNegotiating={selectedBooking.status === 'negotiating' || selectedBooking.status === 'matched'}
            allowsNegotiation={selectedBooking.provider?.allows_negotiation ?? true}
            onPriceAccepted={handlePriceAccepted}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
