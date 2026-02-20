import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Check, X, MessageSquare, Loader2, Car } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChatDialog } from '@/components/booking/ChatDialog';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/hooks/useBookings';
import { useProviders } from '@/hooks/useProviders';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { CURRENCY, BOOKING_TYPE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

export default function ProviderRequests() {
  const { user } = useSupabaseAuth();
  const { provider, isLoading: providerLoading } = useProviders();
  const { bookings, acceptBooking, confirmBooking } = useBookings();
  
  const [pendingRequests, setPendingRequests] = useState<BookingRow[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BookingRow | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Get pending requests (unassigned bookings)
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
          .order('created_at', { ascending: false });

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
      .channel('provider-requests-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
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

  // Get my assigned bookings (matched, negotiating, confirmed)
  const myAssignedBookings = bookings.filter(b => 
    b.provider_id === provider?.id && 
    ['matched', 'negotiating', 'confirmed'].includes(b.status)
  );

  const allRequests = [...pendingRequests, ...myAssignedBookings];

  const handleAcceptRequest = async (booking: BookingRow) => {
    if (!provider) return;
    
    const success = await acceptBooking(booking.id, provider.id);
    if (success) {
      setPendingRequests(prev => prev.filter(r => r.id !== booking.id));
      toast.success('Request accepted! You can now negotiate the price.');
    }
  };

  const handleDeclineRequest = (bookingId: string) => {
    toast.info('Request declined');
    setPendingRequests(prev => prev.filter(r => r.id !== bookingId));
  };

  const handleConfirmBooking = async (bookingId: string, price: number) => {
    const success = await confirmBooking(bookingId, price);
    if (success) {
      toast.success('Booking confirmed!');
    }
  };

  const handleOpenChat = (request: BookingRow) => {
    setSelectedRequest(request);
    setShowChat(true);
  };

  const handlePriceAccepted = (price: number) => {
    if (selectedRequest) {
      handleConfirmBooking(selectedRequest.id, price);
    }
  };

  const isLoading = providerLoading || requestsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Booking Requests" subtitle="Manage incoming booking requests">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Booking Requests" subtitle="Manage incoming booking requests">
      <div className="flex flex-col gap-4">
        {/* Requests List */}
        <div className="w-full">
          <div className="space-y-4">
            <AnimatePresence>
              {allRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Clock size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No pending requests</h3>
                  <p className="text-muted-foreground">New booking requests will appear here</p>
                </div>
              ) : (
                allRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-card rounded-xl border ${
                      request.status === 'pending' ? 'border-warning/50' : 'border-border'
                    } overflow-hidden`}
                  >
                    {/* Countdown Bar for pending */}
                    {request.status === 'pending' && (
                      <div className="h-1 bg-warning/20">
                        <motion.div
                          className="h-full bg-warning"
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: 60, ease: 'linear' }}
                        />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Car size={24} className="text-accent" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground capitalize">
                              {BOOKING_TYPE_LABELS[request.booking_type] || request.booking_type.replace('-', ' ')}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="capitalize">{request.vehicle_preference || 'Any'} vehicle</span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-success mt-2" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {request.pickup_name || request.pickup_address}
                              </p>
                              <p className="text-xs text-muted-foreground">Pickup</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {request.dropoff_name || request.dropoff_address}
                              </p>
                              <p className="text-xs text-muted-foreground">Drop-off</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock size={14} />
                              <span>{request.scheduled_time}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {new Date(request.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                          {request.estimated_min_price && request.estimated_max_price && (
                            <p className="text-lg font-bold text-foreground mt-2">
                              {CURRENCY}{request.estimated_min_price.toLocaleString()} - {CURRENCY}{request.estimated_max_price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleAcceptRequest(request)}
                              className="flex-1 bg-success hover:bg-success/90 min-w-[100px]"
                              size="sm"
                            >
                              <Check size={16} className="mr-1.5" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDeclineRequest(request.id)}
                              className="flex-1 min-w-[100px]"
                              size="sm"
                            >
                              <X size={16} className="mr-1.5" />
                              Decline
                            </Button>
                          </>
                        )}
                        {request.status === 'matched' && (
                          <Button
                            onClick={() => handleConfirmBooking(request.id, request.estimated_max_price || 50000)}
                            className="flex-1 bg-success hover:bg-success/90 min-w-[100px]"
                            size="sm"
                          >
                            <Check size={16} className="mr-1.5" />
                            Confirm
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenChat(request)}
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <MessageSquare size={16} className="mr-1.5" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Chat Dialog */}
      {selectedRequest && user && (
        <ChatDialog
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          bookingId={selectedRequest.id}
          userRole="provider"
          isNegotiating={['pending', 'matching', 'matched', 'negotiating'].includes(selectedRequest.status)}
          allowsNegotiation={provider?.allows_negotiation ?? true}
          estimatedMinPrice={selectedRequest.estimated_min_price || undefined}
          estimatedMaxPrice={selectedRequest.estimated_max_price || undefined}
          onPriceAccepted={handlePriceAccepted}
          onBookingConfirmed={() => {
            setShowChat(false);
            toast.success('Booking confirmed successfully!');
          }}
        />
      )}
    </DashboardLayout>
  );
}
