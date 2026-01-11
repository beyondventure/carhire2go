import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, DollarSign, Send, Check, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/hooks/useChat';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useBookings } from '@/hooks/useBookings';
import { CURRENCY } from '@/lib/constants';
import type { UserRole, ChatMessage } from '@/types';
import { toast } from 'sonner';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  userRole: UserRole;
  isNegotiating?: boolean;
  allowsNegotiation?: boolean;
  onPriceAccepted?: (price: number) => void;
  onBookingConfirmed?: () => void;
}

export function ChatDialog({
  isOpen,
  onClose,
  bookingId,
  userRole,
  isNegotiating = true,
  allowsNegotiation = true,
  onPriceAccepted,
  onBookingConfirmed,
}: ChatDialogProps) {
  const { user } = useSupabaseAuth();
  const { messages, sendMessage, sendPriceProposal, acceptPrice, isLoading: chatLoading } = useChat(bookingId);
  const { confirmBooking } = useBookings();
  
  const [messageInput, setMessageInput] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Find if there's an accepted price in the messages
  const acceptedPriceMessage = messages.find(m => m.type === 'price-accepted');
  const agreedPrice = acceptedPriceMessage?.proposedPrice || null;
  const canNegotiate = isNegotiating && allowsNegotiation && !agreedPrice;

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    await sendMessage(messageInput.trim(), userRole);
    setMessageInput('');
  };

  const handlePriceProposal = async () => {
    const price = parseFloat(proposedPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    await sendPriceProposal(price, userRole);
    setProposedPrice('');
    setShowPriceInput(false);
  };

  const handleAcceptPrice = async (messageId: string, price: number) => {
    await acceptPrice(price, userRole);
    onPriceAccepted?.(price);
    toast.success(`Price of ${CURRENCY}${price.toLocaleString()} accepted!`);
  };

  const handleConfirmBooking = async () => {
    if (!agreedPrice) return;
    
    setIsConfirming(true);
    try {
      const result = await confirmBooking(bookingId, agreedPrice);
      if (result) {
        toast.success('Booking confirmed successfully!');
        onBookingConfirmed?.();
        onClose();
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MessageSquare size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Chat & Negotiation</h3>
                  <div className="flex items-center gap-2">
                    {agreedPrice ? (
                      <span className="text-xs text-success flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Price agreed: {CURRENCY}{agreedPrice.toLocaleString()}
                      </span>
                    ) : allowsNegotiation ? (
                      <span className="text-xs text-warning flex items-center gap-1">
                        <DollarSign size={12} />
                        Negotiation enabled
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle size={12} />
                        Fixed pricing
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px]">
              {chatLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                  {allowsNegotiation && (
                    <p className="text-xs mt-1">Use the $ button to propose a price.</p>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user.id;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.type === 'system' ? (
                          <div className="w-full text-center">
                            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                              {msg.content}
                            </span>
                          </div>
                        ) : msg.type === 'price-proposal' || msg.type === 'price-accepted' ? (
                          <div
                            className={`max-w-[80%] ${
                              msg.type === 'price-accepted'
                                ? 'bg-success/10 border-success/30'
                                : isOwn
                                ? 'bg-accent/10 border-accent/30'
                                : 'bg-warning/10 border-warning/30'
                            } border rounded-xl p-4`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {msg.type === 'price-accepted' ? (
                                <CheckCircle2 size={16} className="text-success" />
                              ) : (
                                <DollarSign size={16} className="text-warning" />
                              )}
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {msg.type === 'price-accepted' ? 'Price Accepted' : 'Price Proposal'}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                              {CURRENCY}{msg.proposedPrice?.toLocaleString()}
                            </p>
                            {msg.content && (
                              <p className="text-xs text-muted-foreground mt-1">{msg.content}</p>
                            )}
                            
                            {/* Accept/Counter buttons for incoming price proposals */}
                            {msg.type === 'price-proposal' && !isOwn && canNegotiate && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptPrice(msg.id, msg.proposedPrice!)}
                                  className="flex-1 bg-success hover:bg-success/90"
                                >
                                  <Check size={14} className="mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowPriceInput(true)}
                                  className="flex-1"
                                >
                                  <X size={14} className="mr-1" />
                                  Counter
                                </Button>
                              </div>
                            )}
                            
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                              isOwn
                                ? 'bg-accent text-accent-foreground rounded-br-md'
                                : 'bg-muted text-foreground rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <span className={`text-xs mt-1 block ${
                              isOwn ? 'text-accent-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Price Input */}
            <AnimatePresence>
              {showPriceInput && canNegotiate && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border overflow-hidden"
                >
                  <div className="p-3 bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Enter your price proposal:</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {CURRENCY}
                        </span>
                        <Input
                          type="number"
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(e.target.value)}
                          placeholder="Enter amount"
                          className="pl-10"
                          onKeyDown={(e) => e.key === 'Enter' && handlePriceProposal()}
                          autoFocus
                        />
                      </div>
                      <Button onClick={handlePriceProposal} className="bg-warning text-warning-foreground hover:bg-warning/90">
                        Propose
                      </Button>
                      <Button variant="ghost" onClick={() => setShowPriceInput(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input (when negotiating or chatting) */}
            {!showPriceInput && (
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  {canNegotiate && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPriceInput(true)}
                      className="shrink-0"
                      title="Propose a price"
                    >
                      <DollarSign size={18} />
                    </Button>
                  )}
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="shrink-0">
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            )}

            {/* Confirmation Footer (when price is agreed) */}
            {agreedPrice && (
              <div className="p-4 border-t border-border bg-success/5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-success" />
                      <span className="text-sm font-medium text-foreground">Agreed Price</span>
                    </div>
                    <span className="text-xl font-bold text-success">
                      {CURRENCY}{agreedPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  {userRole === 'provider' && (
                    <Button 
                      onClick={handleConfirmBooking} 
                      className="w-full btn-primary"
                      disabled={isConfirming}
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          Confirm Booking
                          <ArrowRight size={18} className="ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                  
                  {userRole === 'consumer' && (
                    <p className="text-xs text-center text-muted-foreground">
                      Waiting for provider to confirm the booking...
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
