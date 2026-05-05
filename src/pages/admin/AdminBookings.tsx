import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, MoreVertical, MessageSquare, Loader2, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookingMap } from '@/components/map/BookingMap';
import { CURRENCY, BOOKING_TYPE_LABELS, BOOKING_STATUS_LABELS } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookingRow {
  id: string;
  status: string;
  bookingType: string;
  pickupLine: string;
  dropoffLine: string;
  scheduledDate: string;
  finalPrice: number | null;
  consumerName: string;
  consumerAvatar: string;
  consumerPhone: string;
  providerName: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rawBookings = data || [];

      // Manual join for profiles (consumers)
      const consumerIds = [...new Set(rawBookings.map(b => b.consumer_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, email, phone, avatar_url')
        .in('id', consumerIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Manual join for providers
      const providerIds = [...new Set(rawBookings.filter(b => b.provider_id).map(b => b.provider_id!))];
      const { data: providersData } = await supabase
        .from('providers')
        .select('id, business_name')
        .in('id', providerIds);
      
      const providersMap = new Map(providersData?.map(p => [p.id, p]) || []);

      const mapped: BookingRow[] = rawBookings.map((b: any) => {
        const profile = profilesMap.get(b.consumer_id);
        const provider = b.provider_id ? providersMap.get(b.provider_id) : null;
        
        return {
          id: b.id,
          status: b.status || 'pending',
          bookingType: b.booking_type || 'unknown',
          pickupLine: b.pickup_address || '',
          dropoffLine: b.dropoff_address || '',
          scheduledDate: b.scheduled_date || b.created_at,
          finalPrice: b.final_price ?? b.negotiated_price ?? null,
          consumerName: profile?.name || 'Unknown',
          consumerAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.consumer_id}`,
          consumerPhone: profile?.phone || '-',
          providerName: provider?.business_name || '-',
          pickupLat: b.pickup_lat || 6.5244, 
          pickupLng: b.pickup_lng || 3.3792,
          dropoffLat: b.dropoff_lat || 6.5244, 
          dropoffLng: b.dropoff_lng || 3.3792,
        };
      });

      setBookings(mapped);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    
    const channel = supabase
      .channel('admin-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchBookings()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.consumerName.toLowerCase().includes(query) ||
        booking.providerName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <DashboardLayout title="All Bookings" subtitle="Monitor and manage platform bookings">
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Bookings List */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by ID, consumer, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize whitespace-nowrap"
                >
                  {status === 'all' ? 'All' : BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] || status}
                </Button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="flex-1 overflow-auto bg-card rounded-xl border border-border">
            {isLoading ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                <Calendar size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No bookings found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-card border-b border-border z-10">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Booking ID</th>
                    <th className="p-4 font-medium">Consumer</th>
                    <th className="p-4 font-medium">Provider</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium whitespace-nowrap">Date</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`hover:bg-muted/50 cursor-pointer ${
                        selectedBooking?.id === booking.id ? 'bg-accent/5' : ''
                      }`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-foreground">#{booking.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={booking.consumerAvatar}
                            alt={booking.consumerName}
                            className="w-8 h-8 rounded-lg"
                          />
                          <span className="text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                            {booking.consumerName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                        {booking.providerName}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {BOOKING_TYPE_LABELS[booking.bookingType] || booking.bookingType}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground whitespace-nowrap">
                        {booking.finalPrice ? `${CURRENCY}${booking.finalPrice.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedBooking(booking)}>
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Booking options coming soon')}>
                            <MoreVertical size={16} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Booking Details Pane */}
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex w-96 flex-col space-y-4"
          >
            {/* Fake Map representation since coordinates might not be fully stored */}
            <div className="h-48 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
              <BookingMap
                pickup={{ name: selectedBooking.pickupLine, address: selectedBooking.pickupLine, lat: selectedBooking.pickupLat!, lng: selectedBooking.pickupLng! }}
                dropoff={{ name: selectedBooking.dropoffLine, address: selectedBooking.dropoffLine, lat: selectedBooking.dropoffLat!, lng: selectedBooking.dropoffLng! }}
                className="h-full w-full"
              />
            </div>

            {/* Details Card */}
            <div className="bg-card rounded-xl border border-border p-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Booking Details</h3>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <div className="space-y-6">
                {/* Route */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Route Information</p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-success mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-2">{selectedBooking.pickupLine || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pickup Location</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-2">{selectedBooking.dropoffLine || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Drop-off Location</p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Users */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Consumer</p>
                    <p className="text-sm text-foreground font-medium truncate" title={selectedBooking.consumerName}>
                      {selectedBooking.consumerName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate" title={selectedBooking.consumerPhone}>
                      {selectedBooking.consumerPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Provider</p>
                    <p className="text-sm text-foreground font-medium truncate" title={selectedBooking.providerName}>
                      {selectedBooking.providerName}
                    </p>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Financials */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Final Amount</p>
                    <p className="text-lg text-foreground font-bold">
                      {selectedBooking.finalPrice ? `${CURRENCY}${selectedBooking.finalPrice.toLocaleString()}` : 'Pending'}
                    </p>
                  </div>
                  {selectedBooking.finalPrice && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Platform Fee (10%)</p>
                      <p className="text-sm text-foreground font-medium mt-1">
                        {CURRENCY}{(selectedBooking.finalPrice * 0.1).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info('Chat interface coming soon')}>
                    <MessageSquare size={14} className="mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
