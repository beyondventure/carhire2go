import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Search, Filter, Eye, MoreVertical, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookingMap } from '@/components/map/BookingMap';
import { mockBookings } from '@/lib/mock-data';
import { CURRENCY, BOOKING_TYPE_LABELS, BOOKING_STATUS_LABELS } from '@/lib/constants';
import type { Booking } from '@/types';

export default function AdminBookings() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = mockBookings.filter((booking) => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.consumer?.name?.toLowerCase().includes(query) ||
        booking.provider?.businessName?.toLowerCase().includes(query)
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
            <table className="w-full">
              <thead className="sticky top-0 bg-card border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Booking ID</th>
                  <th className="p-4 font-medium">Consumer</th>
                  <th className="p-4 font-medium">Provider</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Date</th>
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
                      <span className="font-mono text-sm text-foreground">#{booking.id.slice(0, 8)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={booking.consumer?.avatar}
                          alt={booking.consumer?.name}
                          className="w-8 h-8 rounded-lg"
                        />
                        <span className="text-sm text-foreground">{booking.consumer?.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      {booking.provider?.businessName || '-'}
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      {BOOKING_TYPE_LABELS[booking.bookingType] || booking.bookingType}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="p-4 text-sm font-medium text-foreground">
                      {booking.finalPrice ? `${CURRENCY}${booking.finalPrice.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Details */}
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-96 space-y-4"
          >
            {/* Map */}
            <BookingMap
              pickup={selectedBooking.pickup}
              dropoff={selectedBooking.dropoff}
              className="h-48"
            />

            {/* Details */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Booking Details</h3>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Route</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-foreground">{selectedBooking.pickup.name || selectedBooking.pickup.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <span className="text-foreground">{selectedBooking.dropoff.name || selectedBooking.dropoff.address}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Consumer</p>
                    <p className="text-foreground font-medium">{selectedBooking.consumer?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Provider</p>
                    <p className="text-foreground font-medium">{selectedBooking.provider?.businessName || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="text-foreground font-bold text-lg">
                      {selectedBooking.finalPrice ? `${CURRENCY}${selectedBooking.finalPrice.toLocaleString()}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Commission</p>
                    <p className="text-foreground font-medium">
                      {selectedBooking.finalPrice ? `${CURRENCY}${(selectedBooking.finalPrice * 0.1).toLocaleString()}` : '-'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare size={14} className="mr-1" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye size={14} className="mr-1" />
                    Full Details
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
