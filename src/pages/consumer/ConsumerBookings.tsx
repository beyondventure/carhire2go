import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Car, MessageSquare, Filter, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockBookings } from '@/lib/mock-data';
import { CURRENCY, BOOKING_STATUS_LABELS } from '@/lib/constants';
import type { Booking, ChatMessage } from '@/types';

export default function ConsumerBookings() {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      bookingId: 'b1',
      senderId: 'provider1',
      senderRole: 'provider',
      content: 'Hello! Thank you for your booking request.',
      type: 'text',
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      bookingId: 'b1',
      senderId: 'provider1',
      senderRole: 'provider',
      content: 'Based on your requirements, here is my proposal:',
      type: 'price-proposal',
      proposedPrice: 45000,
      createdAt: new Date(Date.now() - 3000000),
    },
  ]);

  const filteredBookings = mockBookings.filter((booking) => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.pickup.address.toLowerCase().includes(query) ||
        booking.dropoff.address.toLowerCase().includes(query) ||
        booking.provider?.businessName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: selectedBooking?.id || '',
      senderId: 'consumer1',
      senderRole: 'consumer',
      content,
      type: 'text',
      createdAt: new Date(),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const handlePriceProposal = (price: number) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: selectedBooking?.id || '',
      senderId: 'consumer1',
      senderRole: 'consumer',
      content: 'Counter proposal',
      type: 'price-proposal',
      proposedPrice: price,
      createdAt: new Date(),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const handleAcceptPrice = (messageId: string, price: number) => {
    const acceptMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: selectedBooking?.id || '',
      senderId: 'consumer1',
      senderRole: 'consumer',
      content: `Price accepted: ${CURRENCY}${price.toLocaleString()}`,
      type: 'price-accepted',
      proposedPrice: price,
      createdAt: new Date(),
    };
    setChatMessages([...chatMessages, acceptMessage]);
  };

  const handleRejectPrice = (messageId: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: selectedBooking?.id || '',
      senderId: 'system',
      senderRole: 'consumer',
      content: 'Price rejected. Please propose a counter offer.',
      type: 'system',
      createdAt: new Date(),
    };
    setChatMessages([...chatMessages, systemMessage]);
  };

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
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`booking-card p-5 cursor-pointer ${
                  selectedBooking?.id === booking.id ? 'ring-2 ring-accent' : ''
                }`}
                onClick={() => {
                  setSelectedBooking(booking);
                  if (booking.status === 'negotiating' || booking.status === 'matched') {
                    setShowChat(true);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {booking.vehicle ? (
                      <img
                        src={booking.vehicle.images[0]}
                        alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                        <Car size={24} className="text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {booking.vehicle 
                          ? `${booking.vehicle.make} ${booking.vehicle.model}`
                          : `${booking.vehiclePreference || 'Any'} vehicle`
                        }
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.provider?.businessName || 'Matching provider...'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <p className="text-sm text-foreground truncate">
                      {booking.pickup.name || booking.pickup.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <p className="text-sm text-foreground truncate">
                      {booking.dropoff.name || booking.dropoff.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {booking.scheduledTime}
                    </span>
                    <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {(booking.status === 'negotiating' || booking.status === 'matched') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                          setShowChat(true);
                        }}
                      >
                        <MessageSquare size={16} className="mr-1" />
                        Chat
                      </Button>
                    )}
                    {booking.finalPrice && (
                      <p className="font-semibold text-foreground">
                        {CURRENCY}{booking.finalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && selectedBooking && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-96"
          >
            <ChatPanel
              messages={chatMessages}
              currentUserId="consumer1"
              currentUserRole="consumer"
              onSendMessage={handleSendMessage}
              onPriceProposal={handlePriceProposal}
              onAcceptPrice={handleAcceptPrice}
              onRejectPrice={handleRejectPrice}
              isNegotiating={selectedBooking.status === 'negotiating' || selectedBooking.status === 'matched'}
              className="h-full"
            />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
