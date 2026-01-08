import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, User, Car, Check, X, MessageSquare, ChevronDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Button } from '@/components/ui/button';
import { mockBookings, mockVehicles, mockDrivers } from '@/lib/mock-data';
import { CURRENCY, BOOKING_TYPE_LABELS } from '@/lib/constants';
import type { Booking, ChatMessage } from '@/types';

export default function ProviderRequests() {
  const [selectedRequest, setSelectedRequest] = useState<Booking | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [countdown, setCountdown] = useState(45);

  const pendingRequests = mockBookings.filter(b => 
    ['pending', 'matching', 'matched', 'negotiating'].includes(b.status)
  );

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      bookingId: 'b1',
      senderId: 'consumer1',
      senderRole: 'consumer',
      content: 'Hi, I need a car for a full day hire tomorrow.',
      type: 'text',
      createdAt: new Date(Date.now() - 3600000),
    },
  ]);

  const handleAcceptRequest = (booking: Booking) => {
    console.log('Accepting booking:', booking.id);
    // In real app, this would call API
  };

  const handleDeclineRequest = (booking: Booking) => {
    console.log('Declining booking:', booking.id);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: selectedRequest?.id || '',
      senderId: 'provider1',
      senderRole: 'provider',
      content,
      type: 'text',
      createdAt: new Date(),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const handlePriceProposal = (price: number) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: selectedRequest?.id || '',
      senderId: 'provider1',
      senderRole: 'provider',
      content: 'My price proposal for this trip:',
      type: 'price-proposal',
      proposedPrice: price,
      createdAt: new Date(),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const handleAcceptPrice = (messageId: string, price: number) => {
    const acceptMessage: ChatMessage = {
      id: Date.now().toString(),
      bookingId: selectedRequest?.id || '',
      senderId: 'provider1',
      senderRole: 'provider',
      content: `Price agreed: ${CURRENCY}${price.toLocaleString()}`,
      type: 'price-accepted',
      proposedPrice: price,
      createdAt: new Date(),
    };
    setChatMessages([...chatMessages, acceptMessage]);
  };

  const handleRejectPrice = () => {};

  return (
    <DashboardLayout title="Booking Requests" subtitle="Manage incoming booking requests">
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Requests List */}
        <div className={`flex-1 ${showChat ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="space-y-4">
            <AnimatePresence>
              {pendingRequests.map((request, index) => (
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
                  {/* Countdown Bar */}
                  {request.status === 'pending' && (
                    <div className="h-1 bg-warning/20">
                      <motion.div
                        className="h-full bg-warning"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: countdown, ease: 'linear' }}
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.consumer?.avatar}
                          alt={request.consumer?.name}
                          className="w-12 h-12 rounded-xl"
                        />
                        <div>
                          <h4 className="font-semibold text-foreground">{request.consumer?.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{BOOKING_TYPE_LABELS[request.bookingType]}</span>
                            <span>•</span>
                            <span className="capitalize">{request.vehiclePreference || 'Any'}</span>
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
                              {request.pickup.name || request.pickup.address}
                            </p>
                            <p className="text-xs text-muted-foreground">Pickup</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {request.dropoff.name || request.dropoff.address}
                            </p>
                            <p className="text-xs text-muted-foreground">Drop-off</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock size={14} />
                            <span>{request.scheduledTime}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(request.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                        {request.estimatedPrice && (
                          <p className="text-lg font-bold text-foreground mt-2">
                            {CURRENCY}{request.estimatedPrice.min.toLocaleString()} - {CURRENCY}{request.estimatedPrice.max.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleAcceptRequest(request)}
                            className="flex-1 bg-success hover:bg-success/90"
                          >
                            <Check size={18} className="mr-2" />
                            Accept ({countdown}s)
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDeclineRequest(request)}
                            className="flex-1"
                          >
                            <X size={18} className="mr-2" />
                            Decline
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowChat(true);
                        }}
                      >
                        <MessageSquare size={18} className="mr-2" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {pendingRequests.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Clock size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No pending requests</h3>
                <p className="text-muted-foreground">New booking requests will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && selectedRequest && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-96"
          >
            <ChatPanel
              messages={chatMessages}
              currentUserId="provider1"
              currentUserRole="provider"
              onSendMessage={handleSendMessage}
              onPriceProposal={handlePriceProposal}
              onAcceptPrice={handleAcceptPrice}
              onRejectPrice={handleRejectPrice}
              isNegotiating={selectedRequest.status === 'negotiating' || selectedRequest.status === 'matched'}
              className="h-full"
            />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
